# Design Document: Mobile Backend Integration

## Introduction

This document outlines the comprehensive design for integrating the Apex Estates Flutter mobile application with the NestJS REST backend server. The design replaces all mock data sources with real API calls, implementing proper authentication flows, error handling, loading states, and data synchronization between the mobile app and backend.

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Flutter Mobile App                        │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐          │
│  │   Screens  │→│ Controllers│→│   Services   │          │
│  │    (UI)    │  │  (GetX)    │  │  (API/Data) │          │
│  └────────────┘  └────────────┘  └─────────────┘          │
│                                          ↓                   │
│                                   ┌─────────────┐           │
│                                   │  ApiService │           │
│                                   │    (Dio)    │           │
│                                   └─────────────┘           │
└────────────────────────────────┬─────────────────────────────┘
                                 │ HTTPS/REST
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│                  NestJS Backend Server                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │→│   Services    │→│    Prisma    │     │
│  │  (REST API)  │  │  (Business)   │  │   (ORM)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                              ↓              │
│                                       ┌──────────────┐     │
│                                       │  PostgreSQL  │     │
│                                       │   Database   │     │
│                                       └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **User Interaction** → Screen captures user input
2. **State Management** → Controller processes input and calls services
3. **API Service** → Constructs and sends HTTP request via Dio
4. **Authentication** → Interceptor adds JWT token to request headers
5. **Network Layer** → Dio makes HTTP request to backend REST API
6. **Backend Processing** → NestJS controller → service → database
7. **Response Handling** → Backend returns JSON response
8. **Data Parsing** → Mobile app deserializes JSON to Dart models
9. **State Update** → Controller updates reactive state (.obs)
10. **UI Refresh** → Screen automatically rebuilds with new data

### Key Design Principles

1. **Single Source of Truth**: Backend database is the authoritative data source
2. **Stateless API**: Each request contains all necessary information (JWT token)
3. **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE)
4. **Token-Based Auth**: JWT access tokens with automatic refresh mechanism
5. **Error Recovery**: Automatic retry with exponential backoff for transient failures
6. **Offline Awareness**: Detect connectivity before making requests
7. **Progressive Enhancement**: Graceful degradation when offline

## Component Design

### 1. API Configuration Module

**Location**: `lib/config/api_config.dart`

**Purpose**: Centralized configuration management for API connection settings.

#### Components

```dart
class ApiConfig {
  // Environment variables
  static String get baseUrl => _getEnv('API_BASE_URL', 'http://localhost:3003/api/v1');
  static int get timeoutSeconds => int.parse(_getEnv('API_TIMEOUT_SECONDS', '30'));
  static bool get useMockData => _getEnv('USE_MOCK_DATA', 'false') == 'true';
  static bool get enableRequestLogs => _getEnv('ENABLE_REQUEST_LOGS', 'true') == 'true';
  
  // Computed values
  static Duration get timeout => Duration(seconds: timeoutSeconds);
  static int get timeoutMillis => timeoutSeconds * 1000;
  
  // Helper
  static String _getEnv(String key, String defaultValue) {
    return dotenv.env[key] ?? defaultValue;
  }
}
```

#### Configuration Loading Sequence

1. App startup → Load `.env` file via flutter_dotenv
2. Initialize ApiConfig → Read environment variables
3. Validate configuration → Log warnings for missing values
4. Configure Dio → Apply timeout and base URL settings

#### SSL Certificate Handling

```dart
class ApiConfig {
  static bool get isDevelopment => baseUrl.contains('localhost') || 
                                    baseUrl.contains('127.0.0.1');
  
  static BadCertificateCallback? get certificateCallback {
    return isDevelopment ? (cert, host, port) => true : null;
  }
}
```

### 2. Core API Service

**Location**: `lib/services/api_service.dart`

**Purpose**: Base HTTP client wrapper providing authentication, error handling, and interceptors.

#### Class Structure

```dart
class ApiService extends GetxService {
  late final Dio _dio;
  final StorageService _storage;
  final ConnectivityService _connectivity;
  
  // Token refresh management
  bool _isRefreshing = false;
  final List<Function> _refreshQueue = [];
  
  Future<ApiService> init() async {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.timeout,
      receiveTimeout: ApiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    
    _setupInterceptors();
    return this;
  }
}
```

#### Interceptor Chain

```
Request → [Connectivity Check] → [Auth Token] → [Logger] → [Mock?] → Network
Response ← [Error Handler] ← [Token Refresh] ← [Logger] ← Network
```

**Interceptor Order**:
1. **ConnectivityInterceptor** - Checks internet connection before request
2. **AuthInterceptor** - Adds JWT token to Authorization header
3. **LoggerInterceptor** - Logs requests/responses (if enabled)
4. **MockInterceptor** - Returns mock data (if enabled)
5. **ErrorInterceptor** - Handles errors and triggers token refresh

#### Authentication Interceptor

```dart
class AuthInterceptor extends Interceptor {
  final StorageService _storage;
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Skip auth for auth endpoints
    if (options.path.contains('/auth/')) {
      return handler.next(options);
    }
    
    final token = await _storage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    handler.next(options);
  }
}
```

#### Token Refresh Logic

```dart
class ApiService {
  Future<Response> _handleTokenRefresh(DioException error) async {
    // Prevent multiple simultaneous refreshes
    if (_isRefreshing) {
      return _enqueueRequest(error.requestOptions);
    }
    
    _isRefreshing = true;
    
    try {
      final refreshToken = await _storage.getRefreshToken();
      
      final response = await _dio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });
      
      final newAccessToken = response.data['data']['accessToken'];
      await _storage.setAccessToken(newAccessToken);
      
      // Retry all queued requests
      _processRefreshQueue(newAccessToken);
      
      // Retry original request
      return _retry(error.requestOptions);
      
    } catch (e) {
      // Refresh failed - logout user
      await _storage.clearTokens();
      Get.offAllNamed('/login');
      throw UnauthorizedException('Session expired');
      
    } finally {
      _isRefreshing = false;
    }
  }
}
```

### 3. Feature API Services

**Pattern**: Each feature has a dedicated API service that uses the base ApiService.

#### Structure

```dart
class PropertyApiService {
  final ApiService _api = Get.find();
  
  Future<ApiResponse<List<PropertyModel>>> getProperties({
    String? query,
    String? listingType,
    String? propertyType,
    String? city,
    String? subCity,
    double? minPrice,
    double? maxPrice,
    int? minBedrooms,
    int page = 1,
    int limit = 10,
    String? sort,
  }) async {
    final response = await _api.get('/properties', queryParameters: {
      if (query != null) 'query': query,
      if (listingType != null) 'listingType': listingType,
      if (propertyType != null) 'propertyType': propertyType,
      if (city != null) 'city': city,
      if (subCity != null) 'subCity': subCity,
      if (minPrice != null) 'minPrice': minPrice,
      if (maxPrice != null) 'maxPrice': maxPrice,
      if (minBedrooms != null) 'minBedrooms': minBedrooms,
      'page': page,
      'limit': limit,
      if (sort != null) 'sort': sort,
    });
    
    return ApiResponse<List<PropertyModel>>.fromJson(
      response.data,
      (json) => (json as List).map((e) => PropertyModel.fromJson(e)).toList(),
    );
  }
}
```

### 4. Data Models

**Pattern**: All models use manual JSON serialization with `fromJson` and `toJson` methods.

#### Base Model Pattern

```dart
abstract class BaseModel {
  Map<String, dynamic> toJson();
  
  // Helper for date serialization
  static String? dateToJson(DateTime? date) {
    return date?.toIso8601String();
  }
  
  // Helper for date deserialization
  static DateTime? dateFromJson(dynamic json) {
    if (json == null) return null;
    if (json is String) return DateTime.parse(json);
    return null;
  }
}
```

#### Example: Property Model

```dart
class PropertyModel extends BaseModel {
  final String id;
  final String title;
  final String description;
  final String listingType; // RENT or SALE
  final String propertyType;
  final double price;
  final LocationModel location;
  final DetailsModel details;
  final List<String> imageUrls;
  final String ownerId;
  final UserModel? owner;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isFavorite;
  final int viewCount;
  
  PropertyModel({
    required this.id,
    required this.title,
    required this.description,
    required this.listingType,
    required this.propertyType,
    required this.price,
    required this.location,
    required this.details,
    required this.imageUrls,
    required this.ownerId,
    this.owner,
    required this.createdAt,
    required this.updatedAt,
    this.isFavorite = false,
    this.viewCount = 0,
  });
  
  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      listingType: json['listingType'] as String,
      propertyType: json['propertyType'] as String,
      price: (json['price'] as num).toDouble(),
      location: LocationModel.fromJson(json['location'] as Map<String, dynamic>),
      details: DetailsModel.fromJson(json['details'] as Map<String, dynamic>),
      imageUrls: (json['imageUrls'] as List?)?.cast<String>() ?? [],
      ownerId: json['ownerId'] as String,
      owner: json['owner'] != null ? UserModel.fromJson(json['owner']) : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      isFavorite: json['isFavorite'] as bool? ?? false,
      viewCount: json['viewCount'] as int? ?? 0,
    );
  }
  
  @override
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'listingType': listingType,
      'propertyType': propertyType,
      'price': price,
      'location': location.toJson(),
      'details': details.toJson(),
      'imageUrls': imageUrls,
      'ownerId': ownerId,
      if (owner != null) 'owner': owner!.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isFavorite': isFavorite,
      'viewCount': viewCount,
    };
  }
}
```

#### Deserialization Error Handling

```dart
factory PropertyModel.fromJson(Map<String, dynamic> json) {
  try {
    // Validate required fields
    if (!json.containsKey('id')) {
      throw DeserializationException('Missing required field: id');
    }
    if (!json.containsKey('title')) {
      throw DeserializationException('Missing required field: title');
    }
    
    return PropertyModel(
      id: json['id'] as String,
      title: json['title'] as String,
      // ... rest of fields
    );
  } catch (e) {
    LoggingService.error('PropertyModel deserialization failed', e);
    rethrow;
  }
}
```

### 5. API Response Wrapper

**Location**: `lib/models/api_response.dart`

**Purpose**: Standardized wrapper for all API responses with success/error handling.

```dart
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final PaginationMeta? pagination;
  final ApiError? error;
  
  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.pagination,
    this.error,
  });
  
  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] as bool? ?? true,
      data: json['data'] != null && fromJsonT != null 
          ? fromJsonT(json['data']) 
          : json['data'] as T?,
      message: json['message'] as String?,
      pagination: json['pagination'] != null
          ? PaginationMeta.fromJson(json['pagination'])
          : null,
      error: json['error'] != null
          ? ApiError.fromJson(json['error'])
          : null,
    );
  }
}

class PaginationMeta {
  final int page;
  final int limit;
  final int total;
  final int totalPages;
  final bool hasNext;
  final bool hasPrev;
  
  PaginationMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
    required this.hasNext,
    required this.hasPrev,
  });
  
  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      page: json['page'] as int,
      limit: json['limit'] as int,
      total: json['total'] as int,
      totalPages: json['totalPages'] as int,
      hasNext: json['hasNext'] as bool,
      hasPrev: json['hasPrev'] as bool,
    );
  }
}
```

### 6. Error Handling System

#### Error Types Hierarchy

```dart
abstract class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic originalError;
  
  AppException(this.message, {this.code, this.originalError});
}

class NetworkException extends AppException {
  NetworkException(String message, {String? code, dynamic originalError})
      : super(message, code: code, originalError: originalError);
}

class AuthException extends AppException {
  AuthException(String message, {String? code, dynamic originalError})
      : super(message, code: code, originalError: originalError);
}

class ValidationException extends AppException {
  final Map<String, List<String>>? fieldErrors;
  
  ValidationException(String message, {this.fieldErrors, String? code})
      : super(message, code: code);
}

class ServerException extends AppException {
  final int? statusCode;
  
  ServerException(String message, {this.statusCode, String? code})
      : super(message, code: code);
}
```

#### HTTP Status Code Mapping

```dart
class ErrorHandler {
  static AppException handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return NetworkException('Request timed out, please try again');
        
      case DioExceptionType.connectionError:
        return NetworkException('No internet connection');
        
      case DioExceptionType.badResponse:
        return _handleStatusCode(error.response);
        
      default:
        return NetworkException('An unexpected error occurred');
    }
  }
  
  static AppException _handleStatusCode(Response? response) {
    final statusCode = response?.statusCode;
    final data = response?.data;
    final message = data is Map ? data['message'] as String? : null;
    
    switch (statusCode) {
      case 400:
        return ValidationException(
          message ?? 'Invalid request',
          fieldErrors: _extractFieldErrors(data),
        );
        
      case 401:
        return AuthException(message ?? 'Unauthorized');
        
      case 403:
        return AuthException(
          message ?? "You don't have permission to perform this action",
        );
        
      case 404:
        return ServerException(
          message ?? 'The requested resource was not found',
          statusCode: 404,
        );
        
      case 409:
        return ServerException(
          message ?? 'This resource already exists',
          statusCode: 409,
        );
        
      case 500:
      case 502:
      case 503:
        return ServerException(
          message ?? 'Server error, please try again later',
          statusCode: statusCode,
        );
        
      default:
        return ServerException(
          message ?? 'An error occurred',
          statusCode: statusCode,
        );
    }
  }
}
```

### 7. Loading State Management

**Pattern**: Controllers manage loading states using reactive observables.

```dart
class PropertyController extends GetxController {
  final PropertyApiService _propertyApi = Get.find();
  
  // State
  final properties = <PropertyModel>[].obs;
  final isLoading = false.obs;
  final isLoadingMore = false.obs;
  final isRefreshing = false.obs;
  final error = Rxn<AppException>();
  
  // Pagination
  var currentPage = 1;
  var hasMore = true;
  
  Future<void> fetchProperties() async {
    if (isLoading.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      final response = await _propertyApi.getProperties(page: 1, limit: 10);
      
      if (response.success) {
        properties.value = response.data ?? [];
        currentPage = 1;
        hasMore = response.pagination?.hasNext ?? false;
      }
    } on AppException catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }
  
  Future<void> loadMore() async {
    if (isLoadingMore.value || !hasMore) return;
    
    isLoadingMore.value = true;
    
    try {
      final response = await _propertyApi.getProperties(
        page: currentPage + 1,
        limit: 10,
      );
      
      if (response.success) {
        properties.addAll(response.data ?? []);
        currentPage++;
        hasMore = response.pagination?.hasNext ?? false;
      }
    } on AppException catch (e) {
      SnackbarUtils.showError(e.message);
    } finally {
      isLoadingMore.value = false;
    }
  }
  
  Future<void> refresh() async {
    isRefreshing.value = true;
    await fetchProperties();
    isRefreshing.value = false;
  }
}
```

### 8. Connectivity Service

**Location**: `lib/services/connectivity_service.dart`

**Purpose**: Monitor network connectivity and notify components of status changes.

```dart
class ConnectivityService extends GetxService {
  final _connectivity = Connectivity();
  final isOnline = true.obs;
  StreamSubscription? _subscription;
  
  Future<ConnectivityService> init() async {
    // Check initial status
    final result = await _connectivity.checkConnectivity();
    isOnline.value = result != ConnectivityResult.none;
    
    // Listen for changes
    _subscription = _connectivity.onConnectivityChanged.listen((result) {
      final wasOnline = isOnline.value;
      isOnline.value = result != ConnectivityResult.none;
      
      // Notify user of status changes
      if (!wasOnline && isOnline.value) {
        SnackbarUtils.showSuccess('Connection restored');
      } else if (wasOnline && !isOnline.value) {
        SnackbarUtils.showWarning('You are offline');
      }
    });
    
    return this;
  }
  
  @override
  void onClose() {
    _subscription?.cancel();
    super.onClose();
  }
}
```

#### Connectivity Interceptor

```dart
class ConnectivityInterceptor extends Interceptor {
  final ConnectivityService _connectivity;
  
  ConnectivityInterceptor(this._connectivity);
  
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (!_connectivity.isOnline.value) {
      handler.reject(
        DioException(
          requestOptions: options,
          type: DioExceptionType.connectionError,
          message: 'No internet connection',
        ),
      );
      return;
    }
    
    handler.next(options);
  }
}
```

### 9. Media Upload Service

**Location**: `lib/services/media_api_service.dart`

**Purpose**: Handle file uploads with progress tracking.

```dart
class MediaApiService {
  final ApiService _api = Get.find();
  
  Future<MediaResponse> uploadImage(
    File file, {
    Function(int, int)? onProgress,
  }) async {
    final fileName = file.path.split('/').last;
    
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(
        file.path,
        filename: fileName,
      ),
    });
    
    final response = await _api.post(
      '/media',
      data: formData,
      onSendProgress: onProgress,
    );
    
    return MediaResponse.fromJson(response.data['data']);
  }
  
  Future<List<MediaResponse>> uploadMultiple(
    List<File> files, {
    Function(int, int)? onProgress,
  }) async {
    final results = <MediaResponse>[];
    
    for (final file in files) {
      try {
        final result = await uploadImage(file, onProgress: onProgress);
        results.add(result);
      } catch (e) {
        LoggingService.error('Failed to upload ${file.path}', e);
        rethrow;
      }
    }
    
    return results;
  }
}
```

#### Upload Progress UI

```dart
class PropertyFormController extends GetxController {
  final uploadProgress = 0.0.obs;
  final isUploading = false.obs;
  
  Future<void> uploadPropertyImages(List<File> images) async {
    isUploading.value = true;
    uploadProgress.value = 0.0;
    
    try {
      final uploadedMedia = await _mediaApi.uploadMultiple(
        images,
        onProgress: (sent, total) {
          uploadProgress.value = sent / total;
        },
      );
      
      propertyImageUrls.addAll(uploadedMedia.map((m) => m.url));
      
    } catch (e) {
      SnackbarUtils.showError('Failed to upload images');
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0.0;
    }
  }
}
```

### 10. Logging Service

**Location**: `lib/services/logging_service.dart`

**Purpose**: Centralized logging for debugging and error tracking.

```dart
class LoggingService {
  static const _isDebug = kDebugMode;
  
  static void info(String message, [dynamic data]) {
    if (_isDebug && ApiConfig.enableRequestLogs) {
      print('[INFO] $message');
      if (data != null) print(data);
    }
  }
  
  static void error(String message, dynamic error, [StackTrace? stackTrace]) {
    if (_isDebug && ApiConfig.enableRequestLogs) {
      print('[ERROR] $message');
      print(error);
      if (stackTrace != null) print(stackTrace);
    }
  }
  
  static void warning(String message, [dynamic data]) {
    if (_isDebug && ApiConfig.enableRequestLogs) {
      print('[WARNING] $message');
      if (data != null) print(data);
    }
  }
}
```

#### Request/Response Logging

```dart
void _setupInterceptors() {
  // Pretty logger for requests/responses
  if (ApiConfig.enableRequestLogs) {
    _dio.interceptors.add(PrettyDioLogger(
      requestHeader: true,
      requestBody: true,
      responseBody: true,
      responseHeader: false,
      error: true,
      compact: true,
      maxWidth: 90,
      // Sanitize sensitive data
      requestFilter: (options, args) {
        // Remove password from logs
        if (options.data is Map) {
          final data = Map.from(options.data);
          if (data.containsKey('password')) {
            data['password'] = '***';
          }
          options.data = data;
        }
        return options;
      },
    ));
  }
}
```

## Implementation Strategy

### Phase 1: Foundation Setup (Week 1)

#### Tasks
1. Configure environment variables in `.env` file
2. Implement ApiConfig class for configuration management
3. Set up base ApiService with Dio
4. Implement StorageService for token management
5. Create base exception classes
6. Set up ConnectivityService

#### Success Criteria
- Environment variables loaded successfully
- Dio configured with correct base URL and timeout
- Basic HTTP requests working
- Token storage working

### Phase 2: Authentication Flow (Week 1-2)

#### Tasks
1. Implement AuthApiService with login/register/refresh endpoints
2. Create AuthInterceptor for token attachment
3. Implement token refresh logic with queue management
4. Handle 401 responses and automatic refresh
5. Update AuthController to use real API
6. Test login/logout/token refresh flows

#### Success Criteria
- User can register and login
- JWT tokens stored securely
- Automatic token refresh working
- Logout clears tokens and redirects

### Phase 3: Core Data Models (Week 2)

#### Tasks
1. Implement PropertyModel with fromJson/toJson
2. Implement UserModel with fromJson/toJson
3. Implement ChatModel and MessageModel
4. Implement NotificationModel
5. Create ApiResponse wrapper
6. Test JSON serialization/deserialization

#### Success Criteria
- All models deserialize from backend responses
- Models serialize correctly for requests
- Date handling working (ISO 8601)
- Unknown fields ignored gracefully

### Phase 4: Properties Integration (Week 2-3)

#### Tasks
1. Implement PropertyApiService with all endpoints
2. Update PropertyController to use real API
3. Implement loading states and error handling
4. Add pagination support
5. Implement pull-to-refresh and load more
6. Update property screens to show real data

#### Success Criteria
- Property list displays real data
- Filtering and sorting working
- Pagination working
- Error handling displaying appropriate messages
- Loading states visible during requests

### Phase 5: Chat Integration (Week 3)

#### Tasks
1. Implement ChatApiService
2. Update ChatController to use real API
3. Implement MessageController
4. Handle real-time message updates
5. Update chat screens

#### Success Criteria
- Chat list shows real conversations
- Messages sent and received
- Pagination working for messages
- Read status updates working

### Phase 6: Media Uploads (Week 3-4)

#### Tasks
1. Implement MediaApiService
2. Add multipart/form-data support
3. Implement upload progress tracking
4. Update PropertyFormController
5. Test image uploads

#### Success Criteria
- Images upload successfully
- Progress bar displays correctly
- Uploaded images appear in property listings
- Error handling for failed uploads

### Phase 7: Additional Features (Week 4)

#### Tasks
1. Implement NotificationApiService
2. Implement UserApiService
3. Update remaining controllers
4. Add error retry mechanisms
5. Implement offline caching (optional)

#### Success Criteria
- Notifications display from backend
- User profiles load correctly
- Brokers list shows real data
- Retry on failure working

### Phase 8: Testing & Polish (Week 4-5)

#### Tasks
1. Remove all mock data references
2. Test all API integrations end-to-end
3. Test error scenarios
4. Test offline behavior
5. Performance testing
6. Fix bugs and edge cases

#### Success Criteria
- No mock data used when USE_MOCK_DATA=false
- All features working with real backend
- Error messages clear and helpful
- App handles offline gracefully
- Performance acceptable

## Data Flow Examples

### Example 1: Fetching Properties with Filters

```
User Action: Apply filters and tap "Search"
     ↓
PropertyController.searchProperties(filters)
     ↓
PropertyApiService.getProperties(filters)
     ↓
ApiService.get('/properties', queryParams: filters)
     ↓
[AuthInterceptor adds JWT token]
     ↓
[ConnectivityInterceptor checks online status]
     ↓
[Dio makes HTTP GET request]
     ↓
Backend: NestJS PropertiesController.findAll()
     ↓
Backend: PropertiesService.findAll(filters)
     ↓
Backend: Prisma query with filters
     ↓
Backend: Returns { success: true, data: [...], pagination: {...} }
     ↓
ApiResponse.fromJson() deserializes response
     ↓
PropertyModel.fromJson() for each item
     ↓
PropertyController.properties.value = results
     ↓
Screen automatically rebuilds with Obx
     ↓
User sees filtered property list
```

### Example 2: Token Refresh Flow

```
User Action: View property details
     ↓
PropertyController.getPropertyById(id)
     ↓
PropertyApiService.getProperty(id)
     ↓
ApiService.get('/properties/$id')
     ↓
[AuthInterceptor adds expired JWT token]
     ↓
[Dio makes HTTP GET request]
     ↓
Backend: Responds with 401 Unauthorized
     ↓
[ErrorInterceptor detects 401]
     ↓
ApiService._handleTokenRefresh()
     ↓
Check if already refreshing → Add to queue if yes
     ↓
Make POST /auth/refresh with refresh token
     ↓
Backend: Returns new access token
     ↓
Store new access token in secure storage
     ↓
Retry original request with new token
     ↓
[AuthInterceptor adds new JWT token]
     ↓
[Dio makes HTTP GET request again]
     ↓
Backend: Returns property data
     ↓
PropertyModel.fromJson() deserializes
     ↓
PropertyController updates state
     ↓
User sees property details
```

### Example 3: Creating Property with Images

```
User Action: Fill form and tap "Submit"
     ↓
PropertyFormController.createProperty()
     ↓
1. Upload images first
   MediaApiService.uploadMultiple(images)
     ↓
   For each image:
     - Create FormData with multipart/form-data
     - POST /media with progress callback
     - Track uploadProgress.value
     - Collect media URLs
     ↓
2. Create property with image URLs
   PropertyApiService.createProperty(propertyData)
     ↓
   POST /properties with property data + image URLs
     ↓
   Backend: Creates property record
     ↓
   Backend: Returns created property
     ↓
3. Deserialize response
   PropertyModel.fromJson(response.data)
     ↓
4. Navigate to property details
   Get.to(() => PropertyDetailScreen(property))
     ↓
User sees newly created property
```

## Error Handling Scenarios

### Scenario 1: Network Timeout

```
Request takes > 30 seconds
     ↓
Dio throws DioException(type: connectionTimeout)
     ↓
ErrorHandler.handleDioError()
     ↓
Returns NetworkException('Request timed out, please try again')
     ↓
Controller catches exception
     ↓
error.value = exception
     ↓
Screen shows ErrorWidget with retry button
     ↓
User taps retry
     ↓
Controller.retry() calls API again
```

### Scenario 2: Validation Error (400)

```
Backend returns 400 Bad Request
Response body: {
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
     ↓
ErrorHandler._handleStatusCode(400)
     ↓
Returns ValidationException with fieldErrors
     ↓
Controller displays errors below form fields
     ↓
User corrects errors and resubmits
```

### Scenario 3: Offline Detection

```
User opens property list while offline
     ↓
PropertyController.fetchProperties()
     ↓
ApiService.get('/properties')
     ↓
[ConnectivityInterceptor checks isOnline]
     ↓
isOnline = false
     ↓
Interceptor rejects request immediately
     ↓
Throws NetworkException('No internet connection')
     ↓
Controller catches exception
     ↓
Screen shows "You are offline" message
     ↓
Screen shows cached data if available
     ↓
User connects to wifi
     ↓
ConnectivityService detects change
     ↓
Shows "Connection restored" snackbar
     ↓
Controller.retry() automatically called
     ↓
Data refreshed from server
```

## Security Considerations

### 1. Token Storage

- **Access Token**: Stored in secure storage (encrypted)
- **Refresh Token**: Stored in secure storage (encrypted)
- **Never**: Store tokens in SharedPreferences or plain text

### 2. SSL/TLS

- **Production**: Enforce HTTPS and validate certificates
- **Development**: Allow localhost with self-signed certificates
- **Never**: Disable certificate validation in production

### 3. Sensitive Data Logging

- **Never log**: Passwords, tokens, API keys
- **Sanitize**: Request logs to remove sensitive fields
- **Disable**: Logging in production builds

### 4. Token Refresh Security

- **Prevent**: Multiple simultaneous refresh attempts
- **Queue**: Pending requests during refresh
- **Logout**: On refresh failure to prevent unauthorized access

## Performance Optimizations

### 1. Request Optimization

- **Pagination**: Load data in chunks (10-20 items per page)
- **Caching**: Use Dio cache interceptor for GET requests
- **Debouncing**: Debounce search inputs (300ms delay)
- **Throttling**: Throttle scroll-triggered load more

### 2. Image Loading

- **Lazy Loading**: Load images only when visible
- **Caching**: Use cached_network_image package
- **Compression**: Compress uploads before sending
- **Thumbnails**: Request thumbnail URLs for list views

### 3. State Management

- **Selective Updates**: Use Obx for targeted rebuilds
- **Computed Values**: Use getters for derived state
- **Avoid**: Rebuilding entire screens unnecessarily

### 4. Network Efficiency

- **Connection Reuse**: Dio maintains HTTP/2 connection pool
- **Request Cancellation**: Cancel pending requests on dispose
- **Batch Operations**: Batch related requests when possible

## Monitoring & Debugging

### Development Tools

1. **PrettyDioLogger**: Pretty print all HTTP traffic
2. **Flutter DevTools**: Monitor network requests
3. **Error Logs**: Detailed error logs with stack traces
4. **State Inspector**: GetX built-in state inspector

### Production Monitoring

1. **Error Tracking**: Integrate Sentry or Firebase Crashlytics
2. **Analytics**: Track API call success/failure rates
3. **Performance**: Monitor request duration and timeout rates
4. **User Feedback**: In-app feedback for API issues

## Testing Strategy

### Unit Tests

1. **Model Tests**: Test JSON serialization/deserialization
2. **Service Tests**: Test API service methods with mocks
3. **Controller Tests**: Test business logic with mocked services
4. **Utility Tests**: Test validation, formatting, conversion functions

### Integration Tests

1. **API Integration**: Test with local backend instance
2. **Authentication Flow**: End-to-end login/logout/refresh
3. **CRUD Operations**: Create, read, update, delete for each entity
4. **Error Handling**: Simulate various error conditions

### Widget Tests

1. **Loading States**: Test loading indicators appear/disappear
2. **Error States**: Test error messages display correctly
3. **Empty States**: Test empty state placeholders
4. **User Interactions**: Test button clicks trigger correct actions

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Configuration Loading Consistency

*For any* valid environment variable key-value pair in the `.env` file, loading the configuration should produce the same value when accessed through `ApiConfig`.

**Validates: Requirements 1.1, 1.2**

### Property 2: Timeout Conversion Accuracy

*For any* timeout value in seconds from the environment configuration, converting to milliseconds should equal the seconds value multiplied by 1000.

**Validates: Requirements 1.3**

### Property 3: Protocol Support Universality

*For any* URL string prefixed with "http://" or "https://", the API configuration should accept it as a valid base URL.

**Validates: Requirements 1.6**

### Property 4: Token Storage Persistence

*For any* valid JWT token string, storing the token in secure storage after login should make it retrievable on subsequent access.

**Validates: Requirements 2.1, 2.2**

### Property 5: Authorization Header Format

*For any* authenticated HTTP request with a stored access token, the request should include an Authorization header with the format "Bearer {token}".

**Validates: Requirements 2.3**

### Property 6: Token Refresh Trigger

*For any* HTTP request that returns a 401 status code (excluding auth endpoints), the API service should attempt to refresh the access token using the refresh token.

**Validates: Requirements 2.4**

### Property 7: Request Retry After Refresh

*For any* request that fails with 401 and where token refresh succeeds, the original request should be retried with the new access token.

**Validates: Requirements 2.5**

### Property 8: Refresh Concurrency Control

*For any* N simultaneous HTTP requests that return 401 status, only one token refresh attempt should be made, with other requests queued.

**Validates: Requirements 2.7**

### Property 9: Model Serialization Round-Trip

*For any* valid data model instance (PropertyModel, UserModel, ChatModel, MessageModel, NotificationModel, BrokerModel), serializing to JSON and then deserializing should produce an equivalent instance.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

### Property 10: Unknown Field Resilience

*For any* data model and any unknown JSON field not in the model schema, deserialization should succeed and ignore the unknown field without throwing an error.

**Validates: Requirements 3.7**

### Property 11: Required Field Validation

*For any* data model with a missing required field in the input JSON, deserialization should throw an error that includes the name of the missing field.

**Validates: Requirements 3.8**

### Property 12: Date Serialization Round-Trip

*For any* DateTime object, serializing to ISO 8601 string and then deserializing should produce an equivalent DateTime value.

**Validates: Requirements 3.9, 3.10**

### Property 13: Query Parameter Construction

*For any* combination of non-null filter values provided to the properties API, the constructed query string should contain all provided parameter names and values.

**Validates: Requirements 4.2**

### Property 14: Pagination Metadata Extraction

*For any* API response containing pagination metadata, parsing should correctly extract all pagination fields (page, limit, total, totalPages, hasNext, hasPrev).

**Validates: Requirements 4.3**

### Property 15: Upload Progress Bounds

*For any* file upload operation in progress, the progress value should be between 0 and 100 inclusive at all times.

**Validates: Requirements 8.6**

### Property 16: HTTP Error Message Mapping

*For any* HTTP error status code returned by the backend, the error handler should produce an appropriate error message specific to that status code.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.10**

### Property 17: Loading State Lifecycle - Start

*For any* API request that begins execution, a loading indicator should be visible in the UI while the request is in progress.

**Validates: Requirements 11.1**

### Property 18: Loading State Lifecycle - Success

*For any* API request that completes successfully, the loading state should be hidden and the fetched data should be displayed.

**Validates: Requirements 11.5**

### Property 19: Loading State Lifecycle - Failure

*For any* API request that fails, the loading state should be hidden and an error state with a retry option should be displayed.

**Validates: Requirements 11.6**

### Property 20: Button Disabling During Request

*For any* API request in progress, action buttons that could trigger duplicate requests should be disabled.

**Validates: Requirements 11.7**

### Property 21: Offline Detection Before Request

*For any* API request attempted when the device has no internet connection, the offline status should be detected before attempting the HTTP request.

**Validates: Requirements 12.1**

### Property 22: Offline Request Prevention

*For any* API request attempted while offline, an "You are offline" message should be displayed and no HTTP request should be sent.

**Validates: Requirements 12.2**

### Property 23: Response Success Field Validation

*For any* API response received from the backend, the mobile app should verify that the response contains a "success" field before processing the data.

**Validates: Requirements 13.1**

### Property 24: Deserialization Error Handling

*For any* JSON response that fails to deserialize into a data model, the error should be caught, logged with details, and a user-friendly error message should be displayed.

**Validates: Requirements 13.3, 13.4**

### Property 25: Optional Field Null Safety

*For any* data model with optional fields, deserialization should handle null values without throwing errors.

**Validates: Requirements 13.6**

### Property 26: Empty Array Deserialization

*For any* JSON response containing an empty array field, deserialization should convert it to an empty Dart List.

**Validates: Requirements 13.7**

## Migration Guide

### For Controllers

**Before (Mock Data)**:
```dart
class PropertyController extends GetxController {
  final properties = mockProperties.obs;
  
  void fetchProperties() {
    properties.value = mockProperties;
  }
}
```

**After (Real API)**:
```dart
class PropertyController extends GetxController {
  final PropertyApiService _api = Get.find();
  
  final properties = <PropertyModel>[].obs;
  final isLoading = false.obs;
  final error = Rxn<AppException>();
  
  Future<void> fetchProperties() async {
    isLoading.value = true;
    error.value = null;
    
    try {
      final response = await _api.getProperties();
      if (response.success) {
        properties.value = response.data ?? [];
      }
    } on AppException catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }
}
```

### For Screens

**Before**:
```dart
Widget build(BuildContext context) {
  return ListView.builder(
    itemCount: controller.properties.length,
    itemBuilder: (context, index) {
      return PropertyCard(property: controller.properties[index]);
    },
  );
}
```

**After**:
```dart
Widget build(BuildContext context) {
  return Obx(() {
    if (controller.isLoading.value) {
      return ShimmerLoading();
    }
    
    if (controller.error.value != null) {
      return ErrorWidget(
        error: controller.error.value!,
        onRetry: controller.fetchProperties,
      );
    }
    
    if (controller.properties.isEmpty) {
      return EmptyState(message: 'No properties found');
    }
    
    return RefreshIndicator(
      onRefresh: controller.refresh,
      child: ListView.builder(
        itemCount: controller.properties.length + (controller.hasMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == controller.properties.length) {
            return LoadingIndicator(); // Load more indicator
          }
          return PropertyCard(property: controller.properties[index]);
        },
      ),
    );
  });
}
```

## Appendix

### A. Complete API Endpoint List

#### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/verify-email` - Verify email with token

#### User Endpoints
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/profile` - Get detailed user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users` - Get all users (paginated)
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/:id/profile` - Get user profile by ID

#### Property Endpoints
- `GET /api/v1/properties` - Get all properties with filters
- `GET /api/v1/properties/featured` - Get featured properties
- `GET /api/v1/properties/my` - Get current user's properties
- `GET /api/v1/properties/:id` - Get property by ID
- `POST /api/v1/properties` - Create new property
- `PUT /api/v1/properties/:id` - Update property
- `DELETE /api/v1/properties/:id` - Delete property
- `POST /api/v1/properties/:id/views` - Increment views
- `POST /api/v1/properties/:id/favorite` - Toggle favorite

#### Chat Endpoints
- `GET /api/v1/chat` - Get user's chats
- `GET /api/v1/chat/:id` - Get chat by ID
- `GET /api/v1/chat/:id/messages` - Get chat messages
- `POST /api/v1/chat` - Create new chat
- `POST /api/v1/chat/:id/messages` - Send message
- `POST /api/v1/chat/messages/read` - Mark messages as read
- `DELETE /api/v1/chat/:id` - Delete chat

#### Notification Endpoints
- `GET /api/v1/notifications` - Get notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `DELETE /api/v1/notifications/:id` - Delete notification

#### Media Endpoints
- `POST /api/v1/media` - Upload single file
- `POST /api/v1/media/upload-multiple` - Upload multiple files (deprecated - use single upload multiple times)
- `DELETE /api/v1/media/:id` - Delete media file

### B. Environment Variables Reference

```env
# API Configuration
API_BASE_URL=http://localhost:3003/api/v1
API_TIMEOUT_SECONDS=30

# Feature Flags
USE_MOCK_DATA=false
ENABLE_REQUEST_LOGS=true

# Development
DEBUG_MODE=true
```

### C. Data Model Schema Reference

See backend Prisma schema at `d:\Projects\realestate-server\prisma\schema.prisma` for complete entity definitions.

### D. Testing Checklist

- [ ] User can register with email/password
- [ ] User can login and receive JWT tokens
- [ ] Tokens stored securely in storage
- [ ] Token automatically refreshes on 401
- [ ] User redirected to login on refresh failure
- [ ] Property list displays real data from backend
- [ ] Property filtering works with query parameters
- [ ] Pagination loads more items correctly
- [ ] Pull-to-refresh updates data
- [ ] Property details show complete information
- [ ] User can create new property with images
- [ ] Images upload with progress indicator
- [ ] User can update existing property
- [ ] User can delete their property
- [ ] Favorite toggle works and persists
- [ ] Chat list shows real conversations
- [ ] User can send messages in chat
- [ ] Messages display in correct order
- [ ] Notifications appear from backend
- [ ] Unread notification count updates
- [ ] User can view and edit profile
- [ ] Broker list shows real brokers
- [ ] Loading indicators appear during requests
- [ ] Error messages display for failures
- [ ] Retry button works after errors
- [ ] Offline detection prevents requests
- [ ] App shows cached data when offline
- [ ] Connection restored notification appears
- [ ] No mock data used when USE_MOCK_DATA=false
- [ ] Logging works when ENABLE_REQUEST_LOGS=true
- [ ] Logging disabled when ENABLE_REQUEST_LOGS=false

---

**Document Version**: 1.0  
**Last Updated**: 2026-09-01  
**Language**: Dart/Flutter  
**Backend**: NestJS REST API

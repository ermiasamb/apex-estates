# Flutter Mobile App Development Requirements - Apex Estates Real Estate Platform

## Project Overview
Develop a cross-platform mobile application (iOS & Android) using Flutter for the Apex Estates Real Estate Platform. The app must provide feature parity with the existing web application and integrate directly with the REST backend API.

---

## Backend Integration

### API Configuration
- **Base URL**: `http://localhost:3003/api/v1` (Development) / Production URL to be configured
- **API Type**: REST API (JSON)
- **Authentication**: JWT Bearer Token (Access Token + Refresh Token)
- **Port**: Backend runs on port 3003 (Development)

### Important Notes
- The backend provides BOTH REST and GraphQL APIs
- The web application uses the **REST API** exclusively
- For consistency, the mobile app must also use the **REST API**
- REST endpoints are prefixed with `/api/v1`
- The Postman collection `Apex-Estates-REST-API-Postman-Collection.json` reflects the current implementation

---

## Required Flutter Packages

The following packages MUST be used for the mobile app:

### Core & State Management
- `get` - State management, navigation, and dependency injection (GetX)
- `get_storage` - Local storage for preferences and cache

### Network & API
- `dio` - HTTP client for REST API calls
- `pretty_dio_logger` - Network request/response logging

### UI & Loading
- `flutter_spinkit` - Loading indicators and spinners
- `shimmer` - Skeleton loading animations
- `animations` - Custom animations
- `google_fonts` - Custom fonts

### Media & Display
- `cached_network_image` - Optimized image loading and caching
- `image_picker` - Camera and gallery access

### Utils
- `flutter_dotenv` - Environment variables configuration
- `intl` - Internationalization and date formatting
- `url_launcher` - Open URLs, phone, email
- `share_plus` - Share functionality
- `connectivity_plus` - Network connectivity status
- `flutter_inappwebview` - In-app browser for virtual tours

### App Configuration
- `flutter_launcher_icons` - App icon generation

### Important Constraints
- ❌ **NO code generation packages** (no `build_runner`, `json_serializable` generators)
- ❌ **NO dependency injection packages** beyond GetX (no `get_it`)
- ❌ **NO json_annotation, retrofit, or similar generator-based packages**
- ✅ All JSON parsing will be done **manually** with `fromJson` and `toJson` methods
- ✅ All models will be simple Dart classes

---

## Architecture & Project Structure

The app MUST follow a **modular, portable, and maintainable architecture** with clear separation of concerns.

### Project Structure (Flat & Simple)
```
lib/
├── main.dart
│
├── config/
│   ├── app_config.dart              # App configuration
│   ├── api_config.dart              # API base URLs and endpoints
│   ├── app_routes.dart              # Route definitions
│   └── storage_keys.dart            # Storage key constants
│
├── themes/
│   ├── app_theme.dart               # Main theme configuration
│   ├── app_colors.dart              # Color palette (EASY TO CHANGE)
│   ├── app_text_styles.dart         # Text styles
│   ├── app_decorations.dart         # Input, card, container decorations
│   └── app_dimensions.dart          # Spacing, sizing constants
│
├── translations/
│   ├── en_us.dart                   # English translations
│   └── am_et.dart                   # Amharic translations
│
├── controllers/
│   ├── auth_controller.dart         # Authentication controller
│   ├── home_controller.dart         # Home screen controller
│   ├── property_controller.dart     # Property list controller
│   ├── property_detail_controller.dart
│   ├── property_form_controller.dart
│   ├── favorites_controller.dart    # Favorites controller
│   ├── brokers_controller.dart      # Brokers controller
│   ├── broker_detail_controller.dart
│   ├── profile_controller.dart      # Profile controller
│   ├── search_controller.dart       # Search controller
│   ├── notifications_controller.dart
│   └── settings_controller.dart
│
├── models/
│   ├── api_response.dart            # Generic API response
│   ├── api_error.dart               # API error model
│   ├── pagination.dart              # Pagination model
│   ├── user_model.dart              # User model
│   ├── profile_model.dart           # User profile model
│   ├── property_model.dart          # Property model
│   ├── property_filter.dart         # Property filter model
│   ├── property_location.dart       # Property location model
│   ├── property_pricing.dart        # Property pricing model
│   ├── property_details.dart        # Property details model
│   ├── property_media.dart          # Property media model
│   ├── broker_model.dart            # Broker model
│   ├── chat_model.dart              # Chat model
│   ├── message_model.dart           # Message model
│   ├── notification_model.dart      # Notification model
│   ├── login_request.dart           # Login request
│   ├── register_request.dart        # Register request
│   ├── auth_response.dart           # Auth response
│   └── property_request.dart        # Create/Update property request
│
├── services/
│   ├── api_service.dart             # Base API service (Dio)
│   ├── auth_service.dart            # Auth service
│   ├── auth_api_service.dart        # Auth API calls
│   ├── user_api_service.dart        # User API calls
│   ├── property_api_service.dart    # Property API calls
│   ├── broker_api_service.dart      # Broker API calls
│   ├── chat_api_service.dart        # Chat API calls
│   ├── notification_api_service.dart # Notification API calls
│   ├── media_api_service.dart       # Media upload service
│   ├── storage_service.dart         # Local storage
│   ├── connectivity_service.dart    # Network monitoring
│   ├── logging_service.dart         # Logging service
│   └── error_service.dart           # Error handling
│
├── screens/
│   ├── splash_screen.dart           # Splash screen
│   ├── onboarding_screen.dart       # Onboarding screen
│   ├── login_screen.dart            # Login screen
│   ├── register_screen.dart         # Register screen
│   ├── forgot_password_screen.dart  # Forgot password screen
│   ├── reset_password_screen.dart   # Reset password screen
│   ├── verify_email_screen.dart     # Email verification screen
│   ├── verify_otp_screen.dart       # OTP verification screen
│   ├── home_screen.dart             # Home screen
│   ├── search_screen.dart           # Search screen
│   ├── properties_screen.dart       # Property list screen
│   ├── property_detail_screen.dart  # Property detail screen
│   ├── add_property_screen.dart     # Add property screen
│   ├── edit_property_screen.dart    # Edit property screen
│   ├── my_properties_screen.dart    # My properties screen
│   ├── property_analytics_screen.dart # Property analytics
│   ├── favorites_screen.dart        # Favorites screen
│   ├── brokers_screen.dart          # Brokers list screen
│   ├── broker_detail_screen.dart    # Broker detail screen
│   ├── profile_screen.dart          # Profile screen
│   ├── edit_profile_screen.dart     # Edit profile screen
│   ├── settings_screen.dart         # Settings screen
│   ├── notifications_screen.dart    # Notifications screen
│   ├── chat_list_screen.dart        # Chat list screen
│   ├── chat_screen.dart             # Chat conversation screen
│   └── about_screen.dart            # About app screen
│
├── widgets/
│   ├── custom_text_field.dart       # Text input widget
│   ├── custom_dropdown.dart         # Dropdown widget
│   ├── custom_checkbox.dart         # Checkbox widget
│   ├── custom_radio.dart            # Radio button widget
│   ├── custom_switch.dart           # Switch widget
│   ├── date_picker_field.dart       # Date picker widget
│   ├── search_field.dart            # Search input widget
│   ├── multi_select_field.dart      # Multi-select widget
│   ├── primary_button.dart          # Primary button
│   ├── secondary_button.dart        # Secondary button
│   ├── outline_button.dart          # Outline button
│   ├── text_button_custom.dart      # Text button
│   ├── icon_button_custom.dart      # Icon button
│   ├── floating_action_btn.dart     # FAB
│   ├── property_card.dart           # Property card
│   ├── broker_card.dart             # Broker card
│   ├── info_card.dart               # Info card
│   ├── stat_card.dart               # Statistics card
│   ├── app_layout.dart              # Main app layout
│   ├── custom_app_bar.dart          # Custom app bar
│   ├── custom_bottom_nav.dart       # Bottom nav bar
│   ├── custom_drawer.dart           # Side drawer
│   ├── tab_bar_custom.dart          # Tab bar
│   ├── loading_indicator.dart       # Loading spinner
│   ├── error_widget.dart            # Error display
│   ├── empty_state.dart             # Empty state
│   ├── shimmer_loading.dart         # Shimmer loader
│   ├── badge_widget.dart            # Badge widget
│   ├── tag_chip.dart                # Tag/chip widget
│   ├── avatar_widget.dart           # Avatar widget
│   ├── divider_widget.dart          # Divider widget
│   ├── section_header.dart          # Section header
│   ├── cached_image.dart            # Cached image
│   ├── image_gallery.dart           # Image gallery
│   ├── image_placeholder.dart       # Image placeholder
│   ├── confirmation_dialog.dart     # Confirmation dialog
│   ├── info_dialog.dart             # Info dialog
│   ├── bottom_sheet_custom.dart     # Bottom sheet
│   ├── property_list_item.dart      # Property list item
│   ├── property_filter_sheet.dart   # Property filter sheet
│   └── property_stats_widget.dart   # Property stats
│
├── utils/
│   ├── date_utils.dart              # Date utilities
│   ├── string_utils.dart            # String utilities
│   ├── currency_utils.dart          # Currency utilities
│   ├── validator_utils.dart         # Validation utilities
│   ├── list_utils.dart              # List utilities
│   ├── image_utils.dart             # Image utilities
│   └── snackbar_utils.dart          # Snackbar utilities
│
├── constants/
│   ├── app_constants.dart           # App constants
│   ├── api_endpoints.dart           # API endpoints
│   └── asset_constants.dart         # Asset paths
│
├── exceptions/
│   ├── app_exception.dart           # Base exception
│   ├── network_exception.dart       # Network exceptions
│   └── auth_exception.dart          # Auth exceptions
│
└── bindings/
    └── initial_binding.dart         # Initial bindings

```

### Architecture Principles

1. **GetX State Management**
   - Use `GetxController` for ALL state management
   - Reactive state with `.obs` observables
   - GetX dependency injection (NO get_it)
   - Simple and minimal boilerplate

2. **Modular Services**
   - Single `ApiService` class for ALL HTTP requests
   - Centralized error handling in `ErrorService`
   - Reusable utility functions in separate files
   - Each feature has its own API service that uses the base `ApiService`

3. **Portable Widgets**
   - EVERY UI component is a separate, reusable widget
   - Widgets are configurable via constructor parameters
   - NO hard-coded values - use theme and constants
   - Easy to copy widgets between projects

4. **Manual JSON Parsing**
   - NO code generation tools
   - Simple `fromJson` and `toJson` factory methods
   - Easy to understand and debug
   - NO build step required

5. **Configurable Theming**
   - ALL colors defined in `app_colors.dart`
   - Change entire app theme by modifying ONE file
   - Consistent spacing via `app_dimensions.dart`
   - Easy light/dark mode support

6. **Clean Separation**
   - Controllers handle state and business logic ONLY
   - Services handle API calls and data operations ONLY
   - Models are pure data classes ONLY
   - Screens are UI ONLY (NO business logic)
   - Widgets are reusable UI components ONLY

### Why This Flat Structure?

**Easy to Navigate**:
- Need a screen? Look in `/screens` folder
- Need a controller? Look in `/controllers` folder  
- Need a model? Look in `/models` folder
- Need a widget? Look in `/widgets` folder
- Need a service? Look in `/services` folder

**No Deep Nesting**:
- No `features/auth/controllers/` - just `controllers/auth_controller.dart`
- No `features/properties/screens/` - just `screens/properties_screen.dart`
- Everything is ONE level deep - super simple!

**File Naming Makes It Clear**:
- `login_screen.dart` - Obviously a screen
- `auth_controller.dart` - Obviously a controller
- `property_model.dart` - Obviously a model
- `primary_button.dart` - Obviously a widget

**Easy for Beginners**:
- No confusion about where files go
- No nested folder hunting
- Clear organization by file type
- Familiar structure (like most tutorials)

---

## REST API Endpoints

All endpoints are prefixed with `/api/v1`. Base URL: `http://localhost:3003/api/v1`

### Authentication (`/auth/*`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/verify-email` - Verify email with token

### Users (`/users/*`)
- `GET /users/me` - Get current user profile
- `GET /users/profile` - Get detailed user profile
- `PUT /users/profile` - Update user profile
- `GET /users` - Get all users (paginated, with filters)
- `GET /users/:id` - Get user by ID
- `GET /users/:id/profile` - Get user profile by ID
- `POST /users` - Create user (admin)
- `PUT /users/:id` - Update user (admin)
- `DELETE /users/:id` - Delete user (admin)

### Properties (`/properties/*`)
- `GET /properties` - Get all properties (with filters, pagination)
- `GET /properties/featured` - Get featured properties
- `GET /properties/my` - Get current user's properties
- `GET /properties/:id` - Get property by ID
- `POST /properties` - Create new property
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property
- `POST /properties/:id/views` - Increment property views
- `POST /properties/:id/favorite` - Toggle property favorite

### Chat & Messaging (`/chat/*`)
- `GET /chat` - Get user's chats (paginated)
- `GET /chat/:id` - Get chat by ID
- `GET /chat/:id/messages` - Get chat messages (paginated)
- `POST /chat` - Create new chat
- `POST /chat/:id/messages` - Send message
- `POST /chat/messages/read` - Mark messages as read
- `DELETE /chat/:id` - Delete chat

### Media (`/media/*`)
- `POST /media/upload` - Upload single file
- `POST /media/upload-multiple` - Upload multiple files
- `DELETE /media/:id` - Delete media file

### Notifications (`/notifications/*`)
- `GET /notifications` - Get notifications (paginated)
- `GET /notifications/unread-count` - Get unread count
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

---

## Success Criteria

1. **Modularity**: Every widget, service, and utility is in a separate, reusable file
2. **Portability**: Easy to copy widgets and services to other projects
3. **Configurability**: Theme can be changed by modifying one file (`app_colors.dart`)
4. **Maintainability**: Clear separation between UI, logic, and data
5. **No Generators**: NO build_runner, NO code generation
6. **GetX Only**: ALL state management, DI, and navigation via GetX
7. **Manual JSON**: All models use manual `fromJson`/`toJson` methods
8. **REST API**: Uses REST API exclusively (NO GraphQL)

---

## Resources

- **REST API Documentation**: `Apex-Estates-REST-API-Postman-Collection.json`
- **Web App Reference**: `d:\Projects\apex-estates` for UI/UX patterns
- **API Client Reference**: `src/lib/api-client.ts` for implementation patterns
- **Backend**: `d:\Projects\realestate-server`

---

**END OF REQUIREMENTS DOCUMENT**

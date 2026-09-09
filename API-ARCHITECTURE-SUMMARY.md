# API Architecture Summary - Apex Estates

## Overview
The Apex Estates backend provides **BOTH** GraphQL and REST APIs. However, the web application and mobile app should use the **REST API exclusively** for consistency.

---

## Backend Architecture

### Available APIs

#### 1. REST API ✅ (RECOMMENDED - ACTIVELY USED)
- **Base URL**: `http://localhost:3003/api/v1`
- **Format**: Standard REST with JSON
- **Authentication**: JWT Bearer tokens
- **Used by**: Web Application (Next.js)
- **Collection**: `Apex-Estates-REST-API-Postman-Collection.json`

#### 2. GraphQL API ⚠️ (AVAILABLE BUT NOT USED)
- **Endpoint**: `http://localhost:5000/graphql`
- **Format**: GraphQL queries and mutations
- **Authentication**: JWT Bearer tokens
- **Used by**: Nothing (available but not utilized)
- **Collection**: `Apex-Estates-API-Postman-Collection.json`

---

## Current Usage

### Web Application (`/apex-estates`)
The Next.js web application uses **REST API only**:

**API Client**: `src/lib/api-client.ts`
- Custom `ApiClient` class wrapping `fetch`
- Automatic token refresh on 401 errors
- REST endpoint calls

**Service Layer**:
- `src/services/auth-service.ts` → REST `/auth/*`
- `src/services/property-service.ts` → REST `/properties/*`
- `src/services/user-service.ts` → REST `/users/*`

**Example REST Call**:
```typescript
// Login
apiClient.post('/auth/login', { email, password })

// Get properties
apiClient.get('/properties?page=1&limit=10')

// Create property
apiClient.post('/properties', propertyData)
```

---

## Why REST API?

### Reasons the Web App Uses REST:
1. **Simpler implementation** - Standard HTTP methods (GET, POST, PUT, DELETE)
2. **Better caching** - HTTP caching mechanisms work out of the box
3. **URL-based resources** - Easy to understand and debug
4. **Standard tooling** - Works with all HTTP clients, browsers, debugging tools
5. **File uploads** - Easier to handle `multipart/form-data` for media uploads

### GraphQL Was Likely Built But:
- Initial implementation that was later replaced with REST
- Kept for potential future use or backward compatibility
- Web app team decided REST was simpler for their use case

---

## Mobile App Recommendation

### Use REST API ✅

**Reasons**:
1. **Consistency** with the web application
2. **Proven** - Already tested and working in production
3. **Same bugs, same fixes** - Easier to maintain parity
4. **Simpler** - Less overhead than GraphQL client setup
5. **Better documentation** - The REST Postman collection is complete

**Implementation**:
```dart
// Use Dio package for REST API
final dio = Dio(BaseOptions(
  baseUrl: 'http://localhost:3003/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
));

// Add interceptor for auth token
dio.interceptors.add(AuthInterceptor());

// Make REST calls
await dio.post('/auth/login', data: {
  'email': email,
  'password': password,
});
```

---

## GraphQL Client Exists But Unused

The web app has `src/lib/graphql-client.ts` but **it's never imported or used** in the actual application code.

```typescript
// This file exists but is NOT used anywhere
export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);
```

It appears to be:
- Legacy code from initial development
- Placeholder for future features
- Or abandoned implementation

---

## API Endpoint Comparison

### Authentication
| Feature | REST Endpoint | GraphQL Equivalent |
|---------|---------------|-------------------|
| Login | `POST /api/v1/auth/login` | `mutation { login(input: {...}) }` |
| Register | `POST /api/v1/auth/register` | `mutation { register(input: {...}) }` |
| Refresh Token | `POST /api/v1/auth/refresh` | `mutation { refreshToken(input: {...}) }` |

### Properties
| Feature | REST Endpoint | GraphQL Equivalent |
|---------|---------------|-------------------|
| Get All | `GET /api/v1/properties?page=1&limit=10` | `query { properties(pagination: {...}) }` |
| Get One | `GET /api/v1/properties/:id` | `query { property(id: "...") }` |
| Create | `POST /api/v1/properties` | `mutation { createProperty(input: {...}) }` |
| Update | `PUT /api/v1/properties/:id` | `mutation { updateProperty(id: "...", input: {...}) }` |

Both APIs provide the same functionality, just different interfaces.

---

## File Structure Reference

### Backend (NestJS)
```
realestate-server/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts      # REST endpoints
│   │   └── auth.resolver.ts        # GraphQL resolvers (if exists)
│   ├── properties/
│   │   ├── properties.controller.ts # REST endpoints
│   │   └── properties.resolver.ts   # GraphQL resolvers (if exists)
│   └── users/
│       ├── users.controller.ts      # REST endpoints
│       └── users.resolver.ts        # GraphQL resolvers (if exists)
```

### Frontend (Next.js)
```
apex-estates/
├── src/
│   ├── lib/
│   │   ├── api-client.ts           # ✅ REST client (USED)
│   │   └── graphql-client.ts       # ❌ GraphQL client (NOT USED)
│   └── services/
│       ├── auth-service.ts         # Uses REST
│       ├── property-service.ts     # Uses REST
│       └── user-service.ts         # Uses REST
```

---

## Decision for Mobile App

### Final Recommendation: **Use REST API**

**Confidence Level**: High ✅

**Action Items**:
1. Use the REST API endpoints from `Apex-Estates-REST-API-Postman-Collection.json`
2. Implement with `dio` package in Flutter
3. Follow the same authentication flow as web app
4. Reference `api-client.ts` for implementation patterns
5. Ignore GraphQL entirely unless there's a specific reason to use it

---

## When to Consider GraphQL

Consider using GraphQL only if:
- ❌ Backend team explicitly recommends it
- ❌ You need to query deeply nested relationships
- ❌ You need to minimize network requests significantly
- ❌ Web app switches to GraphQL in the future

**Current situation**: None of these apply, so stick with REST API.

---

## Summary

| Aspect | Status |
|--------|--------|
| Backend provides REST | ✅ Yes |
| Backend provides GraphQL | ✅ Yes |
| Web app uses REST | ✅ Yes |
| Web app uses GraphQL | ❌ No |
| Mobile app should use | ✅ REST |

**Conclusion**: The mobile app should use the **REST API** to maintain consistency with the web application and follow the proven, tested implementation path.

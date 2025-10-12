# Plataforma Astral Dashboard API Documentation

## Overview

The Plataforma Astral Dashboard provides a comprehensive REST API for managing educational operations across multiple user roles (Master, Admin, Profesor, Parent). This documentation covers all API endpoints, authentication, and usage patterns.

## Authentication

All API endpoints require authentication using NextAuth.js JWT tokens.

### Authentication Headers

```http
Authorization: Bearer <jwt-token>
```

### User Roles

- **MASTER**: Supreme authority with access to all system functions
- **ADMIN**: Administrative access to user management and school operations
- **PROFESOR**: Teacher access to planning, meetings, and student management
- **PARENT**: Parent access to student information and communications

## Base URL

```text
https://your-domain.com/api
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login

Authenticate user credentials.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**

```json
{
  "user": {
    "id": "string",
    "email": "user@example.com",
    "name": "User Name",
    "role": "ADMIN"
  },
  "token": "jwt-token"
}
```

### Dashboard Endpoints

#### GET /api/admin/dashboard

Get administrative dashboard statistics.

**Permissions:** ADMIN, MASTER

**Response:**

```json
{
  "users": {
    "total": 150,
    "active": 140,
    "admins": 5,
    "profesores": 25,
    "parents": 120
  },
  "meetings": {
    "total": 50,
    "upcoming": 15
  },
  "documents": {
    "total": 200,
    "recent": 25
  },
  "team": {
    "total": 12,
    "active": 10
  },
  "calendar": {
    "upcomingEvents": [...]
  }
}
```

#### GET /api/profesor/dashboard

Get teacher dashboard statistics.

**Permissions:** PROFESOR, MASTER

**Response:**

```json
{
  "plannings": {
    "total": 45,
    "completed": 38
  },
  "meetings": {
    "total": 15,
    "upcoming": 4
  },
  "students": {
    "total": 25,
    "active": 24
  },
  "activities": {
    "total": 30,
    "upcoming": 8
  }
}
```

#### GET /api/parent/dashboard/overview

Get parent dashboard overview.

**Permissions:** PARENT, MASTER

**Response:**

```json
{
  "overallAverage": 87,
  "attendanceRate": 94,
  "newMessagesCount": 5,
  "childrenCount": 2,
  "upcomingEvents": [...],
  "recentActivity": [...]
}
```

#### GET /api/master/dashboard

Get master system dashboard.

**Permissions:** MASTER only

**Response:**

```json
{
  "users": {
    "total": 1247,
    "active": 892,
    "byRole": {
      "MASTER": 1,
      "ADMIN": 5,
      "PROFESOR": 25,
      "PARENT": 1216
    }
  },
  "performance": {
    "responseTime": 45,
    "uptime": "99.98%",
    "throughput": 15420
  },
  "security": {
    "threats": 3,
    "blocked": 47
  },
  "database": {
    "connections": 23,
    "size": "2.4GB"
  }
}
```

### User Management

#### GET /api/admin/users

List all users.

**Permissions:** ADMIN, MASTER

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `role`: Filter by role

**Response:**

```json
{
  "users": [
    {
      "id": "string",
      "name": "User Name",
      "email": "user@example.com",
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

#### POST /api/admin/users

Create new user.

**Permissions:** ADMIN, MASTER

**Request Body:**

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securepassword123",
  "role": "PROFESOR"
}
```

**Response:**

```json
{
  "id": "string",
  "name": "New User",
  "email": "newuser@example.com",
  "role": "PROFESOR",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Notification System

#### GET /api/notifications

Get user notifications.

**Permissions:** All authenticated users

**Query Parameters:**

- `status`: "all", "unread", "read" (default: "all")
- `limit`: Number of notifications (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "notifications": [
    {
      "id": "string",
      "title": "Meeting Reminder",
      "message": "You have a meeting tomorrow",
      "type": "info",
      "category": "meeting",
      "priority": "medium",
      "read": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

#### POST /api/notifications

Create notification.

**Permissions:** ADMIN, PROFESOR, MASTER

**Request Body:**

```json
{
  "title": "System Maintenance",
  "message": "The system will be down for maintenance tonight",
  "type": "warning",
  "category": "system",
  "priority": "high",
  "isBroadcast": true
}
```

**Response:**

```json
{
  "message": "Notification sent to all users",
  "sentTo": 150
}
```

#### PATCH /api/notifications

Mark notifications as read.

**Permissions:** All authenticated users

**Request Body:**

```json
{
  "notificationIds": ["notif-1", "notif-2"],
  "markAll": false
}
```

**Response:**

```json
{
  "message": "Notifications marked as read"
}
```

#### GET /api/notifications/stream

Server-Sent Events stream for real-time notifications.

**Permissions:** All authenticated users

**Response:** Server-Sent Events stream

```json
data: {"type":"notification","title":"New Message","message":"...","timestamp":"2024-01-01T00:00:00Z"}

data: {"type":"heartbeat","timestamp":"2024-01-01T00:00:05Z"}
```

### Meeting Management

#### GET /api/admin/meetings

List meetings.

**Permissions:** ADMIN, MASTER

**Query Parameters:**

- `status`: "scheduled", "completed", "cancelled"
- `page`: Page number
- `limit`: Items per page

#### POST /api/admin/meetings

Create meeting.

**Permissions:** ADMIN, MASTER

**Request Body:**

```json
{
  "title": "Parent-Teacher Conference",
  "description": "Discuss student progress",
  "studentName": "Juan Pérez",
  "studentGrade": "3° Básico",
  "guardianName": "María Pérez",
  "guardianEmail": "parent@example.com",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "10:00",
  "duration": 60,
  "type": "PARENT_TEACHER"
}
```

### Planning Documents

#### GET /api/profesor/plannings

List planning documents.

**Permissions:** PROFESOR, MASTER

**Query Parameters:**

- `subject`: Filter by subject
- `grade`: Filter by grade
- `page`: Page number
- `limit`: Items per page

#### POST /api/profesor/plannings

Create planning document.

**Permissions:** PROFESOR, MASTER

**Request Body:**

```json
{
  "title": "Mathematics Lesson Plan",
  "content": "Lesson content...",
  "subject": "Mathematics",
  "grade": "3° Básico",
  "objectives": "Learn basic addition",
  "materials": "Textbook, worksheets",
  "duration": 45
}
```

### Activities Management

#### GET /api/profesor/activities

List activities.

**Permissions:** PROFESOR, MASTER

**Query Parameters:**

- `status`: "upcoming", "completed"
- `type`: Activity type filter
- `page`: Page number
- `limit`: Items per page

#### POST /api/profesor/activities

Create activity.

**Permissions:** PROFESOR, MASTER

**Request Body:**

```json
{
  "title": "Science Experiment",
  "description": "Volcano eruption experiment",
  "type": "CLASS",
  "subject": "Science",
  "grade": "4° Básico",
  "scheduledDate": "2024-01-20",
  "scheduledTime": "14:00",
  "duration": 90,
  "location": "Science Lab",
  "objectives": "Understand chemical reactions",
  "materials": "Vinegar, baking soda, clay",
  "maxParticipants": 25
}
```

### Calendar Events

#### GET /api/calendar/events

List calendar events.

**Permissions:** All authenticated users

**Query Parameters:**

- `start`: Start date (ISO format)
- `end`: End date (ISO format)
- `category`: Event category filter

#### POST /api/calendar/events

Create calendar event.

**Permissions:** ADMIN, PROFESOR, MASTER

**Request Body:**

```json
{
  "title": "School Assembly",
  "description": "Monthly school assembly",
  "startDate": "2024-01-25T09:00:00Z",
  "endDate": "2024-01-25T10:30:00Z",
  "category": "ACADEMIC",
  "location": "Auditorium",
  "isAllDay": false,
  "priority": "MEDIUM"
}
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints are protected by rate limiting:

- **Admin operations**: 10 requests per minute
- **General operations**: 60 requests per minute
- **Read operations**: 120 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1638360000
```

## Real-time Features

### Server-Sent Events

The notification system uses Server-Sent Events for real-time updates:

```javascript
const eventSource = new EventSource("/api/notifications/stream");

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "notification") {
    // Handle new notification
    console.log("New notification:", data);
  }
};

eventSource.onerror = (error) => {
  console.error("SSE error:", error);
  // Implement reconnection logic
};
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control on all operations
3. **Input Validation**: Comprehensive validation using Zod schemas
4. **Rate Limiting**: Protection against abuse
5. **Data Sanitization**: Input sanitization to prevent XSS
6. **HTTPS Only**: All communications must use HTTPS in production

## Performance Optimization

The API includes several performance optimizations:

1. **Caching**: Response caching with configurable TTL
2. **Pagination**: All list endpoints support pagination
3. **Database Indexing**: Optimized database queries
4. **Connection Pooling**: Efficient database connection management
5. **Compression**: Response compression for large payloads

## Deployment Checklist

### Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Database Setup

1. Run Prisma migrations: `npx prisma migrate deploy`
2. Generate Prisma client: `npx prisma generate`
3. Seed database (if needed): `npx prisma db seed`

### Build and Deployment

```bash
# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

### Monitoring

1. Set up error tracking (Sentry, LogRocket)
2. Configure performance monitoring
3. Set up database monitoring
4. Configure uptime monitoring

## Support

For API support and questions:

- Email: support@manitospintadas.com
- Documentation: https://docs.manitospintadas.com
- API Status: https://status.manitospintadas.com

# Notification Service

A comprehensive notification management microservice with following system support for the SOA Final Project. Provides notification grouping, read/unread status tracking, and user following with bell toggle functionality.

## Features

- **Notification Management**
  - Create, read, update, and delete notifications
  - Mark notifications as read (single or all)
  - Filter by type, read status, and limit
  - Get unread notification count
  - Delete all notifications at once

- **Notification Grouping**
  - Group notifications by thread (comments on user's threads)
  - Group notifications by comment (replies on user's comments)
  - Show count and latest timestamp for each group
  - Track unread status per group

- **Following System**
  - Follow/unfollow users
  - View following list with user details
  - Toggle bell notifications per followed user
  - Prevent self-following

## API Endpoints

### Notifications

#### Get All Notifications
```http
GET /api/notifications
Query Parameters:
  - type: thread_comment | comment_reply | follow | mention | like | system
  - is_read: boolean
  - limit: integer (1-100)
```

#### Get Grouped Thread Comment Notifications
```http
GET /api/notifications/grouped/thread-comments
```
Returns notifications grouped by thread, showing all comments on user's threads.

#### Get Grouped Comment Reply Notifications
```http
GET /api/notifications/grouped/comment-replies
```
Returns notifications grouped by comment, showing all replies on user's comments.

#### Get Unread Count
```http
GET /api/notifications/unread-count
```

#### Get Notification by ID
```http
GET /api/notifications/:id
```

#### Create Notification
```http
POST /api/notifications
Body:
{
  "recipient_id": "uuid",
  "sender_id": "uuid",
  "title": "string",
  "type": "thread_comment | comment_reply | follow | mention | like | system",
  "reference_id": "uuid",
  "reference_type": "thread | comment | resource | collection"
}
```

#### Mark as Read
```http
PUT /api/notifications/:id/mark-read
```

#### Mark All as Read
```http
PUT /api/notifications/mark-all-read
```

#### Delete Notification
```http
DELETE /api/notifications/:id
```

#### Delete All Notifications
```http
DELETE /api/notifications/delete-all
```

### Following System

#### Get Following List
```http
GET /api/notifications/following/list
```
Returns all users the authenticated user is following with bell status.

#### Follow User
```http
POST /api/notifications/following
Body:
{
  "following_id": "uuid"
}
```

#### Unfollow User
```http
DELETE /api/notifications/following/:following_id
```

#### Toggle Bell Notification
```http
PUT /api/notifications/following/:following_id/bell
Body:
{
  "bell_enabled": boolean
}
```

## Database Schema

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES students(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Followers Table
```sql
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  bell_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);
```

## Environment Variables

Create a `.env` file in the notification_service directory:

```env
PORT=3002
NODE_ENV=development
API_KEY=your_api_key

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Notification Types

- `thread_comment`: Someone commented on your thread
- `comment_reply`: Someone replied to your comment
- `follow`: Someone followed you
- `mention`: Someone mentioned you
- `like`: Someone liked your content
- `system`: System notifications

## Reference Types

- `thread`: Reference to a thread
- `comment`: Reference to a comment
- `resource`: Reference to a resource
- `collection`: Reference to a collection

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Swagger Documentation

API documentation is available at:
```
http://localhost:3002/api-docs
```

## Architecture

```
notification_service/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   └── notification_controller.js   # Request handlers
│   │   ├── middlewares/
│   │   │   ├── auth_middleware.js           # JWT authentication
│   │   │   ├── api_key_middleware.js        # API key validation
│   │   │   └── rate_limiter_middleware.js   # Rate limiting
│   │   ├── routes/
│   │   │   └── notification_routes.js        # Route definitions + Swagger
│   │   └── validators/
│   │       └── notification_validator.js     # Input validation
│   ├── config/
│   │   ├── env.js                           # Environment config
│   │   ├── swagger.js                       # Swagger config
│   │   └── index.js                         # Config aggregator
│   ├── domain/
│   │   ├── models/
│   │   │   ├── notification_model.js        # Notification entity
│   │   │   └── follower_model.js            # Follower entity
│   │   └── services/
│   │       └── notification_service.js       # Business logic
│   ├── infrastructure/
│   │   └── database/
│   │       └── supabase.js                  # Database client
│   ├── app.js                               # Express app setup
│   └── server.js                            # Server entry point
├── package.json
└── README.md
```

## User Flow Implementation

### 5.1 - View Notifications About Thread Comments (Grouped)
```javascript
GET /api/notifications/grouped/thread-comments
```
Returns notifications grouped by thread with count and unread status.

### 5.2 - View Notifications About Comment Replies (Grouped)
```javascript
GET /api/notifications/grouped/comment-replies
```
Returns notifications grouped by comment with count and unread status.

### 5.3 - View/Manage Following List with Bell Toggle
```javascript
// Get following list
GET /api/notifications/following/list

// Toggle bell for specific user
PUT /api/notifications/following/:following_id/bell
Body: { "bell_enabled": true/false }
```

### 5.5 - Delete All Notifications at Once
```javascript
DELETE /api/notifications/delete-all
```

### 5.6 - Delete Notification One by One
```javascript
DELETE /api/notifications/:id
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "message": "Error message",
    "status": 400,
    "details": []  // Validation errors if applicable
  }
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}  // Response data
}
```

## Port

This service runs on port **3002** by default.

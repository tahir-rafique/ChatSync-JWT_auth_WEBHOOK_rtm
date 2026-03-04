# 💬 ChatApp – Backend

Real-time chat application backend built with **Node.js · Express · MongoDB · WebSocket (ws)**

---

## 📁 Folder Structure

```
chat-app-backend/
├── src/
│   ├── api/
│   │   └── v1/                          ← Versioned API (add v2/ here later)
│   │       ├── controllers/
│   │       │   ├── authController.js    ← Register, login, logout, forgot/reset password
│   │       │   ├── userController.js    ← Search users, friends CRUD, profile update
│   │       │   └── chatController.js    ← Conversations, messages, file uploads
│   │       ├── routes/
│   │       │   ├── index.js             ← Barrel: mounts all v1 routes
│   │       │   ├── authRoutes.js        ← /api/v1/auth/*
│   │       │   ├── userRoutes.js        ← /api/v1/users/*
│   │       │   └── chatRoutes.js        ← /api/v1/chat/*
│   │       └── validators/              ← (extend: field-level custom validators)
│   │
│   ├── config/
│   │   ├── db.js                        ← MongoDB connection (Mongoose)
│   │   ├── multer.js                    ← File upload config (images/videos/audios/files)
│   │   └── swagger.js                  ← Swagger/OpenAPI 3.0 spec setup
│   │
│   ├── middlewares/
│   │   ├── auth.js                      ← protect(), optionalAuth() JWT middleware
│   │   ├── errorHandler.js             ← Global error handler + 404
│   │   └── validate.js                  ← express-validator chains (reusable validators)
│   │
│   ├── models/
│   │   ├── User.js                      ← User schema (friends, friendRequests, online status)
│   │   ├── Conversation.js             ← DM & group conversations
│   │   └── Message.js                   ← Messages (text, image, video, audio, file)
│   │
│   ├── services/
│   │   └── authService.js              ← JWT helpers, email (nodemailer), cookie helpers
│   │
│   ├── uploads/                         ← Static file storage (served at /uploads/*)
│   │   ├── images/
│   │   ├── videos/
│   │   ├── audios/
│   │   └── files/
│   │
│   ├── utils/
│   │   ├── AppError.js                  ← Custom operational error class
│   │   ├── asyncHandler.js             ← Wraps async route handlers
│   │   ├── logger.js                    ← Winston logger (console + file)
│   │   └── response.js                  ← sendSuccess(), sendPaginated(), sendError()
│   │
│   ├── websocket/
│   │   └── wsServer.js                 ← WebSocket server, rooms, events, broadcasting
│   │
│   ├── app.js                           ← Express app (middlewares, routes, Swagger)
│   └── server.js                        ← HTTP server entry point
│
├── logs/
│   ├── combined.log
│   ├── error.log
│   └── exceptions.log
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in values
cp .env.example .env

# 3. Start dev server
npm run dev

# 4. Open API docs
open http://localhost:5000/api-docs
```

---

## 🔌 WebSocket Events

Connect to: `ws://localhost:5000/ws?token=<JWT_ACCESS_TOKEN>`

### Client → Server

| Event Type          | Payload                        | Description                        |
|---------------------|--------------------------------|------------------------------------|
| `JOIN_CONVERSATION` | `{ conversationId }`           | Join a conversation room           |
| `LEAVE_CONVERSATION`| `{ conversationId }`           | Leave a conversation room          |
| `TYPING_START`      | `{ conversationId }`           | User started typing                |
| `TYPING_STOP`       | `{ conversationId }`           | User stopped typing                |
| `MESSAGE_READ`      | `{ conversationId, messageId }`| Mark message as read               |
| `PING`              | `{}`                           | Heartbeat ping                     |

### Server → Client

| Event Type           | Payload                                    | Description                    |
|----------------------|--------------------------------------------|--------------------------------|
| `CONNECTED`          | `{ userId, message }`                      | Connection acknowledged        |
| `NEW_MESSAGE`        | `{ message }`                              | New message in conversation    |
| `TYPING_START`       | `{ conversationId, userId, userName }`     | Someone is typing              |
| `TYPING_STOP`        | `{ conversationId, userId, userName }`     | Stopped typing                 |
| `MESSAGE_READ`       | `{ conversationId, messageId, readBy }`    | Read receipt                   |
| `MESSAGE_DELETED`    | `{ messageId, conversationId }`            | Message was deleted            |
| `USER_ONLINE`        | `{ userId }`                               | Friend came online             |
| `USER_OFFLINE`       | `{ userId, lastSeen }`                     | Friend went offline            |
| `PONG`               | `{ timestamp }`                            | Heartbeat response             |
| `ERROR`              | `{ message }`                              | Error notification             |

---

## 📡 REST API Endpoints

### Auth  `/api/v1/auth`
| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | `/register`                 | ❌   | Register new user        |
| POST   | `/login`                    | ❌   | Login                    |
| POST   | `/logout`                   | ✅   | Logout                   |
| POST   | `/refresh-token`            | ❌   | Refresh access token     |
| POST   | `/forgot-password`          | ❌   | Send reset email         |
| POST   | `/reset-password/:token`    | ❌   | Reset password via token |
| GET    | `/me`                       | ✅   | Get current user         |

### Users  `/api/v1/users`
| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| GET    | `/search?email=x`               | ✅   | Search all users by email|
| GET    | `/friends`                      | ✅   | Get friends list         |
| GET    | `/:userId`                      | ✅   | Get user by ID           |
| PUT    | `/profile`                      | ✅   | Update profile + avatar  |
| POST   | `/friends/request/:userId`      | ✅   | Send friend request      |
| POST   | `/friends/accept/:requesterId`  | ✅   | Accept friend request    |
| POST   | `/friends/reject/:requesterId`  | ✅   | Reject friend request    |
| DELETE | `/friends/:friendId`            | ✅   | Remove friend            |

### Chat  `/api/v1/chat`
| Method | Endpoint                                  | Auth | Description              |
|--------|-------------------------------------------|------|--------------------------|
| GET    | `/conversations`                          | ✅   | List conversations       |
| GET    | `/conversations/:id`                      | ✅   | Get conversation         |
| POST   | `/conversations/start/:friendId`          | ✅   | Start DM with friend     |
| GET    | `/conversations/:id/messages`             | ✅   | Get messages (paginated) |
| POST   | `/conversations/:id/messages`             | ✅   | Send text message        |
| POST   | `/conversations/:id/upload`               | ✅   | Send media/file message  |
| DELETE | `/messages/:messageId`                    | ✅   | Delete message           |

---

## 🔒 Auth Flow

```
POST /api/v1/auth/register  →  accessToken + refreshToken (cookies + body)
POST /api/v1/auth/login     →  accessToken + refreshToken (cookies + body)
POST /api/v1/auth/refresh-token  →  new accessToken
Authorization: Bearer <accessToken>  (all protected routes)
```

---

## 📁 File Upload Limits

| Type   | Allowed MIME types                                     | Max size |
|--------|--------------------------------------------------------|----------|
| Image  | image/jpeg, image/png, image/gif, image/webp           | 50MB     |
| Video  | video/mp4, video/webm, video/ogg, video/quicktime      | 50MB     |
| Audio  | audio/mpeg, audio/wav, audio/ogg, audio/webm, audio/mp4| 50MB     |
| File   | PDF, Word, Excel, TXT, ZIP                            | 50MB     |

---

## 🗃️ Extending to v2

To add a v2 API:
```
src/api/
├── v1/   ← existing
└── v2/   ← new version
    ├── controllers/
    ├── routes/
    └── validators/
```

Then in `app.js`:
```js
app.use("/api/v2", require("./api/v2/routes"));
```

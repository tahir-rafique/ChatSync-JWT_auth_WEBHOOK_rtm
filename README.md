# 💬 ChatSync – Frontend

Real-time chat application frontend built with **Next.js 15 · React 19 · Tailwind CSS 4 · Sass / SCSS · WebSockets**

Backend Live here: 
https://chatsync-backend-w3ut.onrender.com

Frontend Live here: 
https://chat-sync-frontend.vercel.app
---

## 🚀 Features

- **🔐 Robust Authentication**: Secure login, registration, OTP verification, and forgot/reset password flows.
- **⚡ Real-time Messaging**: Instant messaging powered by WebSockets with typing indicators and read receipts.
- **📁 Multi-media Sharing**: Send images, videos, audio files, and documents with ease.
- **👥 Friend System**: Search users, send/manage friend requests, and see real-time online status.
- **👤 User Profiles**: Personalized profiles with editable avatars, names, and contact info.
- **💅 Premium UI/UX**: Modern, responsive design with smooth animations and dark mode support, powered by SCSS mixins and Tailwind 4.
- **🔔 Interactive Feedback**: Real-time notifications for new messages and friend activities.

---

## 📁 Folder Structure

```
ChatSync-Frontend/
├── app/
│   ├── (auth)/                  ← Authentication routes (Login, Register, OTP, etc.)
│   │   ├── login/
│   │   ├── register/
│   │   ├── otp/
│   │   └── ...
│   ├── (dashboard)/             ← Main application shell (Chat, Friends)
│   │   └── page.tsx             ← Dashboard entry point
│   ├── components/              ← Reusable UI components
│   │   ├── chat-area.tsx        ← Message list and input
│   │   ├── sidebar.tsx          ← Navigation and conversation list
│   │   ├── friends-panel.tsx    ← Friend management UI
│   │   └── ...
│   ├── globals.scss             ← Global styles, SCSS partials, and Tailwind 4 directives
│   ├── styles/                  ← SCSS partials (animations, mixins, variables, etc.)
│   └── layout.tsx               ← Root layout
├── context/                     ← React Context for global state (Auth, Socket, Toast)
├── lib/                         ← Utility functions and API configurations
├── public/                      ← Static assets (images, icons)
├── package.json                 ← Project dependencies and scripts
└── tsconfig.json                ← TypeScript configuration
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Sass / SCSS](https://sass-lang.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **State Management**: React Context API
- **Real-time**: WebSocket (Native / ws)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/tahir-rafique/ChatSync-Frontend.git
cd ChatSync-Frontend
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
# The backend API URL (ending in /api/v1)
NEXT_PUBLIC_API_URL=https://chatsync-backend-w3ut.onrender.com/api/v1
```
> [!NOTE]
> The application automatically derives the WebSocket URL from the `NEXT_PUBLIC_API_URL`.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

The project is optimized for deployment on **Vercel**:

```bash
npm run build
```

---

## � WebSocket Integration

The frontend establishes a persistent connection to the backend to enable real-time features.

### Supported Real-time Events:

| Event             | Description                                          |
|-------------------|------------------------------------------------------|
| `NEW_MESSAGE`     | Updates the chat area and sidebar with incoming messages |
| `TYPING_START`    | Shows a typing indicator in the sidebar and chat header |
| `TYPING_STOP`     | Hides the typing indicator                             |
| `USER_ONLINE`     | Updates friend lists with real-time status           |
| `PROFILE_UPDATED` | Re-syncs user profile info across the app             |
| `FRIEND_UPDATED`  | Refreshes lists when friends are added or removed     |

---

## �🔒 Authentication Flow

1. **Sign Up**: User registers and receives an OTP (if enabled).
2. **Login**: User authenticates and receives JWT tokens (stored in HTTP-only cookies or local storage).
3. **Session**: `AuthContext` manages the user state across the application.
4. **WebSocket**: Upon authentication, a WebSocket connection is established using the JWT token for real-time events.

---

## 📝 License

This project is licensed under the MIT License.

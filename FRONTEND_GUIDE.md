# Modern AI Web Application - Frontend Guide

## 📋 Project Overview

A modern, responsive AI web application inspired by ChatGPT & Notion with React/Next.js, featuring:
- Real-time chat interface
- Document upload & management
- Streaming responses
- Loading states & animations
- Error handling
- FastAPI backend integration

---

## 🏗️ Folder Structure

```
frontend/
├── public/                          # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── icons/
│       ├── upload.svg
│       ├── trash.svg
│       ├── send.svg
│       └── menu.svg
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   └── api/
│   │       └── (optional API routes)
│   │
│   ├── components/                  # React components
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx         # Left sidebar with documents
│   │   │   ├── Header.tsx          # Top navigation bar
│   │   │   └── MainLayout.tsx      # Main layout wrapper
│   │   │
│   │   ├── Chat/
│   │   │   ├── ChatContainer.tsx   # Main chat area
│   │   │   ├── MessageList.tsx     # List of messages
│   │   │   ├── MessageItem.tsx     # Individual message
│   │   │   ├── ChatInput.tsx       # Input field with send button
│   │   │   └── TypingIndicator.tsx # Typing animation
│   │   │
│   │   ├── Documents/
│   │   │   ├── FileUpload.tsx      # Drag & drop file upload
│   │   │   ├── DocumentList.tsx    # List of uploaded documents
│   │   │   ├── DocumentItem.tsx    # Individual document card
│   │   │   └── UploadProgress.tsx  # Upload progress bar
│   │   │
│   │   ├── Common/
│   │   │   ├── Button.tsx          # Reusable button
│   │   │   ├── Card.tsx            # Reusable card
│   │   │   ├── Modal.tsx           # Modal dialog
│   │   │   ├── Toast.tsx           # Toast notifications
│   │   │   ├── Badge.tsx           # Status badge
│   │   │   ├── Skeleton.tsx        # Loading skeleton
│   │   │   └── Loading.tsx         # Loading spinner
│   │   │
│   │   ├── Sidebar/
│   │   │   ├── ConversationList.tsx # List of past conversations
│   │   │   ├── ConversationItem.tsx # Individual conversation
│   │   │   └── NewChatButton.tsx    # Start new conversation
│   │   │
│   │   └── Auth/
│   │       ├── LoginForm.tsx       # Login component
│   │       ├── SignupForm.tsx      # Signup component
│   │       └── ProtectedRoute.tsx  # Protected route wrapper
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useChat.ts              # Chat logic hook
│   │   ├── useDocuments.ts         # Document management hook
│   │   ├── useFileUpload.ts        # File upload hook
│   │   ├── useLocalStorage.ts      # Local storage persistence
│   │   └── useToast.ts             # Toast notifications hook
│   │
│   ├── services/                    # API services
│   │   ├── api.ts                  # API client setup (axios/fetch)
│   │   ├── chatService.ts          # Chat API calls
│   │   ├── documentService.ts      # Document API calls
│   │   ├── authService.ts          # Authentication API calls
│   │   └── types.ts                # API response types
│   │
│   ├── context/                     # React Context
│   │   ├── ChatContext.tsx         # Global chat state
│   │   ├── DocumentContext.tsx     # Global document state
│   │   ├── AuthContext.tsx         # Global auth state
│   │   └── ThemeContext.tsx        # Theme state
│   │
│   ├── utils/                       # Utility functions
│   │   ├── formatting.ts           # Text formatting
│   │   ├── validation.ts           # Input validation
│   │   ├── constants.ts            # App constants
│   │   ├── errorHandling.ts        # Error utilities
│   │   └── localStorage.ts         # Storage utilities
│   │
│   ├── lib/                         # Library configurations
│   │   ├── axios.ts                # Axios config
│   │   └── tailwind.config.ts      # Tailwind config
│   │
│   ├── styles/                      # CSS modules & global styles
│   │   ├── animations.css          # Animation definitions
│   │   ├── variables.css           # CSS variables
│   │   └── tailwind.css            # Tailwind imports
│   │
│   └── types/                       # TypeScript types
│       ├── chat.ts                 # Chat types
│       ├── document.ts             # Document types
│       ├── api.ts                  # API types
│       └── index.ts                # Type exports
│
├── tests/                           # Test files
│   ├── components/
│   │   ├── ChatContainer.test.tsx
│   │   └── FileUpload.test.tsx
│   └── hooks/
│       └── useChat.test.ts
│
├── .env.example                     # Environment variables template
├── .env.local                       # Environment variables (gitignored)
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
├── README.md                       # Frontend readme
└── .gitignore                      # Git ignore file
```

---

## 📊 Component Hierarchy

```
<App>
├── <Layout>
│   ├── <Header>
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── User Menu
│   │
│   ├── <Sidebar>
│   │   ├── <NewChatButton>
│   │   └── <ConversationList>
│   │       └── <ConversationItem> (many)
│   │
│   └── <MainContent>
│       ├── <ChatContainer>
│       │   ├── <MessageList>
│       │   │   ├── <MessageItem> (many)
│       │   │   ├── <TypingIndicator>
│       │   │   └── <Skeleton> (while loading)
│       │   │
│       │   └── <ChatInput>
│       │       ├── Input Field
│       │       ├── File Upload Trigger
│       │       └── Send Button
│       │
│       └── <DocumentPanel>
│           ├── <FileUpload>
│           │   └── Drag & Drop Zone
│           │
│           ├── <UploadProgress>
│           │
│           └── <DocumentList>
│               └── <DocumentItem> (many)
│                   ├── Title
│                   ├── Metadata
│                   ├── Delete Button
│                   └── Status Badge
└── <Toast Container>
    └── <Toast> (many)
```

---

## 🎨 Design System

### Color Palette
```css
Primary:     #10a37f (ChatGPT Green)
Secondary:   #565869 (Dark Gray)
Accent:      #ec4899 (Pink)
Background:  #ffffff (Light) / #1a1a1a (Dark)
Border:      #e5e7eb (Light) / #404554 (Dark)
Text:        #0d0d0d (Light) / #ececec (Dark)
```

### Typography
```css
Display:     48px - Bold - Hero text
Heading 1:   32px - Bold - Page titles
Heading 2:   24px - SemiBold - Section titles
Heading 3:   20px - SemiBold - Card titles
Body:        16px - Regular - Main content
Small:       14px - Regular - Secondary text
Tiny:        12px - Regular - Metadata
Mono:        14px - Regular - Code snippets
```

### Spacing
```
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  24px
2xl: 32px
3xl: 48px
```

### Shadows
```
sm:  0 1px 2px rgba(0,0,0,0.05)
md:  0 4px 6px rgba(0,0,0,0.1)
lg:  0 10px 15px rgba(0,0,0,0.1)
```

---

## 🔄 Data Flow

```
User Action (Send Message)
        ↓
useChat Hook (client-side state)
        ↓
chatService.sendMessage()
        ↓
FastAPI Backend
        ↓
Stream Response (SSE or Websocket)
        ↓
Update MessageList (real-time)
        ↓
Save to localStorage
        ↓
Display in UI
```

---

## 🎯 Key Features

### 1. Real-Time Chat
- Message streaming
- Typing indicators
- Sentiment indicators (success/error)
- Citation display
- Confidence scores

### 2. File Upload
- Drag & drop support
- Multiple file upload
- Progress tracking
- File type validation
- Size limit checking

### 3. State Management
- Context API for global state
- Custom hooks for domain logic
- localStorage for persistence
- Optimistic updates

### 4. Error Handling
- Network error recovery
- Validation errors
- Toast notifications
- Error boundaries
- Fallback UI

### 5. Loading States
- Skeleton loaders
- Progress bars
- Typing indicators
- Spinner animations
- Loading messages

### 6. Responsive Design
- Mobile-first approach
- Breakpoints: xs, sm, md, lg, xl, 2xl
- Touch-friendly buttons
- Collapsible sidebar
- Full-width on mobile

---

## 📱 Responsive Breakpoints

```
Mobile:      0px - 639px
Tablet:      640px - 1023px
Desktop:     1024px - 1279px
Large:       1280px - 1919px
XL:          1920px+
```

---

## 🚀 Performance Optimizations

1. **Code Splitting** - Route-based code splitting
2. **Image Optimization** - Next.js Image component
3. **Lazy Loading** - Dynamic imports for modals
4. **Memoization** - React.memo for heavy components
5. **Virtual Scrolling** - For long message lists
6. **Caching** - HTTP caching with SWR/React Query
7. **CSS Optimization** - Tailwind purging
8. **Bundle Size** - Tree shaking, minification

---

## 🔐 Security Best Practices

1. **XSS Prevention** - Sanitize user input
2. **CSRF Protection** - Token-based requests
3. **Auth** - Secure token storage
4. **Validation** - Client & server-side
5. **Sensitive Data** - No passwords in localStorage
6. **API** - HTTPS only
7. **CSP** - Content Security Policy headers
8. **Rate Limiting** - Frontend rate limiting

---

## 📊 API Integration

All API calls go through `services/chatService.ts` and `services/documentService.ts`:

```typescript
// Example
const response = await chatService.sendMessage({
  query: "What is...",
  top_k: 5,
  user_id: "user_123"
});
```

The service handles:
- Request/response formatting
- Error handling
- Retry logic
- Caching
- Request cancellation

---

## ✅ Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management
- Color contrast compliance (WCAG AA)
- Screen reader support
- Semantic HTML

---

## 📦 Dependencies

### Core
- next 14.0+
- react 18.0+
- tailwindcss 3.0+

### HTTP
- axios / fetch

### State
- zustand OR redux-toolkit (optional)

### UI
- shadcn/ui (optional)
- framer-motion

### Forms
- react-hook-form
- zod (validation)

### Utilities
- clsx
- date-fns
- lodash-es

### Testing
- vitest
- react-testing-library

---

Next: See individual component files for complete implementation.

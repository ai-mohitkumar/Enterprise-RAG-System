# Frontend Codebase Index

Complete file structure and navigation guide for the RAG Chat frontend.

## 📁 Directory Structure

```
frontend/
├── 📄 Configuration Files
│   ├── package.json                # Dependencies and scripts
│   ├── tsconfig.json              # TypeScript configuration
│   ├── tailwind.config.ts         # Tailwind CSS theme
│   ├── next.config.js             # Next.js configuration
│   ├── .env.example               # Environment variables template
│   └── .gitignore                 # Git ignore rules
│
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router
│   │   ├── layout.tsx             # Root layout with providers
│   │   ├── page.tsx               # Home page (Chat + Documents)
│   │   └── globals.css            # Global styles
│   │
│   ├── 📂 components/             # React components
│   │   ├── 📂 Layout/
│   │   │   ├── MainLayout.tsx     # Main layout wrapper
│   │   │   ├── Header.tsx         # Top navigation bar
│   │   │   └── Sidebar.tsx        # Side navigation
│   │   │
│   │   ├── 📂 Chat/
│   │   │   ├── ChatContainer.tsx   # Main chat interface
│   │   │   ├── MessageList.tsx     # Message list display
│   │   │   ├── MessageItem.tsx     # Individual message
│   │   │   ├── ChatInput.tsx       # Input field with attachments
│   │   │   └── TypingIndicator.tsx # Loading indicator
│   │   │
│   │   ├── 📂 Documents/
│   │   │   ├── FileUpload.tsx      # Drag & drop upload
│   │   │   ├── DocumentList.tsx    # Document grid
│   │   │   └── DocumentItem.tsx    # Document card
│   │   │
│   │   └── 📂 Common/
│   │       ├── Button.tsx          # Button component
│   │       ├── Card.tsx            # Card container
│   │       ├── Badge.tsx           # Status badge
│   │       ├── Loading.tsx         # Loading spinner
│   │       ├── Skeleton.tsx        # Loading placeholder
│   │       └── Tabs.tsx            # Tab navigation
│   │
│   ├── 📂 hooks/                  # Custom React hooks
│   │   ├── useChat.ts             # Chat state management
│   │   └── useDocuments.ts        # Document management
│   │
│   ├── 📂 services/               # API service layer
│   │   ├── chatService.ts         # Chat API calls
│   │   └── documentService.ts     # Document API calls
│   │
│   ├── 📂 lib/                    # Utility functions and helpers
│   │   └── api.ts                 # Axios client configuration
│   │
│   └── 📂 types/                  # TypeScript definitions
│       └── index.ts               # All type interfaces
│
├── 📂 public/                     # Static assets
│   └── favicon.ico
│
└── 📄 Documentation Files
    ├── README_FRONTEND.md          # Complete frontend guide
    ├── API_INTEGRATION.md          # Backend API documentation
    ├── QUICK_START.md              # 5-minute setup guide
    ├── COMPONENT_REFERENCE.md      # Component documentation
    └── IMPLEMENTATION_SUMMARY.md   # Project summary
```

## 📊 File Statistics

| Category | Files | Lines | Purpose |
|----------|-------|-------|---------|
| Components | 15 | ~1,800 | UI components |
| Hooks | 2 | ~460 | State management |
| Services | 2 | ~300 | API calls |
| Pages | 2 | ~150 | App routing |
| Types | 1 | ~150 | TypeScript defs |
| Configuration | 5 | ~200 | Setup files |
| Styles | 1 | ~120 | Global CSS |
| **Total** | **~28** | **~3,180** | **Production code** |

## 🗂️ Component Organization

### Layout Components (3)
```
┌─ MainLayout
│  ├─ Sidebar
│  ├─ Header
│  └─ Main Content Area
```

### Chat Components (5)
```
┌─ ChatContainer
│  ├─ MessageList
│  │  ├─ MessageItem
│  │  │  └─ Actions (Copy, Like, Dislike)
│  │  └─ TypingIndicator
│  └─ ChatInput
│     ├─ Textarea
│     └─ File Attachment
```

### Document Components (3)
```
┌─ DocumentList
│  └─ DocumentItem (Grid)
│     ├─ Status Badge
│     ├─ Actions Menu
│     └─ Metadata

└─ FileUpload
   ├─ Drag & Drop Zone
   ├─ File Validation
   └─ Selected Files List
```

### Common Components (6)
```
├─ Button (4 variants, 3 sizes)
├─ Card (Container)
├─ Badge (5 colors)
├─ Loading (Spinner)
├─ Skeleton (Placeholder)
└─ Tabs (Navigation)
```

## 🔌 API Integration Points

### Chat Endpoints
```
POST   /api/query                  → sendQuery()
GET    /api/history               → getHistory()
GET    /api/stats                 → getStats()
GET    /api/health                → healthCheck()
```

### Document Endpoints
```
POST   /api/documents/upload       → uploadDocument()
POST   /api/documents/batch-upload → uploadMultiple()
GET    /api/documents              → getDocuments()
GET    /api/documents/{id}         → getDocument()
DELETE /api/documents/{id}         → deleteDocument()
DELETE /api/documents              → deleteMultiple()
```

## 🔄 Data Flow

### Chat Flow
```
User Input
    ↓
ChatInput Component
    ↓
useChat Hook (validation)
    ↓
chatService.sendQuery()
    ↓
API Call (Axios)
    ↓
Response Processing
    ↓
MessageList Display
    ↓
localStorage Save
```

### Document Flow
```
File Selection
    ↓
FileUpload Component (validation)
    ↓
useDocuments Hook
    ↓
documentService.uploadDocument()
    ↓
API Upload (FormData)
    ↓
Progress Tracking
    ↓
DocumentItem Display
    ↓
Status Update
```

## 🎨 Design System Files

### Theme Configuration
- **File**: `tailwind.config.ts`
- **Includes**:
  - Color palette (primary, secondary, neutral)
  - Typography scale
  - Spacing system
  - Animations
  - Responsive breakpoints

### Global Styles
- **File**: `src/app/globals.css`
- **Includes**:
  - Tailwind directives
  - Custom animations
  - Scrollbar styling
  - Typography utilities
  - Print styles

## 📦 Type Definitions

### Core Types (src/types/index.ts)
```typescript
// Chat Types
- Message
- Conversation
- QueryRequest
- QueryResponse

// Document Types
- Document
- DocumentStatus
- DocumentMetadata

// State Types
- ChatState
- DocumentState
- LoadingState

// UI Types
- Toast
- Pagination
- User
```

## 🔧 Service Layer

### Chat Service (src/services/chatService.ts)
- `sendQuery(request)` - Send single query
- `batchQueries(queries)` - Send multiple queries
- `getQueryHistory(limit, offset)` - Fetch history
- `getStats()` - Get system stats
- `healthCheck()` - Check API health

### Document Service (src/services/documentService.ts)
- `uploadDocument(file, onProgress)` - Single upload
- `uploadMultiple(files)` - Batch upload
- `getDocuments(limit, offset)` - List documents
- `getDocument(id)` - Get single document
- `deleteDocument(id)` - Delete single
- `deleteMultiple(ids)` - Batch delete
- `validateFile(file)` - File validation
- `formatFileSize(bytes)` - Size formatting

## 🎯 Key Features Implementation

### Real-time Chat
- ✅ `src/components/Chat/ChatContainer.tsx`
- ✅ `src/hooks/useChat.ts`
- ✅ `src/services/chatService.ts`

### Document Management
- ✅ `src/components/Documents/FileUpload.tsx`
- ✅ `src/components/Documents/DocumentList.tsx`
- ✅ `src/hooks/useDocuments.ts`

### Responsive Design
- ✅ `src/components/Layout/MainLayout.tsx`
- ✅ `tailwind.config.ts`
- ✅ All components have `sm:`, `md:` breakpoints

### Error Handling
- ✅ `src/lib/api.ts` (Axios interceptors)
- ✅ All components with error states
- ✅ Try-catch in services

### Loading States
- ✅ `src/components/Common/Loading.tsx`
- ✅ `src/components/Common/Skeleton.tsx`
- ✅ `src/components/Chat/TypingIndicator.tsx`

## 📚 Documentation Files

### README_FRONTEND.md (2000+ lines)
- Complete setup guide
- Feature overview
- Tech stack
- Project structure
- Browser support
- Troubleshooting

### API_INTEGRATION.md (1500+ lines)
- API endpoint specs
- Request/response examples
- Error handling
- Rate limiting
- Authentication
- WebSocket setup

### QUICK_START.md (300+ lines)
- 5-minute setup
- Commands reference
- Environment setup
- Common issues

### COMPONENT_REFERENCE.md (1200+ lines)
- Component API docs
- Props reference
- Usage examples
- Best practices

### IMPLEMENTATION_SUMMARY.md
- Project overview
- Features checklist
- Tech stack summary
- Next steps

## 🚀 Getting Started

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev      # Start server
npm run lint     # Check code
npm run format   # Format code
npm run test     # Run tests
```

### Production
```bash
npm run build    # Build
npm run start    # Start server
```

## 🔍 Finding Components

### By Feature
- **Chat**: `src/components/Chat/*`
- **Documents**: `src/components/Documents/*`
- **Layout**: `src/components/Layout/*`
- **UI Elements**: `src/components/Common/*`

### By Functionality
- **State Management**: `src/hooks/*`
- **API Calls**: `src/services/*`
- **Configuration**: `tailwind.config.ts`, `next.config.js`
- **Types**: `src/types/index.ts`
- **Styles**: `src/app/globals.css`

### By Page
- **Home**: `src/app/page.tsx`
- **Layout**: `src/app/layout.tsx`

## 📝 Quick Reference

### Import Paths (using aliases)
```typescript
import { Button } from '@/components/Common/Button'
import { useChat } from '@/hooks/useChat'
import { chatService } from '@/services/chatService'
import { Message } from '@/types'
import { apiClient } from '@/lib/api'
```

### Component Usage
```typescript
// Functional component
<Button variant="primary" size="md">Click</Button>

// With state
const { messages, sendMessage } = useChat()

// API call
const response = await chatService.sendQuery(query)

// With types
const messages: Message[] = []
```

## 🎯 Next Development Steps

1. **Authentication**
   - Create `src/lib/auth.ts`
   - Add login/logout flow
   - Implement token refresh

2. **Real-time Updates**
   - Add WebSocket connection
   - Stream responses
   - Real-time document status

3. **Advanced Features**
   - Conversation management
   - Document sharing
   - User preferences
   - Search functionality

4. **Testing**
   - Component tests
   - Hook tests
   - Integration tests
   - E2E tests

5. **Performance**
   - Analytics
   - Error tracking
   - Performance monitoring
   - SEO optimization

## 🔗 Related Documentation

- **Backend**: `../README.md`
- **Architecture**: `../ARCHITECTURE.md`
- **Deployment**: `../DEPLOYMENT.md`
- **API Reference**: `API_INTEGRATION.md`

## 📞 Support

- Check **QUICK_START.md** for common issues
- See **COMPONENT_REFERENCE.md** for component usage
- Review **API_INTEGRATION.md** for backend setup
- Read **README_FRONTEND.md** for detailed guide

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅

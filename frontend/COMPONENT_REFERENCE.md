# Component Reference Guide

Complete documentation of all components with examples and props.

## Table of Contents

1. [Layout Components](#layout-components)
2. [Chat Components](#chat-components)
3. [Document Components](#document-components)
4. [Common Components](#common-components)
5. [Custom Hooks](#custom-hooks)

---

## Layout Components

### MainLayout

Main application layout wrapper with sidebar and header.

**Location:** `src/components/Layout/MainLayout.tsx`

**Props:**
```typescript
interface MainLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}
```

**Usage:**
```typescript
<MainLayout>
  <div>Your content here</div>
</MainLayout>
```

**Features:**
- Responsive sidebar with mobile overlay
- Header integration
- Smooth transitions
- Proper z-index layering

### Header

Top navigation bar with menu toggle, settings, and logout.

**Location:** `src/components/Layout/Header.tsx`

**Props:**
```typescript
interface HeaderProps {
  onMenuToggle?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}
```

**Usage:**
```typescript
<Header 
  onMenuToggle={handleMenuToggle}
  onSettingsClick={handleSettings}
  onLogoutClick={handleLogout}
/>
```

**Features:**
- Responsive menu toggle
- Desktop logo display
- Settings and logout buttons
- Dark mode support

### Sidebar

Left navigation with conversation history and quick actions.

**Location:** `src/components/Layout/Sidebar.tsx`

**Props:**
```typescript
interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
}
```

**Usage:**
```typescript
<Sidebar 
  collapsed={isCollapsed}
  onToggle={() => setIsCollapsed(!isCollapsed)}
  mobile={isMobile}
/>
```

**Features:**
- New chat button
- Conversation history list
- Upload files quick access
- Collapse toggle for desktop
- Responsive for mobile

---

## Chat Components

### ChatContainer

Main chat interface combining messages and input.

**Location:** `src/components/Chat/ChatContainer.tsx`

**Props:**
```typescript
interface ChatContainerProps {
  conversationId?: string;
  onError?: (error: string) => void;
}
```

**Usage:**
```typescript
<ChatContainer 
  conversationId="conv-123"
  onError={(err) => console.error(err)}
/>
```

**Features:**
- Message display area
- Chat input field
- Auto-scroll to latest message
- Error handling
- Loading states

### MessageList

Scrollable list of chat messages.

**Location:** `src/components/Chat/MessageList.tsx`

**Props:**
```typescript
interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  error?: string | null;
  onCopyMessage?: (content: string) => void;
}
```

**Usage:**
```typescript
<MessageList 
  messages={messages}
  loading={isLoading}
  error={error}
  onCopyMessage={(content) => clipboard.write(content)}
/>
```

**Features:**
- Auto-scroll to bottom
- Empty state with suggestions
- Error display
- Loading indicator
- Message grouping by sender

### MessageItem

Individual chat message with metadata.

**Location:** `src/components/Chat/MessageItem.tsx`

**Props:**
```typescript
interface MessageItemProps {
  message: Message;
  isLast?: boolean;
  onCopy?: (content: string) => void;
}

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  confidence?: number;
  timestamp?: string;
}
```

**Usage:**
```typescript
<MessageItem 
  message={message}
  isLast={true}
  onCopy={(content) => handleCopy(content)}
/>
```

**Features:**
- User/Assistant distinction
- Copy button
- Helpful/Unhelpful rating
- Citation display
- Confidence score visualization

### ChatInput

Text input field with file attachment support.

**Location:** `src/components/Chat/ChatInput.tsx`

**Props:**
```typescript
interface ChatInputProps {
  onSubmit: (message: string, files?: File[]) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}
```

**Usage:**
```typescript
<ChatInput 
  onSubmit={async (msg, files) => {
    await sendMessage(msg);
    if (files) uploadFiles(files);
  }}
  loading={isSending}
/>
```

**Features:**
- Auto-resizing textarea
- File attachment support
- Keyboard shortcuts (Ctrl+Enter)
- Disabled state when sending
- File preview chips

### TypingIndicator

Animated typing dots indicator.

**Location:** `src/components/Chat/TypingIndicator.tsx`

**Props:**
```typescript
interface TypingIndicatorProps {
  visible?: boolean;
}
```

**Usage:**
```typescript
{isThinking && <TypingIndicator visible={true} />}
```

**Features:**
- Animated dots
- Optional label
- Smooth animations

---

## Document Components

### FileUpload

Drag & drop file upload zone.

**Location:** `src/components/Documents/FileUpload.tsx`

**Props:**
```typescript
interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // MB
  acceptedTypes?: string[];
  loading?: boolean;
}
```

**Usage:**
```typescript
<FileUpload 
  onFilesSelected={async (files) => {
    await uploadDocuments(files);
  }}
  maxFiles={5}
  maxSize={50}
  acceptedTypes={['.pdf', '.txt', '.docx']}
  loading={isUploading}
/>
```

**Features:**
- Drag & drop support
- File type validation
- Size validation
- Multiple files support
- Error messages
- Selected files preview

### DocumentList

Grid of document cards.

**Location:** `src/components/Documents/DocumentList.tsx`

**Props:**
```typescript
interface DocumentListProps {
  onDocumentDeleted?: (id: string) => void;
  onDocumentDownloaded?: (id: string) => void;
}
```

**Usage:**
```typescript
<DocumentList 
  onDocumentDeleted={(id) => refreshList()}
  onDocumentDownloaded={(id) => handleDownload(id)}
/>
```

**Features:**
- Auto-fetch documents
- Responsive grid layout
- Loading skeletons
- Error handling
- Empty state

### DocumentItem

Individual document card.

**Location:** `src/components/Documents/DocumentItem.tsx`

**Props:**
```typescript
interface DocumentItemProps {
  document: Document;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

interface Document {
  id: string;
  name: string;
  size: number;
  status: 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  pages?: number;
  description?: string;
}
```

**Usage:**
```typescript
<DocumentItem 
  document={doc}
  onDelete={(id) => handleDelete(id)}
  onDownload={(id) => handleDownload(id)}
/>
```

**Features:**
- File icon and metadata
- Status badge with color coding
- Action menu (download, delete)
- File size formatting
- Upload date display

---

## Common Components

### Button

Reusable button with variants and sizes.

**Location:** `src/components/Common/Button.tsx`

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}
```

**Usage:**
```typescript
<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

**Variants:**
- `primary`: Blue button (main action)
- `secondary`: Gray button (secondary action)
- `danger`: Red button (destructive action)
- `ghost`: Transparent button (tertiary)

**Sizes:**
- `sm`: 12px / 20px
- `md`: 16px / 32px
- `lg`: 20px / 48px

### Card

Container for grouped content.

**Location:** `src/components/Common/Card.tsx`

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}
```

**Usage:**
```typescript
<Card hoverable onClick={handleClick}>
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

**Features:**
- Border and shadow
- Hover effect option
- Click handler support
- Dark mode support

### Badge

Status/tag indicator.

**Location:** `src/components/Common/Badge.tsx`

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}
```

**Usage:**
```typescript
<Badge variant="success" size="sm">
  Completed
</Badge>
```

**Variants:**
- `primary`: Blue
- `success`: Green
- `warning`: Yellow
- `danger`: Red
- `neutral`: Gray

### Loading

Loading spinner component.

**Location:** `src/components/Common/Loading.tsx`

**Props:**
```typescript
interface LoadingProps {
  fullscreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**
```typescript
<Loading fullscreen message="Processing..." size="md" />
```

**Features:**
- Inline or fullscreen
- Custom message
- Size options
- Animated spinner

### Skeleton

Loading placeholder.

**Location:** `src/components/Common/Skeleton.tsx`

**Props:**
```typescript
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  count?: number;
}
```

**Usage:**
```typescript
<Skeleton variant="text" count={3} />
```

**Variants:**
- `text`: Line height (4px)
- `circle`: Square (40px)
- `rect`: Full width (96px height)

### Tabs

Tab navigation component.

**Location:** `src/components/Common/Tabs.tsx`

**Props:**
```typescript
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}
```

**Usage:**
```typescript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="chat">Chat</TabsTrigger>
    <TabsTrigger value="docs">Documents</TabsTrigger>
  </TabsList>
  
  <TabsContent value="chat">
    {/* Chat content */}
  </TabsContent>
  
  <TabsContent value="docs">
    {/* Docs content */}
  </TabsContent>
</Tabs>
```

---

## Custom Hooks

### useChat

Chat state management and message handling.

**Location:** `src/hooks/useChat.ts`

**Methods:**
```typescript
const {
  messages,              // Message[]
  loading,              // boolean
  error,                // string | null
  sendMessage,          // (query: string, files?: File[]) => Promise<void>
  sendBatch,            // (queries: string[]) => Promise<void>
  clearMessages,        // () => void
  removeMessage,        // (id: string) => void
  editMessage,          // (id: string, content: string) => void
  retry,                // () => Promise<void>
  cancel,               // () => void
} = useChat({ autoSave: true });
```

**Usage:**
```typescript
const { messages, sendMessage, loading } = useChat();

const handleSend = async (query: string) => {
  await sendMessage(query);
};
```

**Features:**
- Message persistence with localStorage
- Auto-save support
- Error handling
- Request cancellation
- Batch queries
- Message editing

### useDocuments

Document management and upload.

**Location:** `src/hooks/useDocuments.ts`

**Methods:**
```typescript
const {
  documents,            // Document[]
  loading,              // boolean
  error,                // string | null
  uploadProgress,       // number (0-100)
  fetchDocuments,       // () => Promise<void>
  uploadDocument,       // (file: File) => Promise<Document>
  uploadMultiple,       // (files: File[]) => Promise<Document[]>
  deleteDocument,       // (id: string) => Promise<void>
  deleteMultiple,       // (ids: string[]) => Promise<void>
  clearAll,             // () => void
} = useDocuments();
```

**Usage:**
```typescript
const { documents, uploadDocument } = useDocuments();

const handleUpload = async (file: File) => {
  const doc = await uploadDocument(file);
  console.log('Uploaded:', doc.name);
};
```

**Features:**
- Document fetching
- Single/batch uploads
- Single/batch deletes
- Progress tracking
- File validation
- Error handling

---

## Type Definitions

### Message
```typescript
interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  confidence?: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}
```

### Document
```typescript
interface Document {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  pages?: number;
  description?: string;
  metadata?: {
    language?: string;
    chunks?: number;
    extractedText?: string;
  };
}
```

### QueryRequest
```typescript
interface QueryRequest {
  query: string;
  conversationId?: string;
  topK?: number;
  filters?: {
    documentIds?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
}
```

### QueryResponse
```typescript
interface QueryResponse {
  id: string;
  query: string;
  response: string;
  citations: Citation[];
  confidence: number;
  responseTimeMs: number;
  tokensUsed: {
    prompt: number;
    completion: number;
  };
}

interface Citation {
  documentId: string;
  documentName: string;
  page?: number;
  snippet: string;
}
```

---

## Best Practices

### Component Organization
```typescript
// 1. Imports
import React from 'react';
import { SomeIcon } from 'lucide-react';

// 2. Types
interface Props {
  title: string;
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};

// 4. Default export
export default MyComponent;
```

### Hook Usage
```typescript
// Fetch data on mount
useEffect(() => {
  fetchData();
}, []);

// Debounce user input
const debouncedSearch = useCallback(
  debounce((query: string) => {
    search(query);
  }, 300),
  []
);
```

### Styling
```typescript
// Use className with Tailwind
<button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg">
  Click
</button>

// Use dark mode
<div className="bg-white dark:bg-secondary-900 text-secondary-900 dark:text-neutral-100">
  Content
</div>
```

---

**Version**: 1.0.0  
**Last Updated**: 2024

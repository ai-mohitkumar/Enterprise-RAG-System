# RAG Chat Frontend

Modern, production-grade React/Next.js frontend for AI-powered document analysis with RAG (Retrieval Augmented Generation).

## Features

✨ **Core Features**
- Real-time chat interface inspired by ChatGPT & Notion
- Document upload with drag & drop
- AI-powered Q&A with citations and confidence scores
- Conversation history management
- Dark mode support
- Fully responsive design (mobile, tablet, desktop)

🎨 **UI/UX**
- Modern component library with Tailwind CSS
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications
- Accessibility-first approach (WCAG 2.1)

🔒 **Security**
- TypeScript for type safety
- Environment variable management
- CSRF protection headers
- Input validation and sanitization
- Secure API communication

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 14.0+ |
| **UI Library** | React | 18.3+ |
| **Styling** | Tailwind CSS | 3.4+ |
| **HTTP Client** | Axios | 1.6+ |
| **Forms** | react-hook-form | 7.48+ |
| **Validation** | Zod | 3.22+ |
| **State** | Zustand/Context | 4.4+ |
| **Animation** | Framer Motion | 10.16+ |
| **Icons** | Lucide React | 0.292+ |
| **Testing** | Vitest + RTL | 1.1+ |

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── Layout/             # Layout components
│   │   │   ├── MainLayout.tsx  # Main layout wrapper
│   │   │   ├── Header.tsx      # Top navigation
│   │   │   └── Sidebar.tsx     # Side navigation
│   │   │
│   │   ├── Chat/               # Chat components
│   │   │   ├── ChatContainer.tsx    # Main chat area
│   │   │   ├── MessageList.tsx      # Message display
│   │   │   ├── MessageItem.tsx      # Individual message
│   │   │   ├── ChatInput.tsx        # Input field
│   │   │   └── TypingIndicator.tsx  # Loading indicator
│   │   │
│   │   ├── Documents/          # Document components
│   │   │   ├── FileUpload.tsx      # Upload zone
│   │   │   ├── DocumentList.tsx    # Document grid
│   │   │   └── DocumentItem.tsx    # Document card
│   │   │
│   │   └── Common/             # Reusable components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── Tabs.tsx
│   │       ├── Loading.tsx
│   │       └── Skeleton.tsx
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useChat.ts          # Chat state management
│   │   └── useDocuments.ts     # Document management
│   │
│   ├── services/               # API services
│   │   ├── chatService.ts      # Chat API calls
│   │   └── documentService.ts  # Document API calls
│   │
│   ├── lib/                    # Utilities and helpers
│   │   ├── api.ts              # Axios client configuration
│   │   ├── formatting.ts       # Text formatting utilities
│   │   ├── validation.ts       # Form validation
│   │   └── constants.ts        # App constants
│   │
│   └── types/                  # TypeScript definitions
│       └── index.ts            # All type definitions
│
├── public/                     # Static assets
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind configuration
├── next.config.js             # Next.js configuration
├── .env.example               # Environment template
└── README.md                  # This file
```

## Installation

### Prerequisites

- Node.js 18.0 or higher
- npm 9+ or yarn 4+

### Setup Steps

1. **Clone and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and set:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

### Project Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run test suite |
| `npm run type-check` | Run TypeScript type checking |

## API Integration

### Backend Requirements

The frontend expects a FastAPI backend with the following endpoints:

#### Chat Endpoints
- `POST /api/query` - Send query to RAG system
- `GET /api/history` - Get query history
- `GET /api/stats` - Get system statistics
- `GET /api/health` - Health check

#### Document Endpoints
- `POST /api/documents/upload` - Upload document
- `POST /api/documents/batch-upload` - Upload multiple
- `GET /api/documents` - List all documents
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document
- `DELETE /api/documents` - Batch delete

See [API_INTEGRATION.md](./API_INTEGRATION.md) for detailed specifications.

## Component Hierarchy

### Layout Structure
```
MainLayout
├── Sidebar
│   ├── New Chat Button
│   ├── Conversation List
│   └── Upload Files Button
├── Header
│   ├── Menu Toggle (mobile)
│   ├── Logo
│   ├── Settings Button
│   └── Logout Button
└── Main Content
    ├── Chat Tab
    │   └── ChatContainer
    │       ├── MessageList
    │       │   ├── MessageItem
    │       │   │   ├── Avatar
    │       │   │   ├── Content
    │       │   │   ├── Citations
    │       │   │   ├── Confidence Score
    │       │   │   └── Actions (Copy, Like, Dislike)
    │       │   └── TypingIndicator
    │       └── ChatInput
    │           ├── Textarea
    │           ├── File Attachment
    │           └── Send Button
    └── Documents Tab
        └── DocumentList
            └── DocumentItem (Grid)
                ├── Icon
                ├── Name & Date
                ├── Status Badge
                ├── Description
                └── Actions (Download, Delete)
```

## Design System

### Colors
- **Primary**: #10a37f (ChatGPT Green)
- **Secondary**: #525252 (Dark Gray)
- **Neutral**: #f5f5f5 (Light Gray)
- **Accent**: #ff6b6b (Red)

### Typography Scale
- **Display**: 2.5rem (40px) - Page titles
- **H1**: 2rem (32px) - Section titles
- **H2**: 1.5rem (24px) - Subsection titles
- **H3**: 1.25rem (20px) - Minor titles
- **Body**: 1rem (16px) - Regular text
- **Small**: 0.875rem (14px) - Secondary text
- **Tiny**: 0.75rem (12px) - Captions
- **Mono**: 0.875rem - Code blocks

### Spacing
- Base unit: 4px
- Scale: xs(4px), sm(8px), md(12px), lg(16px), xl(24px), 2xl(32px), 3xl(48px)

### Responsive Breakpoints
- **xs**: 0px (Mobile)
- **sm**: 640px (Tablet)
- **md**: 1024px (Laptop)
- **lg**: 1280px (Desktop)
- **xl**: 1920px (Large Desktop)
- **2xl**: 2560px (Ultra-wide)

## Features Implementation

### Chat Features
- Real-time message streaming
- Message persistence with localStorage
- Conversation history
- Citation tracking
- Confidence scoring
- Message retry on failure
- Copy message content
- Helpful/unhelpful feedback

### Document Features
- Drag & drop file upload
- Multiple file upload
- File validation (type, size)
- Upload progress tracking
- Download documents
- Batch delete
- Document status tracking
- Metadata display (size, date, pages)

### UI Features
- Dark mode with system preference
- Smooth transitions and animations
- Loading skeletons
- Error boundaries
- Toast notifications
- Responsive mobile menu
- Keyboard shortcuts (Ctrl+Enter to send)
- Auto-resizing textarea

## Performance Optimization

### Code Splitting
- Route-based code splitting with Next.js
- Component lazy loading where appropriate
- Dynamic imports for heavy components

### Caching
- HTTP caching with Axios
- LocalStorage for conversations
- SWR for data fetching

### Images
- Automatic image optimization
- WebP format support
- Responsive images

### Bundle
- Tree shaking enabled
- Minification in production
- CSS purging with Tailwind

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local`
   - Use `.env.example` as template

2. **API Communication**
   - All API calls over HTTPS (in production)
   - Auth tokens in secure httpOnly cookies
   - CSRF token validation

3. **Input Validation**
   - Client-side validation with Zod
   - Server-side validation required
   - File type and size validation

4. **Content Security**
   - XSS protection with React's built-in escaping
   - HTML sanitization for rich content
   - CSP headers configuration

## Testing

### Running Tests
```bash
npm run test                    # Run all tests
npm run test:watch            # Watch mode
npm run test:coverage         # Coverage report
```

### Test Structure
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for API calls
- E2E tests for critical user flows

## Accessibility (a11y)

The application follows WCAG 2.1 AA standards:

- ✅ Semantic HTML structure
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Color contrast ratios
- ✅ Alt text for images
- ✅ Screen reader support

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | Latest 2 | ✅ Full |
| Firefox | Latest 2 | ✅ Full |
| Safari | Latest 2 | ✅ Full |
| Edge | Latest 2 | ✅ Full |
| Mobile | Modern | ✅ Full |

## Troubleshooting

### Common Issues

**Issue: API connection refused**
```bash
# Check backend is running
# Verify NEXT_PUBLIC_API_URL in .env.local
# Check CORS configuration on backend
```

**Issue: Port 3000 already in use**
```bash
# Use different port
npm run dev -- -p 3001
```

**Issue: Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `RAG Chat` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `false` |

## Contributing

1. Follow the project structure and naming conventions
2. Write components in TypeScript
3. Use Tailwind CSS for styling
4. Add tests for new features
5. Format code with Prettier
6. Commit with clear messages

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review component documentation
3. Open an issue on GitHub

## Next Steps

1. **Customize Branding**
   - Update logo in `public/`
   - Modify colors in `tailwind.config.ts`
   - Change app name in metadata

2. **Add Authentication**
   - Implement auth context
   - Add login/logout flow
   - Secure API endpoints

3. **Deploy**
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, or your server
   - Set production environment variables

4. **Monitor & Debug**
   - Set up error tracking (Sentry)
   - Configure analytics
   - Monitor performance metrics

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅

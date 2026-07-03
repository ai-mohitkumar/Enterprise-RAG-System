# Quick Start Guide

Get the RAG Chat frontend running in 5 minutes.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (included with Node.js)
- Backend running on `http://localhost:8000`

## 1. Install Dependencies

```bash
cd frontend
npm install
```

Takes ~2-3 minutes depending on internet speed.

## 2. Configure Environment

```bash
cp .env.example .env.local
```

The default `NEXT_PUBLIC_API_URL=http://localhost:8080` should work for local development.

## 3. Start Development Server

```bash
npm run dev
```

Output:
```
> next dev
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

## 4. Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

You should see:
- **Chat tab** with message input (empty if no conversations yet)
- **Documents tab** with upload zone
- **Sidebar** with navigation
- **Header** with menu and settings

## 5. Try It Out

### Upload a Document
1. Go to **Documents** tab
2. Drag & drop a PDF/TXT file or click "Select Files"
3. Wait for upload to complete (status changes to "completed")

### Ask a Question
1. Go to **Chat** tab
2. Type: "What is in the document?"
3. Press Ctrl+Enter or click send button
4. Wait for AI response with citations

## Project Structure at a Glance

```
frontend/
├── src/
│   ├── app/           # Pages and layouts
│   ├── components/    # UI components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API calls
│   ├── lib/           # Utilities
│   └── types/         # TypeScript types
├── public/            # Static files
├── package.json       # Dependencies
├── tailwind.config.ts # Styling
└── README_FRONTEND.md # Full documentation
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Check code quality
npm run format          # Format code
npm run type-check      # Check TypeScript

# Testing
npm run test            # Run tests
npm run test:watch     # Watch mode
```

## Troubleshooting

**Backend connection error?**
- Ensure backend is running: `python app.py`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend CORS allows `http://localhost:3000`

**Module not found?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 in use?**
```bash
npm run dev -- -p 3001
```

## Next Steps

1. Read [README_FRONTEND.md](./README_FRONTEND.md) for detailed documentation
2. Check [API_INTEGRATION.md](./API_INTEGRATION.md) for backend integration details
3. Customize colors in `tailwind.config.ts`
4. Add authentication in `src/lib/auth.ts`
5. Deploy to production (Vercel, Netlify, etc.)

## File Structure for Reference

### Creating New Components

```typescript
// src/components/MyComponent/index.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return <div>{title}</div>;
};

export default MyComponent;
```

### Using Custom Hooks

```typescript
// Usage in component
import { useChat } from '@/hooks/useChat';

export const MyChat = () => {
  const { messages, sendMessage } = useChat();
  
  return <div>{/* Use messages and sendMessage */}</div>;
};
```

### API Calls

```typescript
// src/services/myService.ts
import { apiClient } from '@/lib/api';

export const myService = {
  async getData() {
    const response = await apiClient.get('/endpoint');
    return response.data;
  },
};
```

## Performance Tips

- Use `npm run build` to check bundle size
- Enable image optimization in `next.config.js`
- Lazy load heavy components with `dynamic()`
- Monitor performance with browser DevTools

## Support Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

**Ready?** Run `npm run dev` and start building! 🚀

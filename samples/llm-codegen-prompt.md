# LLM Code Generation Prompt for UI Spec

Use this prompt template with an LLM (Claude, GPT-4, etc.) to generate a complete React/Node.js web application from your UI Spec file.

---

## Prompt Template

```
You are an expert full-stack developer. Generate a complete, production-ready web application based on the UI Spec XML file provided below.

## Technology Stack

Use the following technologies:

### Frontend
- React 18+ with TypeScript
- Vite for build tooling
- React Router v6 for navigation
- TanStack Query (React Query) for server state
- Tailwind CSS for styling
- shadcn/ui component library
- Lucide React for icons
- React Hook Form + Zod for form validation

### Backend
- Node.js with Express
- Prisma ORM with SQLite (easily swappable to PostgreSQL)
- JWT for authentication
- bcrypt for password hashing

### Project Structure
```
project/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (from spec)
│   │   ├── layouts/        # Layout components (from spec)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   ├── stores/         # State management (if needed)
│   │   └── types/          # TypeScript types (from entities)
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── services/       # Business logic
│   │   └── prisma/         # Database schema
│   └── package.json
└── README.md
```

## Code Generation Rules

### From Entities
- Generate Prisma schema models from `<entity>` definitions
- Create TypeScript interfaces for each entity
- Generate CRUD API endpoints for each entity
- Create React Query hooks for data fetching

### From Layouts
- Generate layout components from `<layout>` definitions
- Implement slots as React children or named slots
- Handle `role="chrome"` as static layout areas
- Handle `role="content"` as dynamic page content areas

### From Components
- Generate reusable React components from `<component>` definitions
- Implement props from `<prop>` definitions with TypeScript types
- Wire up actions from `<action>` definitions

### From Pages
- Generate page components from `<page>` definitions
- Set up React Router routes based on `route` attribute
- Implement data fetching from `<data>` queries
- Apply layouts using the `layout` attribute
- Fill slots using `target` attribute references

### From Prompts
- **Container/Slot prompts**: Implement the UI as described in the prompt
- **context="true"**: Apply the design context to all children
- **constraints="true"**: Treat as strict requirements (Must/Must NOT)
- Use your best judgment for prompts, following the design system

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow shadcn/ui patterns for components
- Implement responsive design (mobile-first)
- Support dark mode via Tailwind's dark: prefix

### Authentication
- If `auth="required"` on a page, protect with auth middleware
- If `auth="guest"`, only allow unauthenticated users
- Implement login/logout flows if auth pages exist

## Output Format

Generate the complete application with:
1. All source files with full implementation (no placeholders)
2. package.json files with exact dependency versions
3. Configuration files (vite.config.ts, tailwind.config.js, etc.)
4. Prisma schema based on entities
5. README with setup instructions

---

## UI Spec File

[PASTE YOUR UI SPEC XML HERE]

---

Generate the complete application now.
```

---

## Example Usage

### 1. Copy the prompt template above

### 2. Replace `[PASTE YOUR UI SPEC XML HERE]` with your spec file content

### 3. Send to your preferred LLM

### 4. The LLM will generate:
- Complete frontend React application
- Backend Node.js API
- Database schema
- All configuration files

---

## Default Dependencies

### Frontend (package.json)

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.8",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.363.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.1",
    "react-router-dom": "^6.22.3",
    "tailwind-merge": "^2.2.2",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.2",
    "vite": "^5.2.0"
  }
}
```

### Backend (package.json)

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.11.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.19.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.11.30",
    "prisma": "^5.11.0",
    "tsx": "^4.7.1",
    "typescript": "^5.4.2"
  }
}
```

---

## Tips for Better Results

1. **Be specific in prompts**: The more detail in your `<prompt>` elements, the better the generated code

2. **Use constraints for requirements**: Mark critical requirements with `constraints="true"` so the LLM treats them as non-negotiable

3. **Define all entities**: Complete entity definitions lead to proper TypeScript types and database schemas

4. **Use context for consistency**: Set `context="true"` on parent prompts to maintain consistent styling across children

5. **Iterate**: Generate, review, and refine your spec based on the output

---

## Alternative Stacks

You can modify the prompt template to use different technologies:

### Next.js Full-Stack
Replace the frontend/backend sections with:
```
- Next.js 14 with App Router
- Server Actions for mutations
- Prisma with PostgreSQL
- NextAuth.js for authentication
```

### Vue.js Frontend
Replace React with:
```
- Vue 3 with Composition API
- Vue Router
- Pinia for state management
- Vuetify or PrimeVue for components
```

### Python Backend
Replace Express with:
```
- FastAPI with Python 3.11+
- SQLAlchemy ORM
- Pydantic for validation
- python-jose for JWT
```

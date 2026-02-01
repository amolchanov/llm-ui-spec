# LLM Code Generation Prompt for UI Spec

Use this prompt template with an LLM (Claude, GPT-4, etc.) to generate a complete React/Node.js web application from your UI Spec file.

---

## Prompt Template

```
You are an expert full-stack developer. Generate a complete, production-ready web application based on the UI Spec XML file provided below.

## Understanding UI Spec

LLM UI Spec uses **two primitives** to define all UI:

| Primitive | Purpose | Examples |
|-----------|---------|----------|
| `<element>` | Leaf nodes (no children) | button, text, input, image, icon |
| `<container>` | Nodes with children | row, column, card, tabs, form |

### Key Attributes

- `type`: The element or container type (e.g., `type="button"`, `type="row"`)
- `prompt`: Natural language behavior description (styling, events, layout)
- `use`: Data binding (e.g., `use="@state.user.name"`)
- `if` / `if-not`: Conditional rendering
- `for-each`: Iteration over collections

### Prompt Patterns

The `prompt` attribute describes behavior naturally:

```xml
<!-- Styling -->
prompt="style primary, large size"
prompt="gap medium, padding large"

<!-- Behavior -->
prompt="on click @action.save"
prompt="on submit @action.create"

<!-- Combined -->
prompt="style primary, on click @action.save"
```

### Type Inference

Type is optional when parent context makes it clear:

```xml
<container type="menu">
  <element>Edit</element>      <!-- menu item implied -->
  <element>Delete</element>
</container>

<container type="tabs">
  <container prompt="label Overview">Content</container>
</container>
```

### Reference Namespaces

| Prefix | Example | Description |
|--------|---------|-------------|
| `@entity` | `@entity.User` | Entity schema |
| `@component` | `@component.Card` | Component |
| `@action` | `@action.save` | Action |
| `@guard` | `@guard.auth` | Guard |
| `@state` | `@state.items` | State |
| `@item` | `@item.name` | Loop item |
| `@page` | `@page.Dashboard` | Page (webapp) |
| `@screen` | `@screen.Home` | Screen (mobile) |

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

### From Components
- Generate reusable React components from `<component>` definitions
- Implement props from `<prop>` definitions with TypeScript types

### From Pages/Screens/Views
- Generate page components from `<page>`, `<screen>`, or `<view>` definitions
- Set up React Router routes based on `route` attribute
- Implement data fetching from `<data>` queries
- Apply layouts using the `layout` attribute
- Apply guards for authentication/authorization

### From Two Primitives

**For `<element>` tags:**
- Map to appropriate React/HTML elements based on `type` attribute
- `type="text"` → `<p>`, `<span>`, or heading elements based on prompt
- `type="button"` → `<Button>` component
- `type="input"` → `<Input>` component
- `type="image"` → `<img>` element
- `type="icon"` → Icon component from Lucide
- `type="badge"` → Badge component
- `type="link"` → React Router `<Link>` component
- Parse `prompt` attribute for styling and behavior

**For `<container>` tags:**
- Map to layout components based on `type` attribute
- `type="row"` → flex container with `flex-row`
- `type="column"` → flex container with `flex-col`
- `type="grid"` → grid container
- `type="card"` → Card component
- `type="form"` → `<form>` element with React Hook Form
- `type="tabs"` → Tabs component
- `type="accordion"` → Accordion component
- Parse `prompt` attribute for layout properties (gap, padding, justify, align)

### From Prompts
- Parse `prompt` attribute for styling: "style primary" → variant="primary"
- Parse `prompt` for layout: "gap medium" → gap-4, "padding large" → p-6
- Parse `prompt` for events: "on click @action.save" → onClick handler
- Use best judgment for descriptive prompts

### From Actions
- Generate action handler functions from `<action>` definitions
- Parse `prompt` for action behavior (e.g., "submit form, show success toast")

### From Guards
- Generate route guards from `<guard>` definitions
- Implement authentication/authorization checks

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow shadcn/ui patterns for components
- Implement responsive design (mobile-first)
- Support dark mode via Tailwind's dark: prefix

### Authentication
- If guards are used, implement auth middleware
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

## Example Spec Snippet

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp name="MyApp" version="1.0">
  <entities>
    <entity name="User">
      <field name="id" type="uuid" />
      <field name="name" type="string" prompt="required" />
    </entity>
  </entities>

  <guards>
    <guard name="auth" prompt="if not authenticated, redirect to login" />
  </guards>

  <actions>
    <action name="save" prompt="submit form, show success toast" />
  </actions>

  <pages>
    <page name="Dashboard" route="/dashboard">
      <guards>
        <guard type="@guard.auth" />
      </guards>
      <container type="column" prompt="padding large, gap medium">
        <element type="text" prompt="heading">Welcome</element>
        <element type="text" use="@state.user.name" />
        <element type="button" prompt="style primary, on click @action.save">Save</element>
      </container>
    </page>
  </pages>
</webapp>
```

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

1. **Use the two primitives**: `<element>` for leaf nodes, `<container>` for nodes with children

2. **Use prompts for styling**: Describe visual appearance naturally in the `prompt` attribute

3. **Use prompts for behavior**: Use patterns like "on click @action.save", "on submit @action.create"

4. **Define guards and actions**: Reusable definitions make your spec cleaner and easier to maintain

5. **Type inference**: Omit `type` when parent context makes it clear (menus, tabs, lists)

6. **Reference namespaces**: Use `@entity`, `@component`, `@action`, `@guard`, `@state` prefixes

7. **Iterate**: Generate, review, and refine your spec based on the output

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

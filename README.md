# LLM UI Spec

A declarative XML specification for defining UI structure that can be interpreted by LLMs to generate platform-specific code.

## Overview

LLM UI Spec allows you to define UI at varying levels of specificity:

- **Fully defined**: Explicit structure, components, and bindings
- **Prompt-guided**: Natural language descriptions for LLM interpretation
- **Hybrid**: Mix of defined structure with prompt-guided sections

## Features

- **Visual Editor** - React-based editor for creating and editing specs with drag-and-drop
- **Spec Compiler** - Converts XML specs to LLM-friendly markdown for code generation
- **Iterative Workflow** - 4-level progressive refinement from requirements to full spec
- **External Files** - Split large specs into multiple files for better organization
- **Reference System** - Type-safe references between entities, components, pages, and more

## Quick Start

### Option 1: Visual Editor

```bash
cd editor && npm install && npm run dev
```

Open http://localhost:5173 to use the visual editor.

### Option 2: Write XML Directly

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp name="MyApp" version="1.0" detail="full">
  <entities>
    <entity name="User">
      <field name="id" type="uuid" />
      <field name="name" type="string" required="true" />
    </entity>
  </entities>

  <pages>
    <!-- Well-defined page -->
    <page name="Dashboard" route="/dashboard">
      <container layout="column" gap="lg">
        <text variant="heading1">Welcome</text>
        <text value="@state.user.name" />
      </container>
    </page>

    <!-- Prompt-guided page -->
    <page name="Analytics" route="/analytics">
      <prompt>
        Create an analytics dashboard with charts showing
        user engagement, revenue trends, and geographic data.
      </prompt>
    </page>
  </pages>
</webapp>
```

### Option 3: Compile to Markdown

```bash
cd compiler && npm install && npm run build
node dist/cli.js ../samples/formcraft.spec.xml -o output.md
```

## Detail Levels

Specs support 4 progressive detail levels for iterative development:

| Level | Attribute | Description |
|-------|-----------|-------------|
| L1 | `detail="requirements"` | High-level prompts for pages and layouts |
| L2 | `detail="structure"` | Layout slots and section-level prompts |
| L3 | `detail="detailed"` | Containers, loops, conditions, component refs |
| L4 | `detail="full"` | Complete UI specification, ready for codegen |

See [samples/llm-workflow-guide.md](samples/llm-workflow-guide.md) for LLM prompts to guide the iterative process.

## Reference Namespaces

All references use the `@` prefix:

| Namespace | Example | Description |
|-----------|---------|-------------|
| `@entity` | `@entity.User.name` | Entity schema |
| `@component` | `@component.UserCard` | Component definition |
| `@page` | `@page.Dashboard` | Page navigation |
| `@layout` | `@layout.AppShell.header` | Layout slot |
| `@prop` | `@prop.user.name` | Component prop |
| `@state` | `@state.currentUser` | Page state |
| `@param` | `@param.id` | URL parameter |
| `@item` | `@item.title` | Loop item |
| `@action` | `@action.save` | Defined action |
| `@theme` | `@theme.colors.primary` | Theme token |

## Project Structure

```
llm-ui-spec/
├── README.md              # This file
├── SPEC.md                # Full specification documentation
├── SPEC-REFERENCE.md      # Condensed reference for LLM prompts
├── schema.xsd             # XML Schema for validation
├── compiler/              # Spec-to-markdown compiler
│   ├── src/
│   │   ├── cli.ts         # CLI entry point
│   │   ├── parser.ts      # XML parser
│   │   ├── generator.ts   # Markdown generator
│   │   └── types.ts       # TypeScript types
│   └── package.json
├── editor/                # Visual spec editor
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Zustand state stores
│   │   ├── lib/           # XML parsing, DnD, utilities
│   │   └── types/         # TypeScript definitions
│   └── package.json
└── samples/
    ├── formcraft.spec.xml         # Complete SaaS example
    ├── formcraft.entities.spec.xml # External entities file
    ├── formcraft.md               # Compiled markdown output
    ├── llm-workflow-guide.md      # Iterative development guide
    └── llm-codegen-prompt.md      # Code generation prompt template
```

## Sample Application

The `samples/formcraft.spec.xml` demonstrates a complete SaaS form builder with:

- **Well-defined pages**: Dashboard, Form List, Form Editor, Login
- **Prompt-guided pages**: Analytics, Settings, Pricing, Landing
- **Mixed pages**: Public Form Renderer (structure + prompts)
- **Reusable components**: Avatar, Card, FormCard, StatCard
- **Entity definitions**: User, Form, FormField, Submission
- **Multiple layouts**: AppShell, AuthLayout, FormEditorLayout
- **External files**: Entities split into separate file

## External File Support

Large specs can be split into multiple files:

```xml
<!-- Main spec file -->
<webapp name="MyApp">
  <entities src="./myapp.entities.spec.xml" />
  <layouts src="./myapp.layouts.spec.xml" />
  <!-- ... -->
</webapp>

<!-- External file (myapp.entities.spec.xml) -->
<spec type="entities" webapp="MyApp">
  <entity name="User">...</entity>
</spec>
```

## Using with LLMs

### Including the Spec Reference

For best results, include **SPEC-REFERENCE.md** in your LLM prompts:

```
Use the LLM UI Spec format as defined in the attached SPEC-REFERENCE.md file.
```

### Generation Flow

```mermaid
flowchart TB
    subgraph Input
        A[XML Spec File]
    end

    subgraph Compiler
        B[Parse XML]
        C[Resolve References]
        D[Generate Markdown]
    end

    subgraph LLM
        E[Read Spec + Reference]
        F[Generate Platform Code]
    end

    subgraph Output
        G[React / Vue / SwiftUI]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G

    style Input fill:#e1f5fe
    style Compiler fill:#fff3e0
    style LLM fill:#f3e5f5
    style Output fill:#e8f5e9
```

### Code Generation Prompt

See [samples/llm-codegen-prompt.md](samples/llm-codegen-prompt.md) for a complete prompt template that includes:

- Framework and styling preferences
- Accessibility requirements
- State handling patterns
- Component generation rules

## Key Concepts

### Entities

Data models that components bind to:

```xml
<entity name="Task">
  <field name="title" type="string" required="true" />
  <field name="status" type="enum" values="todo,in_progress,done" />
  <field name="assignee" type="ref" ref="@entity.User" />
</entity>
```

### Layouts

Page structure with named slots:

```xml
<layout name="AppShell">
  <container layout="column" minHeight="100vh">
    <slot name="header" height="64px" role="chrome" />
    <container layout="row" grow="true">
      <slot name="sidebar" width="240px" role="chrome" />
      <slot name="content" grow="true" role="content" />
    </container>
  </container>
</layout>
```

### Components

Reusable UI pieces with props and actions:

```xml
<component name="TaskCard">
  <props>
    <prop name="task" type="@entity.Task" required="true" />
  </props>
  <actions>
    <action name="onComplete" />
  </actions>
  <container layout="row" padding="md">
    <text value="@prop.task.title" />
    <badge value="@prop.task.status" />
  </container>
</component>
```

### Pages

Routes with data queries and slot assignments:

```xml
<page name="Dashboard" route="/dashboard" layout="AppShell" auth="required">
  <data>
    <query name="tasks" type="@entity.Task[]" filter="assignee == @auth.user" />
  </data>

  <slot target="@layout.AppShell.content">
    <for each="task" in="@state.tasks">
      <use component="TaskCard" task="@item" />
    </for>
  </slot>
</page>
```

### Prompts

Natural language guidance at any level:

```xml
<!-- Page-level prompt (L1) -->
<page name="Dashboard">
  <prompt>Create a dashboard with stats and charts</prompt>
</page>

<!-- Section-level prompt (L2) -->
<slot target="@layout.AppShell.content">
  <prompt>Grid of 4 analytics charts showing key metrics</prompt>
</slot>

<!-- Element-level prompt with constraints (L3) -->
<prompt constraints="true">
  Empty state illustration with "No tasks yet" message.
  YOU MUST include a "Create Task" button.
</prompt>
```

## Documentation

- **[SPEC.md](SPEC.md)** - Full specification with all elements and attributes
- **[SPEC-REFERENCE.md](SPEC-REFERENCE.md)** - Condensed reference for LLM prompts
- **[samples/llm-workflow-guide.md](samples/llm-workflow-guide.md)** - Iterative development workflow

## License

MIT

# LLM UI Spec

A declarative XML specification for defining UI structure that can be interpreted by LLMs to generate platform-specific code.

## Overview

LLM UI Spec allows you to define UI at varying levels of specificity:

- **Fully defined**: Explicit structure, components, and bindings
- **Prompt-guided**: Natural language descriptions for LLM interpretation
- **Hybrid**: Mix of defined structure with prompt-guided sections

## Quick Start

```xml
<?xml version="1.0" encoding="UTF-8"?>
<app name="MyApp">
  <entities>
    <entity name="User">
      <field name="id" type="uuid" />
      <field name="name" type="string" required="true" />
    </entity>
  </entities>

  <pages>
    <!-- Well-defined page -->
    <page name="Dashboard" route="/dashboard">
      <container layout="stack" gap="lg">
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
</app>
```

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
| `@i18n` | `@i18n.buttons.save` | Translation |

## Files

```
llm-ui-spec/
├── README.md           # This file
├── SPEC.md             # Full specification documentation
├── schema.xsd          # XML Schema for validation
└── samples/
    └── formbuilder-saas.xml  # Complete SaaS example
```

## Sample Application

The `samples/formbuilder-saas.xml` demonstrates a complete SaaS form builder with:

- **Well-defined pages**: Dashboard, Form List, Form Editor, Login
- **Prompt-guided pages**: Analytics, Settings, Pricing, Landing
- **Mixed pages**: Public Form Renderer (structure + prompts)
- **Reusable components**: Avatar, Card, FormCard, StatCard
- **Entity definitions**: User, Form, FormField, Submission
- **Multiple layouts**: AppShell, AuthLayout, FormEditorLayout

## Using with LLMs

### System Prompt

```
You are a UI code generator. Given a UI spec in LLM UI Spec XML format,
generate [React/Vue/SwiftUI] code following these rules:

1. Parse the XML and identify all elements
2. Resolve all @namespace references
3. For <prompt> elements, generate appropriate UI based on the description
4. Use [Tailwind/Material UI/etc.] for styling
5. Ensure accessibility (ARIA labels, keyboard navigation)
6. Handle all defined states (loading, error, empty)

Output clean, production-ready code with TypeScript types.
```

### Generation Flow

```
XML Spec → Parse → Resolve References → Generate Code
                                              ↓
              ← Combine ← Generate Prompts ←──┘
```

## Key Concepts

### Entities

Data models that components bind to:

```xml
<entity name="Task">
  <field name="title" type="string" required="true" />
  <field name="assignee" type="ref" ref="@entity.User" />
</entity>
```

### Components

Reusable UI pieces with props and slots:

```xml
<component name="TaskCard">
  <props>
    <prop name="task" type="@entity.Task" required="true" />
  </props>
  <container>
    <text value="@prop.task.title" />
  </container>
</component>
```

### Prompts

Natural language guidance at any level:

```xml
<!-- Page-level prompt -->
<page name="Dashboard">
  <prompt>Create a dashboard with stats and charts</prompt>
</page>

<!-- Section-level prompt -->
<section name="charts">
  <prompt>Grid of 4 analytics charts</prompt>
</section>

<!-- Field-level prompt -->
<field name="avatar" type="image">
  <prompt>Upload with crop and preview</prompt>
</field>
```

## License

MIT

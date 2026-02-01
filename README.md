# LLM UI Spec

A declarative XML specification for defining UI structure that can be interpreted by LLMs to generate platform-specific code.

## Overview

LLM UI Spec uses **two primitives** to define all UI:

| Primitive | Purpose | Examples |
|-----------|---------|----------|
| `<element>` | Leaf nodes (no children) | button, text, input, image |
| `<container>` | Nodes with children | row, column, card, tabs |

Describe UI naturally with the `prompt` attribute:

```xml
<container type="row" prompt="gap medium, justify between">
  <element type="text" prompt="large heading">Welcome</element>
  <element type="button" prompt="style primary, on click @action.save">Save</element>
</container>
```

## Why LLM UI Spec?

**Keep LLMs grounded.** Without a spec, LLMs make assumptions about your UI that drift from your intent.

| Benefit | Without Spec | With Spec |
|---------|--------------|-----------|
| **Consistency** | LLM invents patterns | Follows your components |
| **Control** | "Make it nice" → random | Explicit + creative freedom |
| **Cross-platform** | Rewrite per platform | Shared entities, platform UI |

## Quick Start

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

## Key Concepts

### Human Readable Patterns

All attributes except `name` can be expressed in `prompt`:

```xml
<!-- Attribute syntax -->
<element type="text" use="@user.name" />
<element type="spinner" if="@state.loading" />

<!-- Prompt syntax (equivalent) -->
<element type="text" prompt="use @user.name" />
<element type="spinner" prompt="if @state.loading" />

<!-- Type in prompt -->
<element prompt="text, use @user.name" />
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

### Data Binding

Use `use` attribute for data binding:

```xml
<element type="text" use="@user.name" />
<element type="image" use="@user.avatar" />
<element type="badge" use="@item.status" />
```

### Control Flow

```xml
<!-- Conditional -->
<element type="spinner" if="@state.loading" />
<element type="text" if-not="@state.loading">Loaded</element>

<!-- Loops -->
<container type="card" for-each="@state.items">
  <element use="@item.name" />
</container>
```

### Prompt Patterns

```xml
<!-- Styling -->
prompt="style primary"
prompt="large heading"
prompt="gap medium"

<!-- Behavior -->
prompt="on click @action.save"
prompt="on submit @action.create"

<!-- Combined -->
prompt="style primary, on click @action.save"
```

## Reference Namespaces

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

## Platform Support

| Platform | Root Element | Key Constructs |
|----------|--------------|----------------|
| Webapp | `<webapp>` | pages, modals, layouts |
| Mobile | `<mobileapp>` | screens, sheets, tabs |
| Desktop | `<desktopapp>` | views, dialogs, menus |

### Webapp Example

```xml
<page name="Dashboard" route="/dashboard" layout="@layout.AppShell">
  <guards><guard type="@guard.auth" /></guards>
  <data><query name="items" type="@entity.Item[]" /></data>
  <slot target="@layout.AppShell.content">
    <container type="grid" prompt="3 columns, medium gap">
      <element type="@component.ItemCard" for-each="@state.items" />
    </container>
  </slot>
</page>
```

### Mobile Example

```xml
<screen name="Dashboard" prompt="initial">
  <guards><guard type="@guard.auth" /></guards>
  <container type="list" prompt="pull to refresh @action.refresh" for-each="@state.items">
    <container prompt="chevron, on tap push @screen.Detail">
      <element use="@item.name" />
    </container>
  </container>
</screen>
```

### Desktop Example

```xml
<view name="Dashboard">
  <guards><guard type="@guard.auth" /></guards>
  <container type="split-view" prompt="horizontal">
    <container type="panel" prompt="width 250px, resizable">
      <container type="tree-view">
        <element prompt="home icon">Dashboard</element>
      </container>
    </container>
    <container type="panel" prompt="grow">
      <!-- Content -->
    </container>
  </container>
</view>
```

## Project Structure

```
llm-ui-spec/
├── SPEC.md                # Core concepts (shared)
├── SPEC.webapp.md         # Webapp types and patterns
├── SPEC.mobile.md         # Mobile types and patterns
├── SPEC.desktop.md        # Desktop types and patterns
├── SPEC-REFERENCE.md      # Condensed quick reference
├── schema.xsd             # XML Schema
├── editor/                # Visual spec editor
├── compiler/              # Spec-to-markdown compiler
├── samples/               # Sample specs
└── docs/                  # Documentation site
```

## File Organization

| Platform | Pattern |
|----------|---------|
| Shared | `app.shared.spec.xml` |
| Webapp | `app.webapp.spec.xml` |
| Mobile | `app.mobile.spec.xml` |
| Desktop | `app.desktop.spec.xml` |

```xml
<!-- Import shared definitions -->
<import src="./myapp.shared.spec.xml" />
```

## Documentation

- **[SPEC.md](SPEC.md)** - Core concepts shared across platforms
- **[SPEC.webapp.md](SPEC.webapp.md)** - Webapp-specific types
- **[SPEC.mobile.md](SPEC.mobile.md)** - Mobile-specific types
- **[SPEC.desktop.md](SPEC.desktop.md)** - Desktop-specific types
- **[SPEC-REFERENCE.md](SPEC-REFERENCE.md)** - Quick reference

## License

MIT

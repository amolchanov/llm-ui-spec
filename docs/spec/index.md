# LLM UI Spec

A declarative XML specification for defining UI structure that can be interpreted by LLMs to generate platform-specific code.

## Platform-Specific Documentation

For platform-specific types and patterns, see:
- **[Webapp](./webapp)** - Web applications (pages, modals, routing)
- **[Mobile](./mobile)** - Mobile applications (screens, sheets, gestures)
- **[Desktop](./desktop)** - Desktop applications (windows, menus, toolbars)

This document covers core concepts shared across all platforms.

---

## Overview

LLM UI Spec uses **two primitives** to define all UI:

| Primitive | Purpose | Examples |
|-----------|---------|----------|
| `<element>` | Leaf nodes (no children) | button, text, input, image, icon |
| `<container>` | Nodes with children | row, column, grid, accordion, tabs, modal |

---

## Human Readability

LLM UI Spec is designed to be read and written by humans. The core principle is: **write what you mean, not what the system requires.**

### Natural Language First

Describe UI behavior naturally:

```xml
<!-- Instead of verbose attributes -->
<element type="button" variant="primary" size="lg" disabled="false" />

<!-- Write what you mean -->
<element type="button" prompt="large primary button">Save</element>
```

### Minimal Syntax

Only specify what's necessary:

```xml
<!-- Type from context -->
<container type="menu">
  <element>Edit</element>        <!-- Obviously a menu item -->
  <element>Delete</element>      <!-- Obviously a menu item -->
</container>

<!-- Type explicit when needed -->
<element type="button">Save</element>
```

### Prompt-Driven Patterns

Common patterns expressed naturally:

```xml
<!-- Styling -->
prompt="style primary"
prompt="large heading"
prompt="muted text"

<!-- Layout -->
prompt="gap medium"
prompt="padding large"
prompt="3 columns"

<!-- Behavior -->
prompt="on click @action.save"
prompt="on submit @action.create"
prompt="if @state.loading"

<!-- Combined -->
prompt="large primary button, on click @action.save"
```

---

## Common Attributes

All primitives share these attributes:

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Identifier for referencing |
| `type` | string | Element or container type |
| `prompt` | string | Natural language behavior description |
| `use` | reference | Data binding |
| `if` | expression | Render only if true |
| `if-not` | expression | Render only if false |
| `for-each` | collection | Iterate over items |

### Attribute Expression

All attributes (except `name`) can be expressed in prompt:

```xml
<!-- Attribute syntax -->
<element type="text" use="@user.name" />
<element type="spinner" if="@state.loading" />
<container type="card" for-each="@state.items" />

<!-- Prompt syntax (equivalent) -->
<element type="text" prompt="use @user.name" />
<element type="spinner" prompt="if @state.loading" />
<container type="card" prompt="for each @state.items" />

<!-- Type in prompt -->
<element prompt="text, use @user.name" />
<element prompt="spinner, if @state.loading" />
<container prompt="card, for each @state.items" />
```

### Type Inference

Type is optional when parent context makes it clear:

```xml
<!-- Inside accordion, children are accordion content -->
<container type="accordion">
  <container prompt="label Section 1">Content 1</container>
  <container prompt="label Section 2">Content 2</container>
</container>

<!-- Inside tabs, children are tab content -->
<container type="tabs">
  <container prompt="label Overview">Overview</container>
  <container prompt="label Settings">Settings</container>
</container>

<!-- Inside list, children are list items -->
<container type="list">
  <container prompt="chevron">Item 1</container>
  <container prompt="chevron">Item 2</container>
</container>
```

---

## Element

Leaf nodes that display content or accept input. Cannot have children.

```xml
<element type="text" prompt="large heading">Welcome</element>
<element type="button" prompt="style primary, on click @action.save">Save</element>
<element type="input" prompt="required, placeholder Enter email">Email</element>
<element type="image" use="@user.avatar" prompt="avatar style, size 40" />
<element type="icon" prompt="home, size large" />
<element type="badge" use="@item.status" prompt="style success" />
```

### Common Element Types

| Type | Description |
|------|-------------|
| `text` | Text display |
| `button` | Clickable button |
| `input` | Text input |
| `image` | Image display |
| `icon` | Icon display |
| `badge` | Status badge |
| `link` | Navigation link |
| `separator` | Visual divider |
| `spinner` | Loading indicator |

See platform specs for additional element types.

---

## Container

Nodes that hold child elements or other containers.

```xml
<container type="column" prompt="padding medium, gap large">
  <element type="text" prompt="heading">Title</element>
  <element type="text" prompt="muted" use="@item.description" />
</container>

<container type="row" prompt="justify between, align center">
  <element type="text">Label</element>
  <element type="button" prompt="style primary">Action</element>
</container>
```

### Common Container Types

| Type | Description |
|------|-------------|
| `row` | Horizontal layout |
| `column` | Vertical layout |
| `grid` | Grid layout |
| `card` | Card with border/shadow |
| `form` | Form container |
| `section` | Semantic section |
| `scroll` | Scrollable container |

See platform specs for additional container types.

---

## Data Binding

Use the `use` attribute for data binding:

```xml
<!-- Display data -->
<element type="text" use="@user.name" />
<element type="image" use="@user.avatar" />
<element type="badge" use="@item.status" />

<!-- Also expressible in prompt -->
<element type="text" prompt="use @user.name" />
```

---

## Control Flow

### Conditional Rendering

```xml
<!-- Show if condition is true -->
<element type="spinner" if="@state.loading" />

<!-- Show if condition is false -->
<element type="text" if-not="@state.loading">Loaded</element>

<!-- Conditional container -->
<container type="card" if="@state.hasData">
  <element use="@state.data.title" />
</container>
```

### Loops

```xml
<!-- Iterate over collection (item available as @item) -->
<container type="card" for-each="@state.items">
  <element use="@item.name" />
</container>

<!-- In prompt -->
<container type="card" prompt="for each @state.items">
  <element use="@item.name" />
</container>
```

---

## Prompt-Driven Development

Use the `prompt` attribute to describe behavior in natural language:

```xml
<!-- Styling -->
<element type="button" prompt="style primary, large size">Save</element>
<container type="row" prompt="gap medium, justify between" />

<!-- Behavior -->
<element type="button" prompt="on click @action.save, show loading while saving">Save</element>
<container type="form" prompt="on submit @action.create, on success close modal" />

<!-- Complex descriptions -->
<container type="data-table" use="@state.users" prompt="
  sortable, filterable, 25 per page,
  row selection, bulk delete action
" />
```

### Prompt as Child

For complex prompts, use a child element:

```xml
<container type="column">
  <prompt context="true">
    Use minimal design with monochrome colors.
    All children should follow this style.
  </prompt>
  <container type="card" prompt="User profile" />
  <container type="card" prompt="Activity feed" />
</container>
```

---

## Reference Namespaces

All references use the `@` prefix:

| Namespace | Syntax | Description |
|-----------|--------|-------------|
| `@entity` | `@entity.Name` | Entity schema |
| `@component` | `@component.Name` | Component reference |
| `@state` | `@state.name` | Page/component state |
| `@item` | `@item.field` | Current loop item |
| `@action` | `@action.name` | Defined action |
| `@guard` | `@guard.name` | Guard reference |
| `@page` | `@page.Name` | Page navigation (webapp) |
| `@screen` | `@screen.Name` | Screen navigation (mobile) |
| `@modal` | `@modal.Name` | Modal reference (webapp) |
| `@sheet` | `@sheet.Name` | Sheet reference (mobile) |
| `@layout` | `@layout.Name` | Layout reference |
| `@prop` | `@prop.name` | Component prop |
| `@param` | `@param.name` | URL/route parameters |
| `@theme` | `@theme.type.name` | Theme value (e.g., `@theme.color.primary`) |

---

## Entities

Define data models. Shared across all platforms.

```xml
<entities>
  <entity name="User">
    <field name="id" type="uuid" />
    <field name="name" type="string" prompt="required" />
    <field name="email" type="email" prompt="required" />
    <field name="avatar" type="image" />
    <field name="posts" type="ref" prompt="references @entity.Post, many" />
  </entity>

  <entity name="Post">
    <field name="id" type="uuid" />
    <field name="title" type="string" prompt="required, max 100 chars" />
    <field name="content" type="richtext" />
    <field name="author" type="ref" prompt="references @entity.User" />
  </entity>
</entities>
```

### Field Types

| Type | Description |
|------|-------------|
| `uuid` | Unique identifier |
| `string` | Text value |
| `text` | Long text |
| `richtext` | Rich/formatted text |
| `email` | Email address |
| `url` | URL |
| `phone` | Phone number |
| `number` | Numeric value |
| `integer` | Whole number |
| `decimal` | Decimal number |
| `boolean` | True/false |
| `date` | Date only |
| `time` | Time only |
| `datetime` | Date and time |
| `image` | Image reference |
| `file` | File reference |
| `json` | JSON object |
| `enum` | Enumerated values |
| `ref` | Reference to another entity |

---

## Components

Reusable UI compositions with props.

```xml
<components>
  <component name="UserCard">
    <props>
      <prop name="user" type="@entity.User" prompt="required" />
      <prop name="compact" type="boolean" prompt="default false" />
    </props>

    <container type="row" prompt="gap small">
      <element type="image" use="@prop.user.avatar" prompt="avatar style" />
      <container type="column">
        <element use="@prop.user.name" />
        <element prompt="muted" use="@prop.user.email" if-not="@prop.compact" />
      </container>
    </container>
  </component>
</components>
```

### Using Components

```xml
<!-- Reference with type -->
<element type="@component.UserCard" use="@state.currentUser" />

<!-- With for-each (item passed automatically) -->
<element type="@component.UserCard" for-each="@state.users" />
```

---

## Actions

Reusable action definitions. Referenced with `@action.name`.

```xml
<actions>
  <action name="save" prompt="submit form, show success toast" />
  <action name="delete" prompt="confirm dialog, delete item, refresh list" />
  <action name="export" prompt="download as CSV file" />
</actions>
```

### Using Actions

```xml
<element type="button" prompt="on click @action.save">Save</element>
<container type="form" prompt="on submit @action.save, on success close modal" />
```

---

## Guards

Authentication and authorization guards. Referenced with `@guard.name`.

```xml
<guards>
  <guard name="auth" prompt="if not authenticated, redirect to login" />
  <guard name="admin" prompt="if not admin role, redirect to unauthorized" />
</guards>
```

### Using Guards

```xml
<!-- Webapp -->
<page name="Dashboard" route="/dashboard">
  <guards>
    <guard type="@guard.auth" />
  </guards>
</page>

<!-- Mobile -->
<screen name="Dashboard">
  <guards>
    <guard type="@guard.auth" />
  </guards>
</screen>

<!-- Desktop -->
<view name="Editor">
  <guards>
    <guard type="@guard.auth" />
  </guards>
</view>
```

---

## File Organization

### File Extensions

| Platform | File Pattern |
|----------|--------------|
| Shared | `<app>.shared.spec.xml` |
| Webapp | `<app>.webapp.spec.xml` or `<app>.spec.xml` |
| Mobile | `<app>.mobile.spec.xml` |
| Desktop | `<app>.desktop.spec.xml` |

### Import

```xml
<import src="./myapp.shared.spec.xml" />
```

### Example Structure

```
myapp/
├── myapp.shared.spec.xml   # Entities, components, actions, guards
├── myapp.spec.xml          # Web pages, modals
├── myapp.mobile.spec.xml   # Mobile screens, sheets
└── myapp.desktop.spec.xml  # Desktop windows, menus
```

---

## Config

Theme and application configuration.

```xml
<config>
  <theme>
    <value type="color" name="primary">#3B82F6</value>
    <value type="color" name="danger">#EF4444</value>
    <value type="spacing" name="unit">4px</value>
    <value type="radius" name="default">8px</value>
  </theme>

  <llm>
    <prompt type="global">
      Generate accessible, production-ready code.
      Use semantic HTML and proper ARIA labels.
    </prompt>
  </llm>
</config>
```

### Referencing Theme Values

Use `@theme.type.name` to reference theme values:

```xml
<element type="button" prompt="background @theme.color.primary">Submit</element>
<container prompt="padding @theme.spacing.unit, rounded @theme.radius.default">
  <element prompt="text color @theme.color.danger">Error message</element>
</container>
```

---

## Best Practices

1. **Use prompts for styling** - Describe visual appearance naturally
2. **Use prompts for behavior** - Describe interactions with "on click", "on submit", etc.
3. **Omit types when context is clear** - Inside menus, lists, tabs, etc.
4. **Define reusable elements** - Put entities, components, actions, guards in shared spec
5. **Reference with @** - Use reference namespaces for linking

---

## License

MIT

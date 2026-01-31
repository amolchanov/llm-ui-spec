# LLM UI Spec

A declarative XML specification for defining UI structure that can be interpreted by LLMs to generate platform-specific code.

## Platform-Specific Documentation

For platform-specific elements and patterns, see:
- **[Webapp](./webapp)** - Web applications (layouts, pages, modals, routing)
- **[Mobile](./mobile)** - Mobile applications (screens, tabs, sheets, swipe actions)
- **[Desktop](./desktop)** - Desktop applications (windows, menus, toolbars, context menus)

This document covers shared concepts used across all platforms.

---

## Overview

LLM UI Spec allows you to define UI at varying levels of specificity:
- **Fully defined**: Explicit structure, components, and bindings
- **Prompt-guided**: Natural language descriptions for LLM interpretation
- **Hybrid**: Mix of defined structure with prompt-guided sections

The specification supports an iterative development workflow where you progressively add detail, allowing validation at each stage before committing to implementation specifics.

---

## Detail Levels

Specs can be developed iteratively through four detail levels. Use the `detail` attribute on `<webapp>` to indicate the current level:

```xml
<webapp name="MyApp" version="1.0" detail="requirements">
```

### Level 1: Requirements (`detail="requirements"`)

High-level structure with prompts describing entire pages and layouts.

**Contains:**
- Entity names and basic fields
- Layout names with prompt descriptions
- Page names, routes, auth requirements with prompt descriptions
- Component names with prompt descriptions

**Example:**
```xml
<webapp name="FormCraft" version="1.0" detail="requirements">
  <entities>
    <entity name="Form">
      <field name="id" type="uuid" />
      <field name="name" type="string" />
      <field name="owner" type="ref" ref="@entity.User" />
    </entity>
  </entities>

  <layouts>
    <layout name="AppShell">
      <prompt>Main application layout with header, collapsible sidebar, and content area</prompt>
    </layout>
  </layouts>

  <pages>
    <page name="Dashboard" route="/dashboard" auth="required">
      <prompt>Dashboard showing form statistics, recent forms grid, and recent submissions table</prompt>
    </page>
  </pages>

  <components>
    <component name="FormCard">
      <prompt>Card displaying form name, status badge, submission count, and action menu</prompt>
    </component>
  </components>
</webapp>
```

### Level 2: Structure (`detail="structure"`)

Adds layout structure, slot assignments, and section-level prompts.

**Adds:**
- Layout containers and slot definitions
- Page layout assignments and slot fills
- Data queries
- Section-level prompts (instead of page-level)

### Level 3: Detailed (`detail="detailed"`)

Adds UI containers, loops, conditions, and component usage with prompts for complex elements.

**Adds:**
- Container hierarchy with layout props
- `<for>` loops for lists/grids
- `<if>` conditions for dynamic UI
- `<use component="...">` for component instances
- Prompts only for complex/creative elements

### Level 4: Full (`detail="full"`)

Complete specification with all UI elements defined. Minimal or no prompts.

**Contains:**
- All UI elements explicitly defined
- Complete component props and actions
- Form validation rules
- Loading, error, and empty states
- Navigation guards and flows

### Mixed Detail Levels

You can mix detail levels within a single file:

```xml
<webapp name="MyApp" version="1.0" detail="full">
  <!-- Fully specified page -->
  <page name="Dashboard" route="/dashboard" detail="full">
    <container>...</container>
  </page>

  <!-- Still in progress - prompt only -->
  <page name="Analytics" route="/analytics" detail="requirements">
    <prompt>Analytics dashboard with charts for form performance and submission trends</prompt>
  </page>
</webapp>
```

---

## Reference Namespaces

All references use the `@` prefix with a namespace:

| Namespace | Syntax | Description |
|-----------|--------|-------------|
| `@entity` | `@entity.Name.field` | Entity schema reference |
| `@component` | `@component.Name` | Component definition |
| `@page` | `@page.Name` | Page navigation |
| `@screen` | `@screen.Name` | Mobile screen navigation |
| `@layout` | `@layout.Name.slot` | Layout reference |
| `@prop` | `@prop.name` | Component prop |
| `@state` | `@state.name` | Page/component state |
| `@param` | `@param.name` | URL/route parameters |
| `@item` | `@item.field` | Current loop item |
| `@action` | `@action.name` | Defined action |
| `@theme` | `@theme.path` | Theme tokens |
| `@i18n` | `@i18n.key` | Translations |
| `@asset` | `@asset.type.name` | Static assets |
| `@config` | `@config.path` | Config values |
| `@modal` | `@modal.Name` | Modal reference (webapp) |
| `@sheet` | `@sheet.Name` | Sheet reference (mobile) |
| `@dialog` | `@dialog.Name` | Dialog reference (desktop) |
| `@window` | `@window.Name` | Window reference (desktop) |
| `@contextMenu` | `@contextMenu.Name` | Context menu (desktop) |

## Document Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp name="AppName" version="1.0">
  <entities>...</entities>
  <layouts>...</layouts>
  <components>...</components>
  <pages>...</pages>
  <navigation>...</navigation>
  <config>...</config>
</webapp>
```

---

## File Organization

LLM UI Spec supports both single-file and multi-file project structures.

### File Extension

All spec files use the `.spec.xml` extension:
```
myapp.spec.xml
```

### Single-File Structure

For smaller projects, everything can live in one file:
```
myapp.spec.xml
```

### Multi-File Structure

Larger projects can split definitions into separate files:

```
myapp.spec.xml                              # Main spec file
myapp.entities.spec.xml                     # All entities (section file)
myapp.entity.User.spec.xml                  # Single entity definition
myapp.component.Header.spec.xml             # Single component definition
myapp.page.Dashboard.spec.xml               # Single page definition
```

### External File Format

External spec files use a `<spec>` root element:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<spec type="<type>" webapp="<appname>">
  <!-- Element definition here -->
</spec>
```

---

## Platform-Specific Specs

For cross-platform applications, separate shared definitions from platform-specific UI.

### File Naming Convention

| Platform | File Pattern | Description |
|----------|--------------|-------------|
| `shared` | `<app>.shared.spec.xml` | Common entities, components, styles |
| `webapp` | `<app>.webapp.spec.xml` or `<app>.spec.xml` | Web routes, pages, modals |
| `mobile` | `<app>.mobile.spec.xml` | Mobile screens, tabs, sheets |
| `desktop` | `<app>.desktop.spec.xml` | Windows, menus, toolbars |

### What Goes Where

**Shared spec (`myapp.shared.spec.xml`):**
- Entities (data models)
- Reusable components
- Theme tokens
- Common validation rules

**Platform specs:**
- Layouts (platform-specific structure)
- Pages/Screens/Views (platform navigation)
- Platform-specific UI patterns
- Navigation structure

### Example Structure

```
formcraft/
├── formcraft.shared.spec.xml   # Entities, components
├── formcraft.spec.xml          # Web pages, modals (webapp)
├── formcraft.mobile.spec.xml   # Mobile screens, sheets
└── formcraft.desktop.spec.xml  # Desktop windows, menus
```

### Import Element

Use `<import>` to include shared definitions:

```xml
<import src="./myapp.shared.spec.xml" />
```

### Platform Detection

The platform is determined by the file name pattern, not an attribute:

- `*.shared.spec.xml` → Shared definitions
- `*.webapp.spec.xml` or `*.spec.xml` → Web application
- `*.mobile.spec.xml` → Mobile application
- `*.desktop.spec.xml` → Desktop application

---

## Entities

Define data models that components bind to. Entities are shared across all platforms.

```xml
<entities>
  <entity name="User">
    <field name="id" type="uuid" />
    <field name="name" type="string" required="true" />
    <field name="email" type="email" required="true" />
    <field name="posts" type="ref" ref="@entity.Post" cardinality="many" />
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
| `image` | Image URL/reference |
| `file` | File URL/reference |
| `json` | JSON object |
| `enum` | Enumerated values |
| `ref` | Reference to another entity |

### Field Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Field name (required) |
| `type` | string | Field type (required) |
| `required` | boolean | Is field required |
| `default` | any | Default value |
| `values` | string | Comma-separated enum values |
| `ref` | @entity | Referenced entity for `ref` type |
| `cardinality` | one/many | Relationship cardinality |
| `minLength` | number | Minimum length |
| `maxLength` | number | Maximum length |
| `min` | number | Minimum value |
| `max` | number | Maximum value |
| `pattern` | string | Regex pattern |

---

## Components

Reusable UI components with props, slots, and actions. Components are shared across platforms.

```xml
<components>
  <component name="UserCard">
    <props>
      <prop name="user" type="@entity.User" required="true" />
      <prop name="compact" type="boolean" default="false" />
    </props>
    <actions>
      <action name="onClick" params="userId: uuid" />
    </actions>

    <container layout="row" gap="sm">
      <use component="@component.Avatar" src="@prop.user.avatar" />
      <text value="@prop.user.name" />
    </container>
  </component>
</components>
```

### Component Definition

| Element | Description |
|---------|-------------|
| `<props>` | Declare component inputs |
| `<actions>` | Declare callbacks/events |
| `<slot>` | Content insertion points |
| `<prompt>` | LLM guidance for implementation |

### Using Components

```xml
<use
  component="@component.UserCard"
  user="@state.currentUser"
  onClick="handleUserClick"
/>
```

---

## The Prompt Element

The `<prompt>` element allows natural language guidance at any level.

### Prompt on Containers

```xml
<!-- Simple attribute prompt -->
<container layout="row" prompt="User profile card with avatar and stats" />

<!-- Nested prompt element for longer descriptions -->
<container layout="column" gap="md">
  <prompt context="true" constraints="true">
    Project list with filtering and pagination.
    Must show loading skeleton while fetching.
    Must NOT display raw error messages to users.
  </prompt>
</container>
```

### Prompt Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `context` | boolean | Sets context that flows down to all child elements |
| `override` | boolean | Ignores parent context, starts fresh |
| `constraints` | boolean | Treats content as must/must-not rules |
| `for` | string | Targets specific sub-element |

### Context Inheritance

When `context="true"`, the prompt establishes a design context that flows to all nested elements:

```xml
<container>
  <prompt context="true">
    Use a minimal design with monochrome colors,
    subtle borders, and outline-style icons.
  </prompt>

  <!-- All children inherit the minimal/monochrome context -->
  <container prompt="User profile card" />
  <container prompt="Activity feed" />
</container>
```

### Constraints

When `constraints="true"`, the prompt content is treated as non-negotiable requirements:

```xml
<container>
  <prompt constraints="true">
    Must include ARIA labels on all interactive elements.
    Must NOT use color alone to convey meaning.
    Must have minimum 4.5:1 contrast ratio.
  </prompt>
</container>
```

---

## Common Elements

Elements shared across all platforms.

### Container & Layout

```xml
<container
  layout="row|column|stack|grid|center"
  gap="xs|sm|md|lg|xl"
  padding="xs|sm|md|lg|xl"
  align="start|center|end|stretch"
  justify="start|center|end|between|around"
>
```

### Text

```xml
<text
  value="@prop.user.name"
  variant="heading1|heading2|heading3|body|caption|label"
  weight="normal|medium|bold"
  muted="boolean"
  truncate="number"
/>
```

### Button

```xml
<button
  variant="primary|secondary|outline|ghost|danger"
  size="sm|md|lg"
  icon="icon-name"
  onClick="@action.name"
  disabled="boolean"
  loading="boolean"
>
  Button Text
</button>
```

### Form Elements

```xml
<form onSubmit="@action.submit" onSuccess="@action.onSuccess">
  <input label="Name" bind="name" required="true" />
  <textarea label="Description" bind="description" rows="3" />
  <select label="Status" bind="status" options="@state.options" />
  <switch label="Active" bind="isActive" />
  <button type="submit">Save</button>
</form>
```

### Conditional

```xml
<if condition="@state.isLoading">
  <spinner />
</if>
<else>
  <container>Content</container>
</else>
```

### Loop

```xml
<for each="item" in="@state.items">
  <text value="@item.name" />
</for>
```

---

## Element Reference (Shared)

### Layout Containers

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `row` | Horizontal flex container | `gap`, `align`, `justify`, `wrap` |
| `column` | Vertical flex container | `gap`, `align` |
| `stack` | Alias for column | `gap` |
| `grid` | CSS grid container | `columns`, `gap` |
| `container` | Generic container | `maxWidth`, `padding`, `layout` |
| `card` | Card with border/shadow | `title`, `padding` |
| `section` | Semantic section | `title`, `name` |

### Text & Display

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `text` | Text content | `value`, `variant`, `weight`, `muted`, `truncate` |
| `heading` | Heading (h1-h6) | `level`, `content` |
| `icon` | Icon display | `name`, `size`, `color` |
| `image` | Image display | `src`, `alt`, `width`, `height`, `fit` |
| `badge` | Status badge | `value`, `variant` |
| `tag` | Removable tag | `content`, `removable` |
| `divider` | Visual separator | `orientation` |
| `spacer` | Empty space | `size` |
| `spinner` | Loading indicator | `label`, `size` |

### Form Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `form` | Form container | `onSubmit`, `data`, `entity` |
| `input` | Text input | `label`, `type`, `name`, `bind`, `placeholder`, `required` |
| `textarea` | Multi-line input | `label`, `name`, `bind`, `rows` |
| `select` | Dropdown select | `label`, `name`, `bind`, `options` |
| `checkbox` | Checkbox input | `label`, `name`, `bind`, `checked` |
| `radio` | Radio button | `label`, `name`, `value`, `bind` |
| `switch` | Toggle switch | `label`, `name`, `bind` |
| `datepicker` | Date selector | `label`, `bind`, `required` |

### Buttons & Links

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `button` | Clickable button | `variant`, `size`, `icon`, `onClick`, `disabled`, `loading` |
| `link` | Navigation link | `to`, `variant`, `external` |

### Logic & Control

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `if` | Conditional render | `condition` |
| `else` | Else branch | - |
| `for` | Loop | `each`, `in` |
| `slot` | Content slot | `name`, `target` |

### Component References

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `component` | Component definition | `name` |
| `use` | Use component | `component` (+ any props) |

### Special

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `prompt` | LLM prompt | `context`, `constraints`, `override`, `for` |

---

## Config

Theme and application configuration.

```xml
<config>
  <theme>
    <colors>
      <primary>#3B82F6</primary>
      <secondary>#6B7280</secondary>
      <success>#10B981</success>
      <danger>#EF4444</danger>
    </colors>
    <spacing unit="4px" />
    <borderRadius default="8px" />
  </theme>

  <i18n default="en">
    <locale name="en">
      <string key="app.title">My App</string>
    </locale>
  </i18n>

  <llm>
    <prompt type="global">
      Generate accessible, production-ready code.
      Use semantic HTML and proper ARIA labels.
    </prompt>
  </llm>
</config>
```

---

## Editor Namespace (Optional)

The `editor` namespace provides hints for visual editors that don't affect generated code.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp xmlns:editor="http://llm-ui-spec.org/editor" name="MyApp">
  ...
</webapp>
```

### The Role Attribute

Controls how elements behave in visual editors:

| Role | Description |
|------|-------------|
| `content` | Primary editable area - expanded when editing |
| `chrome` | Layout structure - collapsed and read-only when editing |

```xml
<slot name="header" role="chrome" />
<slot name="content" role="content" />
```

---

## Best Practices

1. **Use prompts for complex UI** - When UI is hard to specify declaratively, use prompts
2. **Be explicit for critical UI** - Important forms and flows should be fully defined
3. **Entity binding** - Always bind components to entities for type safety
4. **Consistent references** - Use `@namespace.path` consistently
5. **Constraints in prompts** - Use must/must-not rules to guide LLM
6. **Context inheritance** - Use `context="true"` to set style context for sections
7. **Share entities and components** - Put reusable definitions in shared spec
8. **Platform-specific UI** - Use appropriate patterns for each platform

---

## License

MIT

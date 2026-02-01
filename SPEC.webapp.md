# LLM UI Spec - Webapp Platform

> **Preview:** This specification is under active development and may change.

Platform-specific types and patterns for web applications.

See [SPEC.md](./SPEC.md) for core concepts (primitives, entities, prompts, etc.).

---

## Overview

Webapp specs use file pattern `*.webapp.spec.xml` or `*.spec.xml` (default).

Key characteristics:
- URL-based routing with browser history
- Sidebar/header layouts with slots
- Modal dialogs for overlays
- Table-based data display with pagination

---

## Common Attributes

All elements and containers support these optional attributes:

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Identifier for referencing |
| `type` | string | Element or container type |
| `prompt` | string | Natural language behavior description |
| `use` | reference | Data binding |
| `if` | expression | Render only if true |
| `if-not` | expression | Render only if false |
| `for-each` | collection | Iterate over items |

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

Type is optional when parent context makes it clear:

```xml
<!-- Inside accordion, children are accordion content -->
<container type="accordion">
  <container prompt="label Section 1">Content 1</container>
  <container prompt="label Section 2">Content 2</container>
</container>

<!-- Inside tabs, children are tab content -->
<container type="tabs">
  <container prompt="label Overview">Overview content</container>
  <container prompt="label Settings">Settings content</container>
</container>

<!-- Inside dropdown, children are dropdown items -->
<container type="dropdown">
  <element prompt="edit icon">Edit</element>
  <element prompt="trash icon, style danger">Delete</element>
</container>
```

---

## Container Types

### Layout Types

Basic layout containers for arranging children.

| Type | Description |
|------|-------------|
| `row` | Horizontal flex layout |
| `column` | Vertical flex layout |
| `grid` | Grid layout |
| `stack` | Layered z-index layout |

```xml
<container type="row" prompt="medium gap, vertically centered">
  <element type="image" use="@user.avatar" />
  <element type="text" use="@user.name" />
</container>

<container type="grid" prompt="3 columns, large gap">
  <container type="card" for-each="@state.items">...</container>
</container>
```

Use `prompt` for all layout styling (columns, gap, padding, alignment):

```xml
<container type="row" prompt="medium gap, center aligned">...</container>
<container type="grid" prompt="3 columns, large gap">...</container>
```

---

### Structural Types

| Type | Description |
|------|-------------|
| `card` | Card with border/shadow |
| `section` | Semantic section |
| `form` | Form container |
| `scroll-area` | Scrollable region |
| `aspect-ratio` | Maintains width/height ratio |
| `collapsible` | Expandable/collapsible section |

```xml
<container type="card" prompt="large padding">
  <element type="text" prompt="heading">Card Title</element>
  <element type="text">Card content here</element>
</container>

<container type="form" prompt="on submit @action.save, on success navigate to @page.List">
  <element type="input" prompt="required">Name</element>
  <element type="button" prompt="style primary">Save</element>
</container>

<container type="aspect-ratio" prompt="ratio 16/9">
  <element type="image" use="@video.thumbnail" prompt="fit cover" />
</container>

<container type="collapsible" prompt="open by default">
  <container type="collapsible-content" prompt="label Toggle details">
    <element type="text">Hidden content here</element>
  </container>
</container>
```

---

### Interactive Types

Complex containers with built-in behavior.

#### Accordion

```xml
<container type="accordion" prompt="collapsible">
  <container prompt="label Section 1">
    <element>Content for section 1</element>
  </container>
  <container prompt="label Section 2">
    <element>Content for section 2</element>
  </container>
</container>
```

#### Tabs

```xml
<container type="tabs">
  <container prompt="label Overview">
    <element>Overview content</element>
  </container>
  <container prompt="label Settings">
    <element>Settings content</element>
  </container>
</container>
```

#### Carousel

```xml
<container type="carousel" for-each="@state.slides" prompt="loop, show arrows">
  <element use="@item.image" />
</container>
```

Use `prompt` for behavior (loop, autoplay, arrows, indicators).

#### Resizable

```xml
<container type="resizable" prompt="horizontal, with visible handles">
  <container prompt="25% width, min 15%">
    <element>Sidebar</element>
  </container>
  <container prompt="75% width">
    <element>Main content</element>
  </container>
</container>
```

Handles are implicit between panels. Use `prompt` for direction and sizing.

#### Command (Palette)

```xml
<container type="command" prompt="open with ⌘K">
  <element prompt="input, placeholder 'Type a command...'" />
  <container prompt="list">
    <container prompt="group Actions">
      <element prompt="on select @action.newFile, file-plus icon">New File</element>
      <element prompt="on select @action.search, search icon">Search</element>
    </container>
  </container>
</container>
```

#### Context Menu

```xml
<container type="context-menu">
  <container prompt="trigger">
    <element>Right-click me</element>
  </container>
  <container prompt="content">
    <element prompt="on select @action.cut, shortcut ⌘X">Cut</element>
    <element prompt="on select @action.copy, shortcut ⌘C">Copy</element>
    <element type="separator" />
    <element prompt="on select @action.delete, style danger">Delete</element>
  </container>
</container>
```

---

### Data Display Types

#### Table

```xml
<container type="table">
  <container prompt="header">
    <element>Name</element>
    <element>Status</element>
    <element prompt="width 50px" />
  </container>
  <container prompt="row" for-each="@state.items">
    <element>@item.name</element>
    <element>
      <element type="badge" use="@item.status" />
    </element>
    <element>
      <container type="dropdown">...</container>
    </element>
  </container>
</container>
```

- `table-header` contains `table-head` cells directly (implicit single row)
- `table-row` elements are direct children of `table` (no wrapper needed)

#### Data Table

Full-featured table with sorting, filtering, pagination.

```xml
<container type="data-table" use="@state.users" prompt="25 per page, sortable, filterable by name and status, row selection, bulk actions" />
```

#### Chart

```xml
<container type="chart" use="@state.salesData" prompt="bar chart, 300px height, tooltip on hover, legend at bottom" />
```

---

### Overlay Types

#### Modal

```xml
<container type="modal" name="CreateProject" prompt="title 'New Project', medium size">
  <container type="form" prompt="on submit @action.createProject, on success close modal">
    <element type="input" prompt="required">Project Name</element>
    <element type="button" prompt="style primary">Create</element>
  </container>
</container>

<!-- Open modal -->
<element type="button" prompt="on click open modal @modal.CreateProject">New Project</element>
```

Use `prompt` for size, closable, title, etc.

#### Dropdown

```xml
<container type="dropdown" prompt="trigger click">
  <element type="button" prompt="more-vertical icon, style ghost" />
  <container prompt="content">
    <element prompt="on click @action.edit, edit icon">Edit</element>
    <element prompt="on click @action.duplicate, copy icon">Duplicate</element>
    <element type="separator" />
    <element prompt="on click @action.delete, trash icon, style danger">Delete</element>
  </container>
</container>
```

#### Popover

```xml
<container type="popover" prompt="trigger click">
  <element type="button">Open Popover</element>
  <container prompt="content">
    <element>Popover content here</element>
  </container>
</container>
```

#### Tooltip

```xml
<container type="tooltip" prompt="content 'This is a tooltip'">
  <element type="button" prompt="info icon, style ghost" />
</container>
```

---

### Navigation Types

#### Nav

```xml
<container type="nav" prompt="vertical">
  <element type="nav-item" to="@page.Dashboard" prompt="home icon">Dashboard</element>
  <element type="nav-item" to="@page.Projects" prompt="folder icon">Projects</element>
  <element type="nav-item" to="@page.Settings" prompt="settings icon">Settings</element>
</container>
```

#### Breadcrumb

```xml
<container type="breadcrumb">
  <element type="breadcrumb-item" to="@page.Dashboard">Dashboard</element>
  <element type="breadcrumb-item" to="@page.Projects">Projects</element>
  <element type="breadcrumb-item" prompt="current page">Current Project</element>
</container>
```

---

## Element Types

### Display Elements

| Type | Description | Key Attributes |
|------|-------------|----------------|
| `text` | Text display | `use` |
| `icon` | Icon display | - |
| `image` | Image display | `use` |
| `badge` | Status badge | `use` |
| `alert` | Status callout message | - |
| `separator` | Visual divider | - |
| `spinner` | Loading indicator | - |
| `skeleton` | Loading placeholder | - |
| `avatar` | User avatar | `use` |
| `progress` | Progress bar | `use` |
| `kbd` | Keyboard key display | - |

Use `prompt` for styling (size, color, variant):

```xml
<element type="text" prompt="page title, large">Welcome</element>
<element type="badge" prompt="style success">Active</element>
<element type="avatar" use="@user.avatar" prompt="fallback @user.initials, large" />
<element type="progress" prompt="value 75, max 100" />
<element type="alert" prompt="title 'Warning', style warning">Please review before submitting.</element>
<container type="row" prompt="small gap">
  <element type="text">Press</element>
  <element type="kbd">⌘</element>
  <element type="kbd">K</element>
  <element type="text">to open</element>
</container>
```

### Input Elements

| Type | Description | Key Attributes |
|------|-------------|----------------|
| `input` | Text input | - |
| `textarea` | Multi-line input | - |
| `select` | Dropdown select | - |
| `combobox` | Searchable select | - |
| `checkbox` | Checkbox input | - |
| `radio` | Radio button | - |
| `switch` | Toggle switch | - |
| `toggle` | Pressable toggle button | - |
| `slider` | Range slider | - |
| `otp-input` | One-time password input | - |
| `date-picker` | Date input | - |
| `calendar` | Date calendar | - |
| `label` | Form field label | - |

Use `prompt` for: bind, label, value, required, placeholder, min/max, length, etc.

```xml
<element type="input" prompt="required">Email</element>
<element type="select" prompt="options @state.statusOptions">Status</element>
<element type="slider" prompt="min 0, max 100">Volume</element>
<element type="date-picker" prompt="format MMM dd yyyy">Due Date</element>

<!-- Radio group -->
<container type="column" prompt="small gap">
  <element type="label">Select size</element>
  <element type="radio" prompt="value sm">Small</element>
  <element type="radio" prompt="value md">Medium</element>
  <element type="radio" prompt="value lg">Large</element>
</container>

<!-- Toggle button -->
<element type="toggle" prompt="bold icon" />

<!-- OTP input -->
<element type="otp-input" prompt="length 6">Verification Code</element>
```

### Action Elements

| Type | Description | Key Attributes |
|------|-------------|----------------|
| `button` | Clickable button | - |
| `link` | Navigation link | `to` |
| `nav-item` | Navigation link | `to` |

```xml
<element type="button" prompt="on click @action.save, style primary">Save</element>
<element type="button" prompt="on click @action.export, style outline, download icon">Export</element>
<element type="button" prompt="on click @action.delete, style danger">Delete</element>
<element type="link" to="@page.Settings">Settings</element>
```

---

## Layouts

Reusable page structure templates with slots.

```xml
<layouts>
  <layout name="AppShell">
    <container type="row" prompt="min height 100vh">
      <slot name="sidebar" prompt="width 240px, collapsible" />
      <container type="column" prompt="grow">
        <slot name="header" prompt="height 64px, sticky" />
        <slot name="content" prompt="grow, scroll" />
      </container>
    </container>
  </layout>
</layouts>
```

### Filling Slots

```xml
<page name="Dashboard" layout="@layout.AppShell">
  <slot target="@layout.AppShell.header">
    <element type="@component.Header" />
  </slot>
  <slot target="@layout.AppShell.sidebar">
    <container type="nav" prompt="vertical">...</container>
  </slot>
  <slot target="@layout.AppShell.content">
    <container type="grid" prompt="3 columns, medium gap">...</container>
  </slot>
</page>
```

---

## Pages

Define application pages with routes and data.

```xml
<pages>
  <page name="Dashboard" route="/dashboard" layout="@layout.AppShell">
    <guards>
      <guard type="@guard.auth" />
    </guards>
    <data>
      <query name="projects" type="@entity.Project[]" />
    </data>

    <slot target="@layout.AppShell.content">
      <element type="skeleton" if="@state.loading" />
      <element type="text" prompt="style danger" if="@state.error">Failed to load</element>
      <container type="grid" prompt="3 columns, medium gap" if="@state.projects">
        <element type="@component.ProjectCard" for-each="@state.projects" />
      </container>
    </slot>
  </page>
</pages>
```

### Page Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Page identifier |
| `route` | string | URL path |
| `layout` | @layout | Layout to use |

Use `prompt` for: route params (`param id`), title.

### Route Parameters

```xml
<page name="UserProfile" route="/users" prompt="param id">
  <data>
    <query name="user" type="@entity.User" prompt="filter by id param" />
  </data>
</page>
```

Multiple params: `prompt="params id, tab"`

---

## Actions

```xml
<actions>
  <action name="save" prompt="submit form, show success toast" />
  <action name="delete" prompt="confirm dialog, then delete item, refresh list" />
  <action name="export" prompt="download as CSV file" />
</actions>
```

Reference actions in elements:

```xml
<element type="button" prompt="on click @action.save">Save</element>
<element type="button" prompt="on click @action.delete, style danger">Delete</element>
```

---

## Guards

```xml
<guards>
  <guard name="auth" prompt="if not authenticated, redirect to /login" />
  <guard name="admin" prompt="if not admin role, redirect to /unauthorized" />
</guards>
```

Pages reference guards:

```xml
<page name="Dashboard" route="/dashboard">
  <guards>
    <guard type="@guard.auth" />
  </guards>
  ...
</page>
```

---

## Toast Notifications

```xml
<!-- Toast container (place once in layout) -->
<element type="toaster" name="notifications" prompt="position bottom-right" />

<!-- Trigger toast -->
<element type="button" prompt="on click toast notifications 'Saved', style success">
  Save
</element>
```

---

## Complete Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp name="MyApp" version="1.0">
  <import src="./myapp.shared.spec.xml" />

  <layouts>
    <layout name="AppShell">
      <container type="row" prompt="min height 100vh">
        <slot name="sidebar" prompt="width 240px" />
        <container type="column" prompt="grow">
          <slot name="header" prompt="height 64px" />
          <slot name="content" prompt="grow, scroll" />
        </container>
      </container>
    </layout>
  </layouts>

  <pages>
    <page name="Dashboard" route="/dashboard" layout="@layout.AppShell">
      <guards>
        <guard type="@guard.auth" />
      </guards>
      <data>
        <query name="projects" type="@entity.Project[]" />
      </data>

      <slot target="@layout.AppShell.content">
        <container type="grid" prompt="3 columns, medium gap">
          <element type="@component.ProjectCard" for-each="@state.projects" />
        </container>
      </slot>
    </page>
  </pages>

  <modals>
    <container type="modal" name="CreateProject" prompt="title 'New Project', medium size">
      <container type="form" prompt="on submit @action.createProject, on success close modal">
        <element type="input" prompt="required">Project Name</element>
        <element type="button" prompt="style primary">Create</element>
      </container>
    </container>
  </modals>
</webapp>
```

# LLM UI Spec - Webapp Platform

Platform-specific elements and patterns for web applications.

See [SPEC.md](./SPEC.md) for shared concepts (entities, components, prompts, etc.).

---

## Overview

Webapp specs use file pattern `*.webapp.spec.xml` or `*.spec.xml` (default).

Key characteristics:
- URL-based routing with browser history
- Sidebar/header layouts with slots
- Modal dialogs for overlays
- Dropdown menus for actions
- Table-based data display with pagination
- Horizontal tabs for content organization

---

## Layouts

Reusable page structure templates with slots.

```xml
<layouts>
  <layout name="AppShell">
    <slot name="header" position="top" sticky="true" />
    <container layout="row">
      <slot name="sidebar" width="250px" collapsible="true" />
      <slot name="content" grow="true" scroll="true" />
    </container>
    <slot name="footer" position="bottom" />
  </layout>
</layouts>
```

### Slot Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Slot identifier (required) |
| `position` | top/bottom/left/right | Fixed position |
| `sticky` | boolean | Stick to viewport |
| `width` | size | Fixed width |
| `height` | size | Fixed height |
| `grow` | boolean | Fill available space |
| `scroll` | boolean | Enable scrolling |
| `collapsible` | boolean | Can be collapsed |
| `optional` | boolean | Slot is optional |
| `role` | content/chrome | Editor behavior |
| `prompt` | string | LLM guidance for slot content |

### Filling Slots with Target

Layouts define **named slots** as placeholders. Pages **fill those slots** using the `target` attribute.

**Layout defines slots:**
```xml
<layout name="AppShell">
  <slot name="header" position="top" sticky="true" />
  <slot name="sidebar" width="250px" />
  <slot name="content" grow="true" />
</layout>
```

**Page fills slots with target:**
```xml
<page name="Dashboard" layout="@layout.AppShell">
  <slot target="@layout.AppShell.header">
    <use component="@component.Header" />
  </slot>

  <slot target="@layout.AppShell.sidebar">
    <use component="@component.Sidebar" />
  </slot>

  <slot target="@layout.AppShell.content">
    <!-- Main page content here -->
    <heading level="1">Dashboard</heading>
  </slot>
</page>
```

### Slot Roles

The `role` attribute controls how slots behave in visual editors.

```xml
<layout name="AppShell">
  <slot name="header" role="chrome" />
  <slot name="sidebar" role="chrome" />
  <slot name="content" role="content" />
  <slot name="footer" role="chrome" />
</layout>
```

When editing a page, only the `content` slot is expanded. The `chrome` slots remain collapsed.

---

## Pages

Define application pages with routes, data, and content.

```xml
<pages>
  <page
    name="Dashboard"
    route="/dashboard"
    layout="@layout.AppShell"
    auth="required"
  >
    <data>
      <query name="tasks" type="@entity.Task[]" />
    </data>

    <slot target="@layout.AppShell.content">
      <!-- Page content -->
    </slot>

    <states>
      <state name="loading">...</state>
      <state name="error">...</state>
    </states>
  </page>
</pages>
```

### Page Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Page identifier (required) |
| `route` | string | URL path (required) |
| `layout` | @layout | Layout to use |
| `auth` | required/guest/none | Authentication requirement |
| `entity` | @entity | Primary entity for the page |
| `title` | string | Page title |

### Route Parameters

```xml
<page name="UserProfile" route="/users/:id">
  <data>
    <query name="user" type="@entity.User" filter="id == @param.id" />
  </data>
</page>
```

---

## Modals

Overlay dialogs for forms and confirmations.

```xml
<modals>
  <modal name="CreateProject" title="New Project" size="medium">
    <form onSubmit="@action.createProject" onSuccess="closeModal()">
      <input label="Project Name" bind="name" required="true" />
      <button type="submit">Create</button>
    </form>
  </modal>

  <modal name="ConfirmDelete" title="Delete Item?" size="small">
    <text>Are you sure you want to delete this item?</text>
    <container layout="row" gap="md" justify="end">
      <button variant="outline" onClick="closeModal()">Cancel</button>
      <button variant="danger" onClick="@action.delete">Delete</button>
    </container>
  </modal>
</modals>
```

### Modal Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Modal identifier (required) |
| `title` | string | Modal title |
| `size` | small/medium/large/full | Modal size |
| `closable` | boolean | Show close button |
| `closeOnOverlay` | boolean | Close when clicking overlay |

### Opening Modals

```xml
<button onClick="openModal(@modal.CreateProject)">New Project</button>
```

### Closing Modals

```xml
<button onClick="closeModal()">Cancel</button>
```

---

## Navigation

Webapp navigation with sidebar and routing.

```xml
<navigation>
  <flow name="authFlow">
    <step page="@page.Login" />
    <step page="@page.Register" />
    <redirect onSuccess="/dashboard" />
  </flow>

  <guards>
    <guard name="auth" redirect="/login" />
    <guard name="guest" redirect="/dashboard" />
    <guard name="admin" role="admin" redirect="/unauthorized" />
  </guards>
</navigation>
```

### NavItem Element

```xml
<navItem
  to="@page.Dashboard"
  icon="home"
  label="Dashboard"
  active="@state.currentPage == 'Dashboard'"
/>
```

### Navigation Functions

| Function | Description |
|----------|-------------|
| `navigateTo(@page.X)` | Navigate to page |
| `navigateBack()` | Go back in history |
| `openModal(@modal.X)` | Open modal dialog |
| `closeModal()` | Close current modal |

---

## Webapp-Specific Elements

### Dropdown Menu

```xml
<dropdown trigger="click">
  <button icon="more-vertical" variant="ghost" />
  <menu>
    <menuItem icon="edit" label="Edit" onClick="@action.edit" />
    <menuItem icon="copy" label="Duplicate" onClick="@action.duplicate" />
    <separator />
    <menuItem icon="trash" label="Delete" color="danger" onClick="@action.delete" />
  </menu>
</dropdown>
```

### Table

```xml
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Date</th>
      <th width="50px"></th>
    </tr>
  </thead>
  <tbody>
    <for each="item" in="@state.items">
      <tr>
        <td>@item.name</td>
        <td><badge value="@item.status" /></td>
        <td>@item.createdAt</td>
        <td>
          <dropdown>
            <menuItem onClick="@action.edit">Edit</menuItem>
            <menuItem onClick="@action.delete">Delete</menuItem>
          </dropdown>
        </td>
      </tr>
    </for>
  </tbody>
</table>
```

### Pagination

```xml
<pagination
  data="@state.items"
  pageSize="25"
  currentPage="@state.page"
  onChange="@action.setPage"
/>
```

### Tabs

```xml
<tabs defaultTab="overview">
  <tab name="overview" label="Overview">
    <container>Overview content</container>
  </tab>
  <tab name="settings" label="Settings">
    <container>Settings content</container>
  </tab>
</tabs>
```

### Breadcrumb

```xml
<breadcrumb>
  <breadcrumbItem to="@page.Dashboard">Dashboard</breadcrumbItem>
  <breadcrumbItem to="@page.Projects">Projects</breadcrumbItem>
  <breadcrumbItem>Current Project</breadcrumbItem>
</breadcrumb>
```

### Tooltip

```xml
<tooltip content="This is a tooltip">
  <button icon="info" variant="ghost" />
</tooltip>
```

### Sidebar

```xml
<slot name="sidebar" width="250px" collapsible="true">
  <nav orientation="vertical">
    <navItem to="@page.Dashboard" icon="home">Dashboard</navItem>
    <navItem to="@page.Projects" icon="folder">Projects</navItem>
    <navItem to="@page.Settings" icon="settings">Settings</navItem>
  </nav>
</slot>
```

---

## Element Reference (Webapp)

### Layout Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `layout` | Page layout template | `name` |
| `slot` | Content placeholder | `name`, `target`, `width`, `height`, `sticky` |
| `page` | Routed page | `name`, `route`, `layout`, `auth` |

### Overlay Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `modal` | Dialog modal | `name`, `title`, `size`, `closable` |
| `drawer` | Slide-out drawer | `name`, `title`, `position`, `size` |
| `dropdown` | Dropdown menu | `trigger`, `align` |
| `tooltip` | Hover tooltip | `content`, `position` |
| `popover` | Click popover | `trigger`, `content` |

### Data Display

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `table` | Data table | `columns`, `sortable`, `selectable` |
| `thead` | Table header | - |
| `tbody` | Table body | - |
| `tr` | Table row | - |
| `th` | Table header cell | - |
| `td` | Table data cell | - |
| `pagination` | Page navigation | `pageSize`, `total`, `current` |

### Navigation

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `nav` | Navigation container | `orientation` |
| `navItem` | Navigation link | `to`, `icon`, `label`, `active` |
| `breadcrumb` | Breadcrumb trail | - |
| `breadcrumbItem` | Breadcrumb link | `to` |
| `tabs` | Tab container | `defaultTab`, `variant` |
| `tab` | Tab panel | `name`, `label`, `icon` |

---

## Example

Complete webapp spec structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp name="MyApp" version="1.0">
  <import src="./myapp.shared.spec.xml" />

  <layouts>
    <layout name="AppShell">
      <container layout="row" minHeight="100vh">
        <slot name="sidebar" width="240px" role="chrome" />
        <container layout="column" grow="true">
          <slot name="header" height="64px" role="chrome" />
          <slot name="content" grow="true" scroll="true" role="content" />
        </container>
      </container>
    </layout>
  </layouts>

  <pages>
    <page name="Dashboard" route="/dashboard" layout="AppShell" auth="required">
      <data>
        <query name="projects" type="@entity.Project[]" />
      </data>

      <slot target="@layout.AppShell.content">
        <container layout="grid" columns="3" gap="md">
          <for each="project" in="@state.projects">
            <use component="ProjectCard" project="@item" />
          </for>
        </container>
      </slot>
    </page>
  </pages>

  <modals>
    <modal name="CreateProject" title="New Project" size="medium">
      <form onSubmit="@action.createProject" onSuccess="closeModal()">
        <input label="Project Name" bind="name" required="true" />
        <button type="submit">Create</button>
      </form>
    </modal>
  </modals>
</webapp>
```

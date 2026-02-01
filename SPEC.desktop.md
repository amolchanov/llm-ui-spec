# LLM UI Spec - Desktop Platform

Platform-specific elements and patterns for desktop applications.

See [SPEC.md](./SPEC.md) for shared concepts (entities, components, prompts, etc.).

---

## Overview

Desktop specs use file pattern `*.desktop.spec.xml`.

Key characteristics:
- Menu bar with keyboard shortcuts
- Toolbar with action buttons
- Multi-window support
- Context menus (right-click)
- Resizable split views and panels
- Status bar
- Dialog boxes
- Drag and drop
- System tray integration
- Tree view navigation

---

## Common Attributes

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
<element type="text" use="@state.title" />
<element type="spinner" if="@state.loading" />
<container type="panel" for-each="@state.items" />

<!-- Prompt syntax (equivalent) -->
<element type="text" prompt="use @state.title" />
<element type="spinner" prompt="if @state.loading" />
<container type="panel" prompt="for each @state.items" />

<!-- Type in prompt -->
<element prompt="text, use @state.title" />
<element prompt="spinner, if @state.loading" />
<container prompt="panel, for each @state.items" />
```

Type is optional when parent context makes it clear:

```xml
<!-- Inside menu, children are menu items -->
<container type="menu" prompt="label File">
  <element prompt="shortcut Ctrl+N, on click open @dialog.Create">New</element>
  <element prompt="shortcut Ctrl+S, on click @action.save">Save</element>
</container>

<!-- Inside tree-view, children are tree items -->
<container type="tree-view">
  <element prompt="home icon, on click @action.setView dashboard">Dashboard</element>
  <container prompt="folder icon, expanded">Projects</container>
</container>

<!-- Inside toolbar, children are toolbar buttons -->
<container type="toolbar">
  <element prompt="plus icon, tooltip New, on click open @dialog.Create" />
</container>
```

---

## App Configuration

```xml
<config>
  <window prompt="title MyApp, width 1200, height 800, min width 800, min height 600, hidden title bar" />
  <tray prompt="icon app-icon, tooltip MyApp" />
</config>
```

---

## Container Types

### Layout Types

| Type | Description |
|------|-------------|
| `column` | Vertical layout |
| `row` | Horizontal layout |
| `split-view` | Resizable split layout |
| `panel` | Split view panel |
| `scroll` | Scrollable container |

```xml
<container type="column" prompt="height 100%">
  <!-- Vertical content -->
</container>

<container type="row" prompt="padding small, gap medium, align center">
  <!-- Horizontal content -->
</container>

<container type="split-view" prompt="horizontal, grow">
  <container type="panel" prompt="width 260px, min width 200px, max width 400px, resizable, collapsible">
    <!-- Sidebar -->
  </container>
  <container type="panel" prompt="grow">
    <!-- Main content -->
  </container>
  <container type="panel" prompt="width 300px, resizable, collapsible" if="@state.propertiesVisible">
    <!-- Properties panel -->
  </container>
</container>

<container type="scroll" prompt="padding large">
  <!-- Scrollable content -->
</container>
```

### Structural Types

| Type | Description |
|------|-------------|
| `title-bar` | Custom window title bar |
| `toolbar` | Action toolbar |
| `status-bar` | Application status bar |
| `form` | Form container |

```xml
<!-- Custom title bar for frameless window -->
<container type="title-bar" prompt="draggable">
  <container type="row" prompt="padding small, gap medium, align center">
    <element type="icon" prompt="app-icon, size small" />
    <element type="text" prompt="body, medium weight">MyApp</element>
    <element type="spacer" />
    <element type="window-controls" />
  </container>
</container>

<!-- Toolbar -->
<container type="toolbar">
  <container prompt="group">
    <element prompt="plus icon, tooltip New (Ctrl+N), on click open @dialog.Create" />
    <element prompt="folder icon, tooltip Open (Ctrl+O), on click @action.open" />
    <element prompt="save icon, tooltip Save (Ctrl+S), on click @action.save, disabled if not @state.isDirty" />
  </container>
  <element type="separator" />
  <container prompt="group">
    <element prompt="undo icon, tooltip Undo, on click @action.undo, disabled if not @state.canUndo" />
    <element prompt="redo icon, tooltip Redo, on click @action.redo, disabled if not @state.canRedo" />
  </container>
  <element type="spacer" />
  <element type="search" prompt="placeholder Search..., width 250px, on search @action.search" />
</container>

<!-- Status bar -->
<container type="status-bar">
  <element use="@state.itemCount">items</element>
  <element type="spacer" />
  <element if="@state.isDirty">
    <element prompt="caption, muted">Unsaved changes</element>
  </element>
  <element if-not="@state.isDirty">
    <element prompt="caption, muted">Saved</element>
  </element>
</container>
```

---

## Element Types

### Display Elements

| Type | Description |
|------|-------------|
| `text` | Text display |
| `icon` | Icon display |
| `badge` | Badge indicator |
| `spinner` | Loading spinner |
| `spacer` | Flexible space |

```xml
<element type="text" prompt="heading1">Dashboard</element>
<element type="text" prompt="body, muted" use="@item.description" />
<element type="icon" prompt="app-icon, size small" />
<element type="badge" use="@state.status" prompt="size extra small" />
<element type="spinner" prompt="size extra small, if @state.syncing" />
<element type="spacer" />
```

### Input Elements

| Type | Description |
|------|-------------|
| `input` | Text input |
| `textarea` | Multi-line input |
| `search` | Search field |
| `checkbox` | Checkbox toggle |
| `select` | Dropdown select |

```xml
<element type="input" prompt="required, auto focus">Name</element>
<element type="textarea" prompt="rows 3">Description</element>
<element type="search" prompt="placeholder Search..., width 250px, on search @action.search" />
<element type="checkbox" use="@state.enabled">Enable feature</element>
<element type="select" prompt="options @state.options, on change @action.setOption" />
```

### Action Elements

| Type | Description |
|------|-------------|
| `button` | Click button |
| `toolbar-button` | Toolbar action |
| `window-controls` | Min/max/close buttons |

```xml
<element type="button" prompt="style primary, on click @action.save">Save</element>
<element type="button" prompt="style outline, on click close dialog">Cancel</element>
<element type="button" prompt="style danger, on click @action.delete then close dialog">Delete</element>
<element type="toolbar-button" prompt="plus icon, tooltip New, on click open @dialog.Create" />
<element type="window-controls" />
```

---

## Menu Bar

```xml
<container type="menu-bar">
  <container type="menu" prompt="label File">
    <element prompt="shortcut Ctrl+N, on click open @dialog.Create">New</element>
    <element prompt="shortcut Ctrl+O, on click @action.open">Open...</element>
    <element type="separator" />
    <element prompt="shortcut Ctrl+S, on click @action.save, enabled if @state.isDirty">Save</element>
    <element prompt="shortcut Ctrl+Shift+S, on click @action.saveAs">Save As...</element>
    <element type="separator" />
    <container prompt="submenu">Import
      <element prompt="on click @action.importJSON">From JSON</element>
      <element prompt="on click @action.importCSV">From CSV</element>
    </container>
    <container prompt="submenu">Export
      <element prompt="on click @action.exportJSON">As JSON</element>
      <element prompt="on click @action.exportPDF">As PDF</element>
    </container>
    <element type="separator" />
    <element prompt="shortcut Ctrl+Comma, on click open @window.Settings">Settings</element>
    <element type="separator" />
    <element prompt="shortcut Alt+F4, on click @action.quit">Exit</element>
  </container>

  <container type="menu" prompt="label Edit">
    <element prompt="shortcut Ctrl+Z, on click @action.undo, enabled if @state.canUndo">Undo</element>
    <element prompt="shortcut Ctrl+Shift+Z, on click @action.redo, enabled if @state.canRedo">Redo</element>
    <element type="separator" />
    <element prompt="shortcut Ctrl+X, on click @action.cut">Cut</element>
    <element prompt="shortcut Ctrl+C, on click @action.copy">Copy</element>
    <element prompt="shortcut Ctrl+V, on click @action.paste">Paste</element>
    <element prompt="shortcut Delete, on click @action.delete">Delete</element>
    <element type="separator" />
    <element prompt="shortcut Ctrl+A, on click @action.selectAll">Select All</element>
  </container>

  <container type="menu" prompt="label View">
    <element prompt="shortcut Ctrl+B, on click @action.toggleSidebar, checked if @state.sidebarVisible">Toggle Sidebar</element>
    <element type="separator" />
    <element prompt="shortcut Ctrl+Equals, on click @action.zoomIn">Zoom In</element>
    <element prompt="shortcut Ctrl+Minus, on click @action.zoomOut">Zoom Out</element>
    <element prompt="shortcut Ctrl+0, on click @action.zoomReset">Reset Zoom</element>
    <element type="separator" />
    <element prompt="shortcut F11, on click @action.toggleFullScreen">Full Screen</element>
  </container>

  <container type="menu" prompt="label Help">
    <element prompt="shortcut F1, on click @action.openDocs">Documentation</element>
    <element prompt="shortcut Ctrl+Slash, on click open @dialog.Shortcuts">Keyboard Shortcuts</element>
    <element type="separator" />
    <element prompt="on click open @dialog.About">About</element>
  </container>
</container>
```

---

## Context Menus

Right-click context menus.

```xml
<context-menus>
  <context-menu name="Item">
    <element prompt="edit icon, on click @action.edit with @context.id">Edit</element>
    <element prompt="copy icon, shortcut Ctrl+D, on click @action.duplicate with @context.id">Duplicate</element>
    <element type="separator" />
    <element prompt="arrow up icon, on click @action.moveUp with @context.id, enabled if @context.index > 0">Move Up</element>
    <element prompt="arrow down icon, on click @action.moveDown with @context.id">Move Down</element>
    <element type="separator" />
    <element prompt="trash icon, style danger, shortcut Delete, on click @action.delete with @context.id">Delete</element>
  </context-menu>
</context-menus>
```

### Using Context Menus

```xml
<container type="row" prompt="context menu @contextMenu.Item, on double click @action.edit">
  <element type="text" use="@item.name" />
</container>

<!-- Or programmatically -->
<element type="button" prompt="on click show context menu @contextMenu.Item with @item">Options</element>
```

---

## Tree View

Sidebar navigation with hierarchy.

```xml
<container type="tree-view">
  <element prompt="home icon, selected if @state.view == dashboard, on click @action.setView dashboard">Dashboard</element>
  <container prompt="folder icon, expanded">Projects
    <element prompt="file icon, selected if @state.selectedProject == @item.id, on click @action.selectProject with @item.id, context menu @contextMenu.Project" for-each="@state.projects" use="@item.name" />
  </container>
  <element prompt="settings icon, on click open @window.Settings">Settings</element>
</container>
```

---

## Views

Main content views (replaces pages).

```xml
<views>
  <view name="Dashboard">
    <data>
      <query name="items" type="@entity.Item[]" />
    </data>

    <container type="scroll" prompt="padding large">
      <container type="column" prompt="gap large, max width 1200px">
        <element type="text" prompt="heading1">Dashboard</element>
        <!-- View content -->
      </container>
    </container>
  </view>

  <view name="Editor" prompt="param id">
    <container type="split-view" prompt="horizontal">
      <container type="panel" prompt="width 220px, border right">
        <!-- Palette -->
      </container>
      <container type="panel" prompt="grow">
        <!-- Canvas -->
      </container>
    </container>
  </view>
</views>
```

---

## Windows

Multi-window support for secondary windows.

```xml
<windows>
  <window name="Settings" prompt="title Settings, width 700, height 500, not resizable">
    <container type="row" prompt="height 100%">
      <container type="column" prompt="width 200px, background gray 50, padding medium">
        <element type="button" prompt="style subtle, align left, on click @action.setTab general">General</element>
        <element type="button" prompt="style subtle, align left, on click @action.setTab appearance">Appearance</element>
        <element type="button" prompt="style subtle, align left, on click @action.setTab account">Account</element>
      </container>

      <container type="column" prompt="grow, padding large">
        <container if="@state.settingsTab == general">
          <!-- General settings -->
        </container>
        <container if="@state.settingsTab == appearance">
          <!-- Appearance settings -->
        </container>
        <container if="@state.settingsTab == account">
          <!-- Account settings -->
        </container>
      </container>
    </container>
  </window>

  <window name="Preview" prompt="title Preview, width 500, height 700">
    <container type="toolbar">
      <element type="toolbar-button" prompt="smartphone icon, tooltip Mobile, on click @action.setSize mobile" />
      <element type="toolbar-button" prompt="tablet icon, tooltip Tablet, on click @action.setSize tablet" />
      <element type="toolbar-button" prompt="monitor icon, tooltip Desktop, on click @action.setSize desktop" />
    </container>
    <container prompt="grow">
      <!-- Preview content -->
    </container>
  </window>
</windows>
```

---

## Dialogs

Modal dialog boxes.

```xml
<dialogs>
  <dialog name="Create" prompt="title Create New Item, width 450">
    <container type="form" prompt="on submit @action.create, on success close dialog">
      <container type="column" prompt="gap medium, padding large">
        <element type="input" prompt="required, auto focus">Name</element>
        <element type="textarea" prompt="rows 3">Description</element>

        <container type="row" prompt="justify end, gap small, margin top medium">
          <element type="button" prompt="style outline, on click close dialog">Cancel</element>
          <element type="button" prompt="submit, style primary">Create</element>
        </container>
      </container>
    </container>
  </dialog>

  <dialog name="ConfirmDelete" prompt="title Delete Item?, width 400">
    <container type="column" prompt="padding large, gap medium">
      <element type="text">Are you sure you want to delete this item? This action cannot be undone.</element>
      <container type="row" prompt="justify end, gap small">
        <element type="button" prompt="style outline, on click close dialog">Cancel</element>
        <element type="button" prompt="style danger, on click @action.delete then close dialog">Delete</element>
      </container>
    </container>
  </dialog>

  <dialog name="About" prompt="title About MyApp, width 400">
    <container type="column" prompt="align center, gap medium, padding extra large">
      <element type="icon" prompt="app-icon, size extra large" />
      <element type="text" prompt="heading2">MyApp</element>
      <element type="text" prompt="body, muted">Version 1.0.0</element>
      <element type="button" prompt="style outline, on click close dialog">Close</element>
    </container>
  </dialog>
</dialogs>
```

---

## Drag and Drop

```xml
<!-- Draggable item -->
<container type="draggable" prompt="type item, data @item">
  <container type="card" prompt="padding small">
    <element type="text" use="@item.name" />
  </container>
</container>

<!-- Drop zone -->
<container type="drop-zone" prompt="accept item, on drop @action.handleDrop">
  <container prompt="padding medium, border dashed">
    <element type="text" prompt="muted">Drop items here</element>
  </container>
</container>

<!-- Reorderable list -->
<container type="list" prompt="reorderable, on reorder @action.reorder" for-each="@state.items">
  <container type="draggable" prompt="type item, data @item, reorderable">
    <container type="list-item">
      <element type="text" use="@item.name" />
    </container>
  </container>
</container>
```

---

## Actions

Reusable action definitions.

```xml
<actions>
  <action name="save" prompt="save current document, show success toast" />
  <action name="open" prompt="show file picker, load selected file" />
  <action name="delete" prompt="show confirm dialog, delete item, refresh list" />
  <action name="undo" prompt="undo last action" />
  <action name="redo" prompt="redo last undone action" />
</actions>
```

---

## Guards

Authentication and authorization guards.

```xml
<guards>
  <guard name="auth" prompt="if not authenticated, show login dialog" />
  <guard name="unsaved" prompt="if has unsaved changes, show save dialog" />
</guards>
```

### Using Guards

```xml
<view name="Editor">
  <guards>
    <guard type="@guard.auth" />
  </guards>
  <!-- View content -->
</view>
```

---

## Navigation Functions

| Function | Description |
|----------|-------------|
| `set view X` | Switch to view |
| `open @window.X` | Open new window |
| `open @dialog.X` | Open modal dialog |
| `close dialog` | Close current dialog |
| `show context menu @contextMenu.X` | Show context menu |

---

## Example

Complete desktop spec structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<desktopapp name="MyApp" version="1.0">
  <import src="./myapp.shared.spec.xml" />

  <config>
    <window prompt="title MyApp, width 1200, height 800, min width 800, min height 600" />
    <tray prompt="icon app-icon, tooltip MyApp" />
  </config>

  <guards>
    <guard name="auth" prompt="if not authenticated, show login dialog" />
  </guards>

  <actions>
    <action name="save" prompt="save document, show success toast" />
    <action name="create" prompt="submit form, close dialog, refresh list" />
    <action name="delete" prompt="show confirm dialog, delete item, refresh list" />
  </actions>

  <container type="menu-bar">
    <container type="menu" prompt="label File">
      <element prompt="shortcut Ctrl+N, on click open @dialog.Create">New</element>
      <element prompt="shortcut Ctrl+S, on click @action.save">Save</element>
      <element type="separator" />
      <element prompt="shortcut Ctrl+Comma, on click open @window.Settings">Settings</element>
      <element type="separator" />
      <element prompt="shortcut Alt+F4, on click @action.quit">Exit</element>
    </container>
    <container type="menu" prompt="label Edit">
      <element prompt="shortcut Ctrl+Z, on click @action.undo">Undo</element>
      <element prompt="shortcut Ctrl+Shift+Z, on click @action.redo">Redo</element>
    </container>
  </container>

  <layout name="MainLayout">
    <container type="column" prompt="height 100%">
      <container type="toolbar">
        <element prompt="plus icon, tooltip New, on click open @dialog.Create" />
        <element prompt="save icon, tooltip Save, on click @action.save" />
      </container>

      <container type="split-view" prompt="horizontal, grow">
        <container type="panel" prompt="width 250px, resizable">
          <container type="tree-view">
            <element prompt="home icon, on click @action.setView dashboard">Dashboard</element>
            <container prompt="folder icon, expanded">Items
              <element prompt="on click @action.select with @item.id, context menu @contextMenu.Item" for-each="@state.items" use="@item.name" />
            </container>
          </container>
        </container>
        <container type="panel" prompt="grow">
          <slot name="content" />
        </container>
      </container>

      <container type="status-bar">
        <element>@state.items.length items</element>
        <element type="spacer" />
        <element>Ready</element>
      </container>
    </container>
  </layout>

  <views>
    <view name="Dashboard">
      <guards>
        <guard type="@guard.auth" />
      </guards>
      <container type="scroll" prompt="padding large">
        <element type="text" prompt="heading1">Dashboard</element>
      </container>
    </view>
  </views>

  <dialogs>
    <dialog name="Create" prompt="title New Item, width 450">
      <container type="form" prompt="on submit @action.create, on success close dialog">
        <element type="input" prompt="required, auto focus">Name</element>
        <container type="row" prompt="justify end, gap small">
          <element type="button" prompt="style outline, on click close dialog">Cancel</element>
          <element type="button" prompt="submit, style primary">Create</element>
        </container>
      </container>
    </dialog>
  </dialogs>

  <context-menus>
    <context-menu name="Item">
      <element prompt="edit icon, on click @action.edit with @context.id">Edit</element>
      <element prompt="trash icon, style danger, on click @action.delete with @context.id">Delete</element>
    </context-menu>
  </context-menus>
</desktopapp>
```

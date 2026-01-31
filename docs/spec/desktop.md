# LLM UI Spec - Desktop Platform

Platform-specific elements and patterns for desktop applications.

See [Core Specification](./) for shared concepts (entities, components, prompts, etc.).

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

## App Configuration

Configure window and system integration.

```xml
<config>
  <window
    title="MyApp"
    width="1200"
    height="800"
    minWidth="800"
    minHeight="600"
    titleBarStyle="hidden"
  />
  <tray icon="app-icon" tooltip="MyApp" />
</config>
```

### Window Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `title` | string | Window title |
| `width` | number | Initial width |
| `height` | number | Initial height |
| `minWidth` | number | Minimum width |
| `minHeight` | number | Minimum height |
| `resizable` | boolean | Can resize |
| `titleBarStyle` | default/hidden | Title bar style |

---

## Menu Bar

Application menu with keyboard shortcuts.

```xml
<menuBar>
  <menu label="File">
    <menuItem label="New" shortcut="Ctrl+N" onClick="openDialog(@dialog.Create)" />
    <menuItem label="Open..." shortcut="Ctrl+O" onClick="@action.open" />
    <separator />
    <menuItem label="Save" shortcut="Ctrl+S" onClick="@action.save" enabled="@state.isDirty" />
    <menuItem label="Save As..." shortcut="Ctrl+Shift+S" onClick="@action.saveAs" />
    <separator />
    <menuItem label="Import" submenu="true">
      <menuItem label="From JSON" onClick="@action.importJSON" />
      <menuItem label="From CSV" onClick="@action.importCSV" />
    </menuItem>
    <menuItem label="Export" submenu="true">
      <menuItem label="As JSON" onClick="@action.exportJSON" />
      <menuItem label="As PDF" onClick="@action.exportPDF" />
    </menuItem>
    <separator />
    <menuItem label="Settings" shortcut="Ctrl+," onClick="openWindow(@window.Settings)" />
    <separator />
    <menuItem label="Exit" shortcut="Alt+F4" onClick="@action.quit" />
  </menu>

  <menu label="Edit">
    <menuItem label="Undo" shortcut="Ctrl+Z" onClick="@action.undo" enabled="@state.canUndo" />
    <menuItem label="Redo" shortcut="Ctrl+Shift+Z" onClick="@action.redo" enabled="@state.canRedo" />
    <separator />
    <menuItem label="Cut" shortcut="Ctrl+X" onClick="@action.cut" />
    <menuItem label="Copy" shortcut="Ctrl+C" onClick="@action.copy" />
    <menuItem label="Paste" shortcut="Ctrl+V" onClick="@action.paste" />
    <menuItem label="Delete" shortcut="Delete" onClick="@action.delete" />
    <separator />
    <menuItem label="Select All" shortcut="Ctrl+A" onClick="@action.selectAll" />
  </menu>

  <menu label="View">
    <menuItem label="Toggle Sidebar" shortcut="Ctrl+B" onClick="@action.toggleSidebar" checked="@state.sidebarVisible" />
    <separator />
    <menuItem label="Zoom In" shortcut="Ctrl+=" onClick="@action.zoomIn" />
    <menuItem label="Zoom Out" shortcut="Ctrl+-" onClick="@action.zoomOut" />
    <menuItem label="Reset Zoom" shortcut="Ctrl+0" onClick="@action.zoomReset" />
    <separator />
    <menuItem label="Full Screen" shortcut="F11" onClick="@action.toggleFullScreen" />
  </menu>

  <menu label="Help">
    <menuItem label="Documentation" shortcut="F1" onClick="@action.openDocs" />
    <menuItem label="Keyboard Shortcuts" shortcut="Ctrl+/" onClick="openDialog(@dialog.Shortcuts)" />
    <separator />
    <menuItem label="About" onClick="openDialog(@dialog.About)" />
  </menu>
</menuBar>
```

### MenuItem Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `label` | string | Menu item text |
| `shortcut` | string | Keyboard shortcut |
| `onClick` | action | Click handler |
| `enabled` | boolean | Is enabled |
| `checked` | boolean | Is checked (for toggles) |
| `submenu` | boolean | Has submenu |
| `icon` | string | Menu item icon |

---

## Toolbar

Quick access toolbar with action buttons.

```xml
<toolbar>
  <toolbarGroup>
    <toolbarButton icon="plus" tooltip="New (Ctrl+N)" onClick="openDialog(@dialog.Create)" />
    <toolbarButton icon="folder-open" tooltip="Open (Ctrl+O)" onClick="@action.open" />
    <toolbarButton icon="save" tooltip="Save (Ctrl+S)" onClick="@action.save" disabled="!@state.isDirty" />
  </toolbarGroup>
  <toolbarSeparator />
  <toolbarGroup>
    <toolbarButton icon="undo" tooltip="Undo" onClick="@action.undo" disabled="!@state.canUndo" />
    <toolbarButton icon="redo" tooltip="Redo" onClick="@action.redo" disabled="!@state.canRedo" />
  </toolbarGroup>
  <spacer />
  <search placeholder="Search..." width="250px" onSearch="@action.search" />
</toolbar>
```

### ToolbarButton Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `icon` | string | Button icon |
| `tooltip` | string | Hover tooltip |
| `onClick` | action | Click handler |
| `disabled` | boolean | Is disabled |
| `active` | boolean | Is active/pressed |

---

## Layout

Main layout with split views and panels.

```xml
<layout name="MainLayout">
  <column height="100%">
    <!-- Custom Title Bar (for frameless window) -->
    <titleBar draggable="true">
      <row padding="sm" gap="md" align="center">
        <icon name="app-icon" size="sm" />
        <text variant="body" weight="medium">MyApp</text>
        <spacer />
        <windowControls />
      </row>
    </titleBar>

    <!-- Toolbar -->
    <toolbar>...</toolbar>

    <!-- Main Content Area -->
    <splitView direction="horizontal" grow="true">
      <!-- Sidebar -->
      <panel name="sidebar" width="260px" minWidth="200px" maxWidth="400px" resizable="true" collapsible="true">
        <slot name="sidebar" />
      </panel>

      <!-- Main Content -->
      <panel grow="true">
        <slot name="content" />
      </panel>

      <!-- Properties Panel -->
      <panel name="properties" width="300px" resizable="true" collapsible="true" visible="@state.propertiesVisible">
        <slot name="properties" />
      </panel>
    </splitView>

    <!-- Status Bar -->
    <statusBar>
      <statusBarItem>@state.itemCount items</statusBarItem>
      <spacer />
      <statusBarItem>
        <if condition="@state.isDirty">
          <text variant="caption" muted="true">Unsaved changes</text>
        </if>
        <else>
          <text variant="caption" muted="true">Saved</text>
        </else>
      </statusBarItem>
    </statusBar>
  </column>
</layout>
```

### SplitView

```xml
<splitView direction="horizontal|vertical">
  <panel width="250px" resizable="true">...</panel>
  <panel grow="true">...</panel>
</splitView>
```

### Panel Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Panel identifier |
| `width` | size | Fixed or initial width |
| `minWidth` | size | Minimum width |
| `maxWidth` | size | Maximum width |
| `grow` | boolean | Fill available space |
| `resizable` | boolean | Can resize |
| `collapsible` | boolean | Can collapse |
| `visible` | boolean | Is visible |

---

## Views

Main content views (replaces pages).

```xml
<views>
  <view name="Dashboard">
    <data>
      <query name="items" type="@entity.Item[]" />
    </data>

    <scroll padding="lg">
      <column gap="lg" maxWidth="1200px">
        <text variant="heading1">Dashboard</text>
        <!-- View content -->
      </column>
    </scroll>
  </view>

  <view name="Editor">
    <params>
      <param name="id" type="uuid" required="true" />
    </params>

    <splitView direction="horizontal">
      <panel width="220px" borderRight="true">
        <!-- Palette -->
      </panel>
      <panel grow="true">
        <!-- Canvas -->
      </panel>
    </splitView>
  </view>
</views>
```

### Navigation Functions

| Function | Description |
|----------|-------------|
| `setView('name')` | Switch to view |
| `openWindow(@window.X)` | Open new window |
| `openDialog(@dialog.X)` | Open modal dialog |
| `closeDialog()` | Close current dialog |
| `showContextMenu(@contextMenu.X, data)` | Show context menu |

---

## Windows

Multi-window support for secondary windows.

```xml
<windows>
  <window name="Settings" title="Settings" width="700" height="500" resizable="false">
    <row height="100%">
      <!-- Settings Navigation -->
      <column width="200px" background="@theme.colors.gray.50" padding="md">
        <button variant="subtle" align="left" onClick="@action.setTab('general')">General</button>
        <button variant="subtle" align="left" onClick="@action.setTab('appearance')">Appearance</button>
        <button variant="subtle" align="left" onClick="@action.setTab('account')">Account</button>
      </column>

      <!-- Settings Content -->
      <column grow="true" padding="lg">
        <switch value="@state.settingsTab">
          <case value="general">...</case>
          <case value="appearance">...</case>
          <case value="account">...</case>
        </switch>
      </column>
    </row>
  </window>

  <window name="Preview" title="Preview" width="500" height="700">
    <toolbar>
      <toolbarButton icon="smartphone" tooltip="Mobile" onClick="@action.setSize('mobile')" />
      <toolbarButton icon="tablet" tooltip="Tablet" onClick="@action.setSize('tablet')" />
      <toolbarButton icon="monitor" tooltip="Desktop" onClick="@action.setSize('desktop')" />
    </toolbar>
    <container grow="true">
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
  <dialog name="Create" title="Create New Item" width="450">
    <form onSubmit="@action.create" onSuccess="closeDialog()">
      <column gap="md" padding="lg">
        <input label="Name" bind="name" required="true" autoFocus="true" />
        <textarea label="Description" bind="description" rows="3" />

        <row justify="end" gap="sm" marginTop="md">
          <button variant="outline" onClick="closeDialog()">Cancel</button>
          <button type="submit" variant="primary">Create</button>
        </row>
      </column>
    </form>
  </dialog>

  <dialog name="ConfirmDelete" title="Delete Item?" width="400">
    <column padding="lg" gap="md">
      <text>Are you sure you want to delete this item? This action cannot be undone.</text>
      <row justify="end" gap="sm">
        <button variant="outline" onClick="closeDialog()">Cancel</button>
        <button variant="danger" onClick="@action.delete; closeDialog()">Delete</button>
      </row>
    </column>
  </dialog>

  <dialog name="About" title="About MyApp" width="400">
    <column align="center" gap="md" padding="xl">
      <icon name="app-icon" size="xl" />
      <text variant="heading2">MyApp</text>
      <text variant="body" muted="true">Version 1.0.0</text>
      <button variant="outline" onClick="closeDialog()">Close</button>
    </column>
  </dialog>
</dialogs>
```

### Dialog Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Dialog identifier |
| `title` | string | Dialog title |
| `width` | number | Dialog width |
| `height` | number | Dialog height (optional) |
| `resizable` | boolean | Can resize |

---

## Context Menus

Right-click context menus.

```xml
<contextMenus>
  <contextMenu name="Item">
    <menuItem icon="edit" label="Edit" onClick="@action.edit(@context.id)" />
    <menuItem icon="copy" label="Duplicate" shortcut="Ctrl+D" onClick="@action.duplicate(@context.id)" />
    <separator />
    <menuItem icon="arrow-up" label="Move Up" onClick="@action.moveUp(@context.id)" enabled="@context.index > 0" />
    <menuItem icon="arrow-down" label="Move Down" onClick="@action.moveDown(@context.id)" />
    <separator />
    <menuItem icon="trash" label="Delete" color="danger" shortcut="Delete" onClick="@action.delete(@context.id)" />
  </contextMenu>
</contextMenus>
```

### Usage

```xml
<tr contextMenu="@contextMenu.Item" onDoubleClick="@action.edit">
  <td>@item.name</td>
</tr>

<!-- Or programmatically -->
<button onClick="showContextMenu(@contextMenu.Item, @item)">Options</button>
```

### Context Reference

Inside context menu handlers, use `@context` to access the data passed to the menu.

---

## Tree View

Sidebar navigation with hierarchy.

```xml
<treeView>
  <treeItem icon="home" label="Dashboard" selected="@state.view == 'dashboard'" onClick="@action.setView('dashboard')" />
  <treeItem icon="folder" label="Projects" expanded="true">
    <for each="project" in="@state.projects">
      <treeItem
        icon="file"
        label="@item.name"
        selected="@state.selectedProject == @item.id"
        onClick="@action.selectProject(@item.id)"
        contextMenu="@contextMenu.Project"
      />
    </for>
  </treeItem>
  <treeItem icon="settings" label="Settings" onClick="openWindow(@window.Settings)" />
</treeView>
```

### TreeItem Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `icon` | string | Item icon |
| `label` | string | Item text |
| `selected` | boolean | Is selected |
| `expanded` | boolean | Is expanded (for parent items) |
| `onClick` | action | Click handler |
| `contextMenu` | @contextMenu | Right-click menu |

---

## Drag and Drop

Drag and drop support for desktop interactions.

```xml
<!-- Draggable item -->
<draggable type="item" data="@item">
  <container variant="card" padding="sm">
    <text value="@item.name" />
  </container>
</draggable>

<!-- Drop zone -->
<dropZone accept="item" onDrop="@action.handleDrop">
  <container padding="md" borderStyle="dashed">
    <text muted="true">Drop items here</text>
  </container>
</dropZone>

<!-- Reorderable list -->
<list data="@state.items" reorderable="true" onReorder="@action.reorder">
  <for each="item" in="@data">
    <draggable type="item" data="@item" reorderable="true">
      <listItem title="@item.name" />
    </draggable>
  </for>
</list>
```

### Draggable Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `type` | string | Drag type identifier |
| `data` | any | Data to transfer |
| `reorderable` | boolean | For list reordering |

### DropZone Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `accept` | string | Accepted drag types |
| `onDrop` | action | Drop handler |

---

## Status Bar

Application status bar.

```xml
<statusBar>
  <statusBarItem>
    <text variant="caption">@state.itemCount items</text>
  </statusBarItem>
  <statusBarItem>
    <badge value="@state.status" size="xs" />
  </statusBarItem>
  <spacer />
  <statusBarItem>
    <if condition="@state.syncing">
      <row gap="xs" align="center">
        <spinner size="xs" />
        <text variant="caption">Syncing...</text>
      </row>
    </if>
    <else>
      <text variant="caption" muted="true">Last saved: @state.lastSaved</text>
    </else>
  </statusBarItem>
</statusBar>
```

---

## Element Reference (Desktop)

### Window Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `window` | Secondary window | `name`, `title`, `width`, `height` |
| `titleBar` | Custom title bar | `draggable` |
| `windowControls` | Min/max/close buttons | - |

### Menu Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `menuBar` | Application menu | - |
| `menu` | Menu dropdown | `label` |
| `menuItem` | Menu option | `label`, `shortcut`, `onClick`, `enabled`, `checked` |
| `separator` | Menu separator | - |

### Toolbar Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `toolbar` | Toolbar container | - |
| `toolbarButton` | Toolbar action | `icon`, `tooltip`, `onClick`, `disabled`, `active` |
| `toolbarGroup` | Button group | - |
| `toolbarSeparator` | Toolbar divider | - |

### Layout Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `splitView` | Resizable split | `direction` |
| `panel` | Split panel | `width`, `minWidth`, `maxWidth`, `resizable`, `collapsible` |
| `statusBar` | Status bar | - |
| `statusBarItem` | Status item | - |

### Navigation Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `view` | Content view | `name` |
| `treeView` | Tree navigation | - |
| `treeItem` | Tree node | `icon`, `label`, `selected`, `expanded` |

### Dialog Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `dialog` | Modal dialog | `name`, `title`, `width` |
| `contextMenu` | Right-click menu | `name` |

### Drag & Drop

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `draggable` | Draggable item | `type`, `data`, `reorderable` |
| `dropZone` | Drop target | `accept`, `onDrop` |

---

## Example

Complete desktop spec structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp name="MyApp" version="1.0">
  <import src="./myapp.shared.spec.xml" />

  <config>
    <window title="MyApp" width="1200" height="800" minWidth="800" minHeight="600" />
    <tray icon="app-icon" tooltip="MyApp" />
  </config>

  <menuBar>
    <menu label="File">
      <menuItem label="New" shortcut="Ctrl+N" onClick="openDialog(@dialog.Create)" />
      <menuItem label="Save" shortcut="Ctrl+S" onClick="@action.save" />
      <separator />
      <menuItem label="Settings" shortcut="Ctrl+," onClick="openWindow(@window.Settings)" />
      <separator />
      <menuItem label="Exit" shortcut="Alt+F4" onClick="@action.quit" />
    </menu>
    <menu label="Edit">
      <menuItem label="Undo" shortcut="Ctrl+Z" onClick="@action.undo" />
      <menuItem label="Redo" shortcut="Ctrl+Shift+Z" onClick="@action.redo" />
    </menu>
  </menuBar>

  <layout name="MainLayout">
    <column height="100%">
      <toolbar>
        <toolbarButton icon="plus" tooltip="New" onClick="openDialog(@dialog.Create)" />
        <toolbarButton icon="save" tooltip="Save" onClick="@action.save" />
      </toolbar>

      <splitView direction="horizontal" grow="true">
        <panel width="250px" resizable="true">
          <treeView>
            <treeItem icon="home" label="Dashboard" onClick="@action.setView('dashboard')" />
            <treeItem icon="folder" label="Items" expanded="true">
              <for each="item" in="@state.items">
                <treeItem label="@item.name" onClick="@action.select(@item.id)" contextMenu="@contextMenu.Item" />
              </for>
            </treeItem>
          </treeView>
        </panel>
        <panel grow="true">
          <slot name="content" />
        </panel>
      </splitView>

      <statusBar>
        <statusBarItem>@state.items.length items</statusBarItem>
        <spacer />
        <statusBarItem>Ready</statusBarItem>
      </statusBar>
    </column>
  </layout>

  <views>
    <view name="Dashboard">
      <scroll padding="lg">
        <text variant="heading1">Dashboard</text>
      </scroll>
    </view>
  </views>

  <dialogs>
    <dialog name="Create" title="New Item" width="450">
      <form onSubmit="@action.create" onSuccess="closeDialog()">
        <input label="Name" bind="name" required="true" autoFocus="true" />
        <row justify="end" gap="sm">
          <button variant="outline" onClick="closeDialog()">Cancel</button>
          <button type="submit" variant="primary">Create</button>
        </row>
      </form>
    </dialog>
  </dialogs>

  <contextMenus>
    <contextMenu name="Item">
      <menuItem icon="edit" label="Edit" onClick="@action.edit(@context.id)" />
      <menuItem icon="trash" label="Delete" color="danger" onClick="@action.delete(@context.id)" />
    </contextMenu>
  </contextMenus>
</webapp>
```

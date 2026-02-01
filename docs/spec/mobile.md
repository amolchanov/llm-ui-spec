# LLM UI Spec - Mobile Platform

Platform-specific elements and patterns for mobile applications.

See [Introduction](./) for shared concepts (entities, components, prompts, etc.).

---

## Overview

Mobile specs use file pattern `*.mobile.spec.xml`.

Key characteristics:
- Tab-based navigation with bottom tab bar
- Push navigation with back button
- Bottom sheets instead of modals
- Swipe actions on list items
- Pull-to-refresh
- Floating action buttons
- Safe area handling
- Native-style navigation bars

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
<element type="text" use="@user.name" />
<element type="spinner" if="@state.loading" />
<container type="list" for-each="@state.items" />

<!-- Prompt syntax (equivalent) -->
<element type="text" prompt="use @user.name" />
<element type="spinner" prompt="if @state.loading" />
<container type="list" prompt="for each @state.items" />

<!-- Type in prompt -->
<element prompt="text, use @user.name" />
<element prompt="spinner, if @state.loading" />
<container prompt="list, for each @state.items" />
```

Type is optional when parent context makes it clear:

```xml
<!-- Inside list, children are list items -->
<container type="list">
  <container prompt="chevron, on tap push @screen.Detail">Item 1</container>
  <container prompt="chevron, on tap push @screen.Detail">Item 2</container>
</container>

<!-- Inside tabs, children are tabs -->
<container type="tabs">
  <element prompt="home icon, screen @screen.Dashboard">Home</element>
  <element prompt="folder icon, screen @screen.Projects">Projects</element>
</container>
```

---

## Container Types

### Layout Types

| Type | Description |
|------|-------------|
| `column` | Vertical layout |
| `row` | Horizontal layout |
| `scroll` | Scrollable container |

```xml
<container type="column" prompt="safe area, padding medium">
  <container type="row" prompt="justify between, align center">
    <element type="text" prompt="large title">Dashboard</element>
    <element type="button" prompt="icon plus, on tap @action.create" />
  </container>
</container>

<container type="scroll" prompt="vertical, pull to refresh @action.refresh">
  <!-- Scrollable content -->
</container>

<container type="scroll" prompt="horizontal, gap medium">
  <!-- Horizontal scroll items -->
</container>
```

### List Types

| Type | Description |
|------|-------------|
| `list` | Native list container |
| `list-section` | Grouped section |
| `list-item` | List row |

```xml
<container type="list" prompt="pull to refresh @action.refresh" for-each="@state.items">
  <container prompt="swipe actions, chevron, on tap push @screen.Detail">
    <element use="@item.name" />
    <element prompt="swipe right, trash icon, style danger, on tap @action.delete" />
  </container>
</container>

<!-- Grouped list -->
<container type="list" prompt="grouped">
  <container prompt="section Account">
    <container prompt="user icon, chevron">Profile</container>
    <container prompt="bell icon, chevron">Notifications</container>
  </container>
  <container prompt="section Support">
    <container prompt="help icon, chevron">Help</container>
    <container prompt="message icon, chevron">Contact Us</container>
  </container>
</container>
```

### Form Types

| Type | Description |
|------|-------------|
| `form` | Form container |

```xml
<container type="form" prompt="on submit @action.save, on success dismiss sheet">
  <element type="input" prompt="required">Name</element>
  <element type="button" prompt="full width, style primary">Save</element>
</container>
```

---

## Element Types

### Display Elements

| Type | Description |
|------|-------------|
| `text` | Text display |
| `icon` | Icon display |
| `image` | Image display |
| `badge` | Badge indicator |
| `spinner` | Loading spinner |

```xml
<element type="text" prompt="large title">Dashboard</element>
<element type="text" prompt="body, muted" use="@item.description" />
<element type="icon" prompt="user, size large" />
<element type="image" use="@user.avatar" prompt="avatar style, size 40" />
<element type="badge" use="@state.unreadCount" prompt="style primary" />
<element type="spinner" prompt="if @state.loading" />
```

### Input Elements

| Type | Description |
|------|-------------|
| `input` | Text input |
| `search` | Search bar |
| `switch` | Toggle switch |
| `segment` | Segment option |

```xml
<element type="input" prompt="required, placeholder Enter name">Name</element>
<element type="search" prompt="placeholder Search..., show cancel, on search @action.search" />
<element type="switch" prompt="on change @action.toggle" use="@state.enabled">Enable notifications</element>

<!-- Segmented control -->
<container type="row" prompt="segmented control">
  <element type="segment" prompt="value all">All</element>
  <element type="segment" prompt="value active">Active</element>
  <element type="segment" prompt="value done">Done</element>
</container>
```

### Action Elements

| Type | Description |
|------|-------------|
| `button` | Tap button |
| `swipe-action` | Swipe action |
| `floating-button` | Floating action button |

```xml
<element type="button" prompt="style primary, on tap @action.save">Save</element>
<element type="button" prompt="icon x, style ghost, on tap dismiss sheet" />
<element type="swipe-action" prompt="left side, check icon, style success, on tap @action.complete" />
<element type="swipe-action" prompt="right side, trash icon, style danger, on tap @action.delete" />
<element type="floating-button" prompt="plus icon, bottom right, on tap present @sheet.Create" />
```

---

## Navigation

### Tab Navigation

```xml
<container type="tabs">
  <element prompt="home icon, screen @screen.Dashboard">Home</element>
  <element prompt="folder icon, screen @screen.Projects, badge @state.projectCount">Projects</element>
  <element prompt="inbox icon, screen @screen.Inbox, badge @state.unreadCount">Inbox</element>
  <element prompt="user icon, screen @screen.Profile">Profile</element>
</container>
```

### Navigation Bar

```xml
<element type="nav-bar" prompt="title Item Details, back button, right button edit icon on tap @action.edit" />

<!-- Or with multiple right buttons -->
<element type="nav-bar" prompt="title Settings, back button">
  <element prompt="right, share icon, on tap @action.share" />
  <element prompt="right, more icon, on tap present @sheet.Options" />
</element>
```

### Navigation Functions

| Function | Description |
|----------|-------------|
| `push @screen.X` | Navigate to screen (push onto stack) |
| `pop` | Go back (pop from stack) |
| `switch tab X` | Switch to tab by name |
| `present @sheet.X` | Present bottom sheet |
| `dismiss sheet` | Dismiss current sheet |
| `show alert @alert.X` | Show alert dialog |

---

## Screens

```xml
<screens>
  <screen name="Dashboard" prompt="initial">
    <data>
      <query name="items" type="@entity.Item[]" />
    </data>

    <container type="column" prompt="safe area, padding medium">
      <element type="text" prompt="large title">Dashboard</element>

      <container type="list" prompt="pull to refresh @action.refresh" for-each="@state.items">
        <container type="list-item" prompt="chevron, swipe actions, on tap push @screen.Detail with id @item.id">
          <element type="text" use="@item.name" />
          <element type="swipe-action" prompt="right, trash icon, style danger, on tap @action.delete" />
        </container>
      </container>
    </container>

    <element type="floating-button" prompt="plus icon, on tap present @sheet.Create" />
  </screen>

  <screen name="Detail" prompt="param id">
    <element type="nav-bar" prompt="title Item Details, back button, right button edit icon on tap @action.edit" />

    <container type="column" prompt="padding medium">
      <!-- Detail content -->
    </container>
  </screen>
</screens>
```

---

## Sheets

Bottom sheets for overlays (replaces modals on mobile).

```xml
<sheets>
  <sheet name="Create" prompt="height auto, dismissible">
    <container type="column" prompt="padding large, gap medium">
      <container type="row" prompt="justify between, align center">
        <element type="text" prompt="headline">New Item</element>
        <element type="button" prompt="icon x, style ghost, on tap dismiss sheet" />
      </container>

      <container type="form" prompt="on submit @action.create, on success dismiss sheet">
        <element type="input" prompt="required">Name</element>
        <element type="button" prompt="full width, style primary">Create</element>
      </container>
    </container>
  </sheet>

  <sheet name="Options" prompt="height auto">
    <container type="list">
      <container type="list-item" prompt="edit icon, on tap @action.edit then dismiss sheet">Edit</container>
      <container type="list-item" prompt="share icon, on tap @action.share then dismiss sheet">Share</container>
      <container type="list-item" prompt="trash icon, style danger, on tap @action.delete then dismiss sheet">Delete</container>
    </container>
  </sheet>
</sheets>
```

---

## Alerts

Native-style alert dialogs for confirmations. Alert children use type inference:
- First element without a role is the message text
- Elements with `role` in prompt are action buttons

```xml
<alerts>
  <!-- Type inference: first child is message, others are actions -->
  <alert name="ConfirmDelete" prompt="title Delete Item?, style destructive">
    <element>This action cannot be undone.</element>
    <element prompt="role cancel">Cancel</element>
    <element prompt="role destructive, on tap @callback">Delete</element>
  </alert>

  <alert name="Saved" prompt="title Success">
    <element>Your changes have been saved.</element>
    <element prompt="role default">OK</element>
  </alert>
</alerts>
```

### Alert Action Roles

| Role | Description |
|------|-------------|
| `cancel` | Cancel button (left side, plain style) |
| `default` | Default action (bold style) |
| `destructive` | Destructive action (red style) |

---

## Actions

Reusable action definitions.

```xml
<actions>
  <action name="refresh" prompt="refresh list data" />
  <action name="create" prompt="submit form, dismiss sheet, show success toast" />
  <action name="delete" prompt="show confirm alert, delete item, refresh list" />
  <action name="share" prompt="open system share sheet" />
</actions>
```

---

## Guards

Authentication and authorization guards.

```xml
<guards>
  <guard name="auth" prompt="if not authenticated, redirect to @screen.Login" />
  <guard name="onboarding" prompt="if not onboarded, redirect to @screen.Onboarding" />
</guards>
```

### Using Guards

```xml
<screen name="Dashboard">
  <guards>
    <guard type="@guard.auth" />
  </guards>
  <!-- Screen content -->
</screen>
```

---

## Example

Complete mobile spec structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mobileapp name="MyApp" version="1.0">
  <import src="./myapp.shared.spec.xml" />

  <guards>
    <guard name="auth" prompt="if not authenticated, redirect to @screen.Login" />
  </guards>

  <actions>
    <action name="refresh" prompt="refresh list data" />
    <action name="create" prompt="submit form, dismiss sheet, show success toast" />
    <action name="delete" prompt="confirm dialog, delete item, refresh list" />
  </actions>

  <container type="tabs">
    <element prompt="home icon, screen @screen.Dashboard">Home</element>
    <element prompt="folder icon, screen @screen.Projects">Projects</element>
    <element prompt="user icon, screen @screen.Profile">Profile</element>
  </container>

  <screens>
    <screen name="Dashboard" prompt="initial">
      <guards>
        <guard type="@guard.auth" />
      </guards>
      <data>
        <query name="items" type="@entity.Item[]" />
      </data>

      <container type="column" prompt="safe area, padding medium">
        <element prompt="large title">Dashboard</element>

        <container type="list" prompt="pull to refresh @action.refresh" for-each="@state.items">
          <container prompt="chevron, swipe actions, on tap push @screen.Detail with id @item.id">
            <element use="@item.name" />
            <element prompt="swipe right, trash icon, style danger, on tap @action.delete" />
          </container>
        </container>
      </container>

      <element type="floating-button" prompt="plus icon, on tap present @sheet.Create" />
    </screen>
  </screens>

  <sheets>
    <sheet name="Create" prompt="height auto, dismissible">
      <container type="form" prompt="on submit @action.create, on success dismiss sheet">
        <element type="input" prompt="required">Name</element>
        <element type="button" prompt="full width">Create</element>
      </container>
    </sheet>
  </sheets>

  <alerts>
    <alert name="ConfirmDelete" prompt="title Delete?, style destructive">
      <element>This cannot be undone.</element>
      <element prompt="role cancel">Cancel</element>
      <element prompt="role destructive, on tap @callback">Delete</element>
    </alert>
  </alerts>
</mobileapp>
```

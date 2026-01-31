# LLM UI Spec - Mobile Platform

Platform-specific elements and patterns for mobile applications.

See [SPEC.md](./SPEC.md) for shared concepts (entities, components, prompts, etc.).

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

## Navigation

Tab-based navigation for mobile apps.

```xml
<navigation type="tabs">
  <tab name="home" label="Home" icon="home" screen="@screen.Dashboard" />
  <tab name="projects" label="Projects" icon="folder" screen="@screen.Projects" badge="@state.projectCount" />
  <tab name="inbox" label="Inbox" icon="inbox" screen="@screen.Inbox" badge="@state.unreadCount" />
  <tab name="profile" label="Profile" icon="user" screen="@screen.Profile" />
</navigation>
```

### Tab Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Tab identifier |
| `label` | string | Tab display label |
| `icon` | string | Tab icon |
| `screen` | @screen | Screen to display |
| `badge` | number/string | Badge value |

### Navigation Functions

| Function | Description |
|----------|-------------|
| `push(@screen.X)` | Navigate to screen (push onto stack) |
| `push(@screen.X, { params })` | Navigate with parameters |
| `pop()` | Go back (pop from stack) |
| `switchTab('name')` | Switch to tab by name |
| `presentSheet(@sheet.X)` | Present bottom sheet |
| `dismissSheet()` | Dismiss current sheet |

---

## Screens

Mobile screens with navigation bar and safe area support.

```xml
<screens>
  <screen name="Dashboard" initial="true">
    <data>
      <query name="items" type="@entity.Item[]" />
    </data>

    <column safeArea="true" padding="md">
      <text variant="largeTitle">Dashboard</text>
      <!-- Screen content -->
    </column>
  </screen>

  <screen name="ItemDetail">
    <params>
      <param name="id" type="uuid" required="true" />
    </params>

    <navigationBar
      title="Item Details"
      backButton="true"
      rightButtons="[{ icon: 'edit', onClick: @action.edit }]"
    />

    <column padding="md">
      <!-- Detail content -->
    </column>
  </screen>
</screens>
```

### Screen Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Screen identifier (required) |
| `initial` | boolean | Is initial screen for tab |

### NavigationBar

```xml
<navigationBar
  title="Screen Title"
  backButton="true"
  rightButtons="[
    { icon: 'share', onClick: @action.share },
    { icon: 'more-vertical', onClick: presentSheet(@sheet.Options) }
  ]"
/>
```

| Attribute | Type | Description |
|-----------|------|-------------|
| `title` | string | Navigation bar title |
| `backButton` | boolean | Show back button |
| `rightButtons` | array | Right-side action buttons |
| `largeTitle` | boolean | Use large title style |

---

## Sheets

Bottom sheets for overlays (replaces modals on mobile).

```xml
<sheets>
  <sheet name="CreateItem" height="auto" dismissible="true">
    <column padding="lg" gap="md">
      <row justify="between" align="center">
        <text variant="headline">New Item</text>
        <button icon="x" variant="ghost" onClick="dismissSheet()" />
      </row>

      <form onSubmit="@action.create" onSuccess="dismissSheet()">
        <input label="Name" bind="name" required="true" />
        <button type="submit" fullWidth="true">Create</button>
      </form>
    </column>
  </sheet>

  <sheet name="Options" height="auto">
    <list>
      <listItem icon="edit" label="Edit" onClick="@action.edit; dismissSheet()" />
      <listItem icon="share" label="Share" onClick="@action.share; dismissSheet()" />
      <listItem icon="trash" label="Delete" color="danger" onClick="@action.delete; dismissSheet()" />
    </list>
  </sheet>
</sheets>
```

### Sheet Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Sheet identifier (required) |
| `height` | auto/small/medium/large/full | Sheet height |
| `dismissible` | boolean | Can swipe to dismiss |
| `detents` | array | Snap points for height |

---

## Alerts

Native-style alert dialogs for confirmations.

```xml
<alerts>
  <alert name="ConfirmDelete" title="Delete Item?" destructive="true">
    <text>This action cannot be undone.</text>
    <action label="Cancel" role="cancel" />
    <action label="Delete" role="destructive" onClick="@callback" />
  </alert>

  <alert name="Saved" title="Success">
    <text>Your changes have been saved.</text>
    <action label="OK" role="default" />
  </alert>
</alerts>
```

### Alert Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Alert identifier |
| `title` | string | Alert title |
| `destructive` | boolean | Destructive action styling |

### Action Roles

| Role | Description |
|------|-------------|
| `cancel` | Cancel button (left side, plain style) |
| `default` | Default action (bold style) |
| `destructive` | Destructive action (red style) |

---

## Mobile-Specific Elements

### List and ListItem

```xml
<list data="@state.items" refreshable="true" onRefresh="@action.refresh">
  <for each="item" in="@data">
    <listItem
      title="@item.name"
      subtitle="@item.description"
      onClick="push(@screen.Detail, { id: @item.id })"
      chevron="true"
      swipeActions="true"
    >
      <swipeAction side="right" icon="edit" onClick="@action.edit(@item.id)" />
      <swipeAction side="right" icon="trash" color="danger" onClick="@action.delete(@item.id)" />
    </listItem>
  </for>
</list>
```

### ListItem Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `title` | string | Primary text |
| `subtitle` | string | Secondary text |
| `icon` | string | Leading icon |
| `chevron` | boolean | Show disclosure indicator |
| `swipeActions` | boolean | Enable swipe actions |

### ListSection

```xml
<list grouped="true">
  <listSection header="Account">
    <listItem icon="user" label="Profile" chevron="true" />
    <listItem icon="bell" label="Notifications" chevron="true" />
  </listSection>

  <listSection header="Support">
    <listItem icon="help-circle" label="Help" chevron="true" />
    <listItem icon="message" label="Contact Us" chevron="true" />
  </listSection>
</list>
```

### SwipeActions

```xml
<listItem swipeActions="true">
  <swipeAction side="left" icon="check" color="success" onClick="@action.complete" />
  <swipeAction side="right" icon="edit" onClick="@action.edit" />
  <swipeAction side="right" icon="trash" color="danger" onClick="@action.delete" />
</listItem>
```

| Attribute | Type | Description |
|-----------|------|-------------|
| `side` | left/right | Swipe direction |
| `icon` | string | Action icon |
| `color` | string | Action color |
| `onClick` | action | Action handler |

### Floating Action Button

```xml
<floatingButton
  icon="plus"
  onClick="presentSheet(@sheet.Create)"
  position="bottom-right"
/>
```

| Attribute | Type | Description |
|-----------|------|-------------|
| `icon` | string | Button icon |
| `onClick` | action | Click handler |
| `position` | bottom-right/bottom-center | Button position |

### Segmented Control

```xml
<segmentedControl value="@state.filter" onChange="@action.setFilter">
  <segment value="all" label="All" />
  <segment value="active" label="Active" />
  <segment value="completed" label="Done" />
</segmentedControl>
```

### Pull-to-Refresh

```xml
<list data="@state.items" refreshable="true" onRefresh="@action.refresh">
  <!-- List content -->
</list>

<scroll refreshable="true" onRefresh="@action.refresh">
  <!-- Scroll content -->
</scroll>
```

### Safe Area

```xml
<column safeArea="true">
  <!-- Content respects device safe areas -->
</column>

<column safeArea="top">
  <!-- Only top safe area -->
</column>

<column safeArea="bottom">
  <!-- Only bottom safe area -->
</column>
```

### Search

```xml
<search
  placeholder="Search..."
  value="@state.searchQuery"
  onSearch="@action.search"
  showCancel="true"
/>
```

---

## Layout Elements

### Column and Row

```xml
<column padding="md" gap="lg" safeArea="true">
  <row justify="between" align="center">
    <text variant="largeTitle">Title</text>
    <button icon="plus" onClick="presentSheet(@sheet.Create)" />
  </row>

  <!-- Content -->
</column>
```

### Scroll

```xml
<scroll direction="vertical" refreshable="true" onRefresh="@action.refresh">
  <!-- Scrollable content -->
</scroll>

<scroll direction="horizontal" gap="md">
  <!-- Horizontal scroll items -->
</scroll>
```

---

## Element Reference (Mobile)

### Screen Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `screen` | Mobile screen | `name`, `initial` |
| `navigationBar` | Top navigation | `title`, `backButton`, `rightButtons` |
| `navigation` | Tab navigation | `type` |
| `tab` | Tab definition | `name`, `label`, `icon`, `screen`, `badge` |

### Overlay Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `sheet` | Bottom sheet | `name`, `height`, `dismissible` |
| `alert` | Alert dialog | `name`, `title`, `destructive` |
| `action` | Alert action | `label`, `role`, `onClick` |

### List Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `list` | List container | `data`, `refreshable`, `grouped` |
| `listItem` | List row | `title`, `subtitle`, `icon`, `chevron`, `swipeActions` |
| `listSection` | Grouped section | `header` |
| `swipeAction` | Swipe action | `side`, `icon`, `color`, `onClick` |

### Input Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `segmentedControl` | Segment picker | `value`, `onChange` |
| `segment` | Segment option | `value`, `label` |
| `search` | Search bar | `placeholder`, `onSearch`, `showCancel` |

### Action Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `floatingButton` | FAB | `icon`, `onClick`, `position` |

### Layout Elements

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `column` | Vertical layout | `padding`, `gap`, `safeArea` |
| `row` | Horizontal layout | `padding`, `gap`, `justify`, `align` |
| `scroll` | Scroll container | `direction`, `refreshable` |

---

## Example

Complete mobile spec structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp name="MyApp" version="1.0">
  <import src="./myapp.shared.spec.xml" />

  <navigation type="tabs">
    <tab name="home" label="Home" icon="home" screen="@screen.Dashboard" />
    <tab name="projects" label="Projects" icon="folder" screen="@screen.Projects" />
    <tab name="profile" label="Profile" icon="user" screen="@screen.Profile" />
  </navigation>

  <screens>
    <screen name="Dashboard" initial="true">
      <column safeArea="true" padding="md">
        <text variant="largeTitle">Dashboard</text>

        <list data="@state.items" refreshable="true">
          <for each="item" in="@data">
            <listItem
              title="@item.name"
              onClick="push(@screen.Detail, { id: @item.id })"
              chevron="true"
              swipeActions="true"
            >
              <swipeAction icon="trash" color="danger" onClick="@action.delete(@item.id)" />
            </listItem>
          </for>
        </list>
      </column>

      <floatingButton icon="plus" onClick="presentSheet(@sheet.Create)" />
    </screen>
  </screens>

  <sheets>
    <sheet name="Create" height="auto" dismissible="true">
      <form onSubmit="@action.create" onSuccess="dismissSheet()">
        <input label="Name" bind="name" required="true" />
        <button type="submit" fullWidth="true">Create</button>
      </form>
    </sheet>
  </sheets>

  <alerts>
    <alert name="ConfirmDelete" title="Delete?" destructive="true">
      <text>This cannot be undone.</text>
      <action label="Cancel" role="cancel" />
      <action label="Delete" role="destructive" onClick="@callback" />
    </alert>
  </alerts>
</webapp>
```

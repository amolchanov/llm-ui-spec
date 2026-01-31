# Platform Element Mapping

This document maps UI spec elements between webapp and mobile platforms, helping maintain consistency when creating platform-specific specs from shared definitions.

---

## Navigation

| Concept | Webapp | Mobile |
|---------|--------|--------|
| Primary navigation | `<layout>` with sidebar slot | `<navigation type="tabs">` |
| Navigation item | `<navItem to="@page.X">` | `<tab screen="@screen.X">` |
| Route | `<page route="/path">` | `<screen name="X">` |
| URL parameters | `<param name="id">` in page | `<param name="id">` in screen |
| Back navigation | Browser back / breadcrumbs | `backButton="true"` on navigationBar |
| Deep linking | URL routes | Universal links / App Links |

### Example

**Webapp:**
```xml
<layouts>
  <layout name="AppShell">
    <slot name="sidebar">
      <navItem to="@page.Dashboard" icon="home">Dashboard</navItem>
      <navItem to="@page.Forms" icon="file-text">Forms</navItem>
    </slot>
    <slot name="content" />
  </layout>
</layouts>

<pages>
  <page name="Dashboard" route="/dashboard" layout="AppShell" />
</pages>
```

**Mobile:**
```xml
<navigation type="tabs">
  <tab name="dashboard" label="Dashboard" icon="home" screen="@screen.Dashboard" />
  <tab name="forms" label="Forms" icon="file-text" screen="@screen.Forms" />
</navigation>

<screens>
  <screen name="Dashboard" initial="true" />
</screens>
```

---

## Page Structure

| Concept | Webapp | Mobile |
|---------|--------|--------|
| Page container | `<page>` | `<screen>` |
| Page header | Slot in layout | `<navigationBar>` |
| Page title | `<text variant="heading1">` | `<text variant="largeTitle">` or navigationBar title |
| Content scroll | `scroll="true"` on slot | `<scroll>` wrapper or `<list>` |
| Safe areas | N/A | `safeArea="true"` on container |

### Example

**Webapp:**
```xml
<page name="Forms" route="/forms" layout="AppShell">
  <slot target="@layout.AppShell.content">
    <container layout="column" gap="lg">
      <text variant="heading1">Forms</text>
      <!-- content -->
    </container>
  </slot>
</page>
```

**Mobile:**
```xml
<screen name="Forms">
  <navigationBar title="Forms" />
  <column safeArea="true" padding="md">
    <!-- content -->
  </column>
</screen>
```

---

## Overlays & Dialogs

| Concept | Webapp | Mobile |
|---------|--------|--------|
| Form dialog | `<modal>` | `<sheet>` |
| Confirmation | `<modal size="small">` | `<alert>` |
| Action menu | `<dropdown>` | `<sheet>` with list or action sheet |
| Full-screen overlay | `<modal size="full">` | `push(@screen.X)` |
| Dismissal | `closeModal()` | `dismissSheet()` |

### Example

**Webapp:**
```xml
<modals>
  <modal name="CreateForm" title="New Form" size="medium">
    <form onSubmit="@action.create" onSuccess="closeModal()">
      <input label="Name" bind="name" />
      <button type="submit">Create</button>
    </form>
  </modal>
</modals>

<!-- Trigger -->
<button onClick="openModal(@modal.CreateForm)">New Form</button>
```

**Mobile:**
```xml
<sheets>
  <sheet name="CreateForm" height="auto" dismissible="true">
    <column padding="lg" gap="md">
      <text variant="headline">New Form</text>
      <form onSubmit="@action.create" onSuccess="dismissSheet()">
        <input label="Name" bind="name" />
        <button type="submit" fullWidth="true">Create</button>
      </form>
    </column>
  </sheet>
</sheets>

<!-- Trigger -->
<button onClick="presentSheet(@sheet.CreateForm)">New Form</button>
```

---

## Lists & Data Display

| Concept | Webapp | Mobile |
|---------|--------|--------|
| Data table | `<table>` | `<list>` |
| Grid layout | `<container layout="grid">` | `<list>` or horizontal `<scroll>` |
| List item | `<tr>` or card | `<listItem>` or custom row |
| Item actions | Dropdown menu / buttons | `swipeActions` |
| Bulk selection | Checkboxes + toolbar | Edit mode with multi-select |
| Pagination | `<pagination>` | Infinite scroll |
| Refresh | Refresh button | `refreshable="true"` (pull-to-refresh) |
| Grouping | Section headers | `grouped="true" groupBy="field"` |

### Example

**Webapp:**
```xml
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <for each="form" in="@state.forms">
      <tr>
        <td>@item.name</td>
        <td><badge value="@item.status" /></td>
        <td>
          <dropdown trigger="icon" icon="more-vertical">
            <menuItem onClick="@action.edit(@item.id)">Edit</menuItem>
            <menuItem onClick="@action.delete(@item.id)">Delete</menuItem>
          </dropdown>
        </td>
      </tr>
    </for>
  </tbody>
</table>
<pagination data="@state.forms" />
```

**Mobile:**
```xml
<list data="@state.forms" refreshable="true" onRefresh="@action.refresh">
  <for each="form" in="@data">
    <listItem
      title="@item.name"
      subtitle="@item.status"
      onClick="push(@screen.FormDetail, { id: @item.id })"
      swipeActions="true"
    >
      <swipeAction side="right" icon="edit" onClick="@action.edit(@item.id)" />
      <swipeAction side="right" icon="trash" color="danger" onClick="@action.delete(@item.id)" />
    </listItem>
  </for>
</list>
<!-- Infinite scroll is automatic -->
```

---

## Forms & Inputs

| Concept | Webapp | Mobile |
|---------|--------|--------|
| Form container | `<form>` | `<form>` |
| Text input | `<input>` | `<input>` |
| Select/dropdown | `<select>` | `<select>` or picker sheet |
| Toggle | `<switch>` or `<checkbox>` | `<switch>` |
| Date picker | `<datepicker>` | `<datepicker>` (native) |
| Segmented choice | Radio group or tabs | `<segmentedControl>` |
| Search | `<search>` | `<search>` (with clear button) |

### Example

**Webapp:**
```xml
<container layout="row" gap="md">
  <select value="@state.filter" onChange="@action.setFilter">
    <option value="all">All</option>
    <option value="active">Active</option>
  </select>
  <search placeholder="Search..." onSearch="@action.search" />
</container>
```

**Mobile:**
```xml
<search placeholder="Search..." onSearch="@action.search" padding="md" />
<segmentedControl value="@state.filter" onChange="@action.setFilter" padding="md">
  <segment value="all" label="All" />
  <segment value="active" label="Active" />
</segmentedControl>
```

---

## Actions & Buttons

| Concept | Webapp | Mobile |
|---------|--------|--------|
| Primary action | Button in header/content | `<floatingButton>` or header button |
| Secondary actions | Button group | navigationBar `rightButtons` |
| Destructive action | `<button variant="danger">` | Alert with `destructive="true"` |
| Context menu | Right-click / dropdown | Long-press or swipe actions |

### Example

**Webapp:**
```xml
<container layout="row" justify="between">
  <text variant="heading1">Forms</text>
  <button variant="primary" icon="plus" onClick="openModal(@modal.CreateForm)">
    New Form
  </button>
</container>
```

**Mobile:**
```xml
<screen name="Forms">
  <navigationBar
    title="Forms"
    rightButtons="[{ icon: 'plus', onClick: presentSheet(@sheet.CreateForm) }]"
  />
  <!-- Or use a FAB -->
  <floatingButton icon="plus" onClick="presentSheet(@sheet.CreateForm)" />
</screen>
```

---

## Feedback & States

| Concept | Webapp | Mobile |
|---------|--------|--------|
| Loading | `<spinner>` or skeleton | `<spinner>` or skeleton |
| Error message | `<alert variant="error">` | `<alert>` dialog |
| Success message | Toast notification | Toast or banner |
| Empty state | Custom component | Custom component |
| Pull-to-refresh | N/A | `refreshable="true"` on list |

---

## Layout Containers

| Concept | Webapp | Mobile |
|---------|--------|--------|
| Vertical stack | `<container layout="column">` | `<column>` |
| Horizontal stack | `<container layout="row">` | `<row>` |
| Grid | `<container layout="grid" columns="3">` | `<container layout="grid">` or list |
| Card | `<container variant="card">` | `<container variant="card">` |
| Section | `<section>` | `<listSection>` in lists |
| Divider | `<divider>` | `<divider>` or list separator |
| Spacer | `<spacer>` | `<spacer>` |

---

## Typography

| Webapp Variant | Mobile Equivalent | Usage |
|----------------|-------------------|-------|
| `heading1` | `largeTitle` | Page titles |
| `heading2` | `title` or `headline` | Section headers |
| `heading3` | `headline` | Subsection headers |
| `subtitle` | `body` with `weight="medium"` | Card titles |
| `body` | `body` | Default text |
| `caption` | `caption` | Secondary text |

---

## Quick Reference: Action Mapping

| User Action | Webapp | Mobile |
|-------------|--------|--------|
| Navigate to page | `navigateTo(@page.X)` | `push(@screen.X)` |
| Go back | `navigateBack()` | Back button / swipe |
| Open dialog | `openModal(@modal.X)` | `presentSheet(@sheet.X)` |
| Close dialog | `closeModal()` | `dismissSheet()` |
| Show confirmation | Modal with buttons | `presentAlert(@alert.X)` |
| Switch tabs | N/A | `switchTab('name')` |
| Share content | Web Share API | `shareNative()` |
| Copy to clipboard | `copyToClipboard()` | `copyToClipboard()` |

---

## Platform-Specific Elements

### Webapp Only

| Element | Description |
|---------|-------------|
| `<table>` | Full data tables with sorting |
| `<pagination>` | Page-based navigation |
| `<breadcrumb>` | Navigation trail |
| `<sidebar>` | Persistent side navigation |
| `<tabs>` (horizontal) | Content tabs |
| `<tooltip>` | Hover tooltips |

### Mobile Only

| Element | Description |
|---------|-------------|
| `<navigationBar>` | Screen header with back button |
| `<tabBar>` | Bottom tab navigation |
| `<sheet>` | Bottom sheet overlay |
| `<alert>` | Native alert dialog |
| `<floatingButton>` | FAB for primary action |
| `<swipeAction>` | Swipe-to-reveal actions |
| `<segmentedControl>` | iOS-style segment picker |
| `<listItem>` | Native list row |
| `<listSection>` | Grouped list header |
| `safeArea="true"` | Respect device notches |
| `refreshable="true"` | Pull-to-refresh |

---

## Migration Checklist

When creating a mobile spec from a webapp spec:

- [ ] Replace `<page>` with `<screen>`
- [ ] Replace sidebar navigation with `<navigation type="tabs">`
- [ ] Replace `<modal>` with `<sheet>` or `<alert>`
- [ ] Replace `<table>` with `<list>`
- [ ] Add `safeArea="true"` to main containers
- [ ] Add `refreshable="true"` to data lists
- [ ] Convert dropdown menus to swipe actions
- [ ] Move primary actions to FAB or navigationBar
- [ ] Replace pagination with infinite scroll
- [ ] Add `<navigationBar>` to detail screens
- [ ] Update navigation functions (`navigateTo` → `push`, `openModal` → `presentSheet`)

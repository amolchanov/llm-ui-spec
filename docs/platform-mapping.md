# Platform Element Mapping

Visual reference for converting specs between webapp, mobile, and desktop platforms.

---

## Navigation

![Navigation Mapping](/images/nav-mapping.svg)

---

## Page Structure

![Page Structure](/images/page-structure.svg)

---

## Overlays & Dialogs

![Overlays & Dialogs](/images/overlays.svg)

---

## Lists & Data

![Lists & Data](/images/lists-data.svg)

---

## Forms & Inputs

![Forms & Inputs](/images/forms-inputs.svg)

---

## Actions & Buttons

![Actions & Buttons](/images/actions-buttons.svg)

---

## Typography

![Typography](/images/typography.svg)

---

## Layout Containers

![Layout Containers](/images/layout-containers.svg)

---

## Action Functions

![Action Functions](/images/action-functions.svg)

---

## Platform-Specific Elements

![Platform-Specific Elements](/images/platform-specific.svg)

---

## Migration Workflows

### Webapp → Mobile

![Migration: Webapp to Mobile](/images/migration-webapp-mobile.svg)

### Webapp → Desktop

![Migration: Webapp to Desktop](/images/migration-webapp-desktop.svg)

---

## Quick Examples

### Navigation Example

**Webapp:**
```xml
<layout name="AppShell">
  <slot name="sidebar">
    <navItem to="@page.Dashboard">Dashboard</navItem>
    <navItem to="@page.Forms">Forms</navItem>
  </slot>
</layout>
```

**Mobile:**
```xml
<navigation type="tabs">
  <tab label="Dashboard" screen="@screen.Dashboard" />
  <tab label="Forms" screen="@screen.Forms" />
</navigation>
```

**Desktop:**
```xml
<treeView>
  <treeItem label="Dashboard" onClick="@action.setView('dashboard')" />
  <treeItem label="Forms" expanded="true">
    <for each="form" in="@state.forms">
      <treeItem label="@item.name" onClick="@action.selectForm(@item.id)" />
    </for>
  </treeItem>
</treeView>
```

### Dialog Example

**Webapp:**
```xml
<modal name="Create" title="New Item">
  <form onSubmit="@action.create" onSuccess="closeModal()">
    <input label="Name" bind="name" />
    <button type="submit">Create</button>
  </form>
</modal>

<button onClick="openModal(@modal.Create)">New</button>
```

**Mobile:**
```xml
<sheet name="Create" height="auto" dismissible="true">
  <form onSubmit="@action.create" onSuccess="dismissSheet()">
    <input label="Name" bind="name" />
    <button type="submit" fullWidth="true">Create</button>
  </form>
</sheet>

<floatingButton icon="plus" onClick="presentSheet(@sheet.Create)" />
```

**Desktop:**
```xml
<dialog name="Create" title="New Item" width="450">
  <form onSubmit="@action.create" onSuccess="closeDialog()">
    <input label="Name" bind="name" autoFocus="true" />
    <row justify="end" gap="sm">
      <button variant="outline" onClick="closeDialog()">Cancel</button>
      <button type="submit" variant="primary">Create</button>
    </row>
  </form>
</dialog>

<menuBar>
  <menu label="File">
    <menuItem label="New" shortcut="Ctrl+N" onClick="openDialog(@dialog.Create)" />
  </menu>
</menuBar>
```

### List Example

**Webapp:**
```xml
<table>
  <for each="item" in="@state.items">
    <tr>
      <td>@item.name</td>
      <td>
        <dropdown>
          <menuItem onClick="@action.edit">Edit</menuItem>
          <menuItem onClick="@action.delete">Delete</menuItem>
        </dropdown>
      </td>
    </tr>
  </for>
</table>
<pagination data="@state.items" />
```

**Mobile:**
```xml
<list data="@state.items" refreshable="true">
  <for each="item" in="@data">
    <listItem title="@item.name" swipeActions="true">
      <swipeAction icon="edit" onClick="@action.edit" />
      <swipeAction icon="trash" color="danger" onClick="@action.delete" />
    </listItem>
  </for>
</list>
```

**Desktop:**
```xml
<table selectable="true">
  <for each="item" in="@state.items">
    <tr contextMenu="@contextMenu.Item" onDoubleClick="@action.edit">
      <td>@item.name</td>
    </tr>
  </for>
</table>
<pagination data="@state.items" />

<contextMenu name="Item">
  <menuItem icon="edit" label="Edit" onClick="@action.edit" />
  <menuItem icon="trash" label="Delete" color="danger" onClick="@action.delete" />
</contextMenu>
```

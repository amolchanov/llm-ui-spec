# LLM UI Spec Quick Reference

Condensed reference for LLM prompts. For full documentation, see [SPEC.md](./SPEC.md).

## Two Primitives

| Primitive | Purpose | Examples |
|-----------|---------|----------|
| `<element>` | Leaf nodes (no children) | button, text, input, image |
| `<container>` | Nodes with children | row, column, card, tabs |

## Common Attributes

| Attribute | Description |
|-----------|-------------|
| `name` | Identifier for referencing |
| `type` | Element or container type |
| `prompt` | Natural language description |
| `use` | Data binding |
| `if` | Render if true |
| `if-not` | Render if false |
| `for-each` | Iterate collection |

## Human Readable Patterns

```xml
<!-- All attributes (except name) can be in prompt -->
<element type="button" prompt="style primary, on click @action.save">Save</element>

<!-- Type optional when context is clear -->
<container type="menu">
  <element>Edit</element>      <!-- menu item implied -->
  <element>Delete</element>
</container>

<!-- Data binding with use -->
<element type="text" use="@user.name" />
<element type="image" use="@user.avatar" />
```

## Reference Namespaces

| Prefix | Example | Description |
|--------|---------|-------------|
| `@entity` | `@entity.User` | Entity schema |
| `@component` | `@component.Card` | Component |
| `@action` | `@action.save` | Action |
| `@guard` | `@guard.auth` | Guard |
| `@state` | `@state.items` | State |
| `@item` | `@item.name` | Loop item |
| `@page` | `@page.Dashboard` | Page (webapp) |
| `@screen` | `@screen.Home` | Screen (mobile) |
| `@modal` | `@modal.Create` | Modal (webapp) |
| `@sheet` | `@sheet.Options` | Sheet (mobile) |
| `@layout` | `@layout.AppShell` | Layout |
| `@prop` | `@prop.user` | Component prop |
| `@param` | `@param.id` | URL parameter |

## Element Types

```xml
<!-- Display -->
<element type="text" prompt="large heading">Title</element>
<element type="text" prompt="muted" use="@item.description" />
<element type="icon" prompt="home, size large" />
<element type="image" use="@user.avatar" prompt="avatar, size 40" />
<element type="badge" use="@item.status" prompt="style success" />
<element type="spinner" if="@state.loading" />

<!-- Input -->
<element type="input" prompt="required, placeholder Enter email">Email</element>
<element type="textarea" prompt="rows 4">Description</element>
<element type="select" prompt="options @state.options" />
<element type="checkbox" use="@state.enabled">Enable</element>

<!-- Actions -->
<element type="button" prompt="style primary, on click @action.save">Save</element>
<element type="link" to="@page.Settings">Settings</element>
```

## Container Types

```xml
<!-- Layout -->
<container type="row" prompt="gap medium, justify between" />
<container type="column" prompt="padding large, gap small" />
<container type="grid" prompt="3 columns, medium gap" />
<container type="card" prompt="padding medium" />

<!-- Interactive -->
<container type="accordion">
  <container prompt="label Section 1">Content</container>
</container>

<container type="tabs">
  <container prompt="label Overview">Content</container>
</container>

<container type="form" prompt="on submit @action.save">
  <element type="input" prompt="required">Name</element>
  <element type="button" prompt="style primary">Save</element>
</container>
```

## Control Flow

```xml
<!-- Conditional -->
<element type="spinner" if="@state.loading" />
<element type="text" if-not="@state.loading">Loaded</element>

<!-- Loops -->
<container type="card" for-each="@state.items">
  <element use="@item.name" />
</container>
```

## Prompt Patterns

```xml
<!-- Styling -->
prompt="style primary"
prompt="large heading"
prompt="muted text"
prompt="gap medium"
prompt="3 columns"

<!-- Behavior -->
prompt="on click @action.save"
prompt="on submit @action.create"
prompt="on success close modal"

<!-- Conditions -->
prompt="if @state.loading"
prompt="for each @state.items"

<!-- Combined -->
prompt="style primary, large, on click @action.save"
```

## Actions

```xml
<actions>
  <action name="save" prompt="submit form, show success toast" />
  <action name="delete" prompt="confirm dialog, delete item, refresh" />
</actions>

<!-- Usage -->
<element type="button" prompt="on click @action.save">Save</element>
```

## Guards

```xml
<guards>
  <guard name="auth" prompt="if not authenticated, redirect to login" />
  <guard name="admin" prompt="if not admin, redirect to unauthorized" />
</guards>

<!-- Usage -->
<page name="Dashboard">
  <guards>
    <guard type="@guard.auth" />
  </guards>
</page>
```

## Entities

```xml
<entity name="User">
  <field name="id" type="uuid" />
  <field name="name" type="string" prompt="required" />
  <field name="email" type="email" prompt="required" />
  <field name="posts" type="ref" prompt="references @entity.Post, many" />
</entity>
```

**Field types:** `uuid`, `string`, `text`, `richtext`, `email`, `url`, `phone`, `number`, `integer`, `decimal`, `boolean`, `date`, `time`, `datetime`, `image`, `file`, `json`, `enum`, `ref`

## Components

```xml
<component name="UserCard">
  <props>
    <prop name="user" type="@entity.User" prompt="required" />
  </props>
  <container type="row" prompt="gap small">
    <element type="image" use="@prop.user.avatar" />
    <element use="@prop.user.name" />
  </container>
</component>

<!-- Usage -->
<element type="@component.UserCard" use="@state.user" />
<element type="@component.UserCard" for-each="@state.users" />
```

## Platform Quick Reference

### Webapp
```xml
<page name="Dashboard" route="/dashboard" layout="@layout.AppShell">
  <guards><guard type="@guard.auth" /></guards>
  <data><query name="items" type="@entity.Item[]" /></data>
  <slot target="@layout.AppShell.content">...</slot>
</page>
```

### Mobile
```xml
<screen name="Dashboard" prompt="initial">
  <guards><guard type="@guard.auth" /></guards>
  <container type="list" prompt="pull to refresh @action.refresh" for-each="@state.items">
    <container prompt="chevron, on tap push @screen.Detail">...</container>
  </container>
</screen>
```

### Desktop
```xml
<view name="Dashboard">
  <guards><guard type="@guard.auth" /></guards>
  <container type="split-view" prompt="horizontal">
    <container type="panel" prompt="width 250px, resizable">...</container>
    <container type="panel" prompt="grow">...</container>
  </container>
</view>
```

## File Organization

| Platform | Pattern |
|----------|---------|
| Shared | `app.shared.spec.xml` |
| Webapp | `app.webapp.spec.xml` |
| Mobile | `app.mobile.spec.xml` |
| Desktop | `app.desktop.spec.xml` |

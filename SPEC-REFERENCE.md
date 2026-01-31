# LLM UI Spec Quick Reference

Condensed reference for LLM prompts. For full documentation, see SPEC.md.

## Reference Namespaces

| Prefix | Example | Description |
|--------|---------|-------------|
| `@entity` | `@entity.User.email` | Entity field |
| `@component` | `@component.Card` | Component |
| `@page` | `@page.Dashboard` | Page navigation |
| `@layout` | `@layout.AppShell.content` | Layout slot |
| `@prop` | `@prop.user` | Component prop |
| `@state` | `@state.items` | Page/component state |
| `@param` | `@param.id` | URL parameter |
| `@item` | `@item.name` | Loop item |
| `@action` | `@action.save` | Action handler |
| `@theme` | `@theme.colors.primary` | Theme token |

## Document Structure

```xml
<webapp name="AppName" version="1.0" detail="full">
  <entities>...</entities>
  <layouts>...</layouts>
  <components>...</components>
  <pages>...</pages>
  <navigation>...</navigation>
  <config>...</config>
</webapp>
```

## Entity

```xml
<entity name="User">
  <field name="id" type="uuid" />
  <field name="email" type="email" required="true" />
  <field name="role" type="enum" values="user,admin" default="user" />
  <field name="posts" type="ref" ref="@entity.Post" cardinality="many" />
</entity>
```

**Field types:** `uuid`, `string`, `text`, `email`, `url`, `integer`, `float`, `boolean`, `date`, `datetime`, `time`, `json`, `enum`, `ref`, `image`, `file`

## Layout

```xml
<layout name="AppShell">
  <container layout="column" minHeight="100vh">
    <slot name="header" position="top" height="64px" role="chrome" />
    <container layout="row" grow="true">
      <slot name="sidebar" width="240px" collapsible="true" role="chrome" />
      <slot name="content" grow="true" scroll="true" role="content" />
    </container>
  </container>
</layout>
```

**Slot attributes:** `name`, `position` (top/bottom/left/right), `width`, `height`, `grow`, `scroll`, `collapsible`, `role` (chrome/content)

## Component

```xml
<component name="StatCard">
  <props>
    <prop name="label" type="string" required="true" />
    <prop name="value" type="number" required="true" />
    <prop name="icon" type="string" />
  </props>
  <actions>
    <action name="onClick" />
  </actions>
  <container layout="column" padding="md">
    <icon name="@prop.icon" />
    <text value="@prop.label" variant="caption" />
    <text value="@prop.value" variant="heading2" />
  </container>
</component>
```

## Page

```xml
<page name="Dashboard" route="/dashboard" layout="AppShell" auth="required">
  <data>
    <query name="user" type="@entity.User" source="auth.currentUser" />
    <query name="items" type="@entity.Item[]" filter="owner == @state.user.id" />
  </data>
  <localState>
    <state name="filter" type="string" default="" />
  </localState>

  <slot target="@layout.AppShell.header">
    <use component="AppHeader" user="@state.user" />
  </slot>

  <slot target="@layout.AppShell.content">
    <!-- Content here -->
  </slot>

  <states>
    <state name="loading"><spinner /></state>
    <state name="error"><prompt>Error message with retry button</prompt></state>
  </states>
</page>
```

**Page attributes:** `name`, `route`, `layout`, `auth` (required/guest/none), `title`

## Elements Quick Reference

### Containers
| Element | Key Attributes |
|---------|----------------|
| `container` | `layout` (row/column/grid/center), `gap`, `padding`, `grow` |
| `row` | `gap`, `align`, `justify`, `wrap` |
| `column` | `gap`, `align` |
| `grid` | `columns`, `gap` |
| `card` | `title`, `padding` |
| `section` | `title`, `name` |
| `tabs` | `defaultTab` |
| `tab` | `name`, `label`, `icon` |

### Text & Display
| Element | Key Attributes |
|---------|----------------|
| `text` | `value`, `variant` (heading1-3/body/caption), `muted` |
| `heading` | `level` (1-6) |
| `icon` | `name`, `size` |
| `image` | `src`, `alt`, `width`, `height` |
| `badge` | `value`, `variant` (primary/success/warning/danger) |
| `divider` | `orientation` |
| `spinner` | `size` |

### Form Elements
| Element | Key Attributes |
|---------|----------------|
| `form` | `onSubmit`, `entity` |
| `input` | `type`, `name`, `label`, `bind`, `required`, `placeholder` |
| `textarea` | `name`, `label`, `bind`, `rows` |
| `select` | `name`, `label`, `bind`, `options` |
| `checkbox` | `name`, `label`, `bind` |
| `switch` | `name`, `label`, `bind` |
| `datepicker` | `name`, `label`, `bind` |

### Buttons & Links
| Element | Key Attributes |
|---------|----------------|
| `button` | `variant` (primary/secondary/outline/ghost/danger), `onClick`, `icon`, `disabled` |
| `link` | `to`, `variant` |

### Data Display
| Element | Key Attributes |
|---------|----------------|
| `table` | + `thead`, `tbody`, `tr`, `th`, `td` |
| `list` | `data`, `empty` |
| `stat` | `label`, `value`, `trend` |
| `pagination` | `pageSize`, `total`, `current` |

### Interactive
| Element | Key Attributes |
|---------|----------------|
| `modal` | `name`, `title`, `size` |
| `drawer` | `name`, `position`, `size` |
| `dropdown` | `trigger` + `menu`, `menuItem` |
| `tooltip` | `content` |

### Logic & Control
| Element | Key Attributes |
|---------|----------------|
| `if` | `condition` |
| `else` | - |
| `for` | `each`, `in` |
| `slot` | `name` (define) or `target` (fill) |
| `use` | `component` + props |

## Prompt Element

```xml
<!-- Simple prompt -->
<prompt>Description of what to generate</prompt>

<!-- With modifiers -->
<prompt context="true" constraints="true">
  Design: Modern, minimal style with blue accent colors.

  Must include loading states.
  Must NOT show raw IDs to users.
</prompt>
```

**Attributes:** `context` (inherits to children), `constraints` (strict rules), `override` (ignore parent context)

## Navigation

```xml
<navigation>
  <guards>
    <guard name="auth" redirect="/login" />
    <guard name="admin" role="admin" redirect="/unauthorized" />
  </guards>
</navigation>
```

## Detail Levels

| Level | Attribute | Contains |
|-------|-----------|----------|
| L1 | `detail="requirements"` | Prompts for entire pages/layouts |
| L2 | `detail="structure"` | Slots + section prompts |
| L3 | `detail="detailed"` | Containers, loops, component refs |
| L4 | `detail="full"` | Complete UI, no prompts |

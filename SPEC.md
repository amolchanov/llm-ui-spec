# LLM UI Spec

A declarative XML specification for defining UI structure that can be interpreted by LLMs to generate platform-specific code.

## Overview

LLM UI Spec allows you to define UI at varying levels of specificity:
- **Fully defined**: Explicit structure, components, and bindings
- **Prompt-guided**: Natural language descriptions for LLM interpretation
- **Hybrid**: Mix of defined structure with prompt-guided sections

The specification supports an iterative development workflow where you progressively add detail, allowing validation at each stage before committing to implementation specifics.

---

## Detail Levels

Specs can be developed iteratively through four detail levels. Use the `detail` attribute on `<webapp>` to indicate the current level:

```xml
<webapp name="MyApp" version="1.0" detail="requirements">
```

### Level 1: Requirements (`detail="requirements"`)

High-level structure with prompts describing entire pages and layouts.

**Contains:**
- Entity names and basic fields
- Layout names with prompt descriptions
- Page names, routes, auth requirements with prompt descriptions
- Component names with prompt descriptions

**Example:**
```xml
<webapp name="FormCraft" version="1.0" detail="requirements">
  <entities>
    <entity name="Form">
      <field name="id" type="uuid" />
      <field name="name" type="string" />
      <field name="owner" type="ref" ref="@entity.User" />
    </entity>
  </entities>

  <layouts>
    <layout name="AppShell">
      <prompt>Main application layout with header, collapsible sidebar, and content area</prompt>
    </layout>
  </layouts>

  <pages>
    <page name="Dashboard" route="/dashboard" auth="required">
      <prompt>Dashboard showing form statistics, recent forms grid, and recent submissions table</prompt>
    </page>
  </pages>

  <components>
    <component name="FormCard">
      <prompt>Card displaying form name, status badge, submission count, and action menu</prompt>
    </component>
  </components>
</webapp>
```

### Level 2: Structure (`detail="structure"`)

Adds layout structure, slot assignments, and section-level prompts.

**Adds:**
- Layout containers and slot definitions
- Page layout assignments and slot fills
- Data queries
- Section-level prompts (instead of page-level)

**Example:**
```xml
<webapp name="FormCraft" version="1.0" detail="structure">
  <layouts>
    <layout name="AppShell">
      <container layout="column" minHeight="100vh">
        <slot name="header" position="top" height="64px" role="chrome" />
        <container layout="row" grow="true">
          <slot name="sidebar" width="240px" collapsible="true" role="chrome" />
          <slot name="content" grow="true" scroll="true" role="content" />
        </container>
      </container>
    </layout>
  </layouts>

  <pages>
    <page name="Dashboard" route="/dashboard" layout="AppShell" auth="required">
      <data>
        <query name="stats" source="api/dashboard/stats" />
        <query name="recentForms" type="@entity.Form[]" filter="owner == @auth.user" limit="6" />
      </data>

      <slot target="@layout.AppShell.header">
        <prompt>Header with logo, navigation, and user avatar dropdown</prompt>
      </slot>

      <slot target="@layout.AppShell.sidebar">
        <prompt>Navigation: Dashboard, Forms, Submissions, Analytics, Settings</prompt>
      </slot>

      <slot target="@layout.AppShell.content">
        <prompt>Welcome message with user name and "Create Form" button</prompt>
        <prompt>Stats row: 4 cards showing key metrics</prompt>
        <prompt>Recent forms: grid of FormCard components</prompt>
        <prompt>Recent submissions: table with form, date, preview columns</prompt>
      </slot>
    </page>
  </pages>
</webapp>
```

### Level 3: Detailed (`detail="detailed"`)

Adds UI containers, loops, conditions, and component usage with prompts for complex elements.

**Adds:**
- Container hierarchy with layout props
- `<for>` loops for lists/grids
- `<if>` conditions for dynamic UI
- `<use component="...">` for component instances
- Prompts only for complex/creative elements

**Example:**
```xml
<webapp name="FormCraft" version="1.0" detail="detailed">
  <pages>
    <page name="Dashboard" route="/dashboard" layout="AppShell" auth="required">
      <slot target="@layout.AppShell.content">
        <container layout="column" gap="xl" padding="lg">

          <!-- Stats Section -->
          <container layout="grid" columns="4" gap="md">
            <use component="StatCard" label="Total Forms" value="@state.stats.totalForms" icon="file-text" />
            <use component="StatCard" label="Submissions" value="@state.stats.submissions" icon="inbox" />
            <use component="StatCard" label="Completion Rate" value="@state.stats.rate" icon="percent" />
            <use component="StatCard" label="Active" value="@state.stats.active" icon="activity" />
          </container>

          <!-- Recent Forms -->
          <section>
            <container layout="row" justify="between">
              <heading level="2">Recent Forms</heading>
              <link to="@page.FormList">View All</link>
            </container>

            <if condition="@state.recentForms.length > 0">
              <container layout="grid" columns="3" gap="md">
                <for each="form" in="@state.recentForms">
                  <use component="FormCard" form="@item" />
                </for>
              </container>
            </if>
            <else>
              <prompt>Empty state with illustration and "Create your first form" CTA</prompt>
            </else>
          </section>

        </container>
      </slot>
    </page>
  </pages>
</webapp>
```

### Level 4: Full (`detail="full"`)

Complete specification with all UI elements defined. Minimal or no prompts.

**Contains:**
- All UI elements explicitly defined
- Complete component props and actions
- Form validation rules
- Loading, error, and empty states
- Navigation guards and flows

This is the target output format. See the complete example in `samples/formcraft.spec.xml`.

### Mixed Detail Levels

You can mix detail levels within a single file using the `detail` attribute on individual elements:

```xml
<webapp name="MyApp" version="1.0" detail="full">
  <!-- Fully specified page -->
  <page name="Dashboard" route="/dashboard" detail="full">
    <container>...</container>
  </page>

  <!-- Still in progress - prompt only -->
  <page name="Analytics" route="/analytics" detail="requirements">
    <prompt>Analytics dashboard with charts for form performance and submission trends</prompt>
  </page>
</webapp>
```

---

## Reference Namespaces

All references use the `@` prefix with a namespace:

| Namespace | Syntax | Description |
|-----------|--------|-------------|
| `@entity` | `@entity.Name.field` | Entity schema reference |
| `@component` | `@component.Name` | Component definition |
| `@page` | `@page.Name` | Page navigation |
| `@layout` | `@layout.Name.slot` | Layout reference |
| `@prop` | `@prop.name` | Component prop |
| `@state` | `@state.name` | Page/component state |
| `@param` | `@param.name` | URL parameters |
| `@item` | `@item.field` | Current loop item |
| `@action` | `@action.name` | Defined action |
| `@theme` | `@theme.path` | Theme tokens |
| `@i18n` | `@i18n.key` | Translations |
| `@asset` | `@asset.type.name` | Static assets |
| `@config` | `@config.path` | Config values |

## Document Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp name="AppName" version="1.0">
  <entities>...</entities>
  <layouts>...</layouts>
  <components>...</components>
  <pages>...</pages>
  <navigation>...</navigation>
  <config>...</config>
</webapp>
```

---

## File Organization

LLM UI Spec supports both single-file and multi-file project structures.

### File Extension

All spec files use the `.spec.xml` extension:
```
myapp.spec.xml
```

### Single-File Structure

For smaller projects, everything can live in one file:
```
myapp.spec.xml
```

### Multi-File Structure

Larger projects can split definitions into separate files using a naming convention:

```
myapp.spec.xml                              # Main spec file
myapp.entities.spec.xml                     # All entities (section file)
myapp.layouts.spec.xml                      # All layouts (section file)
myapp.entity.User.spec.xml                  # Single entity definition
myapp.entity.Post.spec.xml
myapp.layout.AppShell.spec.xml              # Single layout definition
myapp.layout.AuthLayout.spec.xml
myapp.component.Header.spec.xml             # Single component definition
myapp.component.UserCard.spec.xml
myapp.page.Dashboard.spec.xml               # Single page definition
myapp.page.Settings.spec.xml
```

**Naming conventions**:
- Section file: `<appname>.<type>s.spec.xml` (e.g., `myapp.entities.spec.xml`)
- Single item: `<appname>.<type>.<Name>.spec.xml` (e.g., `myapp.entity.User.spec.xml`)

| Type | Section | Description |
|------|---------|-------------|
| `entity` | `entities` | Entity definition(s) |
| `layout` | `layouts` | Layout definition(s) |
| `component` | `components` | Component definition(s) |
| `page` | `pages` | Page definition(s) |

### Referencing External Files

Use the `src` attribute to reference external spec files:

**Option 1: Reference entire sections**
```xml
<webapp name="MyApp" version="1.0">
  <entities src="./myapp.entities.spec.xml" />
  <layouts src="./myapp.layouts.spec.xml" />
  <components src="./myapp.components.spec.xml" />
  <pages src="./myapp.pages.spec.xml" />
</webapp>
```

**Option 2: Reference individual items**
```xml
<webapp name="MyApp" version="1.0">
  <entities>
    <entity name="User" src="./myapp.entity.User.spec.xml" />
    <entity name="Post" src="./myapp.entity.Post.spec.xml" />
  </entities>

  <layouts>
    <layout name="AppShell" src="./myapp.layout.AppShell.spec.xml" />
  </layouts>

  <components>
    <component name="Header" src="./myapp.component.Header.spec.xml" />
  </components>

  <pages>
    <page name="Dashboard" src="./myapp.page.Dashboard.spec.xml" />
  </pages>
</webapp>
```

**Option 3: Auto-discover from directory**
```xml
<webapp name="MyApp" version="1.0">
  <entities src="./entities/" />
  <layouts src="./layouts/" />
  <components src="./components/" />
  <pages src="./pages/" />
</webapp>
```

When `src` points to a directory, all `.spec.xml` files in that directory are loaded.

### External File Format

External spec files use a `<spec>` root element that wraps the definition:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<spec type="<type>" webapp="<appname>">
  <!-- Element definition here -->
</spec>
```

#### Spec Element Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Element type: `entity`, `layout`, `component`, `page`, `entities`, `layouts`, `components`, `pages` |
| `webapp` | No | Name of the parent webapp (for validation) |

#### Section Files

Section files contain multiple items of the same type:

**myapp.entities.spec.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<spec type="entities" webapp="MyApp">
  <entity name="User">
    <field name="id" type="uuid" />
    <field name="name" type="string" required="true" />
    <field name="email" type="email" required="true" />
  </entity>

  <entity name="Post">
    <field name="id" type="uuid" />
    <field name="title" type="string" required="true" />
    <field name="author" type="ref" ref="@entity.User" />
  </entity>
</spec>
```

**myapp.layouts.spec.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<spec type="layouts" webapp="MyApp">
  <layout name="AppShell">
    <!-- layout content -->
  </layout>

  <layout name="AuthLayout">
    <!-- layout content -->
  </layout>
</spec>
```

#### Single Item Files

#### Entity File

**myapp.entity.User.spec.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<spec type="entity" webapp="MyApp">
  <entity name="User">
    <field name="id" type="uuid" />
    <field name="name" type="string" required="true" />
    <field name="email" type="email" required="true" />
  </entity>
</spec>
```

#### Layout File

**myapp.layout.AppShell.spec.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<spec type="layout" webapp="MyApp">
  <layout name="AppShell">
    <container layout="column" minHeight="100vh">
      <slot name="header" position="top" sticky="true" role="chrome" />
      <container layout="row" grow="true">
        <slot name="sidebar" width="240px" role="chrome" />
        <slot name="content" grow="true" role="content" />
      </container>
    </container>
  </layout>
</spec>
```

#### Component File

**myapp.component.Header.spec.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<spec type="component" webapp="MyApp">
  <component name="Header">
    <props>
      <prop name="user" type="@entity.User" />
    </props>
    <container layout="row" justify="between" padding="md">
      <image src="@asset.images.logo" height="32px" />
      <text value="@prop.user.name" />
    </container>
  </component>
</spec>
```

#### Page File

**myapp.page.Dashboard.spec.xml**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<spec type="page" webapp="MyApp">
  <page name="Dashboard" route="/dashboard" layout="@layout.AppShell" auth="required">
    <data>
      <query name="user" type="@entity.User" source="auth.currentUser" />
    </data>

    <slot target="@layout.AppShell.content">
      <heading level="1">Dashboard</heading>
    </slot>
  </page>
</spec>
```

### Mixed Approach

You can combine inline and external definitions:

```xml
<webapp name="MyApp" version="1.0">
  <!-- Some entities inline -->
  <entities>
    <entity name="User">
      <field name="id" type="uuid" />
      <field name="name" type="string" />
    </entity>
    <!-- Others from external files -->
    <entity name="Post" src="./myapp.entity.Post.spec.xml" />
  </entities>

  <!-- All layouts from directory -->
  <layouts src="./layouts/" />

  <!-- All pages from directory -->
  <pages src="./pages/" />
</webapp>
```

---

## Entities

Define data models that components bind to.

```xml
<entities>
  <entity name="User">
    <field name="id" type="uuid" />
    <field name="name" type="string" required="true" />
    <field name="email" type="email" required="true" />
    <field name="posts" type="ref" ref="@entity.Post" cardinality="many" />
  </entity>
</entities>
```

### Field Types

| Type | Description |
|------|-------------|
| `uuid` | Unique identifier |
| `string` | Text value |
| `text` | Long text |
| `richtext` | Rich/formatted text |
| `email` | Email address |
| `url` | URL |
| `phone` | Phone number |
| `number` | Numeric value |
| `integer` | Whole number |
| `decimal` | Decimal number |
| `boolean` | True/false |
| `date` | Date only |
| `time` | Time only |
| `datetime` | Date and time |
| `image` | Image URL/reference |
| `file` | File URL/reference |
| `json` | JSON object |
| `enum` | Enumerated values |
| `ref` | Reference to another entity |

### Field Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Field name (required) |
| `type` | string | Field type (required) |
| `required` | boolean | Is field required |
| `default` | any | Default value |
| `values` | string | Comma-separated enum values |
| `ref` | @entity | Referenced entity for `ref` type |
| `cardinality` | one/many | Relationship cardinality |
| `minLength` | number | Minimum length |
| `maxLength` | number | Maximum length |
| `min` | number | Minimum value |
| `max` | number | Maximum value |
| `pattern` | string | Regex pattern |

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
| `role` | content/chrome | Editor behavior (see below) |
| `prompt` | string | LLM guidance for slot content |
| `prompt:context` | boolean | Prompt context flows to children |
| `prompt:constraints` | boolean | Treat prompt as must/must-not rules |

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

The `target` attribute uses the format `@layout.LayoutName.slotName` to specify which layout slot receives the content.

### Slot Roles

The `role` attribute controls how slots behave in visual editors. This is an editor hint that doesn't affect generated code (see [Editor Namespace](#editor-namespace-optional) for details).

```xml
<layout name="AppShell">
  <slot name="header" role="chrome" />
  <slot name="sidebar" role="chrome" />
  <slot name="content" role="content" />
  <slot name="footer" role="chrome" />
</layout>
```

When editing a page that uses this layout, only the `content` slot is expanded for editing. The `chrome` slots (header, sidebar, footer) remain collapsed since they typically contain shared layout elements.

---

## Components

Reusable UI components with props, slots, and actions.

```xml
<components>
  <component name="UserCard">
    <props>
      <prop name="user" type="@entity.User" required="true" />
      <prop name="compact" type="boolean" default="false" />
    </props>
    <actions>
      <action name="onClick" params="userId: uuid" />
    </actions>

    <container layout="row" gap="sm">
      <use component="@component.Avatar" src="@prop.user.avatar" />
      <text value="@prop.user.name" />
    </container>
  </component>
</components>
```

### Component Definition

| Element | Description |
|---------|-------------|
| `<props>` | Declare component inputs |
| `<actions>` | Declare callbacks/events |
| `<slot>` | Content insertion points |
| `<prompt>` | LLM guidance for implementation |

### Using Components

```xml
<use
  component="@component.UserCard"
  user="@state.currentUser"
  onClick="handleUserClick"
/>
```

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

---

## The Prompt Element

The `<prompt>` element allows natural language guidance at any level.

### Prompt Namespace

To use prompt attributes with modifiers, declare the namespace on your root element:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp xmlns:prompt="http://llm-ui-spec.org/prompt" name="MyApp">
  ...
</webapp>
```

### Prompt on Containers and Slots

Containers and slots support prompts as attributes for concise inline descriptions:

```xml
<!-- Simple attribute prompt -->
<container layout="row" prompt="User profile card with avatar and stats" />

<!-- With modifiers via namespace -->
<container
  prompt="Dashboard stats section"
  prompt:context="true"
  prompt:constraints="true"
/>

<!-- Slot with prompt -->
<slot name="sidebar" width="250px" prompt="Navigation menu with icons" />
```

For longer prompts, use a nested `<prompt>` element:

```xml
<container layout="column" gap="md">
  <prompt context="true" constraints="true">
    Project list with filtering and pagination.
    Must show loading skeleton while fetching.
    Must NOT display raw error messages to users.
    Must include empty state for no results.
  </prompt>
</container>
```

### Page-Level Prompt

```xml
<page name="Analytics" route="/analytics">
  <prompt>
    Create a comprehensive analytics dashboard showing:
    - User engagement metrics
    - Revenue charts
    - Geographic distribution map
    Use a modern, data-dense design.
  </prompt>
</page>
```

### Section-Level Prompt

```xml
<section name="charts">
  <prompt>
    Grid of 4 charts showing key metrics.
    Include line chart, bar chart, pie chart, and area chart.
    Add date range selector that affects all charts.
  </prompt>
</section>
```

### Component-Level Prompt

```xml
<field name="description" type="richtext">
  <prompt>
    Rich text editor with:
    - Markdown support
    - Image drag-and-drop
    - @mentions with autocomplete
    - Emoji picker
  </prompt>
</field>
```

### Prompt Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `context` | boolean | Sets context that flows down to all child elements |
| `override` | boolean | Ignores parent context, starts fresh |
| `constraints` | boolean | Treats content as must/must-not rules |
| `for` | string | Targets specific sub-element |

When using attribute syntax, modifiers use the `prompt:` namespace prefix:
- `prompt:context="true"` - Context flows to children
- `prompt:constraints="true"` - Treat as strict rules
- `prompt:override="true"` - Ignore parent context

### Context Inheritance

When `context="true"`, the prompt establishes a design context that flows to all nested elements. Child prompts inherit this context without needing to repeat it.

```xml
<container>
  <prompt context="true">
    Use a minimal design with monochrome colors,
    subtle borders, and outline-style icons.
  </prompt>

  <!-- All children inherit the minimal/monochrome context -->
  <container prompt="User profile card" />
  <container prompt="Activity feed" />
  <container prompt="Quick actions toolbar" />
</container>
```

Without `context="true"`, each child prompt would be interpreted independently and might generate inconsistent styles.

**Use context for:**
- Establishing design language (colors, spacing, style)
- Setting behavioral patterns (animation style, interaction patterns)
- Defining data conventions (date formats, number formatting)

### Context Override

Use `override="true"` when a child element should break from inherited context:

```xml
<section>
  <prompt context="true">Calm, muted grayscale design</prompt>

  <container prompt="Stats cards" />  <!-- Inherits grayscale -->

  <container>
    <prompt override="true">
      Bright warning banner with orange/red colors
      to alert users of important information
    </prompt>
  </container>
</section>
```

### Constraints

When `constraints="true"`, the prompt content is treated as non-negotiable requirements rather than suggestions. Use "Must" and "Must NOT" language.

```xml
<container>
  <prompt constraints="true">
    Must include ARIA labels on all interactive elements.
    Must NOT use color alone to convey meaning.
    Must have minimum 4.5:1 contrast ratio.
    Must show loading states for async operations.
    Must NOT expose internal IDs to users.
  </prompt>

  <container prompt="Data table with sorting and filtering" />
</container>
```

**Use constraints for:**
- Accessibility requirements (WCAG compliance)
- Security rules (input sanitization, XSS prevention)
- Brand guidelines (logo usage, color restrictions)
- Data privacy (what to show/hide)
- Performance requirements (lazy loading, pagination limits)

### Combining Context and Constraints

Context and constraints can be combined for comprehensive guidance:

```xml
<page name="AdminDashboard" route="/admin">
  <prompt context="true" constraints="true">
    Design context: Enterprise admin panel with data-dense layout,
    professional color scheme, and clear visual hierarchy.

    Must require admin role for all actions.
    Must log all data modifications.
    Must NOT allow bulk deletion without confirmation.
    Must show audit trail for sensitive operations.
  </prompt>

  <slot target="@layout.AdminShell.content">
    <container prompt="User management table" />
    <container prompt="System health metrics" />
    <container prompt="Recent audit log entries" />
  </slot>
</page>
```

---

## Container & Layout

### Container Element

```xml
<container
  layout="row|column|stack|grid|center"
  gap="xs|sm|md|lg|xl"
  padding="xs|sm|md|lg|xl"
  align="start|center|end|stretch"
  justify="start|center|end|between|around"
  prompt="LLM guidance for content"
  prompt:context="boolean"
  prompt:constraints="boolean"
>
```

### Layout Values

| Value | Description |
|-------|-------------|
| `row` | Horizontal flex layout |
| `column` | Vertical flex layout |
| `stack` | Alias for column |
| `grid` | CSS grid layout |
| `center` | Centered content |

---

## Common Elements

### Text

```xml
<text
  value="@prop.user.name"
  variant="heading1|heading2|heading3|body|caption|label"
  weight="normal|medium|bold"
  muted="boolean"
  truncate="number"
/>
```

### Button

```xml
<button
  variant="primary|secondary|outline|ghost|danger"
  size="sm|md|lg"
  icon="icon-name"
  onClick="@action.name"
  disabled="boolean"
  loading="boolean"
>
  Button Text
</button>
```

### Field

```xml
<field
  name="fieldName"
  type="text|email|password|number|date|select|checkbox|richtext|..."
  bind="@entity.Entity.field"
  label="Field Label"
  required="boolean"
  placeholder="string"
/>
```

### List

```xml
<list data="@state.items" empty="@component.EmptyState">
  <template>
    <use component="@component.ItemCard" item="@item" />
  </template>
</list>
```

### Conditional

```xml
<if condition="@state.isLoading">
  <spinner />
</if>

<if condition="@prop.user.role == 'admin'">
  <adminPanel />
</if>
```

### Loop

```xml
<for each="item" in="@state.items">
  <text value="@item.name" />
</for>
```

---

## Navigation

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

---

## Config

```xml
<config>
  <theme>
    <colors>
      <primary>#3B82F6</primary>
      <secondary>#6B7280</secondary>
      <success>#10B981</success>
      <danger>#EF4444</danger>
    </colors>
    <spacing unit="4px" />
    <borderRadius default="8px" />
  </theme>

  <i18n default="en">
    <locale name="en">
      <string key="app.title">My App</string>
    </locale>
  </i18n>

  <llm>
    <prompt type="global">
      Generate accessible, production-ready code.
      Use semantic HTML and proper ARIA labels.
    </prompt>
  </llm>
</config>
```

---

## Editor Namespace (Optional)

The `editor` namespace provides hints for visual editors that don't affect generated code. This namespace is **optional** - specs work perfectly without it.

### Declaring the Namespace

```xml
<?xml version="1.0" encoding="UTF-8"?>
<webapp xmlns:editor="http://llm-ui-spec.org/editor" name="MyApp">
  ...
</webapp>
```

### Editor Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `editor:role` | `content`, `chrome` | Controls editor display behavior |

### The Role Attribute

The `role` attribute (or `editor:role` when using the namespace) controls how elements behave in visual editors:

| Role | Description |
|------|-------------|
| `content` | Primary editable area - expanded when editing |
| `chrome` | Layout structure - collapsed and read-only when editing |

**Without namespace** (simpler, recommended for hand-written specs):
```xml
<slot name="header" role="chrome" />
<container role="content">...</container>
```

**With namespace** (explicit, recommended for tooling):
```xml
<slot name="header" editor:role="chrome" />
<container editor:role="content">...</container>
```

Both forms are valid. The namespace form makes it explicit that this attribute is an editor hint and won't affect the generated application.

### Supported Elements

The `role` / `editor:role` attribute can be used on:
- Layout containers: `row`, `column`, `stack`, `grid`, `container`, `card`, `section`
- Slots: `slot`
- Navigation: `nav`

---

## Element Reference

Complete list of all supported UI elements organized by category.

### Layout Containers

Elements that contain and arrange other elements.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `row` | Horizontal flex container | `gap`, `align`, `justify`, `wrap` |
| `column` | Vertical flex container | `gap`, `align` |
| `stack` | Alias for column | `gap` |
| `grid` | CSS grid container | `columns`, `gap` |
| `container` | Generic container | `maxWidth`, `padding`, `layout` |
| `card` | Card with border/shadow | `title`, `padding` |
| `section` | Semantic section | `title`, `name` |
| `tabs` | Tabbed container | `defaultTab`, `variant` |
| `tab` | Tab panel | `name`, `label`, `icon` |

### Text & Display

Elements for displaying content.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `text` | Text content | `value`, `variant`, `weight`, `muted`, `truncate` |
| `heading` | Heading (h1-h6) | `level`, `content` |
| `icon` | Icon display | `name`, `size`, `color` |
| `image` | Image display | `src`, `alt`, `width`, `height`, `fit` |
| `badge` | Status badge | `value`, `variant` |
| `tag` | Removable tag | `content`, `removable` |
| `divider` | Visual separator | `orientation` |
| `spacer` | Empty space | `size` |
| `alert` | Alert message | `content`, `variant`, `dismissible` |
| `spinner` | Loading indicator | `label`, `size` |

### Form Elements

Elements for user input.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `form` | Form container | `onSubmit`, `data`, `entity` |
| `input` | Text input | `label`, `type`, `name`, `bind`, `placeholder`, `required` |
| `textarea` | Multi-line input | `label`, `name`, `bind`, `rows` |
| `select` | Dropdown select | `label`, `name`, `bind`, `options` |
| `checkbox` | Checkbox input | `label`, `name`, `bind`, `checked` |
| `radio` | Radio button | `label`, `name`, `value`, `bind` |
| `switch` | Toggle switch | `label`, `name`, `bind` |
| `datepicker` | Date selector | `label`, `bind`, `required` |
| `filepicker` | File upload | `label`, `accept`, `multiple`, `onUpload` |
| `search` | Search input | `placeholder`, `bind`, `onSearch` |

### Buttons & Links

Interactive elements.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `button` | Clickable button | `variant`, `size`, `icon`, `onClick`, `disabled`, `loading` |
| `link` | Navigation link | `to`, `variant`, `external` |

### Data Display

Elements for showing data.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `list` | Data list | `data`, `empty`, `emptyProps` |
| `table` | Data table | `entity`, `columns`, `sortable`, `selectable` |
| `thead` | Table header | - |
| `tbody` | Table body | - |
| `tr` | Table row | - |
| `th` | Table header cell | - |
| `td` | Table data cell | - |
| `chart` | Data chart | `type`, `entity`, `xAxis`, `yAxis` |
| `stat` | Statistic display | `label`, `value`, `change`, `trend` |
| `pagination` | Page navigation | `pageSize`, `total`, `current` |

### Interactive Components

Overlays and interactive elements.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `modal` | Dialog modal | `name`, `title`, `size`, `closable` |
| `drawer` | Slide-out drawer | `name`, `title`, `position`, `size` |
| `dropdown` | Dropdown menu | `trigger`, `align` |
| `menu` | Menu container | - |
| `menuItem` | Menu option | `label`, `onClick`, `icon` |
| `tooltip` | Hover tooltip | `content`, `position` |
| `popover` | Click popover | `trigger`, `content` |
| `trigger` | Action trigger | `action`, `on` |
| `overlay` | Screen overlay | `visible`, `onClick` |

### Navigation

Navigation elements.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `nav` | Navigation container | `orientation` |
| `navItem` | Navigation link | `label`, `page`, `icon`, `active` |

### Logic & Control

Structural and logic elements.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `if` | Conditional render | `condition` |
| `else` | Else branch | - |
| `each` | Loop over items | `items`, `as`, `key` |
| `for` | Loop (alias) | `each`, `in` |
| `slot` | Content slot | `name`, `target`, `role`, `prompt` |

### Component References

Elements for component composition.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `component` | Component definition | `name`, `ref` |
| `use` | Use component | `component` (+ any props) |

### Drag & Drop

Drag and drop elements.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `sortable` | Sortable container | `items`, `onReorder` |
| `draggable` | Draggable item | `data` |
| `dropZone` | Drop target | `onDrop`, `accept` |

### Special

Special purpose elements.

| Element | Description | Key Attributes |
|---------|-------------|----------------|
| `prompt` | LLM prompt | `content`, `context`, `constraints`, `for` |
| `prefix` | Input prefix | `content` |
| `suffix` | Input suffix | `content` |

---

## Best Practices

1. **Use prompts for complex UI** - When UI is hard to specify declaratively, use prompts
2. **Be explicit for critical UI** - Important forms and flows should be fully defined
3. **Entity binding** - Always bind components to entities for type safety
4. **Consistent references** - Use `@namespace.path` consistently
5. **Constraints in prompts** - Use must/must-not rules to guide LLM
6. **Context inheritance** - Use `context="true"` to set style context for sections

---

## License

MIT

# LLM UI Spec - Cross-Platform Ideation

This document captures ideas for extending LLM UI Spec to support native platforms beyond web (iOS, Android, Windows Forms, Desktop apps).

---

## Overview

The goal is to keep the spec as simple and platform-agnostic as possible, while still enabling code generation for multiple platforms.

**Target Platforms:**
- Web (React, Vue, etc.)
- iOS (SwiftUI, UIKit)
- Android (Jetpack Compose, XML)
- Desktop (Electron, Tauri, WPF, WinUI)
- Windows Forms
- Flutter
- React Native
- .NET MAUI

---

## Core Principle: Simplicity First

Instead of adding platform-specific hints throughout the markup, we:

1. **Keep the spec abstract** - Describe WHAT, not HOW
2. **Use a simple `target` attribute** - Declare target platforms at app level
3. **Express intent, not implementation** - Use `presentation="overlay"` instead of platform-specific modal types
4. **Let the LLM adapt** - Platform-specific behavior goes in the codegen prompt

---

## Element Mapping Across Platforms

| Spec Element | Web | iOS/SwiftUI | Android/Compose | Flutter | WinForms |
|--------------|-----|-------------|-----------------|---------|----------|
| `row` | `flex-row` | `HStack` | `Row` | `Row` | `FlowLayoutPanel` |
| `column` | `flex-col` | `VStack` | `Column` | `Column` | `FlowLayoutPanel` |
| `grid` | `grid` | `LazyVGrid` | `LazyVerticalGrid` | `GridView` | `TableLayoutPanel` |
| `list` | `map()` | `List` | `LazyColumn` | `ListView` | `ListView` |
| `button` | `<button>` | `Button` | `Button` | `ElevatedButton` | `Button` |
| `input` | `<input>` | `TextField` | `TextField` | `TextField` | `TextBox` |
| `modal` | Dialog | `.sheet` | `Dialog` | `showDialog` | `Form.ShowDialog()` |
| `container` | `<div>` | `VStack/HStack` | `Box/Column` | `Container` | `Panel` |

---

## Page/Screen Concept

### The Challenge

Different platforms have different navigation paradigms:

| Platform | Page Equivalent | Navigation Mechanism |
|----------|-----------------|---------------------|
| Web | Route/URL | Browser history, React Router |
| iOS | View/Screen | NavigationStack, TabView, sheets |
| Android | Fragment/Screen | NavHost, Activities, bottom nav |
| Windows Forms | Form/UserControl | Panel switching, new windows |
| Desktop | Window/View | Window management, panels |

### The Solution: Use `<screens>` with Abstract Navigation

```xml
<app name="MyApp" target="web,ios,android,desktop">

  <screens>
    <screen name="Home" initial="true">
      <container prompt="Dashboard" />
    </screen>

    <screen name="Detail" presentation="push">
      <params><param name="id" type="uuid" /></params>
      <container prompt="Detail view" />
    </screen>

    <screen name="Settings" presentation="overlay" size="medium">
      <container prompt="Settings form" />
    </screen>
  </screens>

</app>
```

### Presentation Modes

| Intent | Web | iOS | Android | Desktop |
|--------|-----|-----|---------|---------|
| `push` | navigate | push to stack | navigate | show panel |
| `overlay` | modal dialog | sheet/modal | bottom sheet/dialog | dialog window |
| `replace` | redirect | replace | popBackStack + navigate | replace panel |
| `root` | navigate | popToRoot | clearBackStack | main panel |

---

## Navigation Definition

### Nav Items

```xml
<navigation>

  <!-- Primary nav (tabs on mobile, sidebar on desktop) -->
  <nav name="main" type="primary">
    <item name="home" label="Home" icon="home" screen="@screen.Home" />
    <item name="projects" label="Projects" icon="folder" screen="@screen.Projects" badge="@data.count" />
    <item name="tasks" label="My Tasks" icon="check-square" screen="@screen.MyTasks" />
  </nav>

  <!-- Secondary nav (settings, profile) -->
  <nav name="user" type="secondary">
    <item label="Settings" icon="settings" screen="@screen.Settings" />
    <item label="Logout" icon="log-out" action="@action.logout" />
  </nav>

</navigation>
```

### Platform Translation

| `nav type="primary"` | Platform Rendering |
|----------------------|-------------------|
| Web | Sidebar or top navigation |
| iOS | Tab bar (bottom) |
| Android | Bottom navigation bar |
| Desktop | Sidebar navigation |
| Windows Forms | TreeView or MenuStrip |

### Flows

Define how screens relate:

```xml
<flows>
  <flow name="main" initial="@screen.Dashboard">

    <!-- Root screens (no back button) -->
    <root screens="Dashboard,Projects,MyTasks" />

    <!-- Push navigation (back button appears) -->
    <push from="Projects" to="ProjectDetail" />
    <push from="ProjectDetail" to="TaskDetail" />

    <!-- Overlays -->
    <overlay screen="Settings" dismissible="true" />
    <overlay screen="CreateTask" size="medium" />

  </flow>

  <flow name="auth" initial="@screen.Login">
    <screen name="Login" />
    <screen name="Register" />
    <onComplete goto="@flow.main" />
  </flow>
</flows>
```

### Routes (for deep linking)

```xml
<routes>
  <route path="/" screen="@screen.Dashboard" />
  <route path="/projects/:id" screen="@screen.ProjectDetail" />
  <route path="/tasks/:id" screen="@screen.TaskDetail" />
</routes>
```

Used for:
- Web: URL routing
- iOS: Universal links
- Android: Deep links / App Links
- Desktop: Protocol handlers

---

## Windows Forms Specifics

Windows Forms has no built-in page/screen concept. Implementation patterns:

### Pattern 1: UserControls as Screens (Recommended)

```
MainForm.cs (shell)
├── ContentPanel (where screens load)
└── Screens/
    ├── DashboardScreen.cs (UserControl)
    ├── ProjectsScreen.cs (UserControl)
    └── SettingsScreen.cs (UserControl)
```

```csharp
public void Navigate(UserControl screen)
{
    contentPanel.Controls.Clear();
    screen.Dock = DockStyle.Fill;
    contentPanel.Controls.Add(screen);
}
```

### Windows Forms Element Mapping

| Spec Element | Windows Forms |
|--------------|---------------|
| `<screen>` | `UserControl` |
| `<window>` | `Form` |
| `<menuBar>` | `MenuStrip` |
| `<toolbar>` | `ToolStrip` |
| `<statusBar>` | `StatusStrip` |
| `<treeNav>` | `TreeView` |
| `<dataGrid>` | `DataGridView` |
| `<dialog>` | `Form.ShowDialog()` |
| `<tabs>` | `TabControl` |

---

## Platform-Specific Hints (If Needed)

We decided to avoid complex platform hints, but if absolutely necessary:

### Option A: Simple Target Attribute

```xml
<app name="MyApp" target="web,ios,android">
```

### Option B: Abstract Intent Attributes

```xml
<screen
  name="Settings"
  presentation="overlay"   <!-- How it opens -->
  size="medium"            <!-- Overlay size -->
  dismissible="true"       <!-- Can swipe/click away -->
/>
```

### Option C: Platform Block (only if needed)

```xml
<platforms>
  <ios>
    <screen name="Settings" presentation="pageSheet" />
  </ios>
</platforms>
```

Most apps won't need this.

---

## Complete Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<app name="ProjectHub" target="web,ios,android,desktop">

  <!-- Entities define data models -->
  <entities>
    <entity name="Project">
      <field name="id" type="uuid" />
      <field name="name" type="string" required="true" />
      <field name="status" type="enum" values="active,completed,archived" />
      <field name="tasks" type="ref" ref="@entity.Task" cardinality="many" />
    </entity>

    <entity name="Task">
      <field name="id" type="uuid" />
      <field name="title" type="string" required="true" />
      <field name="status" type="enum" values="todo,in_progress,done" />
      <field name="project" type="ref" ref="@entity.Project" />
    </entity>
  </entities>

  <!-- Layouts define screen structure -->
  <layouts>
    <layout name="AppShell">
      <slot name="nav" role="chrome" position="left" width="240"
            prompt="Sidebar with logo and navigation" />
      <column grow="true">
        <slot name="header" role="chrome" height="56"
              prompt="Top bar with breadcrumbs and actions" />
        <slot name="content" role="content" grow="true" scroll="true" />
      </column>
    </layout>
  </layouts>

  <!-- Reusable components -->
  <components>
    <component name="ProjectCard">
      <props>
        <prop name="project" type="@entity.Project" required="true" />
      </props>
      <container variant="card" padding="md" interactive="true"
                 prompt="Project card with name, status badge, and task count" />
    </component>

    <component name="TaskRow">
      <props>
        <prop name="task" type="@entity.Task" required="true" />
      </props>
      <row padding="sm" gap="md" align="center">
        <checkbox checked="@prop.task.status == 'done'" />
        <text grow="true">@prop.task.title</text>
        <badge value="@prop.task.status" />
      </row>
    </component>
  </components>

  <!-- Navigation structure -->
  <navigation>
    <nav name="main" type="primary">
      <item name="dashboard" label="Dashboard" icon="home" screen="@screen.Dashboard" />
      <item name="projects" label="Projects" icon="folder" screen="@screen.Projects" />
      <item name="tasks" label="My Tasks" icon="check-square" screen="@screen.MyTasks" />
    </nav>

    <flows>
      <flow name="main" initial="@screen.Dashboard">
        <root screens="Dashboard,Projects,MyTasks" />
        <push from="Projects" to="ProjectDetail" />
        <push from="ProjectDetail" to="TaskDetail" />
        <overlay screen="CreateProject" size="medium" />
        <overlay screen="CreateTask" size="medium" />
      </flow>
    </flows>

    <routes>
      <route path="/" screen="@screen.Dashboard" />
      <route path="/projects" screen="@screen.Projects" />
      <route path="/projects/:id" screen="@screen.ProjectDetail" />
      <route path="/tasks/:id" screen="@screen.TaskDetail" />
    </routes>

    <guards>
      <guard name="auth" redirect="@screen.Login" />
    </guards>
  </navigation>

  <!-- Screen definitions -->
  <screens>

    <screen name="Dashboard" layout="@layout.AppShell" initial="true" auth="required">
      <slot target="@layout.AppShell.content">
        <column padding="lg" gap="lg">
          <text variant="heading2">Welcome back</text>

          <grid columns="3" gap="md">
            <stat label="Active Projects" value="@data.stats.active" />
            <stat label="Tasks Due Today" value="@data.stats.dueToday" />
            <stat label="Completed" value="@data.stats.completed" />
          </grid>

          <row gap="lg">
            <column grow="true" gap="md">
              <text variant="heading3">Recent Projects</text>
              <for each="project" in="@data.recentProjects">
                <use component="@component.ProjectCard" project="@project" />
              </for>
            </column>

            <column width="350" gap="md">
              <text variant="heading3">My Tasks</text>
              <container variant="card">
                <for each="task" in="@data.myTasks">
                  <use component="@component.TaskRow" task="@task" />
                </for>
              </container>
            </column>
          </row>
        </column>
      </slot>
    </screen>

    <screen name="Projects" layout="@layout.AppShell" auth="required">
      <slot target="@layout.AppShell.content">
        <column padding="lg" gap="md">
          <row justify="between" align="center">
            <text variant="heading2">Projects</text>
            <button onClick="present(@screen.CreateProject)">New Project</button>
          </row>

          <grid columns="3" gap="md">
            <for each="project" in="@data.projects">
              <use
                component="@component.ProjectCard"
                project="@project"
                onClick="navigate(@screen.ProjectDetail, { id: @project.id })"
              />
            </for>
          </grid>
        </column>
      </slot>
    </screen>

    <screen name="ProjectDetail" layout="@layout.AppShell" auth="required">
      <params>
        <param name="id" type="uuid" required="true" />
      </params>
      <data>
        <query name="project" type="@entity.Project" filter="id == @param.id" />
      </data>

      <slot target="@layout.AppShell.content">
        <column padding="lg" gap="lg">
          <row justify="between" align="center">
            <text variant="heading2">@data.project.name</text>
            <button onClick="present(@screen.CreateTask)">Add Task</button>
          </row>

          <container variant="card">
            <for each="task" in="@data.project.tasks">
              <use
                component="@component.TaskRow"
                task="@task"
                onClick="navigate(@screen.TaskDetail, { id: @task.id })"
              />
            </for>
          </container>
        </column>
      </slot>
    </screen>

    <screen name="TaskDetail" presentation="overlay" size="large" dismissible="true">
      <params>
        <param name="id" type="uuid" required="true" />
      </params>
      <data>
        <query name="task" type="@entity.Task" filter="id == @param.id" />
      </data>

      <column padding="lg" gap="md">
        <row justify="between">
          <text variant="heading2">@data.task.title</text>
          <button icon="x" variant="ghost" onClick="dismiss()" />
        </row>

        <form data="@data.task" onSubmit="@action.updateTask">
          <column gap="md">
            <input label="Title" bind="title" required="true" />
            <select label="Status" bind="status">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button type="submit">Save</button>
          </column>
        </form>
      </column>
    </screen>

    <screen name="CreateProject" presentation="overlay" size="medium">
      <form onSubmit="@action.createProject">
        <column padding="lg" gap="md">
          <text variant="heading2">Create Project</text>
          <input label="Project Name" bind="name" required="true" />
          <row justify="end" gap="sm">
            <button variant="outline" onClick="dismiss()">Cancel</button>
            <button type="submit">Create</button>
          </row>
        </column>
      </form>
    </screen>

  </screens>

  <!-- Dialogs (alternative to overlay screens) -->
  <dialogs>
    <dialog name="ConfirmDelete" title="Confirm" size="small">
      <column padding="md" gap="md">
        <text>Are you sure you want to delete this?</text>
        <row justify="end" gap="sm">
          <button variant="outline" onClick="closeDialog(false)">Cancel</button>
          <button variant="danger" onClick="closeDialog(true)">Delete</button>
        </row>
      </column>
    </dialog>
  </dialogs>

</app>
```

---

## Platform-Specific Visual Representation

```
┌─────────────────────────────────────────────────────────────────┐
│                           WEB                                    │
│  ┌─────────┬───────────────────────────────────────────────┐    │
│  │ Sidebar │  /projects/123                                │    │
│  │ [Home]  │  ┌─────────────────────────────────────┐      │    │
│  │ [Proj]◄─│  │ ProjectDetail                       │      │    │
│  │ [Tasks] │  │                                     │      │    │
│  │         │  │                    [Modal:Task]     │      │    │
│  └─────────┴──┴─────────────────────────────────────┴──────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           iOS                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ◄ Projects              Project Name              •••    │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │                    ProjectDetail                         │   │
│  │                                                          │   │
│  │         ┌────────────────────────────────┐              │   │
│  │         │ ═══════════════════════════════ │  ← Sheet     │   │
│  │         │       TaskDetail                │              │   │
│  │         │                                 │              │   │
│  ├─────────┴────────────────────────────────┴───────────────┤   │
│  │  [Home]    [Projects]    [Tasks]    [More]               │   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Android                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ← Project Name                                    ⋮      │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │                    ProjectDetail                         │   │
│  │                                                          │   │
│  │    ┌─────────────────────────────────────────────────┐   │   │
│  │    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │   │
│  │    │           TaskDetail (Bottom Sheet)             │   │   │
│  │    │                                                 │   │   │
│  ├────┴─────────────────────────────────────────────────┴───┤   │
│  │  [Home]    [Projects]    [Tasks]                         │   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Desktop                                   │
│  ┌─────────┬────────────────────────────────┬───────────────┐   │
│  │ [=] Nav │  ProjectDetail            [-][□][×]            │   │
│  ├─────────┼────────────────────────────────┴───────────────┤   │
│  │ Home    │                                                │   │
│  │ Projects│◄                               ┌─────────────┐ │   │
│  │ Tasks   │                                │ TaskDetail  │ │   │
│  │         │                                │  (Dialog)   │ │   │
│  │─────────│                                │             │ │   │
│  │ Settings│                                └─────────────┘ │   │
│  └─────────┴────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Windows Forms                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ File  Edit  View  Help                                   │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ [Save] [Print] [Refresh]                                 │   │
│  ├─────────┬────────────────────────────────────────────────┤   │
│  │ ▼ Home  │                                                │   │
│  │ ▼ Proj  │        ProjectDetail (UserControl)             │   │
│  │   ├ A   │                                                │   │
│  │   └ B   │                        ┌─────────────────┐     │   │
│  │ ▼ Tasks │                        │ TaskDetail Form │     │   │
│  │         │                        │   (ShowDialog)  │     │   │
│  ├─────────┴────────────────────────┴─────────────────┴─────┤   │
│  │ Ready                                      User: Admin   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

**Key decisions:**

1. Use `target="web,ios,android,desktop"` at app level
2. Use `<screens>` instead of `<pages>` for cross-platform compatibility
3. Use abstract `presentation` attribute (`push`, `overlay`, `replace`)
4. Define navigation structure in `<navigation>` block
5. Keep routes for deep linking (primarily web, but also mobile)
6. Let the LLM/codegen handle platform-specific implementation details

**Benefits:**

- Simple, clean markup
- No platform-specific clutter in the spec
- Same spec generates native code for all platforms
- LLM adapts to platform conventions automatically

---

## Alternative: Platform-Specific Spec Files

While the universal spec approach above works well for simple apps, complex applications may benefit from **separate spec files per platform**. This improves readability and allows platform-specific optimizations.

### File Structure

```
project/
├── core/
│   ├── entities.xml      # Shared data models
│   └── components.xml    # Shared component definitions
├── web/
│   └── app.xml           # Web-specific screens, routes, modals
├── mobile/
│   └── app.xml           # iOS/Android screens, tabs, sheets
└── desktop/
    └── app.xml           # Windows/macOS windows, menus, panels
```

### Shared Core: entities.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<core xmlns="http://llm-ui-spec.org/core">

  <entities>
    <entity name="Project">
      <field name="id" type="uuid" />
      <field name="name" type="string" required="true" />
      <field name="description" type="text" />
      <field name="status" type="enum" values="active,completed,archived" default="active" />
      <field name="createdAt" type="datetime" />
      <field name="owner" type="ref" ref="@entity.User" />
    </entity>

    <entity name="Task">
      <field name="id" type="uuid" />
      <field name="title" type="string" required="true" />
      <field name="description" type="text" />
      <field name="status" type="enum" values="todo,in_progress,done" default="todo" />
      <field name="priority" type="enum" values="low,medium,high" default="medium" />
      <field name="dueDate" type="date" />
      <field name="project" type="ref" ref="@entity.Project" />
      <field name="assignee" type="ref" ref="@entity.User" />
    </entity>

    <entity name="User">
      <field name="id" type="uuid" />
      <field name="email" type="email" required="true" unique="true" />
      <field name="name" type="string" required="true" />
      <field name="avatar" type="url" />
      <field name="role" type="enum" values="admin,member,guest" default="member" />
    </entity>
  </entities>

</core>
```

### Shared Core: components.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<core xmlns="http://llm-ui-spec.org/core">

  <components>

    <component name="ProjectCard">
      <props>
        <prop name="project" type="@entity.Project" required="true" />
        <prop name="onClick" type="action" />
      </props>
      <container variant="card" padding="md" interactive="true">
        <column gap="sm">
          <row justify="between" align="center">
            <text variant="heading4">@prop.project.name</text>
            <badge value="@prop.project.status" />
          </row>
          <text variant="body2" color="muted" lines="2">
            @prop.project.description
          </text>
          <row gap="sm" align="center">
            <icon name="calendar" size="sm" />
            <text variant="caption">@format.date(@prop.project.createdAt)</text>
          </row>
        </column>
      </container>
    </component>

    <component name="TaskRow">
      <props>
        <prop name="task" type="@entity.Task" required="true" />
        <prop name="onToggle" type="action" />
        <prop name="onClick" type="action" />
      </props>
      <row padding="sm" gap="md" align="center" interactive="true">
        <checkbox
          checked="@prop.task.status == 'done'"
          onChange="@prop.onToggle"
        />
        <column grow="true" gap="xs">
          <text strikethrough="@prop.task.status == 'done'">
            @prop.task.title
          </text>
          <row gap="sm" visible="@prop.task.dueDate">
            <icon name="clock" size="xs" color="muted" />
            <text variant="caption" color="muted">
              @format.date(@prop.task.dueDate)
            </text>
          </row>
        </column>
        <badge value="@prop.task.priority" size="sm" />
      </row>
    </component>

    <component name="UserAvatar">
      <props>
        <prop name="user" type="@entity.User" required="true" />
        <prop name="size" type="enum" values="sm,md,lg" default="md" />
      </props>
      <image
        src="@prop.user.avatar"
        fallback="@prop.user.name | initials"
        shape="circle"
        size="@prop.size"
      />
    </component>

    <component name="EmptyState">
      <props>
        <prop name="icon" type="string" default="inbox" />
        <prop name="title" type="string" required="true" />
        <prop name="description" type="string" />
        <prop name="action" type="string" />
        <prop name="onAction" type="action" />
      </props>
      <column align="center" padding="xl" gap="md">
        <icon name="@prop.icon" size="xl" color="muted" />
        <text variant="heading4">@prop.title</text>
        <text variant="body2" color="muted" visible="@prop.description">
          @prop.description
        </text>
        <button variant="primary" onClick="@prop.onAction" visible="@prop.action">
          @prop.action
        </button>
      </column>
    </component>

  </components>

</core>
```

---

### Web: app.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<app name="ProjectHub" platform="web"
     xmlns="http://llm-ui-spec.org/web"
     xmlns:prompt="http://llm-ui-spec.org/prompt">

  <import src="../core/entities.xml" />
  <import src="../core/components.xml" />

  <!-- Web-specific layout with sidebar -->
  <layouts>
    <layout name="AppShell">
      <row height="100vh">
        <slot name="sidebar" role="chrome" width="240"
              prompt="Collapsible sidebar with logo, navigation, and user menu" />
        <column grow="true">
          <slot name="header" role="chrome" height="56"
                prompt="Top bar with breadcrumbs, search, and notifications" />
          <slot name="content" role="content" grow="true" scroll="true" />
        </column>
      </row>
    </layout>

    <layout name="AuthLayout">
      <row height="100vh">
        <column width="50%" background="gradient"
                prompt="Marketing panel with logo and feature highlights" />
        <column width="50%" align="center" justify="center">
          <slot name="form" maxWidth="400" />
        </column>
      </row>
    </layout>
  </layouts>

  <!-- URL-based routing -->
  <routes>
    <route path="/" page="@page.Dashboard" />
    <route path="/projects" page="@page.Projects" />
    <route path="/projects/:id" page="@page.ProjectDetail" />
    <route path="/tasks" page="@page.MyTasks" />
    <route path="/settings" page="@page.Settings" />
    <route path="/login" page="@page.Login" auth="guest" />
    <route path="/register" page="@page.Register" auth="guest" />
  </routes>

  <!-- Page definitions -->
  <pages>

    <page name="Dashboard" route="/" layout="@layout.AppShell" auth="required">
      <slot target="content">
        <column padding="lg" gap="lg">
          <row justify="between" align="center">
            <text variant="heading2">Dashboard</text>
            <button onClick="openModal(@modal.CreateProject)">
              New Project
            </button>
          </row>

          <grid columns="4" gap="md">
            <stat label="Active Projects" value="@data.stats.active" icon="folder" />
            <stat label="Tasks Due Today" value="@data.stats.dueToday" icon="alert-circle" />
            <stat label="In Progress" value="@data.stats.inProgress" icon="clock" />
            <stat label="Completed" value="@data.stats.completed" icon="check-circle" />
          </grid>

          <grid columns="2" gap="lg">
            <column gap="md">
              <text variant="heading3">Recent Projects</text>
              <for each="project" in="@data.recentProjects">
                <use
                  component="@component.ProjectCard"
                  project="@project"
                  onClick="navigate('/projects/' + @project.id)"
                />
              </for>
            </column>

            <column gap="md">
              <text variant="heading3">My Tasks</text>
              <container variant="card">
                <for each="task" in="@data.myTasks" empty="@component.EmptyState">
                  <use
                    component="@component.TaskRow"
                    task="@task"
                    onClick="openModal(@modal.TaskDetail, { id: @task.id })"
                  />
                </for>
              </container>
            </column>
          </grid>
        </column>
      </slot>
    </page>

    <page name="Projects" route="/projects" layout="@layout.AppShell" auth="required">
      <slot target="content">
        <column padding="lg" gap="md">
          <row justify="between" align="center">
            <text variant="heading2">Projects</text>
            <row gap="sm">
              <search placeholder="Search projects..." onSearch="@action.search" />
              <button onClick="openModal(@modal.CreateProject)">New Project</button>
            </row>
          </row>

          <tabs>
            <tab name="all" label="All">
              <grid columns="3" gap="md" padding="md">
                <for each="project" in="@data.projects">
                  <use
                    component="@component.ProjectCard"
                    project="@project"
                    onClick="navigate('/projects/' + @project.id)"
                  />
                </for>
              </grid>
            </tab>
            <tab name="active" label="Active">
              <grid columns="3" gap="md" padding="md">
                <for each="project" in="@data.activeProjects">
                  <use component="@component.ProjectCard" project="@project" />
                </for>
              </grid>
            </tab>
            <tab name="archived" label="Archived">
              <grid columns="3" gap="md" padding="md">
                <for each="project" in="@data.archivedProjects">
                  <use component="@component.ProjectCard" project="@project" />
                </for>
              </grid>
            </tab>
          </tabs>
        </column>
      </slot>
    </page>

    <page name="ProjectDetail" route="/projects/:id" layout="@layout.AppShell" auth="required">
      <params>
        <param name="id" type="uuid" required="true" />
      </params>
      <data>
        <query name="project" entity="@entity.Project" filter="id == @param.id" include="tasks,owner" />
      </data>

      <slot target="content">
        <column padding="lg" gap="lg">
          <row justify="between" align="center">
            <column gap="xs">
              <text variant="heading2">@data.project.name</text>
              <text variant="body2" color="muted">@data.project.description</text>
            </column>
            <row gap="sm">
              <button variant="outline" onClick="openModal(@modal.EditProject)">Edit</button>
              <button onClick="openModal(@modal.CreateTask)">Add Task</button>
            </row>
          </row>

          <row gap="lg">
            <column grow="true" gap="md">
              <container variant="card">
                <column>
                  <row padding="md" justify="between" align="center" borderBottom="true">
                    <text variant="heading4">Tasks</text>
                    <select value="@state.filter" onChange="@action.setFilter">
                      <option value="all">All</option>
                      <option value="todo">To Do</option>
                      <option value="done">Completed</option>
                    </select>
                  </row>
                  <for each="task" in="@data.project.tasks | filter(@state.filter)">
                    <use
                      component="@component.TaskRow"
                      task="@task"
                      onToggle="@action.toggleTask(@task.id)"
                      onClick="openModal(@modal.TaskDetail, { id: @task.id })"
                    />
                  </for>
                </column>
              </container>
            </column>

            <column width="300" gap="md">
              <container variant="card" padding="md">
                <column gap="md">
                  <text variant="heading4">Details</text>
                  <row gap="sm" align="center">
                    <text variant="label">Status:</text>
                    <badge value="@data.project.status" />
                  </row>
                  <row gap="sm" align="center">
                    <text variant="label">Owner:</text>
                    <use component="@component.UserAvatar" user="@data.project.owner" size="sm" />
                    <text>@data.project.owner.name</text>
                  </row>
                  <row gap="sm" align="center">
                    <text variant="label">Created:</text>
                    <text>@format.date(@data.project.createdAt)</text>
                  </row>
                </column>
              </container>
            </column>
          </row>
        </column>
      </slot>
    </page>

    <page name="Login" route="/login" layout="@layout.AuthLayout" auth="guest">
      <slot target="form">
        <form onSubmit="@action.login">
          <column gap="md">
            <text variant="heading2">Welcome back</text>
            <text variant="body2" color="muted">Sign in to your account</text>

            <input type="email" label="Email" bind="email" required="true" />
            <input type="password" label="Password" bind="password" required="true" />

            <row justify="between" align="center">
              <checkbox label="Remember me" bind="remember" />
              <link href="/forgot-password">Forgot password?</link>
            </row>

            <button type="submit" fullWidth="true">Sign In</button>

            <divider label="or" />

            <button variant="outline" fullWidth="true" onClick="@action.loginWithGoogle">
              <icon name="google" /> Continue with Google
            </button>

            <text variant="body2" align="center">
              Don't have an account? <link href="/register">Sign up</link>
            </text>
          </column>
        </form>
      </slot>
    </page>

  </pages>

  <!-- Modal dialogs (web-specific overlays) -->
  <modals>

    <modal name="CreateProject" title="Create Project" size="medium">
      <form onSubmit="@action.createProject" onSuccess="closeModal()">
        <column padding="lg" gap="md">
          <input label="Project Name" bind="name" required="true" autoFocus="true" />
          <textarea label="Description" bind="description" rows="3" />
          <select label="Status" bind="status" default="active">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <row justify="end" gap="sm">
            <button variant="outline" onClick="closeModal()">Cancel</button>
            <button type="submit">Create Project</button>
          </row>
        </column>
      </form>
    </modal>

    <modal name="TaskDetail" title="Task Details" size="large">
      <params>
        <param name="id" type="uuid" required="true" />
      </params>
      <data>
        <query name="task" entity="@entity.Task" filter="id == @param.id" />
      </data>

      <form data="@data.task" onSubmit="@action.updateTask">
        <column padding="lg" gap="md">
          <input label="Title" bind="title" required="true" />
          <textarea label="Description" bind="description" rows="4" />

          <grid columns="2" gap="md">
            <select label="Status" bind="status">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select label="Priority" bind="priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </grid>

          <datepicker label="Due Date" bind="dueDate" />

          <row justify="between">
            <button variant="danger" onClick="@action.deleteTask">Delete</button>
            <row gap="sm">
              <button variant="outline" onClick="closeModal()">Cancel</button>
              <button type="submit">Save Changes</button>
            </row>
          </row>
        </column>
      </form>
    </modal>

    <modal name="ConfirmDelete" title="Confirm Delete" size="small">
      <column padding="lg" gap="md">
        <text>Are you sure you want to delete this item? This action cannot be undone.</text>
        <row justify="end" gap="sm">
          <button variant="outline" onClick="closeModal(false)">Cancel</button>
          <button variant="danger" onClick="closeModal(true)">Delete</button>
        </row>
      </column>
    </modal>

  </modals>

</app>
```

---

### Mobile: app.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<app name="ProjectHub" platform="mobile"
     xmlns="http://llm-ui-spec.org/mobile"
     xmlns:prompt="http://llm-ui-spec.org/prompt">

  <import src="../core/entities.xml" />
  <import src="../core/components.xml" />

  <!-- Tab-based navigation (iOS TabView / Android BottomNav) -->
  <navigation type="tabs">
    <tab name="home" label="Home" icon="home" screen="@screen.Dashboard" />
    <tab name="projects" label="Projects" icon="folder" screen="@screen.Projects" />
    <tab name="tasks" label="Tasks" icon="check-square" screen="@screen.MyTasks" />
    <tab name="profile" label="Profile" icon="user" screen="@screen.Profile" />
  </navigation>

  <!-- Screen definitions -->
  <screens>

    <screen name="Dashboard" initial="true">
      <column padding="md" gap="lg" safeArea="true">
        <text variant="largeTitle">Dashboard</text>

        <scroll direction="horizontal" gap="md">
          <stat label="Active" value="@data.stats.active" compact="true" />
          <stat label="Due Today" value="@data.stats.dueToday" compact="true" />
          <stat label="Done" value="@data.stats.completed" compact="true" />
        </scroll>

        <column gap="md">
          <row justify="between" align="center">
            <text variant="headline">Recent Projects</text>
            <button variant="text" onClick="switchTab('projects')">See All</button>
          </row>

          <for each="project" in="@data.recentProjects | limit(3)">
            <use
              component="@component.ProjectCard"
              project="@project"
              onClick="push(@screen.ProjectDetail, { id: @project.id })"
            />
          </for>
        </column>

        <column gap="md">
          <row justify="between" align="center">
            <text variant="headline">My Tasks</text>
            <button variant="text" onClick="switchTab('tasks')">See All</button>
          </row>

          <container variant="card">
            <for each="task" in="@data.myTasks | limit(5)">
              <use
                component="@component.TaskRow"
                task="@task"
                onToggle="@action.toggleTask(@task.id)"
                onClick="presentSheet(@sheet.TaskDetail, { id: @task.id })"
              />
            </for>
          </container>
        </column>
      </column>

      <floatingButton icon="plus" onClick="presentSheet(@sheet.QuickAdd)" />
    </screen>

    <screen name="Projects">
      <column safeArea="true">
        <row padding="md" justify="between" align="center">
          <text variant="largeTitle">Projects</text>
          <button icon="plus" variant="primary" onClick="presentSheet(@sheet.CreateProject)" />
        </row>

        <search placeholder="Search projects..." onSearch="@action.search" padding="md" />

        <segmentedControl value="@state.filter" onChange="@action.setFilter">
          <segment value="all" label="All" />
          <segment value="active" label="Active" />
          <segment value="archived" label="Archived" />
        </segmentedControl>

        <list data="@data.projects | filter(@state.filter)" refreshable="true" onRefresh="@action.refresh">
          <for each="project" in="@data">
            <use
              component="@component.ProjectCard"
              project="@project"
              onClick="push(@screen.ProjectDetail, { id: @project.id })"
              swipeActions="true"
            >
              <swipeAction side="right" icon="trash" color="danger" onClick="@action.delete(@project.id)" />
              <swipeAction side="right" icon="archive" onClick="@action.archive(@project.id)" />
            </use>
          </for>
        </list>
      </column>
    </screen>

    <screen name="ProjectDetail">
      <params>
        <param name="id" type="uuid" required="true" />
      </params>
      <data>
        <query name="project" entity="@entity.Project" filter="id == @param.id" include="tasks" />
      </data>

      <navigationBar
        title="@data.project.name"
        backButton="true"
        rightButtons="[{ icon: 'edit', onClick: presentSheet(@sheet.EditProject) }]"
      />

      <column padding="md" gap="md">
        <container variant="card" padding="md">
          <column gap="sm">
            <text variant="body">@data.project.description</text>
            <row gap="md">
              <badge value="@data.project.status" />
              <text variant="caption" color="muted">
                @format.date(@data.project.createdAt)
              </text>
            </row>
          </column>
        </container>

        <row justify="between" align="center">
          <text variant="headline">Tasks</text>
          <button icon="plus" variant="text" onClick="presentSheet(@sheet.CreateTask)" />
        </row>

        <list data="@data.project.tasks" empty="@component.EmptyState">
          <for each="task" in="@data">
            <use
              component="@component.TaskRow"
              task="@task"
              onToggle="@action.toggleTask(@task.id)"
              onClick="presentSheet(@sheet.TaskDetail, { id: @task.id })"
            />
          </for>
        </list>
      </column>
    </screen>

    <screen name="MyTasks">
      <column safeArea="true">
        <text variant="largeTitle" padding="md">My Tasks</text>

        <segmentedControl value="@state.view" onChange="@action.setView" padding="md">
          <segment value="today" label="Today" />
          <segment value="upcoming" label="Upcoming" />
          <segment value="all" label="All" />
        </segmentedControl>

        <list data="@data.tasks | view(@state.view)" refreshable="true" grouped="true" groupBy="dueDate">
          <for each="task" in="@data">
            <use
              component="@component.TaskRow"
              task="@task"
              onToggle="@action.toggleTask(@task.id)"
              onClick="presentSheet(@sheet.TaskDetail, { id: @task.id })"
            />
          </for>
        </list>
      </column>
    </screen>

    <screen name="Profile">
      <column padding="md" gap="lg" safeArea="true">
        <column align="center" gap="md">
          <use component="@component.UserAvatar" user="@data.currentUser" size="lg" />
          <text variant="title">@data.currentUser.name</text>
          <text variant="body" color="muted">@data.currentUser.email</text>
        </column>

        <list>
          <listItem icon="settings" label="Settings" onClick="push(@screen.Settings)" chevron="true" />
          <listItem icon="bell" label="Notifications" onClick="push(@screen.Notifications)" chevron="true" />
          <listItem icon="help-circle" label="Help & Support" onClick="push(@screen.Help)" chevron="true" />
          <listItem icon="log-out" label="Sign Out" onClick="@action.logout" color="danger" />
        </list>
      </column>
    </screen>

    <screen name="Settings">
      <navigationBar title="Settings" backButton="true" />

      <list grouped="true">
        <listSection header="Appearance">
          <listItem icon="moon" label="Dark Mode">
            <switch value="@settings.darkMode" onChange="@action.toggleDarkMode" />
          </listItem>
          <listItem icon="type" label="Text Size" onClick="push(@screen.TextSize)" chevron="true" />
        </listSection>

        <listSection header="Notifications">
          <listItem icon="bell" label="Push Notifications">
            <switch value="@settings.pushEnabled" onChange="@action.togglePush" />
          </listItem>
          <listItem icon="mail" label="Email Notifications">
            <switch value="@settings.emailEnabled" onChange="@action.toggleEmail" />
          </listItem>
        </listSection>

        <listSection header="Data">
          <listItem icon="download" label="Export Data" onClick="@action.exportData" />
          <listItem icon="trash" label="Delete Account" color="danger" onClick="@action.deleteAccount" />
        </listSection>
      </list>
    </screen>

  </screens>

  <!-- Bottom sheets (iOS sheets / Android bottom sheets) -->
  <sheets>

    <sheet name="CreateProject" height="auto" dismissible="true">
      <column padding="lg" gap="md">
        <row justify="between" align="center">
          <text variant="headline">New Project</text>
          <button icon="x" variant="ghost" onClick="dismissSheet()" />
        </row>

        <form onSubmit="@action.createProject" onSuccess="dismissSheet()">
          <column gap="md">
            <input label="Project Name" bind="name" required="true" />
            <textarea label="Description" bind="description" rows="3" />
            <button type="submit" fullWidth="true">Create Project</button>
          </column>
        </form>
      </column>
    </sheet>

    <sheet name="TaskDetail" height="large" dismissible="true">
      <params>
        <param name="id" type="uuid" required="true" />
      </params>
      <data>
        <query name="task" entity="@entity.Task" filter="id == @param.id" />
      </data>

      <column padding="lg" gap="md">
        <row justify="between" align="center">
          <text variant="headline">Edit Task</text>
          <button icon="x" variant="ghost" onClick="dismissSheet()" />
        </row>

        <form data="@data.task" onSubmit="@action.updateTask" onSuccess="dismissSheet()">
          <column gap="md">
            <input label="Title" bind="title" required="true" />
            <textarea label="Description" bind="description" rows="3" />

            <select label="Status" bind="status">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select label="Priority" bind="priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <datepicker label="Due Date" bind="dueDate" />

            <button type="submit" fullWidth="true">Save Changes</button>
            <button variant="danger" fullWidth="true" onClick="@action.deleteTask">
              Delete Task
            </button>
          </column>
        </form>
      </column>
    </sheet>

    <sheet name="QuickAdd" height="auto" dismissible="true">
      <column padding="lg" gap="md">
        <text variant="headline">Quick Add</text>
        <button icon="folder-plus" fullWidth="true" onClick="dismissSheet(); presentSheet(@sheet.CreateProject)">
          New Project
        </button>
        <button icon="check-square" fullWidth="true" onClick="dismissSheet(); presentSheet(@sheet.CreateTask)">
          New Task
        </button>
      </column>
    </sheet>

  </sheets>

  <!-- Alert dialogs -->
  <alerts>
    <alert name="ConfirmDelete" title="Delete Item?" destructive="true">
      <text>This action cannot be undone.</text>
      <action label="Cancel" role="cancel" />
      <action label="Delete" role="destructive" onClick="@callback" />
    </alert>

    <alert name="Error" title="Error">
      <text>@param.message</text>
      <action label="OK" role="default" />
    </alert>
  </alerts>

</app>
```

---

### Desktop: app.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<app name="ProjectHub" platform="desktop"
     xmlns="http://llm-ui-spec.org/desktop"
     xmlns:prompt="http://llm-ui-spec.org/prompt">

  <import src="../core/entities.xml" />
  <import src="../core/components.xml" />

  <!-- Main application window -->
  <window name="MainWindow" title="ProjectHub" width="1200" height="800" minWidth="800" minHeight="600">

    <!-- Menu bar (macOS/Windows) -->
    <menuBar>
      <menu label="File">
        <menuItem label="New Project" shortcut="Cmd+N" onClick="openDialog(@dialog.CreateProject)" />
        <menuItem label="New Task" shortcut="Cmd+Shift+N" onClick="openDialog(@dialog.CreateTask)" />
        <separator />
        <menuItem label="Import..." onClick="@action.import" />
        <menuItem label="Export..." onClick="@action.export" />
        <separator />
        <menuItem label="Settings" shortcut="Cmd+," onClick="openDialog(@dialog.Settings)" />
        <separator />
        <menuItem label="Quit" shortcut="Cmd+Q" onClick="@action.quit" />
      </menu>

      <menu label="Edit">
        <menuItem label="Undo" shortcut="Cmd+Z" onClick="@action.undo" />
        <menuItem label="Redo" shortcut="Cmd+Shift+Z" onClick="@action.redo" />
        <separator />
        <menuItem label="Cut" shortcut="Cmd+X" onClick="@action.cut" />
        <menuItem label="Copy" shortcut="Cmd+C" onClick="@action.copy" />
        <menuItem label="Paste" shortcut="Cmd+V" onClick="@action.paste" />
        <separator />
        <menuItem label="Select All" shortcut="Cmd+A" onClick="@action.selectAll" />
      </menu>

      <menu label="View">
        <menuItem label="Toggle Sidebar" shortcut="Cmd+S" onClick="@action.toggleSidebar" />
        <menuItem label="Toggle Details" shortcut="Cmd+D" onClick="@action.toggleDetails" />
        <separator />
        <menu label="Sort By">
          <menuItem label="Name" onClick="@action.sortBy('name')" />
          <menuItem label="Date Created" onClick="@action.sortBy('createdAt')" />
          <menuItem label="Status" onClick="@action.sortBy('status')" />
        </menu>
        <separator />
        <menuItem label="Refresh" shortcut="Cmd+R" onClick="@action.refresh" />
      </menu>

      <menu label="Help">
        <menuItem label="Documentation" onClick="@action.openDocs" />
        <menuItem label="Keyboard Shortcuts" shortcut="Cmd+/" onClick="openDialog(@dialog.Shortcuts)" />
        <separator />
        <menuItem label="About ProjectHub" onClick="openDialog(@dialog.About)" />
      </menu>
    </menuBar>

    <!-- Toolbar -->
    <toolbar>
      <toolbarItem icon="sidebar" tooltip="Toggle Sidebar" onClick="@action.toggleSidebar" />
      <separator />
      <toolbarItem icon="plus" label="New" onClick="openDialog(@dialog.CreateProject)" />
      <toolbarItem icon="refresh" label="Refresh" onClick="@action.refresh" />
      <spacer />
      <search placeholder="Search..." onSearch="@action.search" width="200" />
      <toolbarItem icon="bell" tooltip="Notifications" badge="@data.unreadCount" onClick="@action.showNotifications" />
      <toolbarItem icon="user" tooltip="Account" onClick="@action.showAccountMenu" />
    </toolbar>

    <!-- Main content area -->
    <row grow="true">

      <!-- Sidebar navigation -->
      <panel name="sidebar" width="220" collapsible="true" collapsed="@state.sidebarCollapsed">
        <column padding="md" gap="sm">
          <text variant="overline" color="muted">WORKSPACE</text>

          <navItem icon="home" label="Dashboard" selected="@state.view == 'dashboard'"
                   onClick="@action.setView('dashboard')" />
          <navItem icon="folder" label="Projects" selected="@state.view == 'projects'"
                   onClick="@action.setView('projects')" badge="@data.projectCount" />
          <navItem icon="check-square" label="My Tasks" selected="@state.view == 'tasks'"
                   onClick="@action.setView('tasks')" badge="@data.tasksDueToday" />

          <spacer />

          <text variant="overline" color="muted">RECENT</text>
          <for each="project" in="@data.recentProjects | limit(5)">
            <navItem
              icon="folder"
              label="@project.name"
              onClick="@action.openProject(@project.id)"
              contextMenu="@contextMenu.ProjectItem"
            />
          </for>

          <spacer />

          <navItem icon="settings" label="Settings" onClick="openDialog(@dialog.Settings)" />
        </column>
      </panel>

      <!-- Main panel -->
      <panel name="main" grow="true">
        <switch value="@state.view">

          <case value="dashboard">
            <column padding="lg" gap="lg">
              <row justify="between" align="center">
                <text variant="heading2">Dashboard</text>
                <button onClick="openDialog(@dialog.CreateProject)">New Project</button>
              </row>

              <grid columns="4" gap="md">
                <stat label="Active Projects" value="@data.stats.active" icon="folder" />
                <stat label="Tasks Due Today" value="@data.stats.dueToday" icon="alert-circle" />
                <stat label="In Progress" value="@data.stats.inProgress" icon="clock" />
                <stat label="Completed" value="@data.stats.completed" icon="check-circle" />
              </grid>

              <grid columns="2" gap="lg">
                <container variant="card">
                  <column>
                    <row padding="md" borderBottom="true" justify="between">
                      <text variant="heading4">Recent Projects</text>
                      <button variant="text" onClick="@action.setView('projects')">View All</button>
                    </row>
                    <for each="project" in="@data.recentProjects">
                      <use
                        component="@component.ProjectCard"
                        project="@project"
                        onClick="@action.openProject(@project.id)"
                        onDoubleClick="openDialog(@dialog.EditProject, { id: @project.id })"
                        contextMenu="@contextMenu.ProjectItem"
                      />
                    </for>
                  </column>
                </container>

                <container variant="card">
                  <column>
                    <row padding="md" borderBottom="true" justify="between">
                      <text variant="heading4">My Tasks</text>
                      <button variant="text" onClick="@action.setView('tasks')">View All</button>
                    </row>
                    <for each="task" in="@data.myTasks">
                      <use
                        component="@component.TaskRow"
                        task="@task"
                        onToggle="@action.toggleTask(@task.id)"
                        onClick="openDialog(@dialog.TaskDetail, { id: @task.id })"
                        contextMenu="@contextMenu.TaskItem"
                      />
                    </for>
                  </column>
                </container>
              </grid>
            </column>
          </case>

          <case value="projects">
            <column>
              <row padding="md" gap="md" borderBottom="true">
                <text variant="heading3" grow="true">Projects</text>
                <select value="@state.filter" onChange="@action.setFilter" width="150">
                  <option value="all">All Projects</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
                <button onClick="openDialog(@dialog.CreateProject)">New Project</button>
              </row>

              <table data="@data.projects | filter(@state.filter)" sortable="true" selectable="true">
                <tableColumn field="name" header="Name" width="flex" />
                <tableColumn field="status" header="Status" width="100" />
                <tableColumn field="owner.name" header="Owner" width="150" />
                <tableColumn field="createdAt" header="Created" width="120" format="date" />
                <tableColumn header="Actions" width="100">
                  <row gap="xs">
                    <button icon="edit" size="sm" variant="ghost"
                            onClick="openDialog(@dialog.EditProject, { id: @row.id })" />
                    <button icon="trash" size="sm" variant="ghost"
                            onClick="@action.deleteProject(@row.id)" />
                  </row>
                </tableColumn>

                <onRowClick>@action.openProject(@row.id)</onRowClick>
                <onRowDoubleClick>openDialog(@dialog.EditProject, { id: @row.id })</onRowDoubleClick>
                <contextMenu>@contextMenu.ProjectItem</contextMenu>
              </table>
            </column>
          </case>

          <case value="tasks">
            <column>
              <row padding="md" gap="md" borderBottom="true">
                <text variant="heading3" grow="true">My Tasks</text>
                <segmentedControl value="@state.taskView" onChange="@action.setTaskView">
                  <segment value="today" label="Today" />
                  <segment value="upcoming" label="Upcoming" />
                  <segment value="all" label="All" />
                </segmentedControl>
                <button onClick="openDialog(@dialog.CreateTask)">New Task</button>
              </row>

              <table data="@data.tasks | view(@state.taskView)" sortable="true" selectable="true" grouped="@state.taskView != 'all'" groupBy="dueDate">
                <tableColumn field="title" header="Task" width="flex" />
                <tableColumn field="project.name" header="Project" width="150" />
                <tableColumn field="status" header="Status" width="100" />
                <tableColumn field="priority" header="Priority" width="100" />
                <tableColumn field="dueDate" header="Due" width="120" format="date" />

                <onRowClick>openDialog(@dialog.TaskDetail, { id: @row.id })</onRowClick>
                <contextMenu>@contextMenu.TaskItem</contextMenu>
              </table>
            </column>
          </case>

          <case value="project">
            <row grow="true">
              <column grow="true" padding="lg" gap="lg">
                <row justify="between" align="center">
                  <column gap="xs">
                    <text variant="heading2">@data.currentProject.name</text>
                    <text variant="body" color="muted">@data.currentProject.description</text>
                  </column>
                  <row gap="sm">
                    <button variant="outline" onClick="openDialog(@dialog.EditProject)">Edit</button>
                    <button onClick="openDialog(@dialog.CreateTask)">Add Task</button>
                  </row>
                </row>

                <table data="@data.currentProject.tasks" sortable="true">
                  <tableColumn field="title" header="Task" width="flex" />
                  <tableColumn field="status" header="Status" width="100" />
                  <tableColumn field="priority" header="Priority" width="100" />
                  <tableColumn field="dueDate" header="Due" width="120" format="date" />
                  <tableColumn field="assignee.name" header="Assignee" width="150" />

                  <onRowClick>openDialog(@dialog.TaskDetail, { id: @row.id })</onRowClick>
                  <contextMenu>@contextMenu.TaskItem</contextMenu>
                </table>
              </column>

              <!-- Details side panel -->
              <panel name="details" width="300" collapsible="true" collapsed="@state.detailsCollapsed" borderLeft="true">
                <column padding="md" gap="md">
                  <text variant="heading4">Project Details</text>

                  <column gap="sm">
                    <row gap="sm">
                      <text variant="label" width="80">Status:</text>
                      <badge value="@data.currentProject.status" />
                    </row>
                    <row gap="sm">
                      <text variant="label" width="80">Owner:</text>
                      <use component="@component.UserAvatar" user="@data.currentProject.owner" size="sm" />
                      <text>@data.currentProject.owner.name</text>
                    </row>
                    <row gap="sm">
                      <text variant="label" width="80">Created:</text>
                      <text>@format.date(@data.currentProject.createdAt)</text>
                    </row>
                    <row gap="sm">
                      <text variant="label" width="80">Tasks:</text>
                      <text>@data.currentProject.tasks.length</text>
                    </row>
                  </column>

                  <divider />

                  <text variant="heading4">Activity</text>
                  <for each="activity" in="@data.currentProject.activity | limit(10)">
                    <row gap="sm" padding="xs">
                      <use component="@component.UserAvatar" user="@activity.user" size="sm" />
                      <column gap="xs" grow="true">
                        <text variant="body2">@activity.description</text>
                        <text variant="caption" color="muted">@format.relative(@activity.timestamp)</text>
                      </column>
                    </row>
                  </for>
                </column>
              </panel>
            </row>
          </case>

        </switch>
      </panel>

    </row>

    <!-- Status bar -->
    <statusBar>
      <statusItem>@data.projectCount projects</statusItem>
      <statusItem>@data.taskCount tasks</statusItem>
      <spacer />
      <statusItem>Last synced: @format.time(@data.lastSync)</statusItem>
      <statusItem icon="cloud" color="@data.syncStatus == 'synced' ? 'success' : 'warning'" />
    </statusBar>

  </window>

  <!-- Context menus -->
  <contextMenus>

    <contextMenu name="ProjectItem">
      <menuItem label="Open" onClick="@action.openProject(@context.id)" />
      <menuItem label="Edit" onClick="openDialog(@dialog.EditProject, { id: @context.id })" />
      <separator />
      <menuItem label="Duplicate" onClick="@action.duplicateProject(@context.id)" />
      <menuItem label="Archive" onClick="@action.archiveProject(@context.id)" />
      <separator />
      <menuItem label="Delete" onClick="@action.deleteProject(@context.id)" destructive="true" />
    </contextMenu>

    <contextMenu name="TaskItem">
      <menuItem label="Edit" onClick="openDialog(@dialog.TaskDetail, { id: @context.id })" />
      <separator />
      <menu label="Set Status">
        <menuItem label="To Do" onClick="@action.setTaskStatus(@context.id, 'todo')" />
        <menuItem label="In Progress" onClick="@action.setTaskStatus(@context.id, 'in_progress')" />
        <menuItem label="Done" onClick="@action.setTaskStatus(@context.id, 'done')" />
      </menu>
      <menu label="Set Priority">
        <menuItem label="Low" onClick="@action.setTaskPriority(@context.id, 'low')" />
        <menuItem label="Medium" onClick="@action.setTaskPriority(@context.id, 'medium')" />
        <menuItem label="High" onClick="@action.setTaskPriority(@context.id, 'high')" />
      </menu>
      <separator />
      <menuItem label="Delete" onClick="@action.deleteTask(@context.id)" destructive="true" />
    </contextMenu>

  </contextMenus>

  <!-- Dialog windows -->
  <dialogs>

    <dialog name="CreateProject" title="Create Project" width="500" height="auto">
      <form onSubmit="@action.createProject" onSuccess="closeDialog()">
        <column padding="lg" gap="md">
          <input label="Project Name" bind="name" required="true" autoFocus="true" />
          <textarea label="Description" bind="description" rows="3" />
          <select label="Status" bind="status" default="active">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <row justify="end" gap="sm">
            <button variant="outline" onClick="closeDialog()">Cancel</button>
            <button type="submit">Create Project</button>
          </row>
        </column>
      </form>
    </dialog>

    <dialog name="TaskDetail" title="Edit Task" width="600" height="auto">
      <params>
        <param name="id" type="uuid" required="true" />
      </params>
      <data>
        <query name="task" entity="@entity.Task" filter="id == @param.id" />
      </data>

      <form data="@data.task" onSubmit="@action.updateTask" onSuccess="closeDialog()">
        <column padding="lg" gap="md">
          <input label="Title" bind="title" required="true" />
          <textarea label="Description" bind="description" rows="4" />

          <grid columns="2" gap="md">
            <select label="Status" bind="status">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select label="Priority" bind="priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </grid>

          <grid columns="2" gap="md">
            <datepicker label="Due Date" bind="dueDate" />
            <select label="Assignee" bind="assigneeId">
              <for each="user" in="@data.users">
                <option value="@user.id">@user.name</option>
              </for>
            </select>
          </grid>

          <row justify="between">
            <button variant="danger" onClick="@action.deleteTask">Delete</button>
            <row gap="sm">
              <button variant="outline" onClick="closeDialog()">Cancel</button>
              <button type="submit">Save Changes</button>
            </row>
          </row>
        </column>
      </form>
    </dialog>

    <dialog name="Settings" title="Settings" width="700" height="500">
      <tabs orientation="vertical">
        <tab name="general" label="General" icon="settings">
          <column padding="lg" gap="md">
            <text variant="heading4">Appearance</text>
            <row gap="md" align="center">
              <text grow="true">Theme</text>
              <select value="@settings.theme" onChange="@action.setTheme" width="150">
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </row>
            <row gap="md" align="center">
              <text grow="true">Compact Mode</text>
              <switch value="@settings.compact" onChange="@action.toggleCompact" />
            </row>

            <divider />

            <text variant="heading4">Startup</text>
            <row gap="md" align="center">
              <text grow="true">Open at login</text>
              <switch value="@settings.openAtLogin" onChange="@action.toggleOpenAtLogin" />
            </row>
            <row gap="md" align="center">
              <text grow="true">Start minimized</text>
              <switch value="@settings.startMinimized" onChange="@action.toggleStartMinimized" />
            </row>
          </column>
        </tab>

        <tab name="notifications" label="Notifications" icon="bell">
          <column padding="lg" gap="md">
            <text variant="heading4">Desktop Notifications</text>
            <row gap="md" align="center">
              <text grow="true">Enable notifications</text>
              <switch value="@settings.notifications" onChange="@action.toggleNotifications" />
            </row>
            <row gap="md" align="center">
              <text grow="true">Sound</text>
              <switch value="@settings.notificationSound" onChange="@action.toggleSound" />
            </row>

            <divider />

            <text variant="heading4">Notify me about</text>
            <checkbox label="Task assignments" bind="@settings.notifyAssignments" />
            <checkbox label="Due date reminders" bind="@settings.notifyDueDates" />
            <checkbox label="Project updates" bind="@settings.notifyProjects" />
          </column>
        </tab>

        <tab name="shortcuts" label="Keyboard Shortcuts" icon="command">
          <column padding="lg" gap="sm">
            <for each="shortcut" in="@data.shortcuts">
              <row justify="between" padding="sm">
                <text>@shortcut.label</text>
                <text variant="code">@shortcut.keys</text>
              </row>
            </for>
          </column>
        </tab>

        <tab name="account" label="Account" icon="user">
          <column padding="lg" gap="md">
            <row gap="md" align="center">
              <use component="@component.UserAvatar" user="@data.currentUser" size="lg" />
              <column gap="xs">
                <text variant="heading4">@data.currentUser.name</text>
                <text color="muted">@data.currentUser.email</text>
              </column>
            </row>

            <divider />

            <button variant="outline" onClick="@action.changePassword">Change Password</button>
            <button variant="danger" onClick="@action.logout">Sign Out</button>
          </column>
        </tab>
      </tabs>
    </dialog>

    <dialog name="About" title="About ProjectHub" width="400" height="auto">
      <column padding="lg" gap="md" align="center">
        <image src="@assets.logo" width="64" height="64" />
        <text variant="heading3">ProjectHub</text>
        <text color="muted">Version 1.0.0</text>
        <text variant="body2" align="center">
          A modern project management application built with LLM UI Spec.
        </text>
        <row gap="sm">
          <link href="https://projecthub.app">Website</link>
          <text color="muted">•</text>
          <link href="https://github.com/projecthub">GitHub</link>
        </row>
      </column>
    </dialog>

  </dialogs>

</app>
```

---

## File Summary

| File | Purpose |
|------|---------|
| `core/entities.xml` | Shared data models (Project, Task, User) |
| `core/components.xml` | Reusable UI components (ProjectCard, TaskRow, etc.) |
| `web/app.xml` | Web app with routes, pages, modals, sidebar layout |
| `mobile/app.xml` | Mobile app with tabs, screens, sheets, native navigation |
| `desktop/app.xml` | Desktop app with windows, menus, toolbars, context menus |

---

## Benefits of Platform-Specific Files

1. **Readability**: Each file uses platform-native terminology and patterns
2. **Optimization**: Platform-specific UX patterns (sheets vs modals, tabs vs sidebar)
3. **Maintenance**: Changes to one platform don't affect others
4. **Flexibility**: Easy to support only specific platforms
5. **Translation**: LLM can translate between platforms using core definitions

---

## LLM Translation Between Platforms

With shared core definitions, an LLM can:

1. **Generate from one to another**: "Convert this web app to mobile"
2. **Keep in sync**: "Update mobile app to match web changes"
3. **Suggest optimizations**: "Adapt this desktop table for mobile"

Example prompt:
```
Given the web/app.xml spec, generate the equivalent mobile/app.xml.
Use the shared core/entities.xml and core/components.xml.
Adapt the UI for mobile patterns:
- Replace sidebar with bottom tabs
- Convert modals to sheets
- Use native navigation patterns
- Optimize for touch interactions
```
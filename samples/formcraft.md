# FormCraft

**Version:** 1.0
**Design System:** tailwind

This document describes the UI specification for code generation.

---

## Code Generation Guidelines

### Global
Generate clean, accessible, production-ready React code.
        Use Tailwind CSS for styling.
        Follow the design system tokens.
        Ensure WCAG 2.1 AA compliance.
        Use semantic HTML elements.
        Support keyboard navigation.
        Add proper loading and error states.
        Use React Query for data fetching.
        Use React Hook Form for form handling.

### Components
Create reusable components with TypeScript interfaces.
        Use forwardRef for interactive components.
        Support className prop for customization.
        Include JSDoc comments for props.


---

## Data Entities

The following data models are used throughout the application.

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | No | - |
| `email` | `email` | Yes | - |
| `name` | `string` | Yes | - |
| `avatar` | `image` | No | - |
| `plan` | `enum` | No | Values: free,pro,enterprise. Default: free |
| `createdAt` | `datetime` | No | - |
| `forms` | `ref` | No | References the Form entity (many) |
| `apiKeys` | `ref` | No | References the ApiKey entity (many) |

### Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | No | - |
| `name` | `string` | Yes | - |
| `description` | `text` | No | - |
| `slug` | `string` | No | Unique |
| `fields` | `ref` | No | References the FormField entity (many) |
| `settings` | `ref` | No | References the FormSettings entity |
| `owner` | `ref` | No | References the User entity |
| `submissions` | `ref` | No | References the Submission entity (many) |
| `status` | `enum` | No | Values: draft,published,archived. Default: draft |
| `createdAt` | `datetime` | No | - |
| `updatedAt` | `datetime` | No | - |
| `publishedAt` | `datetime` | No | - |

### FormField

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | No | - |
| `type` | `enum` | No | Values: text,email,number,phone,textarea,select,radio,checkbox,date,time,file,signature,rating,hidden |
| `label` | `string` | Yes | - |
| `placeholder` | `string` | No | - |
| `helpText` | `string` | No | - |
| `required` | `boolean` | No | Default: false |
| `validation` | `json` | No | - |
| `options` | `json` | No | - |
| `conditionalLogic` | `json` | No | - |
| `order` | `integer` | No | - |

### FormSettings

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | No | - |
| `submitButtonText` | `string` | No | Default: Submit |
| `successMessage` | `text` | No | - |
| `redirectUrl` | `url` | No | - |
| `notifyEmail` | `email` | No | - |
| `enableCaptcha` | `boolean` | No | Default: false |
| `allowMultipleSubmissions` | `boolean` | No | Default: true |
| `closeAfterDate` | `datetime` | No | - |
| `maxSubmissions` | `integer` | No | - |
| `customCss` | `text` | No | - |
| `webhookUrl` | `url` | No | - |

### Submission

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | No | - |
| `form` | `ref` | No | References the Form entity |
| `data` | `json` | No | - |
| `metadata` | `json` | No | - |
| `ipAddress` | `string` | No | - |
| `userAgent` | `string` | No | - |
| `createdAt` | `datetime` | No | - |
| `isRead` | `boolean` | No | Default: false |
| `isSpam` | `boolean` | No | Default: false |

### ApiKey

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `uuid` | No | - |
| `name` | `string` | Yes | - |
| `key` | `string` | No | - |
| `permissions` | `enum` | No | Values: read,write,admin |
| `lastUsedAt` | `datetime` | No | - |
| `createdAt` | `datetime` | No | - |


---

## Layouts

Reusable page structure templates.

### AppShell

**Slots:**

| Slot | Position | Role | Properties |
|------|----------|------|------------|
| `header` | top | chrome | sticky, height: 64px |
| `sidebar` | - | chrome | width: 240px, collapsible |
| `content` | - | content | grow, scroll |

**Structure:**

1. Vertical column (min-height 100vh)
  - **header** slot (@layout.AppShell.header) — positioned top, sticky, 64px tall, role: chrome
  - Horizontal row (fills available space)
    - **sidebar** slot (@layout.AppShell.sidebar) — 240px wide, collapsible below md, role: chrome
    - **content** slot (@layout.AppShell.content) — grows to fill, scrollable, role: content

### AuthLayout

**Slots:**

| Slot | Position | Role | Properties |
|------|----------|------|------------|
| `branding` | - | chrome | - |
| `content` | - | content | - |

**Structure:**

1. Horizontal row (min-height 100vh)
  - Container (50% wide, background: theme value `colors.primary`)
    - **branding** slot (@layout.AuthLayout.branding) — role: chrome
  - Centered container (xl padding, 50% wide)
    - **content** slot (@layout.AuthLayout.content) — role: content

### FormEditorLayout

**Slots:**

| Slot | Position | Role | Properties |
|------|----------|------|------------|
| `toolbar` | top | chrome | height: 56px |
| `fieldPalette` | - | chrome | width: 280px |
| `canvas` | - | content | grow |
| `properties` | - | chrome | width: 320px |

**Structure:**

1. Vertical column (min-height 100vh)
  - **toolbar** slot (@layout.FormEditorLayout.toolbar) — positioned top, 56px tall, role: chrome
  - Horizontal row (fills available space)
    - **fieldPalette** slot (@layout.FormEditorLayout.fieldPalette) — 280px wide, role: chrome
    - **canvas** slot (@layout.FormEditorLayout.canvas) — grows to fill, role: content
    - **properties** slot (@layout.FormEditorLayout.properties) — 320px wide, role: chrome

### PublicFormLayout

**Slots:**

| Slot | Position | Role | Properties |
|------|----------|------|------------|
| `content` | - | - | width: 100% |

**Structure:**

1. Centered container (lg padding, min-height 100vh, background: theme value `colors.gray.50`)
  - **content** slot (@layout.PublicFormLayout.content) — 100% wide

### MarketingLayout

**Slots:**

| Slot | Position | Role | Properties |
|------|----------|------|------------|
| `header` | top | chrome | sticky |
| `content` | - | content | grow |
| `footer` | - | chrome | - |

**Structure:**

1. Vertical column (min-height 100vh)
  - **header** slot (@layout.MarketingLayout.header) — positioned top, sticky, role: chrome
  - **content** slot (@layout.MarketingLayout.content) — grows to fill, role: content
  - **footer** slot (@layout.MarketingLayout.footer) — role: chrome


---

## Components

Reusable UI components.

### AppHeader

**Props:**

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `user` | `@entity.User` | No | - |

**Structure:**

1. Horizontal row (md padding, background: white)
  - Horizontal row (lg gap)
    - Link → the Dashboard page
      - Image: images asset "logo" — "FormCraft"
  - Horizontal row (md gap)
    - Button (ghost) → openHelp
    - Button (ghost) → openNotifications
      - Badge (default)
    - Dropdown menu: "click"
      - Trigger
        - Use the Avatar component with src=prop `user.avatar`, size="sm"
      - Dropdown menu
        - MenuItem ("Settings")
        - MenuItem ("Billing")
        - MenuItem ("Log out")

### AppSidebar

**Structure:**

1. Container (md padding, sm gap, background: white)
  - Nav
    - NavItem ("Dashboard")
    - NavItem ("Forms")
    - NavItem ("Submissions")
    - NavItem ("Analytics")
    - NavItem ("Integrations")
  - Container (md padding, background: theme value `colors.gray.50`)
    - Text: "Current Plan"
    - Text: "{capitalize(@state.user.plan)}"
    - **If** state `user.plan` equals 'free':
      - Link → the Pricing page

### Avatar

**Props:**

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `src` | `image` | No | - |
| `name` | `string` | No | - |
| `size` | `enum` | No | md |

**YOU MUST:**

Circular avatar image with fallback to initials.
        Sizes: xs=20px, sm=28px, md=36px, lg=48px, xl=64px.
        If no src, show first two initials on colored background.
        Color should be deterministic based on name.

**Structure:**

1. Prompt ("Circular avatar image with ...")

### FormCard

**Props:**

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `form` | `@entity.Form` | Yes | - |

**Actions:**

- `onEdit()`
- `onDuplicate()`
- `onDelete()`

**Structure:**

1. Container (md padding, background: white)
  - Horizontal row
    - Container (xs gap)
      - Text showing prop `form.name`
      - Text showing prop `form.description`
    - Dropdown menu: "icon"
      - MenuItem ("Edit")
      - MenuItem ("Duplicate")
      - MenuItem ("Preview")
      - MenuItem (variant: danger, "Delete")
  - Horizontal row (md gap)
    - Tag ("{@prop.form.fields.length} ...")
    - Tag ("{@prop.form.submissions.len...")
    - Badge (default): "@prop.form.status"
  - Horizontal row
    - Text: "Updated {formatRelative(@prop.form.updatedAt)}"
    - **If** prop `form.status` equals 'published':
      - Button (ghost) → shareForm(@prop.form.id)

### StatCard

**Props:**

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `label` | `string` | Yes | - |
| `value` | `number` | Yes | - |
| `icon` | `string` | No | - |
| `trend` | `number` | No | - |
| `trendLabel` | `string` | No | - |

**Structure:**

1. Container (lg padding, background: white)
  - Horizontal row
    - Text showing prop `label`
    - **If** prop `icon`:
      - Icon: @prop.icon
  - Text showing prop `value`
  - **If** prop `trend`:
    - Horizontal row (xs gap)
      - Icon: {@prop.trend > 0 ? 'trending-up' : 'trending-down'}
      - Text: "{Math.abs(@prop.trend)}%"
      - Text showing prop `trendLabel`

### FieldPreview

**Props:**

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `field` | `@entity.FormField` | Yes | - |
| `selected` | `boolean` | No | false |

**Actions:**

- `onSelect()`
- `onDelete()`
- `onDuplicate()`
- `onMoveUp()`
- `onMoveDown()`

**Structure:**

1. Container (md padding, background: white)
  - Horizontal row
    - Horizontal row (sm gap)
      - Icon: grip-vertical
      - Text showing prop `field.label`
      - **If** prop `field.required`:
        - Text: "*"
    - Horizontal row (xs gap)
      - Button (ghost) → `onMoveUp()` action
      - Button (ghost) → `onMoveDown()` action
      - Button (ghost) → `onDuplicate()` action
      - Button (ghost) → `onDelete()` action
  - Container
     **YOU MUST:** Render a disabled preview of the form field based on @prop.field.type:
            - text/email/phone/number: show input with placeholder
            - textarea: show textarea
            - select: show dropdown with options
            - radio/checkbox: show options
            - date/time: show date/time picker
            - file: show file upload zone
            - signature: show signature pad placeholder
            - rating: show star rating
            Show help text if present.

### EmptyState

**Props:**

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `icon` | `string` | No | inbox |
| `title` | `string` | Yes | - |
| `description` | `string` | No | - |
| `actionLabel` | `string` | No | - |

**Actions:**

- `onAction()`

**Structure:**

1. Container (xl padding, md gap)
  - Centered container (64px wide, background: theme value `colors.gray.100`)
    - Icon: @prop.icon
  - Text showing prop `title`
  - **If** prop `description`:
    - Text showing prop `description`
  - **If** prop `actionLabel`:
    - Button (primary) → `onAction()` action


---

## Pages

Application pages and routes.

### Dashboard

**Route:** `/dashboard`
**Layout:** @layout.AppShell
**Auth:** required

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `user` | @entity.User | auth.currentUser |
| `forms` | @entity.Form[] | owner == @state.user.id |
| `recentSubmissions` | @entity.Submission[] | form.owner == @state.user.id |
| `stats` | - | api/dashboard/stats |

**Content:**

1. Fill the header slot of AppShell layout
  - Use the AppHeader component with user=state `user`
2. Fill the sidebar slot of AppShell layout
  - Use the AppSidebar component
3. Fill the content slot of AppShell layout
  - Container (xl gap)
    - Section
      - Horizontal row
        - Container (xs gap)
          - Text: "Welcome back, {@state.user.name.split(' ')[0]}"
          - Text: "Here's what's happening with your forms"
        - Button (primary) → navigateTo(@page.FormCreate)
    - Section
      - Use the StatCard component with label="Total Forms", value=state `stats.totalForms`, icon="file-text"
      - Use the StatCard component with label="Total Submissions", value=state `stats.totalSubmissions`, icon="inbox"
      - Use the StatCard component with label="Completion Rate", value="{@state.stats.completionRate}%", icon="check-circle"
      - Use the StatCard component with label="Active Forms", value=state `stats.activeForms`, icon="activity"
    - Section
      - Horizontal row
        - Text: "Recent Forms"
        - Link → the FormList page
      - **If** state `forms.length` is greater than 0:
        - Grid layout with 2 columns (md gap)
          - **For each** `form` in state `forms`:
            - Use the FormCard component with form=current item, onEdit="navigateTo(@page.FormEditor, { id: @item.id })", onDuplicate="duplicateForm(@item.id)"
      - Else
        - Use the EmptyState component with icon="file-plus", title="No forms yet", description="Create your first form to start collecting responses"
    - Section
      - Horizontal row
        - Text: "Recent Submissions"
        - Link → the Submissions page
      - **If** state `recentSubmissions.length` is greater than 0:
        - Table with columns: Form, Submitted, Preview, (actions) showing: current item's `form.name`, current item's `createdAt`, "{summarize(@item....", status badge
      - Else
        - Use the EmptyState component with icon="inbox", title="No submissions yet", description="Share your forms to start receiving responses"

**UI States:**

- **loading**: Dashboard skeleton with stat cards and form list placeholders

### FormList

**Route:** `/forms`
**Layout:** @layout.AppShell
**Auth:** required

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `user` | @entity.User | auth.currentUser |
| `forms` | @entity.Form[] | owner == @state.user.id |

**Content:**

1. Fill the header slot of AppShell layout
  - Use the AppHeader component with user=state `user`
2. Fill the sidebar slot of AppShell layout
  - Use the AppSidebar component
3. Fill the content slot of AppShell layout
  - Container (lg gap)
    - Horizontal row
      - Text: "Forms"
      - Button (primary) → navigateTo(@page.FormCreate)
    - Horizontal row (md gap)
      - Search (value: @state.searchQuery)
      - Horizontal row (sm gap)
        - Select (value: @state.statusFilter)
          - Option ("All Status")
          - Option (value: draft, "Draft")
          - Option (value: published, "Published")
          - Option (value: archived, "Archived")
        - Select (value: @state.sortBy)
          - Option (value: updatedAt, "Last Modified")
          - Option (value: createdAt, "Created Date")
          - Option (value: name, "Name")
          - Option (value: submissions, "Submissions")
    - **If** state `forms.length` is greater than 0:
      - Grid layout with 3 columns (md gap)
        - **For each** `form` in state `forms`:
          - Use the FormCard component with form=current item, onEdit="navigateTo(@page.FormEditor, { id: @item.id })", onDuplicate="duplicateForm(@item.id)"
      - Pagination
    - Else
      - Use the EmptyState component with icon="file-plus", title="No forms found", description="{@state.searchQuery ? 'Try a different search term' : 'Create your first form to get started'}"

### FormEditor

**Route:** `/forms/:id/edit`
**Layout:** @layout.FormEditorLayout
**Auth:** required

**URL Parameters:**

- `id`: uuid

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `form` | @entity.Form | id == @param.id |

**Local State:**

- `selectedFieldId: uuid = null`
- `isDirty: boolean = false`
- `previewMode: boolean = false`

**Content:**

1. Fill the toolbar slot of FormEditorLayout layout
  - Horizontal row (sm md padding, background: white)
    - Horizontal row (md gap)
      - Button (ghost) → navigateBack
      - Text input bound to state `form.name` — placeholder: "Untitled Form"
      - Badge (default): "@state.form.status"
      - **If** state `isDirty`:
        - Text: "Unsaved changes"
    - Horizontal row (sm gap)
      - Button (outline) → togglePreview
      - Button (outline) → openSettings
      - Button (secondary) → saveDraft
      - Button (primary) → publishForm
2. Fill the fieldPalette slot of FormEditorLayout layout
  - Container (scrollable, md padding, background: white)
    - Text: "Add Fields"
    - Container (xs gap)
      - Text: "Basic"
      - Draggable (type: field)
      - Draggable (type: field)
      - Draggable (type: field)
      - Draggable (type: field)
      - Draggable (type: field)
    - Container (xs gap)
      - Text: "Choice"
      - Draggable (type: field)
      - Draggable (type: field)
      - Draggable (type: field)
    - Container (xs gap)
      - Text: "Advanced"
      - Draggable (type: field)
      - Draggable (type: field)
      - Draggable (type: field)
      - Draggable (type: field)
      - Draggable (type: field)
3. Fill the canvas slot of FormEditorLayout layout
  - Centered container (xl padding)
    - Container (xl padding, 640px wide, background: white)
      - Container (sm gap)
        - Text input bound to state `form.name` — placeholder: "Form Title"
        - Text input bound to state `form.description` — placeholder: "Form description (optional)"
      - Container
        - Button (primary)
      - DropZone
        - **If** state `form.fields.length` is greater than 0:
          - Sortable
            - **For each** `field` in state `form.fields`:
              - Use the FieldPreview component with field=current item, selected=current item's `id == @state.selectedFieldId`, onSelect="selectField(@item.id)"
        - Else
          - Centered container (xl padding)
            - Container (sm gap)
              - Icon: plus-circle
              - Text: "Drag fields here or click to add"
4. Fill the properties slot of FormEditorLayout layout
  - Container (scrollable, md padding, background: white)
    - **If** state `selectedFieldId`:
       **YOU MUST:** Field properties editor for the selected field.
              Show different options based on field type:

              Common properties for all fields:
              - Label (text input)
              - Placeholder (text input)
              - Help text (text input)
              - Required (toggle)

              For text/email/phone/number:
              - Min/max length
              - Pattern validation
              - Custom error message

              For select/radio/checkbox:
              - Options editor (add/remove/reorder)
              - Allow "Other" option

              For date/time:
              - Min/max date
              - Date format

              For file:
              - Allowed file types
              - Max file size
              - Multiple files toggle

              For rating:
              - Max rating (1-10)
              - Icon style (stars, hearts, etc.)

              Advanced section (collapsible):
              - Conditional logic builder
              - Custom CSS class
              - Field ID (readonly)
    - Else
      - Centered container
        - Text: "Select a field to edit its properties"

**UI States:**

- **loading**: Editor skeleton with toolbar, empty canvas, and properties panel
- **saving**: Custom rendering

### FormCreate

**Route:** `/forms/new`
**Layout:** @layout.AppShell
**Auth:** required

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `user` | @entity.User | auth.currentUser |
| `templates` | - | api/form-templates |

**Content:**

1. Fill the header slot of AppShell layout
  - Use the AppHeader component with user=state `user`
2. Fill the sidebar slot of AppShell layout
  - Use the AppSidebar component
3. Fill the content slot of AppShell layout
  - Container (xl gap)
    - Container (sm gap)
      - Text: "Create a New Form"
      - Text: "Start from scratch or choose a template"
    - Horizontal row (lg padding, lg gap, background: white)
      - Centered container (64px wide, background: theme value `colors.primary.50`)
        - Icon: plus
      - Container (xs gap)
        - Text: "Blank Form"
        - Text: "Start with a blank canvas and add your own fields"
    - Section
      - Text: "Or start with a template"
      - Grid layout with 3 columns (md gap)
        - **For each** `template` in state `templates`:
          - Container (lg padding, background: white)
            - Centered container (background: theme value `colors.gray.50`)
              - Icon: @item.icon
            - Horizontal row (sm gap)
              - Tag ("{@item.fieldCount} fields")
              - Tag ("{@item.category}")
            - Text: "{@item.name}"
            - Text: "{@item.description}"

### Analytics

**Route:** `/analytics`
**Layout:** @layout.AppShell
**Auth:** required

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `user` | @entity.User | auth.currentUser |

**Content:**

1. Fill the header slot of AppShell layout
  - Use the AppHeader component with user=state `user`
2. Fill the sidebar slot of AppShell layout
  - Use the AppSidebar component
3. Fill the content slot of AppShell layout
   **YOU MUST:** Create a comprehensive analytics dashboard for form submissions.

          Header section:
          - Page title "Analytics"
          - Date range picker (preset options: Today, Last 7 days, Last 30 days, Custom)
          - Form selector dropdown to filter by specific form or "All Forms"
          - Export button (CSV, PDF options)

          Stats row (4 cards):
          - Total submissions (with trend vs previous period)
          - Completion rate (started vs completed)
          - Average completion time
          - Unique visitors

          Charts section (2x2 grid):
          1. Line chart: Submissions over time (daily/weekly granularity toggle)
          2. Bar chart: Submissions by form (top 10 forms)
          3. Pie chart: Submissions by device type (desktop, mobile, tablet)
          4. Funnel chart: Form completion funnel (viewed -> started -> completed)

          Geographic section:
          - World map showing submission locations
          - Table with top countries/cities

          Time analysis:
          - Heatmap showing submissions by day of week and hour
          - Insight text like "Most submissions happen on Tuesday at 2 PM"

          Drop-off analysis:
          - Table showing which fields have highest abandonment rate
          - Recommendations for improvement

          Make charts interactive with tooltips and click-to-drill-down.
          Use consistent color scheme from theme.
          Show loading skeletons while data loads.
          Handle empty states gracefully.

### Submissions

**Route:** `/submissions`
**Layout:** @layout.AppShell
**Auth:** required

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `user` | @entity.User | auth.currentUser |
| `forms` | @entity.Form[] | owner == @state.user.id |

**Content:**

1. Fill the header slot of AppShell layout
  - Use the AppHeader component with user=state `user`
2. Fill the sidebar slot of AppShell layout
  - Use the AppSidebar component
3. Fill the content slot of AppShell layout
   **YOU MUST:** Create an inbox-style submissions management page.

          Layout: Split view with list on left (40%) and detail on right (60%)

          Left panel - Submissions list:
          - Filter bar: Form selector, Date range, Read/Unread, Spam filter
          - Search box for searching submission content
          - Bulk actions: Mark as read, Mark as spam, Delete, Export selected
          - Submission list items showing:
            - Form name
            - First field value as preview
            - Timestamp (relative)
            - Unread indicator (blue dot)
            - Spam indicator if flagged
          - Infinite scroll pagination
          - Click to select and view in detail panel

          Right panel - Submission detail:
          - Header with form name and submission date
          - Action buttons: Reply (if email field exists), Mark as spam, Delete
          - All submitted fields displayed as label-value pairs
          - Metadata section (collapsible): IP address, User agent, Location, Referrer
          - Navigation to previous/next submission

          Empty state when no submission selected: "Select a submission to view details"

          Keyboard navigation:
          - Arrow up/down to navigate list
          - Enter to select
          - R to mark as read
          - S to toggle spam
          - Delete to delete

### Integrations

**Route:** `/integrations`
**Layout:** @layout.AppShell
**Auth:** required

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `user` | @entity.User | auth.currentUser |

**Content:**

1. Fill the header slot of AppShell layout
  - Use the AppHeader component with user=state `user`
2. Fill the sidebar slot of AppShell layout
  - Use the AppSidebar component
3. Fill the content slot of AppShell layout
   **YOU MUST:** Create an integrations marketplace page.

          Header:
          - Title "Integrations"
          - Subtitle "Connect your forms with your favorite tools"
          - Search box for filtering integrations

          Categories (tabs or sidebar filter):
          - All
          - Email & Marketing (Mailchimp, ConvertKit, Drip)
          - CRM (Salesforce, HubSpot, Pipedrive)
          - Storage (Google Drive, Dropbox, OneDrive)
          - Spreadsheets (Google Sheets, Airtable, Excel)
          - Automation (Zapier, Make, n8n)
          - Payments (Stripe, PayPal)
          - Notifications (Slack, Discord, Teams)

          Integration cards grid:
          - App icon/logo
          - App name
          - Short description
          - "Connected" badge if already connected
          - "Pro" badge if requires paid plan
          - Connect/Configure button

          Connected integrations section at top:
          - Show currently connected integrations
          - Quick toggle to enable/disable
          - Configure button
          - Disconnect option

          Clicking an integration opens a modal:
          - Integration description
          - Features list
          - Setup instructions
          - OAuth connect button or API key input
          - Form selector to choose which forms to connect

          Self-hosting section:
          - Webhook configuration
          - API documentation link
          - Code examples for custom integrations

### Settings

**Route:** `/settings`
**Layout:** @layout.AppShell
**Auth:** required

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `user` | @entity.User | auth.currentUser |

**Content:**

1. Fill the header slot of AppShell layout
  - Use the AppHeader component with user=state `user`
2. Fill the sidebar slot of AppShell layout
  - Use the AppSidebar component
3. Fill the content slot of AppShell layout
   **YOU MUST:** Create a comprehensive settings page with sidebar navigation.

          Layout: Settings nav on left, content on right

          Settings sections:

          1. Profile
             - Avatar upload with crop
             - Name, email fields
             - Password change (current + new + confirm)
             - Two-factor authentication toggle
             - Connected accounts (Google, GitHub)

          2. Workspace
             - Workspace name
             - Custom domain settings
             - Default form settings
             - Timezone selection
             - Date/time format preferences

          3. API Keys
             - List of existing API keys (name, created date, last used, permissions)
             - Create new key button
             - Regenerate/delete options
             - Copy key functionality
             - Usage statistics per key

          4. Self-Hosting
             - Docker deployment instructions
             - Environment variables reference
             - Download configuration files
             - Health check endpoint info
             - Backup/restore instructions

          5. Team (if applicable)
             - Team members list
             - Invite new member
             - Role management (Admin, Editor, Viewer)
             - Pending invitations

          6. Notifications
             - Email notification preferences
             - Browser push notifications toggle
             - Notification frequency (immediate, daily digest, weekly)

          7. Danger Zone
             - Export all data
             - Delete account (with confirmation)

          Each section should have a save button that only enables when changes are made.
          Show success/error toasts on save.

### Billing

**Route:** `/billing`
**Layout:** @layout.AppShell
**Auth:** required

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `user` | @entity.User | auth.currentUser |

**Content:**

1. Fill the header slot of AppShell layout
  - Use the AppHeader component with user=state `user`
2. Fill the sidebar slot of AppShell layout
  - Use the AppSidebar component
3. Fill the content slot of AppShell layout
   **YOU MUST:** Create a billing management page.

          Current plan card:
          - Plan name and badge (Free, Pro, Enterprise)
          - Price per month
          - Renewal date (if paid)
          - Usage stats: forms used/limit, submissions used/limit, storage used/limit
          - Progress bars for usage
          - Upgrade/Change plan button

          Plan comparison (if on free plan):
          - Feature comparison table
          - Highlight current plan
          - Upgrade CTAs

          Payment method (if paid):
          - Current card (last 4 digits, expiry)
          - Update payment method button
          - Add backup payment method

          Billing history:
          - Table with date, description, amount, status, invoice download
          - Pagination

          Billing information:
          - Company name
          - Billing address
          - VAT/Tax ID
          - Update button

          Cancel subscription (if paid):
          - Link to cancel with confirmation flow
          - Show what they'll lose
          - Offer alternatives (downgrade, pause)

### Pricing

**Route:** `/pricing`
**Layout:** @layout.MarketingLayout
**Auth:** none

**Content:**

1. Fill the header slot of MarketingLayout layout
   **YOU MUST:** Marketing site header with:
          - Logo
          - Nav links: Features, Pricing, Docs, Blog
          - Sign in / Get Started buttons
2. Fill the content slot of MarketingLayout layout
   **YOU MUST:** Create an attractive pricing page for the SaaS form builder.

          Hero section:
          - Headline: "Simple, transparent pricing"
          - Subhead: "Start free, upgrade when you need more"
          - Monthly/Annual toggle (show savings for annual)

          Pricing cards (3 plans side by side):

          1. Free Plan - $0/month
             - 3 forms
             - 100 submissions/month
             - Basic fields
             - Email notifications
             - FormCraft branding
             - Community support
             - CTA: "Get Started Free"

          2. Pro Plan - $29/month (or $24/month billed annually)
             - Unlimited forms
             - 10,000 submissions/month
             - All field types
             - Remove branding
             - Custom thank you pages
             - File uploads (1GB storage)
             - Integrations (Zapier, Webhooks)
             - Priority email support
             - CTA: "Start Pro Trial" (14-day free)
             - MOST POPULAR badge

          3. Enterprise - Custom pricing
             - Everything in Pro
             - Unlimited submissions
             - Unlimited storage
             - Custom domain
             - Self-hosting option
             - SSO/SAML
             - SLA guarantee
             - Dedicated support
             - CTA: "Contact Sales"

          Feature comparison table below:
          - Detailed feature breakdown
          - Checkmarks and limits per plan
          - Expandable sections for feature categories

          FAQ section:
          - Common billing questions
          - Accordion style

          Final CTA:
          - "Ready to get started?"
          - Sign up button

          Use subtle animations on scroll.
          Make pricing cards have hover effects.
3. Fill the footer slot of MarketingLayout layout
   **YOU MUST:** Marketing footer with:
          - Logo and tagline
          - Link columns: Product, Resources, Company, Legal
          - Social media links
          - Copyright notice
          - Made with love message

### PublicForm

**Route:** `/f/:slug`
**Layout:** @layout.PublicFormLayout
**Auth:** none

**URL Parameters:**

- `slug`: string

**Data:**

| Query | Type | Source/Filter |
|-------|------|---------------|
| `form` | @entity.Form | slug == @param.slug && status == 'published' |

**Content:**

1. Fill the content slot of PublicFormLayout layout
  - Container (xl padding, background: white)
    - Container (sm gap)
      - Text showing state `form.name`
      - **If** state `form.description`:
        - Text showing state `form.description`
    - Form → submitForm (POST)
      - Container (lg gap)
        - **For each** `field` in state `form.fields`:
           **YOU MUST:** Render the form field based on @item.type:

                  - Use appropriate input component for each type
                  - Show label with required indicator if needed
                  - Show help text below the field
                  - Apply validation rules from @item.validation
                  - Handle conditional logic from @item.conditionalLogic
                  - Support proper accessibility (labels, ARIA)

                  For select/radio/checkbox: render options from @item.options
                  For file upload: show drag-drop zone with file type restrictions
                  For signature: show signature pad canvas
                  For rating: show interactive star rating

                  Style consistently with the form's theme.
        - Button (primary)
    - **If** state `form.owner.plan` equals 'free':
      - Centered container
        - Link → the Landing page
          - Text: "Powered by FormCraft"

**UI States:**

- **loading**: Custom rendering
- **submitted**: Custom rendering
- **closed**: Custom rendering
- **notFound**: Custom rendering

### Login

**Route:** `/login`
**Layout:** @layout.AuthLayout
**Auth:** guest

**Content:**

1. Fill the branding slot of AuthLayout layout
  - Centered container (xl padding)
    - Container (lg gap)
      - Image: images asset "logoWhite"
      - Text: "Build forms that convert"
      - Text: "Create beautiful, responsive forms in minutes. ..."
2. Fill the content slot of AuthLayout layout
  - Container (lg gap)
    - Container (xs gap)
      - Text: "Welcome back"
      - Text: "Sign in to your account"
    - Horizontal row (md gap)
      - Button (outline) → loginWithGoogle
      - Button (outline) → loginWithGitHub
    - Form → login (POST)
      - Container (md gap)
        - Button (primary)
    - Divider (label: or continue with)
    - Text: "Don't have an account?"
      - Link → the Register page

**UI States:**

- **loading**: Custom rendering
- **error**: Custom rendering

### Register

**Route:** `/register`
**Layout:** @layout.AuthLayout
**Auth:** guest

**Content:**

1. Fill the branding slot of AuthLayout layout
  - Centered container (xl padding)
    - Container (lg gap)
      - Image: images asset "logoWhite"
      - Text: "Start free today"
      - Container (sm gap)
        - Horizontal row (sm gap)
          - Icon: check
          - Text: "No credit card required"
        - Horizontal row (sm gap)
          - Icon: check
          - Text: "3 forms free forever"
        - Horizontal row (sm gap)
          - Icon: check
          - Text: "100 submissions/month"
2. Fill the content slot of AuthLayout layout
   **YOU MUST:** Create a registration form with:

          Header:
          - "Create your account" heading
          - "Get started in seconds" subtext

          Form fields:
          - Full name (required)
          - Email (required, validated)
          - Password (required, with strength indicator)
          - Show password toggle
          - Terms acceptance checkbox with links to Terms and Privacy Policy

          Submit button: "Create Account"

          Social signup options:
          - Google
          - GitHub

          Footer text: "Already have an account? Sign in"

          Password requirements (show inline):
          - At least 8 characters
          - One uppercase letter
          - One number

          Show loading state on submit.
          Handle errors gracefully.

### Landing

**Route:** `/`
**Layout:** @layout.MarketingLayout
**Auth:** none

**Content:**

1. Fill the header slot of MarketingLayout layout
   **YOU MUST:** Marketing header with:
          - Logo on left
          - Navigation: Features, Pricing, Docs, Blog
          - Right side: Sign In button, "Get Started Free" primary button
          - Sticky on scroll with blur background
2. Fill the content slot of MarketingLayout layout
   **YOU MUST:** Create a compelling landing page for FormCraft - a SaaS form builder.

          Hero section:
          - Large headline: "Build beautiful forms in minutes"
          - Subheadline: "Create, share, and analyze forms without writing code. Self-host or use our cloud."
          - Email capture input with "Get Started Free" button
          - "No credit card required" note
          - Hero image/illustration showing the form builder interface
          - Social proof: "Trusted by 10,000+ businesses"
          - Logo cloud of customer logos

          Features section (3 columns):
          1. "Drag & Drop Builder" - Visual editor, no coding
          2. "Smart Integrations" - Connect to 100+ apps
          3. "Self-Host Option" - Own your data, deploy anywhere

          How it works (3 steps):
          1. Create - Design your form with drag and drop
          2. Share - Get a link or embed on your site
          3. Analyze - View responses and insights

          Form types showcase:
          - Contact forms
          - Surveys
          - Registration forms
          - Order forms
          - Job applications
          Show example screenshots/mockups

          Testimonials section:
          - 3 customer quotes with photos, names, companies
          - Star ratings

          Self-hosting section:
          - "Own your data" headline
          - Docker deployment mention
          - One-click cloud deploy options
          - "Deploy in 5 minutes" CTA

          Final CTA section:
          - "Ready to build better forms?"
          - Large "Start Free" button
          - "14-day Pro trial included"

          Use animations on scroll.
          Make it visually impressive with gradients and illustrations.
          Fully responsive design.
3. Fill the footer slot of MarketingLayout layout
   **YOU MUST:** Comprehensive footer with:

          4 columns:
          1. Product: Features, Pricing, Templates, What's New
          2. Resources: Documentation, API Reference, Guides, Blog
          3. Company: About, Careers, Contact, Press Kit
          4. Legal: Terms of Service, Privacy Policy, Cookie Policy, GDPR

          Bottom bar:
          - Copyright notice
          - Social links: Twitter, GitHub, Discord, YouTube
          - Language/region selector


---

## Navigation

### Auth Guards

| Guard | Redirect | Condition |
|-------|----------|-----------|
| `required` | @page.Login | - |
| `guest` | @page.Dashboard | - |
| `admin` | @page.Dashboard | admin |

### Navigation Flows

**onboarding:**
Multi-step onboarding flow for new users:
          1. Welcome screen with value props
          2. "What will you use forms for?" - multiple choice
          3. Create first form (template selection or blank)
          4. Quick tutorial tooltip tour
          5. Completion celebration


---

## Theme

### Colors

```json
{
  "primary": "#6366F1",
  "secondary": "#8B5CF6",
  "success": "#10B981",
  "warning": "#F59E0B",
  "danger": "#EF4444",
  "muted": "#6B7280",
  "gray": {
    "50": "#F9FAFB",
    "100": "#F3F4F6",
    "200": "#E5E7EB",
    "300": "#D1D5DB",
    "400": "#9CA3AF",
    "500": "#6B7280",
    "600": "#4B5563",
    "700": "#374151",
    "800": "#1F2937",
    "900": "#111827"
  }
}
```

### Shadows

- **sm:** `0 1px 2px rgba(0,0,0,0.05)`
- **md:** `0 4px 6px rgba(0,0,0,0.1)`
- **lg:** `0 10px 15px rgba(0,0,0,0.1)`

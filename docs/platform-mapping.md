# Platform Element Mapping

Visual reference for converting specs between webapp, mobile, and desktop platforms.

---

## Navigation

```mermaid
flowchart TB
    subgraph section[" "]
        direction LR
        subgraph Webapp["🌐 Webapp"]
            direction TB
            W1["**Primary Nav**<br/>layout + sidebar slot"]
            W2["**Nav Item**<br/>navItem to=@page.X"]
            W3["**Route**<br/>page route=/path"]
            W4["**Back**<br/>Browser history"]
        end
        subgraph Mobile["📱 Mobile"]
            direction TB
            M1["**Primary Nav**<br/>navigation type=tabs"]
            M2["**Nav Item**<br/>tab screen=@screen.X"]
            M3["**Route**<br/>screen name=X"]
            M4["**Back**<br/>navigationBar backButton"]
        end
        subgraph Desktop["🖥️ Desktop"]
            direction TB
            D1["**Primary Nav**<br/>sidebar + treeView"]
            D2["**Nav Item**<br/>treeItem onClick"]
            D3["**Route**<br/>view name=X"]
            D4["**Back**<br/>menuItem / shortcut"]
        end
    end

    W1 -.-> M1
    M1 -.-> D1
    W2 -.-> M2
    M2 -.-> D2
    W3 -.-> M3
    M3 -.-> D3
    W4 -.-> M4
    M4 -.-> D4

    style Webapp fill:#e3f2fd,stroke:#1976d2
    style Mobile fill:#f3e5f5,stroke:#7b1fa2
    style Desktop fill:#e8f5e9,stroke:#388e3c
```

---

## Page Structure

```mermaid
flowchart TB
    subgraph section[" "]
        direction LR
        subgraph Webapp["🌐 Webapp"]
            direction TB
            W1["**Container**<br/>page"]
            W2["**Header**<br/>slot in layout"]
            W3["**Title**<br/>text variant=heading1"]
            W4["**Scroll**<br/>scroll=true on slot"]
            W5["**Safe Area**<br/>N/A"]
        end
        subgraph Mobile["📱 Mobile"]
            direction TB
            M1["**Container**<br/>screen"]
            M2["**Header**<br/>navigationBar"]
            M3["**Title**<br/>text variant=largeTitle"]
            M4["**Scroll**<br/>scroll or list"]
            M5["**Safe Area**<br/>safeArea=true"]
        end
        subgraph Desktop["🖥️ Desktop"]
            direction TB
            D1["**Container**<br/>view + panel"]
            D2["**Header**<br/>toolbar + titleBar"]
            D3["**Title**<br/>text variant=heading1"]
            D4["**Scroll**<br/>scroll in panel"]
            D5["**Safe Area**<br/>N/A"]
        end
    end

    W1 -.-> M1
    M1 -.-> D1
    W2 -.-> M2
    M2 -.-> D2
    W3 -.-> M3
    M3 -.-> D3
    W4 -.-> M4
    M4 -.-> D4
    W5 -.-> M5
    M5 -.-> D5

    style Webapp fill:#e3f2fd,stroke:#1976d2
    style Mobile fill:#f3e5f5,stroke:#7b1fa2
    style Desktop fill:#e8f5e9,stroke:#388e3c
```

---

## Overlays & Dialogs

```mermaid
flowchart TB
    subgraph section[" "]
        direction LR
        subgraph Webapp["🌐 Webapp"]
            direction TB
            W1["**Form Dialog**<br/>modal"]
            W2["**Confirmation**<br/>modal size=small"]
            W3["**Menu**<br/>dropdown"]
            W4["**Full Screen**<br/>modal size=full"]
            W5["**Close**<br/>closeModal( )"]
        end
        subgraph Mobile["📱 Mobile"]
            direction TB
            M1["**Form Dialog**<br/>sheet"]
            M2["**Confirmation**<br/>alert"]
            M3["**Menu**<br/>sheet with list"]
            M4["**Full Screen**<br/>push(@screen)"]
            M5["**Close**<br/>dismissSheet( )"]
        end
        subgraph Desktop["🖥️ Desktop"]
            direction TB
            D1["**Form Dialog**<br/>dialog"]
            D2["**Confirmation**<br/>dialog (small)"]
            D3["**Menu**<br/>contextMenu"]
            D4["**Full Screen**<br/>window"]
            D5["**Close**<br/>closeDialog( )"]
        end
    end

    W1 -.-> M1
    M1 -.-> D1
    W2 -.-> M2
    M2 -.-> D2
    W3 -.-> M3
    M3 -.-> D3
    W4 -.-> M4
    M4 -.-> D4
    W5 -.-> M5
    M5 -.-> D5

    style Webapp fill:#e3f2fd,stroke:#1976d2
    style Mobile fill:#f3e5f5,stroke:#7b1fa2
    style Desktop fill:#e8f5e9,stroke:#388e3c
```

---

## Lists & Data

```mermaid
flowchart TB
    subgraph section[" "]
        direction LR
        subgraph Webapp["🌐 Webapp"]
            direction TB
            W1["**Table**<br/>table + thead + tbody"]
            W2["**Grid**<br/>container layout=grid"]
            W3["**Row**<br/>tr or card"]
            W4["**Actions**<br/>dropdown menu"]
            W5["**Pagination**<br/>pagination"]
            W6["**Refresh**<br/>button"]
        end
        subgraph Mobile["📱 Mobile"]
            direction TB
            M1["**Table**<br/>list"]
            M2["**Grid**<br/>list or horizontal scroll"]
            M3["**Row**<br/>listItem"]
            M4["**Actions**<br/>swipeActions"]
            M5["**Pagination**<br/>infinite scroll"]
            M6["**Refresh**<br/>refreshable=true"]
        end
        subgraph Desktop["🖥️ Desktop"]
            direction TB
            D1["**Table**<br/>table (selectable)"]
            D2["**Grid**<br/>container layout=grid"]
            D3["**Row**<br/>tr (interactive)"]
            D4["**Actions**<br/>contextMenu"]
            D5["**Pagination**<br/>pagination"]
            D6["**Refresh**<br/>toolbar button"]
        end
    end

    W1 -.-> M1
    M1 -.-> D1
    W2 -.-> M2
    M2 -.-> D2
    W3 -.-> M3
    M3 -.-> D3
    W4 -.-> M4
    M4 -.-> D4
    W5 -.-> M5
    M5 -.-> D5
    W6 -.-> M6
    M6 -.-> D6

    style Webapp fill:#e3f2fd,stroke:#1976d2
    style Mobile fill:#f3e5f5,stroke:#7b1fa2
    style Desktop fill:#e8f5e9,stroke:#388e3c
```

---

## Forms & Inputs

```mermaid
flowchart TB
    subgraph section[" "]
        direction LR
        subgraph Webapp["🌐 Webapp"]
            direction TB
            W1["**Form**<br/>form"]
            W2["**Text**<br/>input"]
            W3["**Select**<br/>select"]
            W4["**Toggle**<br/>switch or checkbox"]
            W5["**Date**<br/>datepicker"]
            W6["**Choice**<br/>radio group"]
        end
        subgraph Mobile["📱 Mobile"]
            direction TB
            M1["**Form**<br/>form"]
            M2["**Text**<br/>input"]
            M3["**Select**<br/>select or picker sheet"]
            M4["**Toggle**<br/>switch"]
            M5["**Date**<br/>datepicker (native)"]
            M6["**Choice**<br/>segmentedControl"]
        end
        subgraph Desktop["🖥️ Desktop"]
            direction TB
            D1["**Form**<br/>form"]
            D2["**Text**<br/>input"]
            D3["**Select**<br/>select"]
            D4["**Toggle**<br/>switch or checkbox"]
            D5["**Date**<br/>datepicker"]
            D6["**Choice**<br/>segmentedControl"]
        end
    end

    W1 -.-> M1
    M1 -.-> D1
    W2 -.-> M2
    M2 -.-> D2
    W3 -.-> M3
    M3 -.-> D3
    W4 -.-> M4
    M4 -.-> D4
    W5 -.-> M5
    M5 -.-> D5
    W6 -.-> M6
    M6 -.-> D6

    style Webapp fill:#e3f2fd,stroke:#1976d2
    style Mobile fill:#f3e5f5,stroke:#7b1fa2
    style Desktop fill:#e8f5e9,stroke:#388e3c
```

---

## Actions & Buttons

```mermaid
flowchart TB
    subgraph section[" "]
        direction LR
        subgraph Webapp["🌐 Webapp"]
            direction TB
            W1["**Primary Action**<br/>button in header"]
            W2["**Secondary**<br/>button group"]
            W3["**Destructive**<br/>button variant=danger"]
            W4["**Context Menu**<br/>dropdown / right-click"]
        end
        subgraph Mobile["📱 Mobile"]
            direction TB
            M1["**Primary Action**<br/>floatingButton or header"]
            M2["**Secondary**<br/>navigationBar rightButtons"]
            M3["**Destructive**<br/>alert destructive=true"]
            M4["**Context Menu**<br/>swipe or long-press"]
        end
        subgraph Desktop["🖥️ Desktop"]
            direction TB
            D1["**Primary Action**<br/>toolbar or menuBar"]
            D2["**Secondary**<br/>toolbar buttons"]
            D3["**Destructive**<br/>dialog confirm"]
            D4["**Context Menu**<br/>contextMenu (right-click)"]
        end
    end

    W1 -.-> M1
    M1 -.-> D1
    W2 -.-> M2
    M2 -.-> D2
    W3 -.-> M3
    M3 -.-> D3
    W4 -.-> M4
    M4 -.-> D4

    style Webapp fill:#e3f2fd,stroke:#1976d2
    style Mobile fill:#f3e5f5,stroke:#7b1fa2
    style Desktop fill:#e8f5e9,stroke:#388e3c
```

---

## Typography

```mermaid
flowchart TB
    subgraph section[" "]
        direction LR
        subgraph Webapp["🌐 Webapp"]
            direction TB
            W1["**Page Title**<br/>heading1"]
            W2["**Section**<br/>heading2"]
            W3["**Subsection**<br/>heading3"]
            W4["**Card Title**<br/>subtitle"]
            W5["**Body**<br/>body"]
            W6["**Secondary**<br/>caption"]
        end
        subgraph Mobile["📱 Mobile"]
            direction TB
            M1["**Page Title**<br/>largeTitle"]
            M2["**Section**<br/>title or headline"]
            M3["**Subsection**<br/>headline"]
            M4["**Card Title**<br/>body weight=medium"]
            M5["**Body**<br/>body"]
            M6["**Secondary**<br/>caption"]
        end
        subgraph Desktop["🖥️ Desktop"]
            direction TB
            D1["**Page Title**<br/>heading1"]
            D2["**Section**<br/>heading2"]
            D3["**Subsection**<br/>subtitle"]
            D4["**Card Title**<br/>body weight=medium"]
            D5["**Body**<br/>body"]
            D6["**Secondary**<br/>caption"]
        end
    end

    W1 -.-> M1
    M1 -.-> D1
    W2 -.-> M2
    M2 -.-> D2
    W3 -.-> M3
    M3 -.-> D3
    W4 -.-> M4
    M4 -.-> D4
    W5 -.-> M5
    M5 -.-> D5
    W6 -.-> M6
    M6 -.-> D6

    style Webapp fill:#e3f2fd,stroke:#1976d2
    style Mobile fill:#f3e5f5,stroke:#7b1fa2
    style Desktop fill:#e8f5e9,stroke:#388e3c
```

---

## Layout Containers

```mermaid
flowchart TB
    subgraph section[" "]
        direction LR
        subgraph Webapp["🌐 Webapp"]
            direction TB
            W1["**Vertical**<br/>container layout=column"]
            W2["**Horizontal**<br/>container layout=row"]
            W3["**Grid**<br/>container layout=grid"]
            W4["**Card**<br/>container variant=card"]
            W5["**Section**<br/>section"]
        end
        subgraph Mobile["📱 Mobile"]
            direction TB
            M1["**Vertical**<br/>column"]
            M2["**Horizontal**<br/>row"]
            M3["**Grid**<br/>grid or list"]
            M4["**Card**<br/>container variant=card"]
            M5["**Section**<br/>listSection"]
        end
        subgraph Desktop["🖥️ Desktop"]
            direction TB
            D1["**Vertical**<br/>column"]
            D2["**Horizontal**<br/>row"]
            D3["**Grid**<br/>container layout=grid"]
            D4["**Card**<br/>container variant=card"]
            D5["**Section**<br/>section or panel"]
        end
    end

    W1 -.-> M1
    M1 -.-> D1
    W2 -.-> M2
    M2 -.-> D2
    W3 -.-> M3
    M3 -.-> D3
    W4 -.-> M4
    M4 -.-> D4
    W5 -.-> M5
    M5 -.-> D5

    style Webapp fill:#e3f2fd,stroke:#1976d2
    style Mobile fill:#f3e5f5,stroke:#7b1fa2
    style Desktop fill:#e8f5e9,stroke:#388e3c
```

---

## Action Functions

```mermaid
flowchart TB
    subgraph section[" "]
        direction LR
        subgraph Webapp["🌐 Webapp"]
            direction TB
            W1["navigateTo(@page.X)"]
            W2["navigateBack( )"]
            W3["openModal(@modal.X)"]
            W4["closeModal( )"]
            W5["N/A"]
        end
        subgraph Mobile["📱 Mobile"]
            direction TB
            M1["push(@screen.X)"]
            M2["back button / swipe"]
            M3["presentSheet(@sheet.X)"]
            M4["dismissSheet( )"]
            M5["switchTab('name')"]
        end
        subgraph Desktop["🖥️ Desktop"]
            direction TB
            D1["setView('X') / treeItem"]
            D2["keyboard shortcut"]
            D3["openDialog(@dialog.X)"]
            D4["closeDialog( )"]
            D5["openWindow(@window.X)"]
        end
    end

    W1 -.-> M1
    M1 -.-> D1
    W2 -.-> M2
    M2 -.-> D2
    W3 -.-> M3
    M3 -.-> D3
    W4 -.-> M4
    M4 -.-> D4
    W5 -.-> M5
    M5 -.-> D5

    style Webapp fill:#e3f2fd,stroke:#1976d2
    style Mobile fill:#f3e5f5,stroke:#7b1fa2
    style Desktop fill:#e8f5e9,stroke:#388e3c
```

---

## Platform-Specific Elements

```mermaid
flowchart LR
    subgraph WebOnly["🌐 Webapp Only"]
        direction TB
        WA["breadcrumb"]
        WB["tabs (horizontal)"]
        WC["tooltip"]
    end

    subgraph MobileOnly["📱 Mobile Only"]
        direction TB
        MA["navigationBar"]
        MB["tabBar"]
        MC["sheet"]
        MD["alert"]
        ME["floatingButton"]
        MF["swipeAction"]
        MG["listItem / listSection"]
        MH["safeArea"]
        MI["refreshable"]
    end

    subgraph DesktopOnly["🖥️ Desktop Only"]
        direction TB
        DA["menuBar"]
        DB["toolbar / toolbarButton"]
        DC["statusBar"]
        DD["window (multi)"]
        DE["contextMenu"]
        DF["treeView / treeItem"]
        DG["splitView / panel"]
        DH["draggable / dropZone"]
        DI["tray"]
        DJ["keyboard shortcuts"]
    end

    style WebOnly fill:#e3f2fd,stroke:#1976d2
    style MobileOnly fill:#f3e5f5,stroke:#7b1fa2
    style DesktopOnly fill:#e8f5e9,stroke:#388e3c
```

---

## Migration Workflows

### Webapp → Mobile

```mermaid
flowchart LR
    subgraph S1["1️⃣ Structure"]
        A1["page → screen"]
        A2["Add navigationBar"]
        A3["Add safeArea"]
    end

    subgraph S2["2️⃣ Navigation"]
        B1["sidebar → tabs"]
        B2["navigateTo → push"]
    end

    subgraph S3["3️⃣ Overlays"]
        C1["modal → sheet"]
        C2["confirm → alert"]
    end

    subgraph S4["4️⃣ Lists"]
        D1["table → list"]
        D2["Add refreshable"]
        D3["Add swipeActions"]
    end

    subgraph S5["5️⃣ Actions"]
        E1["button → FAB"]
    end

    S1 --> S2 --> S3 --> S4 --> S5

    style S1 fill:#e8f5e9,stroke:#388e3c
    style S2 fill:#e3f2fd,stroke:#1976d2
    style S3 fill:#fff3e0,stroke:#f57c00
    style S4 fill:#fce4ec,stroke:#c2185b
    style S5 fill:#f3e5f5,stroke:#7b1fa2
```

### Webapp → Desktop

```mermaid
flowchart LR
    subgraph S1["1️⃣ Structure"]
        A1["page → view"]
        A2["Add menuBar"]
        A3["Add toolbar"]
        A4["Add statusBar"]
    end

    subgraph S2["2️⃣ Navigation"]
        B1["sidebar → treeView"]
        B2["Add shortcuts"]
    end

    subgraph S3["3️⃣ Overlays"]
        C1["modal → dialog"]
        C2["full modal → window"]
    end

    subgraph S4["4️⃣ Lists"]
        D1["Add selectable"]
        D2["Add contextMenu"]
        D3["Add drag/drop"]
    end

    subgraph S5["5️⃣ Layout"]
        E1["Add splitView"]
        E2["Add panels"]
    end

    S1 --> S2 --> S3 --> S4 --> S5

    style S1 fill:#e8f5e9,stroke:#388e3c
    style S2 fill:#e3f2fd,stroke:#1976d2
    style S3 fill:#fff3e0,stroke:#f57c00
    style S4 fill:#fce4ec,stroke:#c2185b
    style S5 fill:#f3e5f5,stroke:#7b1fa2
```

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

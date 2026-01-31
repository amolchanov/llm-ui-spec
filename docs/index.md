---
layout: home

hero:
  name: LLM UI Spec
  text: Declarative UI Specification
  tagline: Define UI structure that LLMs can interpret to generate platform-specific code
  actions:
    - theme: brand
      text: Get Started
      link: /spec/
    - theme: alt
      text: View on GitHub
      link: https://github.com/amolchanov/llm-ui-spec

features:
  - icon: 📝
    title: Declarative XML
    details: Define UI at varying levels of specificity - from high-level prompts to fully detailed structure
  - icon: 🔄
    title: Cross-Platform
    details: Write once, generate for webapp, mobile, and desktop with platform-specific patterns
  - icon: 🤖
    title: LLM-Friendly
    details: Natural language prompts guide AI code generation while maintaining structure
  - icon: 📐
    title: Iterative Development
    details: Start with requirements, progressively add detail through 4 specification levels
---

## Quick Example

```xml
<webapp name="MyApp" version="1.0">
  <entities>
    <entity name="Task">
      <field name="id" type="uuid" />
      <field name="title" type="string" required="true" />
      <field name="completed" type="boolean" default="false" />
    </entity>
  </entities>

  <pages>
    <page name="Dashboard" route="/dashboard">
      <prompt>
        Task dashboard with filterable list and quick-add form.
        Show completion stats at the top.
      </prompt>
    </page>
  </pages>
</webapp>
```

## Platforms

<div class="platforms">

### Webapp
Layouts, pages, modals, sidebar navigation, tables with pagination.

[Learn more →](/spec/webapp)

### Mobile
Screens, tab navigation, bottom sheets, swipe actions, pull-to-refresh.

[Learn more →](/spec/mobile)

### Desktop
Windows, menu bar, toolbar, context menus, split views, keyboard shortcuts.

[Learn more →](/spec/desktop)

</div>

<style>
.platforms {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .platforms {
    grid-template-columns: 1fr;
  }
}

.platforms h3 {
  margin-top: 0;
}
</style>

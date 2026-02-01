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

## Why LLM UI Spec?

**Keep LLMs grounded.** Without a spec, LLMs make assumptions about your UI that drift from your intent. Each generation becomes harder to control.

| Benefit | Without Spec | With Spec |
|---------|--------------|-----------|
| **Consistency** | LLM invents new patterns each time | Follows your defined components and layouts |
| **Control** | "Make it look nice" → unpredictable | Explicit structure with creative prompts where needed |
| **Iteration** | Start over or fight hallucinations | Refine progressively from L1 → L4 |
| **Cross-platform** | Rewrite everything per platform | Shared entities, platform-specific UI |
| **Constraints** | Hope LLM follows best practices | Enforce with `Must` / `Must NOT` rules |

The spec is your **single source of truth**. LLMs reference it to generate consistent, predictable code while still having creative freedom where you allow it.

## Iterative Development

Start with high-level requirements, progressively add detail:

![Iterative Development Levels](/images/iterative-development.svg)

At each level, validate with stakeholders before adding more detail. Generate code at any level - LLMs fill in the gaps based on your prompts and constraints.

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

## Tools

### Visual Editor
React-based editor for creating and editing specs with drag-and-drop. Open a spec file and visually build your UI structure.

```bash
cd editor && npm install && npm run dev
```

### Spec Compiler
Converts XML specs to LLM-friendly markdown for code generation. Outputs structured prompts that any LLM can use.

```bash
cd compiler && npm install

# Compile any platform spec
node dist/cli.js ../samples/formcraft.spec.xml -o webapp.md
node dist/cli.js ../samples/formcraft.mobile.spec.xml -o mobile.md
node dist/cli.js ../samples/formcraft.desktop.spec.xml -o desktop.md
```

## Platforms

| Platform | Description |
|----------|-------------|
| [Webapp](/spec/webapp) | Layouts, pages, modals, sidebar navigation, tables with pagination |
| [Mobile](/spec/mobile) | Screens, tab navigation, bottom sheets, swipe actions, pull-to-refresh |
| [Desktop](/spec/desktop) | Windows, menu bar, toolbar, context menus, split views, keyboard shortcuts |

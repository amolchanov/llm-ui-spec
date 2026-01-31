import type {
  Webapp,
  Entity,
  Field,
  Layout,
  Slot,
  Component,
  Page,
  UIElement,
  Navigation,
  Config,
  CompilerOptions,
  PromptInfo,
} from './types.js';

/**
 * Generate LLM-friendly markdown from a parsed webapp spec
 */
export function generateMarkdown(webapp: Webapp, options: Partial<CompilerOptions> = {}): string {
  const includePrompts = options.includePrompts ?? true;

  const sections: string[] = [];

  // Header
  sections.push(generateHeader(webapp));

  // Global LLM prompts (if any)
  if (includePrompts && webapp.config?.llm?.prompts) {
    sections.push(generateGlobalPrompts(webapp.config.llm.prompts));
  }

  // Entities
  if (webapp.entities.length > 0) {
    sections.push(generateEntitiesSection(webapp.entities));
  }

  // Layouts
  if (webapp.layouts.length > 0) {
    sections.push(generateLayoutsSection(webapp.layouts));
  }

  // Components
  if (webapp.components.length > 0) {
    sections.push(generateComponentsSection(webapp.components, includePrompts));
  }

  // Pages
  if (webapp.pages.length > 0) {
    sections.push(generatePagesSection(webapp.pages, includePrompts));
  }

  // Navigation
  if (webapp.navigation) {
    sections.push(generateNavigationSection(webapp.navigation));
  }

  // Theme
  if (webapp.config?.theme) {
    sections.push(generateThemeSection(webapp.config.theme));
  }

  return sections.join('\n\n---\n\n');
}

function generateHeader(webapp: Webapp): string {
  const lines: string[] = [
    `# ${webapp.name}`,
    '',
  ];

  if (webapp.version) {
    lines.push(`**Version:** ${webapp.version}`);
  }

  if (webapp.designSystem) {
    lines.push(`**Design System:** ${webapp.designSystem}`);
  }

  lines.push('');
  lines.push('This document describes the UI specification for code generation.');

  return lines.join('\n');
}

function generateGlobalPrompts(prompts: { type?: string; content: string }[]): string {
  const lines: string[] = [
    '## Code Generation Guidelines',
    '',
  ];

  for (const prompt of prompts) {
    if (prompt.type) {
      lines.push(`### ${capitalize(prompt.type)}`);
    }
    lines.push(prompt.content.trim());
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================
// Entities Section
// ============================================

function generateEntitiesSection(entities: Entity[]): string {
  const lines: string[] = [
    '## Data Entities',
    '',
    'The following data models are used throughout the application.',
    '',
  ];

  for (const entity of entities) {
    lines.push(`### ${entity.name}`);
    lines.push('');
    lines.push('| Field | Type | Required | Description |');
    lines.push('|-------|------|----------|-------------|');

    for (const field of entity.fields) {
      const required = field.required ? 'Yes' : 'No';
      const desc = generateFieldDescription(field);
      lines.push(`| \`${field.name}\` | \`${field.type}\` | ${required} | ${desc} |`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

function generateFieldDescription(field: Field): string {
  const parts: string[] = [];

  if (field.ref) {
    const humanRef = humanizeRef(field.ref);
    const cardinality = field.cardinality === 'many' ? ' (many)' : '';
    parts.push(`References ${humanRef}${cardinality}`);
  }

  if (field.values) {
    parts.push(`Values: ${field.values}`);
  }

  if (field.unique) {
    parts.push('Unique');
  }

  if (field.default) {
    parts.push(`Default: ${field.default}`);
  }

  if (field.minLength || field.maxLength) {
    const range = [field.minLength, field.maxLength].filter(Boolean).join('-');
    parts.push(`Length: ${range}`);
  }

  if (field.min !== undefined || field.max !== undefined) {
    const range = [field.min, field.max].filter((v) => v !== undefined).join('-');
    parts.push(`Range: ${range}`);
  }

  if (field.pattern) {
    parts.push(`Pattern: \`${field.pattern}\``);
  }

  return parts.join('. ') || '-';
}

// ============================================
// Layouts Section
// ============================================

function generateLayoutsSection(layouts: Layout[]): string {
  const lines: string[] = [
    '## Layouts',
    '',
    'Reusable page structure templates.',
    '',
  ];

  for (const layout of layouts) {
    lines.push(`### ${layout.name}`);
    lines.push('');

    if (layout.slots.length > 0) {
      lines.push('**Slots:**');
      lines.push('');
      lines.push('| Slot | Position | Role | Properties |');
      lines.push('|------|----------|------|------------|');

      for (const slot of layout.slots) {
        const position = slot.position || '-';
        const role = slot.role || '-';
        const props = generateSlotProps(slot);
        lines.push(`| \`${slot.name}\` | ${position} | ${role} | ${props} |`);
      }

      lines.push('');
    }

    // Generate structure description
    if (layout.children.length > 0) {
      lines.push('**Structure:**');
      lines.push('');
      lines.push(describeElements(layout.children, 0, { type: 'layout', name: layout.name }));
      lines.push('');
    }
  }

  return lines.join('\n');
}

function generateSlotProps(slot: Slot): string {
  const props: string[] = [];

  if (slot.sticky) props.push('sticky');
  if (slot.width) props.push(`width: ${slot.width}`);
  if (slot.height) props.push(`height: ${slot.height}`);
  if (slot.grow) props.push('grow');
  if (slot.scroll) props.push('scroll');
  if (slot.collapsible) props.push('collapsible');

  return props.join(', ') || '-';
}

// ============================================
// Components Section
// ============================================

function generateComponentsSection(components: Component[], includePrompts: boolean): string {
  const lines: string[] = [
    '## Components',
    '',
    'Reusable UI components.',
    '',
  ];

  for (const component of components) {
    lines.push(`### ${component.name}`);
    lines.push('');

    // Props table
    if (component.props.length > 0) {
      lines.push('**Props:**');
      lines.push('');
      lines.push('| Prop | Type | Required | Default |');
      lines.push('|------|------|----------|---------|');

      for (const prop of component.props) {
        const required = prop.required ? 'Yes' : 'No';
        const defaultVal = prop.default || '-';
        lines.push(`| \`${prop.name}\` | \`${prop.type}\` | ${required} | ${defaultVal} |`);
      }

      lines.push('');
    }

    // Actions
    if (component.actions.length > 0) {
      lines.push('**Actions:**');
      lines.push('');
      for (const action of component.actions) {
        const params = action.params ? `(${action.params})` : '()';
        lines.push(`- \`${action.name}${params}\``);
      }
      lines.push('');
    }

    // Prompt
    if (includePrompts && component.prompt) {
      lines.push('**YOU MUST:**');
      lines.push('');
      lines.push(formatPrompt(component.prompt));
      lines.push('');
    }

    // Structure
    if (component.children.length > 0) {
      lines.push('**Structure:**');
      lines.push('');
      lines.push(describeElements(component.children, 0, { type: 'component', name: component.name }));
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ============================================
// Pages Section
// ============================================

function generatePagesSection(pages: Page[], includePrompts: boolean): string {
  const lines: string[] = [
    '## Pages',
    '',
    'Application pages and routes.',
    '',
  ];

  for (const page of pages) {
    lines.push(`### ${page.name}`);
    lines.push('');
    lines.push(`**Route:** \`${page.route}\``);

    if (page.layout) {
      lines.push(`**Layout:** ${page.layout}`);
    }

    if (page.auth) {
      lines.push(`**Auth:** ${page.auth}`);
    }

    if (page.title) {
      lines.push(`**Title:** ${page.title}`);
    }

    lines.push('');

    // URL Params
    if (page.params.length > 0) {
      lines.push('**URL Parameters:**');
      lines.push('');
      for (const param of page.params) {
        lines.push(`- \`${param.name}\`: ${param.type}`);
      }
      lines.push('');
    }

    // Data queries
    if (page.data.length > 0) {
      lines.push('**Data:**');
      lines.push('');
      lines.push('| Query | Type | Source/Filter |');
      lines.push('|-------|------|---------------|');

      for (const query of page.data) {
        const type = query.type || '-';
        const source = query.source || query.filter || '-';
        lines.push(`| \`${query.name}\` | ${type} | ${source} |`);
      }

      lines.push('');
    }

    // Local state
    if (page.localState.length > 0) {
      lines.push('**Local State:**');
      lines.push('');
      for (const state of page.localState) {
        const defaultVal = state.default ? ` = ${state.default}` : '';
        const type = state.type ? `: ${state.type}` : '';
        lines.push(`- \`${state.name}${type}${defaultVal}\``);
      }
      lines.push('');
    }

    // Prompt
    if (includePrompts && page.prompt) {
      lines.push('**YOU MUST:**');
      lines.push('');
      lines.push(formatPrompt(page.prompt));
      lines.push('');
    }

    // Content structure
    if (page.children.length > 0) {
      lines.push('**Content:**');
      lines.push('');
      lines.push(describeElements(page.children, 0, { type: 'page', name: page.name }));
      lines.push('');
    }

    // Page states (loading, error, etc.)
    if (page.states.length > 0) {
      lines.push('**UI States:**');
      lines.push('');
      for (const state of page.states) {
        const promptText = state.prompt ? formatPromptInline(state.prompt) : 'Custom rendering';
        lines.push(`- **${state.name}**: ${promptText}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ============================================
// Navigation Section
// ============================================

function generateNavigationSection(navigation: Navigation): string {
  const lines: string[] = [
    '## Navigation',
    '',
  ];

  // Guards
  if (navigation.guards.length > 0) {
    lines.push('### Auth Guards');
    lines.push('');
    lines.push('| Guard | Redirect | Condition |');
    lines.push('|-------|----------|-----------|');

    for (const guard of navigation.guards) {
      const condition = guard.role || guard.condition || '-';
      lines.push(`| \`${guard.name}\` | ${guard.redirect} | ${condition} |`);
    }

    lines.push('');
  }

  // Flows
  if (navigation.flows.length > 0) {
    lines.push('### Navigation Flows');
    lines.push('');
    for (const flow of navigation.flows) {
      lines.push(`**${flow.name}:**`);
      if (flow.prompt) {
        lines.push(formatPrompt(flow.prompt));
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ============================================
// Theme Section
// ============================================

function generateThemeSection(theme: Config['theme']): string {
  if (!theme) return '';

  const lines: string[] = [
    '## Theme',
    '',
  ];

  // Colors
  if (theme.colors && Object.keys(theme.colors).length > 0) {
    lines.push('### Colors');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(theme.colors, null, 2));
    lines.push('```');
    lines.push('');
  }

  // Spacing
  if (theme.spacing?.unit) {
    lines.push(`**Spacing Unit:** ${theme.spacing.unit}`);
    lines.push('');
  }

  // Border radius
  if (theme.borderRadius?.default) {
    lines.push(`**Border Radius:** ${theme.borderRadius.default}`);
    lines.push('');
  }

  // Shadows
  if (theme.shadows && Object.keys(theme.shadows).length > 0) {
    lines.push('### Shadows');
    lines.push('');
    for (const [name, value] of Object.entries(theme.shadows)) {
      lines.push(`- **${name}:** \`${value}\``);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================
// Helpers
// ============================================

/**
 * Generate human-readable description of UI elements
 */
// Elements that are fully described by their parent (don't render children separately)
const SELF_CONTAINED_ELEMENTS = new Set(['table', 'thead', 'tbody', 'tr', 'td', 'th']);

function describeElements(elements: UIElement[], depth: number, context?: { type: string; name: string }): string {
  const indent = '  '.repeat(depth);
  const lines: string[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const type = el.type.toLowerCase();

    // Skip table internal elements - they're described by the table itself
    if (['thead', 'tbody', 'tr', 'td', 'th'].includes(type)) {
      continue;
    }

    const bullet = depth === 0 ? `${i + 1}.` : '-';
    const description = describeElement(el, context);

    // Tables are self-contained - don't recurse into children
    const isSelfContained = SELF_CONTAINED_ELEMENTS.has(type);

    if (el.prompt) {
      lines.push(`${indent}${bullet} ${description}`);
      lines.push(`${indent}   **YOU MUST:** ${formatPromptInline(el.prompt)}`);
    } else if (el.children.length > 0 && !isSelfContained) {
      lines.push(`${indent}${bullet} ${description}`);
      lines.push(describeElements(el.children, depth + 1, context));
    } else {
      lines.push(`${indent}${bullet} ${description}`);
    }
  }

  return lines.join('\n');
}

/**
 * Describe a single UI element in human-readable form
 */
function describeElement(el: UIElement, context?: { type: string; name: string }): string {
  const props = el.props;
  const type = el.type.toLowerCase();

  // Handle different element types
  switch (type) {
    case 'container':
      return describeContainer(props);
    case 'slot':
      return describeSlot(props, context);
    case 'text':
      return describeText(el);
    case 'button':
      return describeButton(props);
    case 'link':
      return describeLink(props);
    case 'input':
      return describeInput(props);
    case 'image':
      return describeImage(props);
    case 'icon':
      return describeIcon(props);
    case 'card':
      return describeCard(props);
    case 'list':
      return describeList(props);
    case 'for':
      return describeFor(props);
    case 'if':
      return describeIf(props);
    case 'use':
      return describeUse(props);
    case 'form':
      return describeForm(props);
    case 'table':
      return describeTable(el);
    case 'dialog':
    case 'modal':
      return describeDialog(props);
    case 'tabs':
      return describeTabs(props);
    case 'tab':
      return describeTab(props);
    case 'dropdown':
    case 'menu':
      return describeDropdown(props);
    case 'badge':
      return describeBadge(props);
    case 'avatar':
      return describeAvatar(props);
    case 'heading':
    case 'h1':
    case 'h2':
    case 'h3':
      return describeHeading(el);
    default:
      return describeGenericElement(el);
  }
}

function describeContainer(props: Record<string, unknown>): string {
  const parts: string[] = [];
  const layout = props.layout || 'block';

  if (layout === 'row') {
    parts.push('Horizontal row');
  } else if (layout === 'column') {
    parts.push('Vertical column');
  } else if (layout === 'grid') {
    const cols = props.columns ? ` with ${props.columns} columns` : '';
    parts.push(`Grid layout${cols}`);
  } else if (layout === 'center') {
    parts.push('Centered container');
  } else {
    parts.push('Container');
  }

  if (props.grow) parts.push('fills available space');
  if (props.scroll) parts.push('scrollable');
  if (props.padding) parts.push(`${props.padding} padding`);
  if (props.gap) parts.push(`${props.gap} gap`);
  if (props.width) parts.push(`${props.width} wide`);
  if (props.minHeight) parts.push(`min-height ${props.minHeight}`);
  if (props.background) {
    const bg = String(props.background);
    const humanBg = bg.startsWith('@') ? humanizeRef(bg) : bg;
    parts.push(`background: ${humanBg}`);
  }

  return parts.length > 1 ? `${parts[0]} (${parts.slice(1).join(', ')})` : parts[0];
}

function describeSlot(props: Record<string, unknown>, context?: { type: string; name: string }): string {
  const name = props.name as string | undefined;
  const target = props.target as string | undefined;

  // If this is a slot fill (has target), describe it as filling a layout slot
  if (target) {
    const humanTarget = humanizeRef(target);
    return `Fill ${humanTarget}`;
  }

  // Otherwise it's a slot definition
  const ref = context ? `@${context.type}.${context.name}.${name}` : `@slot.${name}`;
  const parts: string[] = [];

  parts.push(`**${name}** slot (${ref})`);

  const attrs: string[] = [];
  if (props.position) attrs.push(`positioned ${props.position}`);
  if (props.sticky) attrs.push('sticky');
  if (props.width) attrs.push(`${props.width} wide`);
  if (props.height) attrs.push(`${props.height} tall`);
  if (props.grow) attrs.push('grows to fill');
  if (props.scroll) attrs.push('scrollable');
  if (props.collapsible) {
    const bp = props.breakpoint ? ` below ${props.breakpoint}` : '';
    attrs.push(`collapsible${bp}`);
  }
  if (props.role) attrs.push(`role: ${props.role}`);

  if (attrs.length > 0) {
    parts.push(`— ${attrs.join(', ')}`);
  }

  return parts.join(' ');
}

function describeText(el: UIElement): string {
  const content = String(el.textContent || el.props.value || '');
  if (!content) return 'Text element';

  if (content.startsWith('@')) {
    return `Text showing ${humanizeRef(content)}`;
  }
  return `Text: "${truncate(content, 50)}"`;
}

function describeButton(props: Record<string, unknown>): string {
  const variant = props.variant ? ` (${props.variant})` : '';
  const label = props.label || props.children || '';
  const action = String(props.onClick || props.action || props.target || '');

  let desc = `Button${variant}`;
  if (label) desc += `: "${label}"`;
  if (action) {
    const humanAction = action.startsWith('@') ? humanizeRef(action) : action;
    desc += ` → ${humanAction}`;
  }

  return desc;
}

function describeLink(props: Record<string, unknown>): string {
  const target = String(props.to || props.href || props.target || '');
  const label = props.label || props.children || '';

  let desc = 'Link';
  if (label) desc += `: "${label}"`;
  if (target) desc += ` → ${humanizeRef(target)}`;

  return desc;
}

function describeInput(props: Record<string, unknown>): string {
  const inputType = props.type || 'text';
  const name = String(props.name || '');
  const placeholder = props.placeholder || '';
  const value = String(props.value || '');

  let desc = `${capitalize(String(inputType))} input`;
  if (name) desc += ` (${name})`;
  if (value && value.startsWith('@')) {
    desc += ` bound to ${humanizeRef(value)}`;
  }
  if (placeholder) desc += ` — placeholder: "${placeholder}"`;
  if (props.required) desc += ' [required]';

  return desc;
}

function describeImage(props: Record<string, unknown>): string {
  const src = String(props.src || '');
  const alt = props.alt || '';

  let desc = 'Image';
  if (src) {
    const humanSrc = src.startsWith('@') ? humanizeRef(src) : src;
    desc += `: ${humanSrc}`;
  }
  if (alt) desc += ` — "${alt}"`;

  return desc;
}

function describeIcon(props: Record<string, unknown>): string {
  const name = props.name || props.icon || '';
  return name ? `Icon: ${name}` : 'Icon';
}

function describeCard(props: Record<string, unknown>): string {
  const variant = props.variant ? ` (${props.variant})` : '';
  return `Card${variant}`;
}

function describeList(props: Record<string, unknown>): string {
  const variant = props.variant || 'default';
  return `List (${variant} style)`;
}

function describeFor(props: Record<string, unknown>): string {
  const each = props.each || 'item';
  const collection = String(props.in || props.items || 'items');
  const humanCollection = collection.startsWith('@') ? humanizeRef(collection) : `\`${collection}\``;
  return `**For each** \`${each}\` in ${humanCollection}:`;
}

function describeIf(props: Record<string, unknown>): string {
  const condition = String(props.condition || props.when || 'condition');
  const humanCondition = humanizeExpression(condition);
  return `**If** ${humanCondition}:`;
}

function describeUse(props: Record<string, unknown>): string {
  const component = String(props.component || props.name || '');
  // If component already starts with @, use as-is; otherwise add @component. prefix
  const ref = component.startsWith('@') ? component : `@component.${component}`;
  const humanRef = humanizeRef(ref);

  const propsList = Object.entries(props)
    .filter(([k]) => !['component', 'name'].includes(k))
    .map(([k, v]) => {
      const strVal = String(v);
      const humanVal = strVal.startsWith('@') ? humanizeRef(strVal) : JSON.stringify(v);
      return `${k}=${humanVal}`;
    })
    .slice(0, 3);

  let desc = `Use ${humanRef}`;
  if (propsList.length > 0) desc += ` with ${propsList.join(', ')}`;

  return desc;
}

function describeForm(props: Record<string, unknown>): string {
  const action = props.action || props.onSubmit || '';
  const method = props.method || 'POST';

  let desc = 'Form';
  if (action) desc += ` → ${action} (${method})`;

  return desc;
}

function describeTable(el: UIElement): string {
  const props = el.props;
  const parts: string[] = ['Table'];

  // Check for data source
  const data = String(props.data || props.items || '');
  if (data) {
    const humanData = data.startsWith('@') ? humanizeRef(data) : `\`${data}\``;
    parts[0] = `Table displaying ${humanData}`;
  }

  // Extract column headers from thead
  const columns = extractTableColumns(el);
  if (columns.length > 0) {
    parts.push(`with columns: ${columns.join(', ')}`);
  }

  // Extract row data pattern from tbody
  const cellDescriptions = extractTableCells(el);
  if (cellDescriptions.length > 0) {
    parts.push(`showing: ${cellDescriptions.join(', ')}`);
  }

  return parts.join(' ');
}

/**
 * Extract column headers from table thead
 */
function extractTableColumns(table: UIElement): string[] {
  const columns: string[] = [];

  // Find thead
  const thead = table.children.find(c => c.type === 'thead');
  if (!thead) return columns;

  // Find first tr in thead
  const tr = thead.children.find(c => c.type === 'tr');
  if (!tr) return columns;

  // Extract th content
  for (const th of tr.children.filter(c => c.type === 'th')) {
    const text = th.textContent || th.props.children || '';
    if (text) {
      columns.push(String(text).trim());
    } else if (th.children.length > 0) {
      // Try to get text from first child
      const firstChild = th.children[0];
      const childText = firstChild?.textContent || firstChild?.props?.value || firstChild?.props?.children || '';
      columns.push(childText ? String(childText).trim() : '(column)');
    } else {
      // Empty header - often means actions column
      columns.push('');
    }
  }

  // Replace empty columns - last empty column is often actions
  return columns.map((col, i) => {
    if (!col && i === columns.length - 1) return '(actions)';
    return col || '(column)';
  });
}

/**
 * Extract cell data patterns from table tbody
 */
function extractTableCells(table: UIElement): string[] {
  const descriptions: string[] = [];

  // Find tbody
  const tbody = table.children.find(c => c.type === 'tbody');
  if (!tbody) return descriptions;

  // Find first tr (or for loop containing tr)
  let rowTemplate: UIElement | undefined;
  for (const child of tbody.children) {
    if (child.type === 'tr') {
      rowTemplate = child;
      break;
    } else if (child.type === 'for' || child.type === 'each') {
      // Find tr inside the loop
      rowTemplate = child.children.find(c => c.type === 'tr');
      break;
    }
  }

  if (!rowTemplate) return descriptions;

  // Extract td content descriptions
  for (const td of rowTemplate.children.filter(c => c.type === 'td')) {
    const cellDesc = describeCellContent(td);
    if (cellDesc) {
      descriptions.push(cellDesc);
    }
  }

  return descriptions;
}

/**
 * Describe the content of a table cell
 */
function describeCellContent(td: UIElement): string {
  // Direct text content
  if (td.textContent) {
    const text = String(td.textContent);
    return text.startsWith('@') ? humanizeRef(text) : `"${truncate(text, 20)}"`;
  }

  // Check first child element
  if (td.children.length === 0) return '';

  const firstChild = td.children[0];
  const type = firstChild.type.toLowerCase();

  switch (type) {
    case 'text': {
      const value = String(firstChild.textContent || firstChild.props.value || '');
      return value.startsWith('@') ? humanizeRef(value) : (value ? `"${truncate(value, 20)}"` : '');
    }
    case 'badge':
      return 'status badge';
    case 'button':
      return 'action button';
    case 'link':
      return 'link';
    case 'image':
    case 'avatar':
      return 'image';
    case 'icon':
      return 'icon';
    case 'if': {
      // Conditional content - describe what's shown
      const conditionalChild = firstChild.children[0];
      if (conditionalChild) {
        return describeCellContent({ ...td, children: [conditionalChild] }) || 'conditional content';
      }
      return 'conditional content';
    }
    default:
      return type;
  }
}

function describeDialog(props: Record<string, unknown>): string {
  const title = props.title || '';
  const trigger = props.trigger || '';

  let desc = 'Dialog/Modal';
  if (title) desc += `: "${title}"`;
  if (trigger) desc += ` (triggered by: ${trigger})`;

  return desc;
}

function describeTabs(props: Record<string, unknown>): string {
  const defaultTab = props.default || props.defaultValue || '';
  return defaultTab ? `Tabs (default: ${defaultTab})` : 'Tabs';
}

function describeTab(props: Record<string, unknown>): string {
  const label = props.label || props.name || '';
  const value = props.value || '';
  return `Tab: "${label}"` + (value ? ` (value: ${value})` : '');
}

function describeDropdown(props: Record<string, unknown>): string {
  const trigger = props.trigger || props.label || '';
  return trigger ? `Dropdown menu: "${trigger}"` : 'Dropdown menu';
}

function describeBadge(props: Record<string, unknown>): string {
  const variant = props.variant || 'default';
  const value = props.value || props.children || '';

  let desc = `Badge (${variant})`;
  if (value) desc += `: "${value}"`;

  return desc;
}

function describeAvatar(props: Record<string, unknown>): string {
  const src = String(props.src || props.image || '');
  const fallback = String(props.fallback || props.name || '');

  let desc = 'Avatar';
  if (src) {
    const humanSrc = src.startsWith('@') ? humanizeRef(src) : src;
    desc += `: ${humanSrc}`;
  }
  if (fallback) {
    const humanFallback = fallback.startsWith('@') ? humanizeRef(fallback) : fallback;
    desc += ` (fallback: ${humanFallback})`;
  }

  return desc;
}

function describeHeading(el: UIElement): string {
  const level = el.type.replace(/\D/g, '') || '1';
  const content = el.textContent || el.props.children || '';
  return `Heading (h${level})${content ? `: "${truncate(String(content), 40)}"` : ''}`;
}

function describeGenericElement(el: UIElement): string {
  const typeName = capitalize(el.type);
  const importantProps = ['name', 'value', 'label', 'variant', 'type'];
  const attrs: string[] = [];

  for (const prop of importantProps) {
    if (el.props[prop]) {
      attrs.push(`${prop}: ${el.props[prop]}`);
    }
  }

  if (el.textContent) {
    attrs.push(`"${truncate(el.textContent, 30)}"`);
  }

  return attrs.length > 0 ? `${typeName} (${attrs.join(', ')})` : typeName;
}

/**
 * Convert @references to human-readable format
 */
function humanizeRef(value: string): string {
  if (!value.startsWith('@')) {
    if (value.startsWith('/')) {
      return `page at route "${value}"`;
    }
    return value;
  }

  // Parse @namespace.path.parts
  const parts = value.substring(1).split('.');

  if (parts.length === 0) return value;

  const namespace = parts[0];
  const rest = parts.slice(1).join('.');

  switch (namespace) {
    case 'entity':
      return rest ? `the ${rest} entity` : 'entity';
    case 'component':
      return rest ? `the ${rest} component` : 'component';
    case 'page':
      return rest ? `the ${rest} page` : 'page';
    case 'layout':
      if (parts.length >= 3) {
        return `the ${parts[2]} slot of ${parts[1]} layout`;
      }
      return rest ? `the ${rest} layout` : 'layout';
    case 'prop':
      return rest ? `prop \`${rest}\`` : 'prop';
    case 'state':
      return rest ? `state \`${rest}\`` : 'state';
    case 'param':
      return rest ? `URL param \`${rest}\`` : 'param';
    case 'item':
      return rest ? `current item's \`${rest}\`` : 'current item';
    case 'action':
      return rest ? `\`${rest}()\` action` : 'action';
    case 'theme':
      return rest ? `theme value \`${rest}\`` : 'theme';
    case 'i18n':
      return rest ? `translation "${rest}"` : 'translation';
    case 'asset':
      if (parts.length >= 3) {
        return `${parts[1]} asset "${parts.slice(2).join('.')}"`;
      }
      return rest ? `asset "${rest}"` : 'asset';
    case 'config':
      return rest ? `config \`${rest}\`` : 'config';
    case 'route':
      return `page at route "${rest}"`;
    default:
      return value;
  }
}

/**
 * Convert logic expression to human-readable format
 */
function humanizeExpression(expr: string): string {
  if (!expr) return expr;

  // Replace @references
  let result = expr.replace(/@[\w.]+/g, (match) => humanizeRef(match));

  // Replace common operators with words
  result = result
    .replace(/\s*===\s*/g, ' equals ')
    .replace(/\s*!==\s*/g, ' does not equal ')
    .replace(/\s*==\s*/g, ' equals ')
    .replace(/\s*!=\s*/g, ' does not equal ')
    .replace(/\s*>=\s*/g, ' is at least ')
    .replace(/\s*<=\s*/g, ' is at most ')
    .replace(/\s*>\s*/g, ' is greater than ')
    .replace(/\s*<\s*/g, ' is less than ')
    .replace(/\s*&&\s*/g, ' AND ')
    .replace(/\s*\|\|\s*/g, ' OR ')
    .replace(/!/g, 'NOT ');

  return result;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str: string, maxLen: number): string {
  const clean = str.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  return clean.substring(0, maxLen - 3) + '...';
}

/**
 * Format a prompt with its context/constraints markers
 */
function formatPrompt(prompt: PromptInfo, indent: string = ''): string {
  const lines: string[] = [];
  const markers: string[] = [];

  if (prompt.context) markers.push('Context');
  if (prompt.constraints) markers.push('Constraints');

  if (markers.length > 0) {
    lines.push(`${indent}> **[${markers.join(', ')}]**`);
    lines.push(`${indent}>`);
    // Format content with blockquote for context/constraints
    const contentLines = prompt.content.trim().split('\n');
    for (const line of contentLines) {
      lines.push(`${indent}> ${line}`);
    }
  } else {
    lines.push(prompt.content.trim());
  }

  return lines.join('\n');
}

/**
 * Format a prompt for inline display (short form)
 */
function formatPromptInline(prompt: PromptInfo): string {
  const markers: string[] = [];
  if (prompt.context) markers.push('ctx');
  if (prompt.constraints) markers.push('rules');

  const prefix = markers.length > 0 ? `[${markers.join('+')}] ` : '';
  return prefix + prompt.content.trim();
}

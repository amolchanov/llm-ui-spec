import type {
  UISpecProject,
  Entity,
  Layout,
  ComponentDef,
  Page,
  UIElement,
  Navigation,
  NavItem,
  Config,
  MaterializedView,
  Assets,
} from '@/types/spec';

function indent(level: number): string {
  return '  '.repeat(level);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatAttr(name: string, value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  return ` ${name}="${escapeXml(String(value))}"`;
}

export function serializeToXML(project: UISpecProject): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');

  let attrs = `name="${escapeXml(project.name)}"`;
  attrs += ` version="${escapeXml(project.version)}"`;
  if (project.designSystem) {
    attrs += ` designSystem="${escapeXml(project.designSystem)}"`;
  }

  lines.push(`<uispec ${attrs}>`);

  // Entities
  if (project.entities.length > 0) {
    lines.push(`${indent(1)}<entities>`);
    for (const entity of project.entities) {
      lines.push(...serializeEntity(entity, 2));
    }
    lines.push(`${indent(1)}</entities>`);
  }

  // Layouts
  if (project.layouts.length > 0) {
    lines.push(`${indent(1)}<layouts>`);
    for (const layout of project.layouts) {
      lines.push(...serializeLayout(layout, 2));
    }
    lines.push(`${indent(1)}</layouts>`);
  }

  // Components
  if (project.components.length > 0) {
    lines.push(`${indent(1)}<components>`);
    for (const component of project.components) {
      lines.push(...serializeComponent(component, 2));
    }
    lines.push(`${indent(1)}</components>`);
  }

  // Pages
  if (project.pages.length > 0) {
    lines.push(`${indent(1)}<pages>`);
    for (const page of project.pages) {
      lines.push(...serializePage(page, 2));
    }
    lines.push(`${indent(1)}</pages>`);
  }

  // Navigation
  if (project.navigation) {
    lines.push(...serializeNavigation(project.navigation, 1));
  }

  // Config
  if (project.config) {
    lines.push(...serializeConfig(project.config, 1));
  }

  // Assets
  if (project.assets && project.assets.groups.length > 0) {
    lines.push(...serializeAssets(project.assets, 1));
  }

  // Materialized Views
  if (project.materializedViews.length > 0) {
    lines.push(`${indent(1)}<materializedViews>`);
    for (const view of project.materializedViews) {
      lines.push(...serializeMaterializedView(view, 2));
    }
    lines.push(`${indent(1)}</materializedViews>`);
  }

  lines.push('</uispec>');
  return lines.join('\n');
}

function serializeEntity(entity: Entity, level: number): string[] {
  const lines: string[] = [];
  lines.push(`${indent(level)}<entity name="${escapeXml(entity.name)}">`);

  for (const field of entity.fields) {
    let attrs = `name="${escapeXml(field.name)}" type="${field.type}"`;
    if (field.required) attrs += ' required="true"';
    if (field.unique) attrs += ' unique="true"';
    if (field.default) attrs += formatAttr('default', field.default);
    if (field.reference) attrs += formatAttr('reference', field.reference);
    if (field.enum) attrs += formatAttr('enum', field.enum.join(','));
    lines.push(`${indent(level + 1)}<field ${attrs}/>`);
  }

  lines.push(`${indent(level)}</entity>`);
  return lines;
}

function serializeLayout(layout: Layout, level: number): string[] {
  const lines: string[] = [];
  lines.push(`${indent(level)}<layout name="${escapeXml(layout.name)}">`);

  for (const slot of layout.slots) {
    let attrs = `name="${escapeXml(slot.name)}"`;
    if (slot.required) attrs += ' required="true"';
    if (slot.role) attrs += formatAttr('role', slot.role);
    lines.push(`${indent(level + 1)}<slot ${attrs}/>`);
  }

  for (const child of layout.children) {
    lines.push(...serializeElement(child, level + 1));
  }

  lines.push(`${indent(level)}</layout>`);
  return lines;
}

function serializeComponent(component: ComponentDef, level: number): string[] {
  const lines: string[] = [];
  lines.push(`${indent(level)}<component name="${escapeXml(component.name)}">`);

  for (const prop of component.props) {
    let attrs = `name="${escapeXml(prop.name)}" type="${prop.type}"`;
    if (prop.required) attrs += ' required="true"';
    if (prop.default) attrs += formatAttr('default', prop.default);
    lines.push(`${indent(level + 1)}<prop ${attrs}/>`);
  }

  for (const child of component.children) {
    lines.push(...serializeElement(child, level + 1));
  }

  lines.push(`${indent(level)}</component>`);
  return lines;
}

function serializePage(page: Page, level: number): string[] {
  const lines: string[] = [];
  let attrs = `name="${escapeXml(page.name)}" route="${escapeXml(page.route)}"`;
  if (page.layout) attrs += formatAttr('layout', page.layout);
  if (page.title) attrs += formatAttr('title', page.title);

  if (page.children.length === 0) {
    lines.push(`${indent(level)}<page ${attrs}/>`);
  } else {
    lines.push(`${indent(level)}<page ${attrs}>`);
    for (const child of page.children) {
      lines.push(...serializeElement(child, level + 1));
    }
    lines.push(`${indent(level)}</page>`);
  }

  return lines;
}

// Map internal property names to XML attribute names (for namespaced attributes)
const PROP_TO_ATTR_MAP: Record<string, string> = {
  promptContext: 'prompt:context',
  promptConstraints: 'prompt:constraints',
  promptOverride: 'prompt:override',
};

function serializeElement(element: UIElement, level: number): string[] {
  const lines: string[] = [];
  const { type, props, children } = element;

  // Build attributes string
  const attrParts: string[] = [];
  const textContent = props.content;

  for (const [key, value] of Object.entries(props)) {
    if (key === 'content') continue; // Handle separately as text content
    if (value !== undefined && value !== null && value !== '') {
      // Convert internal prop names to XML attribute names
      const attrName = PROP_TO_ATTR_MAP[key] || key;
      attrParts.push(`${attrName}="${escapeXml(String(value))}"`);
    }
  }

  const attrs = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';

  if (children.length === 0 && !textContent) {
    lines.push(`${indent(level)}<${type}${attrs}/>`);
  } else if (children.length === 0 && textContent) {
    lines.push(`${indent(level)}<${type}${attrs}>${escapeXml(String(textContent))}</${type}>`);
  } else {
    lines.push(`${indent(level)}<${type}${attrs}>`);
    if (textContent) {
      lines.push(`${indent(level + 1)}${escapeXml(String(textContent))}`);
    }
    for (const child of children) {
      lines.push(...serializeElement(child, level + 1));
    }
    lines.push(`${indent(level)}</${type}>`);
  }

  return lines;
}

function serializeNavigation(nav: Navigation, level: number): string[] {
  const lines: string[] = [];
  lines.push(`${indent(level)}<navigation type="${nav.type}">`);

  for (const item of nav.items) {
    lines.push(...serializeNavItem(item, level + 1));
  }

  lines.push(`${indent(level)}</navigation>`);
  return lines;
}

function serializeNavItem(item: NavItem, level: number): string[] {
  const lines: string[] = [];
  let attrs = `label="${escapeXml(item.label)}"`;
  if (item.page) attrs += formatAttr('page', item.page);
  if (item.icon) attrs += formatAttr('icon', item.icon);

  if (!item.children || item.children.length === 0) {
    lines.push(`${indent(level)}<item ${attrs}/>`);
  } else {
    lines.push(`${indent(level)}<item ${attrs}>`);
    for (const child of item.children) {
      lines.push(...serializeNavItem(child, level + 1));
    }
    lines.push(`${indent(level)}</item>`);
  }

  return lines;
}

function serializeConfig(config: Config, level: number): string[] {
  const lines: string[] = [];
  lines.push(`${indent(level)}<config>`);

  if (config.theme) {
    let attrs = '';
    if (config.theme.primaryColor) attrs += formatAttr('primaryColor', config.theme.primaryColor);
    if (config.theme.mode) attrs += formatAttr('mode', config.theme.mode);
    lines.push(`${indent(level + 1)}<theme${attrs}/>`);
  }

  if (config.api) {
    let attrs = '';
    if (config.api.baseUrl) attrs += formatAttr('baseUrl', config.api.baseUrl);
    lines.push(`${indent(level + 1)}<api${attrs}/>`);
  }

  if (config.auth) {
    let attrs = '';
    if (config.auth.provider) attrs += formatAttr('provider', config.auth.provider);
    if (config.auth.loginPage) attrs += formatAttr('loginPage', config.auth.loginPage);
    lines.push(`${indent(level + 1)}<auth${attrs}/>`);
  }

  lines.push(`${indent(level)}</config>`);
  return lines;
}

function serializeMaterializedView(view: MaterializedView, level: number): string[] {
  const lines: string[] = [];
  lines.push(`${indent(level)}<view name="${escapeXml(view.name)}" baseEntity="${escapeXml(view.baseEntity)}">`);

  for (const join of view.joins) {
    let attrs = `type="${join.type}" entity="${escapeXml(join.entity)}"`;
    attrs += ` localField="${escapeXml(join.localField)}" foreignField="${escapeXml(join.foreignField)}"`;
    if (join.alias) attrs += formatAttr('alias', join.alias);
    lines.push(`${indent(level + 1)}<join ${attrs}/>`);
  }

  for (const field of view.selectedFields) {
    if (!field.selected) continue;
    let attrs = `source="${escapeXml(field.source)}" name="${escapeXml(field.field)}"`;
    if (field.alias) attrs += formatAttr('alias', field.alias);
    lines.push(`${indent(level + 1)}<field ${attrs}/>`);
  }

  lines.push(`${indent(level)}</view>`);
  return lines;
}

function serializeAssets(assets: Assets, level: number): string[] {
  const lines: string[] = [];
  lines.push(`${indent(level)}<assets>`);

  for (const group of assets.groups) {
    lines.push(`${indent(level + 1)}<${group.name}>`);
    for (const asset of group.items) {
      lines.push(`${indent(level + 2)}<${asset.name} src="${escapeXml(asset.src)}"/>`);
    }
    lines.push(`${indent(level + 1)}</${group.name}>`);
  }

  lines.push(`${indent(level)}</assets>`);
  return lines;
}

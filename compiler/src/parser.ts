import { XMLParser } from 'fast-xml-parser';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import type {
  Webapp,
  Entity,
  Field,
  Layout,
  Slot,
  Component,
  Prop,
  Action,
  Page,
  Param,
  Query,
  State,
  PageState,
  UIElement,
  Navigation,
  Guard,
  Flow,
  Config,
  PromptInfo,
} from './types.js';

type XmlNode = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  preserveOrder: false,
  parseAttributeValue: false,
  trimValues: true,
});

/**
 * Parse a spec file and resolve all external references
 */
export function parseSpecFile(filePath: string): Webapp {
  const content = readFileSync(filePath, 'utf-8');
  const baseDir = dirname(filePath);
  return parseSpec(content, baseDir);
}

/**
 * Parse spec XML content with external file resolution
 */
export function parseSpec(xmlContent: string, baseDir: string): Webapp {
  const parsed = parser.parse(xmlContent);
  const root = parsed.webapp || parsed.Webapp || parsed.app || parsed.App;

  if (!root) {
    throw new Error('No <webapp> root element found');
  }

  const webapp: Webapp = {
    name: (root['@_name'] as string) || 'Untitled',
    version: root['@_version'] as string,
    designSystem: root['@_designSystem'] as string,
    entities: parseEntities(root.entities, baseDir),
    layouts: parseLayouts(root.layouts, baseDir),
    components: parseComponents(root.components, baseDir),
    pages: parsePages(root.pages, baseDir),
    navigation: parseNavigation(root.navigation),
    config: parseConfig(root.config),
  };

  return webapp;
}

function ensureArray(value: unknown): XmlNode[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as XmlNode[];
  return [value as XmlNode];
}

/**
 * Parse a prompt element into PromptInfo
 */
function parsePrompt(promptEl: unknown): PromptInfo | undefined {
  if (!promptEl) return undefined;

  if (typeof promptEl === 'string') {
    return { content: promptEl };
  }

  const el = promptEl as XmlNode;
  const content = (el['#text'] as string) || '';
  if (!content) return undefined;

  return {
    content,
    context: el['@_context'] === 'true',
    constraints: el['@_constraints'] === 'true',
  };
}

// ============================================
// Entity Parsing
// ============================================

function parseEntities(entities: unknown, baseDir: string): Entity[] {
  if (!entities) return [];
  const container = entities as XmlNode;

  // Check for src attribute (file or directory)
  if (container['@_src']) {
    const src = container['@_src'] as string;
    // If src ends with .xml, it's a section file
    if (src.endsWith('.xml')) {
      return loadSectionFile(src, baseDir, 'entities', 'entity', parseEntityFromSpec);
    }
    // Otherwise it's a directory
    return loadFromDirectory(src, baseDir, 'entity', parseEntityFromSpec);
  }

  const entityList = ensureArray(container.entity);
  return entityList.map((e) => parseEntity(e, baseDir));
}

function parseEntity(node: XmlNode, baseDir: string): Entity {
  // Check for external file reference
  if (node['@_src']) {
    const external = loadExternalSpec(node['@_src'] as string, baseDir);
    if (external && external.entity) {
      return parseEntityFromSpec(external.entity as XmlNode, node['@_src'] as string);
    }
  }

  return parseEntityFromSpec(node);
}

function parseEntityFromSpec(node: XmlNode, src?: string): Entity {
  return {
    name: (node['@_name'] as string) || 'Unnamed',
    fields: parseFields(node.field),
    src,
  };
}

function parseFields(fields: unknown): Field[] {
  const fieldList = ensureArray(fields);
  return fieldList.map((f) => ({
    name: (f['@_name'] as string) || 'unnamed',
    type: (f['@_type'] as string) || 'string',
    required: f['@_required'] === 'true',
    default: f['@_default'] as string,
    values: f['@_values'] as string,
    ref: f['@_ref'] as string,
    cardinality: f['@_cardinality'] as 'one' | 'many',
    unique: f['@_unique'] === 'true',
    minLength: f['@_minLength'] ? parseInt(f['@_minLength'] as string) : undefined,
    maxLength: f['@_maxLength'] ? parseInt(f['@_maxLength'] as string) : undefined,
    min: f['@_min'] ? parseFloat(f['@_min'] as string) : undefined,
    max: f['@_max'] ? parseFloat(f['@_max'] as string) : undefined,
    pattern: f['@_pattern'] as string,
    ordered: f['@_ordered'] === 'true',
  }));
}

// ============================================
// Layout Parsing
// ============================================

function parseLayouts(layouts: unknown, baseDir: string): Layout[] {
  if (!layouts) return [];
  const container = layouts as XmlNode;

  // Check for src attribute (file or directory)
  if (container['@_src']) {
    const src = container['@_src'] as string;
    if (src.endsWith('.xml')) {
      return loadSectionFile(src, baseDir, 'layouts', 'layout', parseLayoutFromSpec);
    }
    return loadFromDirectory(src, baseDir, 'layout', parseLayoutFromSpec);
  }

  const layoutList = ensureArray(container.layout);
  return layoutList.map((l) => parseLayout(l, baseDir));
}

function parseLayout(node: XmlNode, baseDir: string): Layout {
  // Check for external file reference
  if (node['@_src']) {
    const external = loadExternalSpec(node['@_src'] as string, baseDir);
    if (external && external.layout) {
      return parseLayoutFromSpec(external.layout as XmlNode, node['@_src'] as string);
    }
  }

  return parseLayoutFromSpec(node);
}

function parseLayoutFromSpec(node: XmlNode, src?: string): Layout {
  return {
    name: (node['@_name'] as string) || 'Unnamed',
    slots: parseSlots(node),
    children: parseChildren(node),
    src,
  };
}

function parseSlots(node: XmlNode): Slot[] {
  const slots: Slot[] = [];

  // Direct slot children
  const slotList = ensureArray(node.slot);
  for (const s of slotList) {
    // Slots can have prompt as attribute or child element
    const slotPrompt = s['@_prompt']
      ? { content: s['@_prompt'] as string }
      : parsePrompt(s.prompt);

    slots.push({
      name: (s['@_name'] as string) || 'default',
      position: s['@_position'] as Slot['position'],
      sticky: s['@_sticky'] === 'true',
      width: s['@_width'] as string,
      height: s['@_height'] as string,
      grow: s['@_grow'] === 'true',
      scroll: s['@_scroll'] === 'true',
      collapsible: s['@_collapsible'] === 'true',
      role: s['@_role'] as Slot['role'],
      prompt: slotPrompt,
    });
  }

  // Also look for slots inside containers
  const containers = ensureArray(node.container);
  for (const c of containers) {
    slots.push(...parseSlots(c));
  }

  return slots;
}

// ============================================
// Component Parsing
// ============================================

function parseComponents(components: unknown, baseDir: string): Component[] {
  if (!components) return [];
  const container = components as XmlNode;

  // Check for src attribute (file or directory)
  if (container['@_src']) {
    const src = container['@_src'] as string;
    if (src.endsWith('.xml')) {
      return loadSectionFile(src, baseDir, 'components', 'component', parseComponentFromSpec);
    }
    return loadFromDirectory(src, baseDir, 'component', parseComponentFromSpec);
  }

  const componentList = ensureArray(container.component);
  return componentList.map((c) => parseComponent(c, baseDir));
}

function parseComponent(node: XmlNode, baseDir: string): Component {
  // Check for external file reference
  if (node['@_src']) {
    const external = loadExternalSpec(node['@_src'] as string, baseDir);
    if (external && external.component) {
      return parseComponentFromSpec(external.component as XmlNode, node['@_src'] as string);
    }
  }

  return parseComponentFromSpec(node);
}

function parseComponentFromSpec(node: XmlNode, src?: string): Component {
  // Parse props from <props><prop>... structure
  const propsContainer = node.props as XmlNode | undefined;
  const propsList = propsContainer ? ensureArray(propsContainer.prop) : ensureArray(node.prop);

  // Parse actions from <actions><action>... structure
  const actionsContainer = node.actions as XmlNode | undefined;
  const actionsList = actionsContainer ? ensureArray(actionsContainer.action) : ensureArray(node.action);

  return {
    name: (node['@_name'] as string) || 'Unnamed',
    props: propsList.map((p) => ({
      name: (p['@_name'] as string) || 'unnamed',
      type: (p['@_type'] as string) || 'string',
      required: p['@_required'] === 'true',
      default: p['@_default'] as string,
      values: p['@_values'] as string,
    })),
    actions: actionsList.map((a) => ({
      name: (a['@_name'] as string) || 'unnamed',
      params: a['@_params'] as string,
    })),
    children: parseChildren(node),
    prompt: parsePrompt(node.prompt),
    src,
  };
}

// ============================================
// Page Parsing
// ============================================

function parsePages(pages: unknown, baseDir: string): Page[] {
  if (!pages) return [];
  const container = pages as XmlNode;

  // Check for src attribute (file or directory)
  if (container['@_src']) {
    const src = container['@_src'] as string;
    if (src.endsWith('.xml')) {
      return loadSectionFile(src, baseDir, 'pages', 'page', parsePageFromSpec);
    }
    return loadFromDirectory(src, baseDir, 'page', parsePageFromSpec);
  }

  const pageList = ensureArray(container.page);
  return pageList.map((p) => parsePage(p, baseDir));
}

function parsePage(node: XmlNode, baseDir: string): Page {
  // Check for external file reference
  if (node['@_src']) {
    const external = loadExternalSpec(node['@_src'] as string, baseDir);
    if (external && external.page) {
      return parsePageFromSpec(external.page as XmlNode, node['@_src'] as string);
    }
  }

  return parsePageFromSpec(node);
}

function parsePageFromSpec(node: XmlNode, src?: string): Page {
  // Parse params
  const paramsContainer = node.params as XmlNode | undefined;
  const paramsList = paramsContainer ? ensureArray(paramsContainer.param) : [];

  // Parse data/queries
  const dataContainer = node.data as XmlNode | undefined;
  const queryList = dataContainer ? ensureArray(dataContainer.query) : [];

  // Parse local state
  const localStateContainer = node.localState as XmlNode | undefined;
  const stateList = localStateContainer ? ensureArray(localStateContainer.state) : [];

  // Parse page states (loading, error, etc.)
  const statesContainer = node.states as XmlNode | undefined;
  const pageStateList = statesContainer ? ensureArray(statesContainer.state) : [];

  return {
    name: (node['@_name'] as string) || 'Unnamed',
    route: (node['@_route'] as string) || '/',
    layout: node['@_layout'] as string,
    auth: node['@_auth'] as Page['auth'],
    title: node['@_title'] as string,
    params: paramsList.map((p) => ({
      name: (p['@_name'] as string) || 'unnamed',
      type: (p['@_type'] as string) || 'string',
    })),
    data: queryList.map((q) => ({
      name: (q['@_name'] as string) || 'unnamed',
      type: q['@_type'] as string,
      source: q['@_source'] as string,
      filter: q['@_filter'] as string,
      include: q['@_include'] as string,
      limit: q['@_limit'] ? parseInt(q['@_limit'] as string) : undefined,
      orderBy: q['@_orderBy'] as string,
      paginated: q['@_paginated'] === 'true',
      pageSize: q['@_pageSize'] ? parseInt(q['@_pageSize'] as string) : undefined,
    })),
    localState: stateList.map((s) => ({
      name: (s['@_name'] as string) || 'unnamed',
      type: s['@_type'] as string,
      default: s['@_default'] as string,
    })),
    children: parseChildren(node),
    states: pageStateList.map((s) => parsePageState(s)),
    prompt: parsePrompt(node.prompt),
    src,
  };
}

function parsePageState(node: XmlNode): PageState {
  return {
    name: (node['@_name'] as string) || 'unnamed',
    children: parseChildren(node),
    prompt: parsePrompt(node.prompt),
  };
}

// ============================================
// Navigation Parsing
// ============================================

function parseNavigation(navigation: unknown): Navigation | undefined {
  if (!navigation) return undefined;
  const nav = navigation as XmlNode;

  const guardsContainer = nav.guards as XmlNode | undefined;
  const guardList = guardsContainer ? ensureArray(guardsContainer.guard) : [];

  const flowsContainer = nav.flows as XmlNode | undefined;
  const flowList = flowsContainer ? ensureArray(flowsContainer.flow) : [];

  return {
    guards: guardList.map((g) => ({
      name: (g['@_name'] as string) || 'unnamed',
      redirect: (g['@_redirect'] as string) || '/',
      message: g['@_message'] as string,
      role: g['@_role'] as string,
      condition: g['@_condition'] as string,
    })),
    flows: flowList.map((f) => ({
      name: (f['@_name'] as string) || 'unnamed',
      prompt: parsePrompt(f.prompt),
      children: parseChildren(f),
    })),
  };
}

// ============================================
// Config Parsing
// ============================================

function parseConfig(config: unknown): Config | undefined {
  if (!config) return undefined;
  const cfg = config as XmlNode;

  return {
    theme: parseTheme(cfg.theme),
    i18n: parseI18n(cfg.i18n),
    assets: parseAssets(cfg.assets),
    llm: parseLLMConfig(cfg.llm),
  };
}

function parseTheme(theme: unknown): Config['theme'] | undefined {
  if (!theme) return undefined;
  const t = theme as XmlNode;

  return {
    colors: t.colors as Record<string, unknown> || {},
    spacing: t.spacing as { unit?: string },
    borderRadius: t.borderRadius as { default?: string },
    shadows: t.shadows as Record<string, string>,
  };
}

function parseI18n(i18n: unknown): Config['i18n'] | undefined {
  if (!i18n) return undefined;
  const i = i18n as XmlNode;

  const localeList = ensureArray(i.locale);

  return {
    default: i['@_default'] as string,
    locales: localeList.map((l) => ({
      name: (l['@_name'] as string) || 'en',
      src: l['@_src'] as string,
      strings: {},
    })),
  };
}

function parseAssets(assets: unknown): Config['assets'] | undefined {
  if (!assets) return undefined;
  const a = assets as XmlNode;

  const images: Record<string, { src: string }> = {};
  if (a.images) {
    const img = a.images as XmlNode;
    for (const key of Object.keys(img)) {
      if (!key.startsWith('@_')) {
        const item = img[key] as XmlNode;
        if (item && item['@_src']) {
          images[key] = { src: item['@_src'] as string };
        }
      }
    }
  }

  return { images };
}

function parseLLMConfig(llm: unknown): Config['llm'] | undefined {
  if (!llm) return undefined;
  const l = llm as XmlNode;

  const promptList = ensureArray(l.prompt);

  return {
    prompts: promptList.map((p) => ({
      type: p['@_type'] as string,
      content: (p['#text'] as string) || '',
    })),
  };
}

// ============================================
// UI Element Parsing
// ============================================

const ELEMENT_TYPES = new Set([
  'row', 'column', 'stack', 'grid', 'card', 'section', 'container', 'tabs', 'tab',
  'text', 'heading', 'button', 'link', 'image', 'icon', 'divider', 'spacer', 'badge', 'tag',
  'form', 'input', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'datepicker', 'filepicker', 'search',
  'list', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'chart', 'stat', 'pagination',
  'modal', 'drawer', 'tooltip', 'popover', 'dropdown', 'menu', 'menuItem', 'trigger', 'alert', 'overlay', 'spinner',
  'nav', 'navItem',
  'component', 'use', 'slot',
  'if', 'else', 'each', 'for', 'sortable', 'dropZone', 'draggable',
  'prompt', 'suffix', 'prefix', 'template', 'option',
]);

const SKIP_ELEMENTS = new Set([
  'props', 'prop', 'field', 'actions', 'action', 'data', 'query', 'localState', 'state',
  'params', 'param', 'states', 'modals', 'guards', 'guard', 'flows', 'flow',
  'colors', 'spacing', 'borderRadius', 'shadows', 'i18n', 'locale', 'assets', 'images', 'llm',
  'theme', 'join',
]);

function parseChildren(parent: XmlNode): UIElement[] {
  const children: UIElement[] = [];

  for (const key of Object.keys(parent)) {
    if (key.startsWith('@_') || key === '#text') continue;
    if (SKIP_ELEMENTS.has(key)) continue;
    if (!ELEMENT_TYPES.has(key)) continue;

    const elements = ensureArray(parent[key]);
    for (const el of elements) {
      children.push(parseElement(key, el));
    }
  }

  return children;
}

function parseElement(type: string, data: XmlNode | string): UIElement {
  // Handle case where element content is just text (e.g., <th>Form</th>)
  if (typeof data === 'string') {
    return {
      type,
      props: {},
      children: [],
      textContent: data,
    };
  }

  const props: Record<string, unknown> = {};
  let textContent: string | undefined;

  // Extract attributes as props
  for (const key of Object.keys(data)) {
    if (key.startsWith('@_')) {
      const propName = key.substring(2);
      props[propName] = data[key];
    } else if (key === '#text') {
      textContent = data[key] as string;
    }
  }

  return {
    type,
    props,
    children: parseChildren(data),
    prompt: parsePrompt(data.prompt),
    textContent,
  };
}

// ============================================
// External File Loading
// ============================================

function loadExternalSpec(src: string, baseDir: string): XmlNode | null {
  const fullPath = resolve(baseDir, src);

  if (!existsSync(fullPath)) {
    console.warn(`External file not found: ${fullPath}`);
    return null;
  }

  try {
    const content = readFileSync(fullPath, 'utf-8');
    const parsed = parser.parse(content);

    // Handle <spec> wrapper
    if (parsed.spec) {
      return parsed.spec as XmlNode;
    }

    return parsed;
  } catch (error) {
    console.error(`Failed to parse external file: ${fullPath}`, error);
    return null;
  }
}

function loadFromDirectory<T>(
  src: string,
  baseDir: string,
  type: string,
  parseFunc: (node: XmlNode, src?: string) => T
): T[] {
  const dirPath = resolve(baseDir, src);

  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
    console.warn(`Directory not found: ${dirPath}`);
    return [];
  }

  const results: T[] = [];
  const files = readdirSync(dirPath).filter((f) => f.endsWith('.spec.xml'));

  for (const file of files) {
    const filePath = join(dirPath, file);
    const external = loadExternalSpec(filePath, baseDir);

    if (external) {
      // Handle <spec> wrapper
      const specType = external['@_type'] as string;
      if (specType === type && external[type]) {
        results.push(parseFunc(external[type] as XmlNode, `./${src}/${file}`));
      } else if (external[type]) {
        // Direct element without spec wrapper
        results.push(parseFunc(external[type] as XmlNode, `./${src}/${file}`));
      }
    }
  }

  return results;
}

/**
 * Load a section file (e.g., entities.spec.xml with multiple entities)
 */
function loadSectionFile<T>(
  src: string,
  baseDir: string,
  sectionType: string,
  itemType: string,
  parseFunc: (node: XmlNode, src?: string) => T
): T[] {
  const external = loadExternalSpec(src, baseDir);
  if (!external) return [];

  // Check if it's a <spec type="entities"> wrapper
  const specType = external['@_type'] as string;
  if (specType === sectionType) {
    // Parse all items inside the spec
    const items = ensureArray(external[itemType]);
    return items.map((item) => parseFunc(item, src));
  }

  // Fallback: maybe it's a direct section element
  if (external[itemType]) {
    const items = ensureArray(external[itemType]);
    return items.map((item) => parseFunc(item, src));
  }

  console.warn(`Section file ${src} does not contain ${sectionType}`);
  return [];
}

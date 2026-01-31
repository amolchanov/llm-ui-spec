import { XMLParser } from 'fast-xml-parser';
import { generateId } from '@/lib/utils/id';
import type {
  UISpecProject,
  Entity,
  Field,
  Layout,
  ComponentDef,
  Page,
  UIElement,
  Navigation,
  NavItem,
  Config,
  MaterializedView,
  Join,
  FieldSelection,
  Slot,
  PropDef,
  UIElementType,
  Assets,
  AssetGroup,
  Asset,
  ContainerRole,
} from '@/types/spec';

type XmlNode = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  preserveOrder: false,
  parseAttributeValue: false,
  trimValues: true,
});

// External file resolver callback type
type ExternalResolver = (src: string) => Promise<ExternalSpecResult | null> | null;

export interface ExternalSpecResult {
  type: 'entity' | 'layout' | 'component' | 'page' | 'entities' | 'layouts' | 'components' | 'pages';
  webapp?: string;
  data: Entity | Layout | ComponentDef | Page | Entity[] | Layout[] | ComponentDef[] | Page[];
}

// Track section-level src attributes for external resolution
export interface SectionSources {
  entities?: string;
  layouts?: string;
  components?: string;
  pages?: string;
}

export function parseXML(xmlString: string, _externalResolver?: ExternalResolver): UISpecProject & { _sectionSources?: SectionSources } {
  const parsed = parser.parse(xmlString);
  // Support webapp (new) and app (legacy) root elements
  const root = parsed.webapp || parsed.Webapp || parsed.uispec || parsed.UISpec || parsed.app || parsed.App || parsed;

  // Assets can be at root level or inside config
  const configNode = root.config as XmlNode | undefined;
  const assetsNode = root.assets || (configNode?.assets);

  // Track section-level src attributes
  const sectionSources: SectionSources = {};
  const entitiesNode = root.entities as XmlNode | undefined;
  const layoutsNode = root.layouts as XmlNode | undefined;
  const componentsNode = root.components as XmlNode | undefined;
  const pagesNode = root.pages as XmlNode | undefined;

  if (entitiesNode?.['@_src']) sectionSources.entities = entitiesNode['@_src'] as string;
  if (layoutsNode?.['@_src']) sectionSources.layouts = layoutsNode['@_src'] as string;
  if (componentsNode?.['@_src']) sectionSources.components = componentsNode['@_src'] as string;
  if (pagesNode?.['@_src']) sectionSources.pages = pagesNode['@_src'] as string;

  return {
    name: root['@_name'] || 'Untitled',
    version: root['@_version'] || '1.0.0',
    designSystem: root['@_designSystem'],
    entities: parseEntities(root.entities),
    layouts: parseLayouts(root.layouts),
    components: parseComponents(root.components),
    pages: parsePages(root.pages),
    navigation: parseNavigation(root.navigation),
    config: parseConfig(root.config),
    assets: parseAssets(assetsNode),
    materializedViews: parseMaterializedViews(root.materializedViews),
    _sectionSources: Object.keys(sectionSources).length > 0 ? sectionSources : undefined,
  };
}

/**
 * Parse an external spec file (wrapped in <spec> element)
 */
export function parseExternalSpec(xmlString: string): ExternalSpecResult | null {
  const parsed = parser.parse(xmlString);

  // Check for <spec> wrapper
  const spec = parsed.spec || parsed.Spec;
  if (spec) {
    const type = spec['@_type'] as string;
    const webapp = spec['@_webapp'] as string | undefined;

    if (type === 'entity' && spec.entity) {
      const e = spec.entity as XmlNode;
      return {
        type: 'entity',
        webapp,
        data: {
          id: generateId(),
          name: (e['@_name'] as string) || 'Unnamed',
          fields: parseFields(e.field),
        },
      };
    }

    if (type === 'layout' && spec.layout) {
      const l = spec.layout as XmlNode;
      return {
        type: 'layout',
        webapp,
        data: {
          id: generateId(),
          name: (l['@_name'] as string) || 'Unnamed',
          slots: parseSlots(l.slot),
          children: parseChildren(l),
        },
      };
    }

    if (type === 'component' && spec.component) {
      const c = spec.component as XmlNode;
      return {
        type: 'component',
        webapp,
        data: {
          id: generateId(),
          name: (c['@_name'] as string) || 'Unnamed',
          props: parseProps(c.prop),
          children: parseChildren(c),
        },
      };
    }

    if (type === 'page' && spec.page) {
      const p = spec.page as XmlNode;
      return {
        type: 'page',
        webapp,
        data: {
          id: generateId(),
          name: (p['@_name'] as string) || 'Unnamed',
          route: (p['@_route'] as string) || '/',
          layout: p['@_layout'] as string,
          title: p['@_title'] as string,
          children: parseChildren(p),
        },
      };
    }

    // Section types (multiple items)
    if (type === 'entities' && spec.entity) {
      const entityList = ensureArray(spec.entity);
      return {
        type: 'entities',
        webapp,
        data: entityList.map((e) => ({
          id: generateId(),
          name: (e['@_name'] as string) || 'Unnamed',
          fields: parseFields(e.field),
        })),
      };
    }

    if (type === 'layouts' && spec.layout) {
      const layoutList = ensureArray(spec.layout);
      return {
        type: 'layouts',
        webapp,
        data: layoutList.map((l) => ({
          id: generateId(),
          name: (l['@_name'] as string) || 'Unnamed',
          slots: parseSlots(l.slot),
          children: parseChildren(l),
        })),
      };
    }

    if (type === 'components' && spec.component) {
      const componentList = ensureArray(spec.component);
      return {
        type: 'components',
        webapp,
        data: componentList.map((c) => ({
          id: generateId(),
          name: (c['@_name'] as string) || 'Unnamed',
          props: parseProps(c.prop),
          children: parseChildren(c),
        })),
      };
    }

    if (type === 'pages' && spec.page) {
      const pageList = ensureArray(spec.page);
      return {
        type: 'pages',
        webapp,
        data: pageList.map((p) => ({
          id: generateId(),
          name: (p['@_name'] as string) || 'Unnamed',
          route: (p['@_route'] as string) || '/',
          layout: p['@_layout'] as string,
          title: p['@_title'] as string,
          children: parseChildren(p),
        })),
      };
    }
  }

  // Try parsing as bare element (legacy support)
  if (parsed.entity) {
    const e = parsed.entity as XmlNode;
    return {
      type: 'entity',
      data: {
        id: generateId(),
        name: (e['@_name'] as string) || 'Unnamed',
        fields: parseFields(e.field),
      },
    };
  }

  if (parsed.layout) {
    const l = parsed.layout as XmlNode;
    return {
      type: 'layout',
      data: {
        id: generateId(),
        name: (l['@_name'] as string) || 'Unnamed',
        slots: parseSlots(l.slot),
        children: parseChildren(l),
      },
    };
  }

  if (parsed.component) {
    const c = parsed.component as XmlNode;
    return {
      type: 'component',
      data: {
        id: generateId(),
        name: (c['@_name'] as string) || 'Unnamed',
        props: parseProps(c.prop),
        children: parseChildren(c),
      },
    };
  }

  if (parsed.page) {
    const p = parsed.page as XmlNode;
    return {
      type: 'page',
      data: {
        id: generateId(),
        name: (p['@_name'] as string) || 'Unnamed',
        route: (p['@_route'] as string) || '/',
        layout: p['@_layout'] as string,
        title: p['@_title'] as string,
        children: parseChildren(p),
      },
    };
  }

  return null;
}

function ensureArray(value: unknown): XmlNode[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as XmlNode[];
  return [value as XmlNode];
}

function parseEntities(entities: unknown): Entity[] {
  if (!entities) return [];
  const container = entities as XmlNode;
  const entityList = ensureArray(container.entity);

  return entityList.map((e) => ({
    id: generateId(),
    name: (e['@_name'] as string) || 'Unnamed',
    fields: parseFields(e.field),
    src: e['@_src'] as string | undefined,
  }));
}

function parseFields(fields: unknown): Field[] {
  const fieldList = ensureArray(fields);

  return fieldList.map((f) => ({
    id: generateId(),
    name: (f['@_name'] as string) || 'unnamed',
    type: (f['@_type'] as Field['type']) || 'string',
    required: f['@_required'] === 'true',
    unique: f['@_unique'] === 'true',
    default: f['@_default'] as string,
    reference: f['@_reference'] as string,
    enum: f['@_enum'] ? (f['@_enum'] as string).split(',').map(s => s.trim()) : undefined,
  }));
}

function parseLayouts(layouts: unknown): Layout[] {
  if (!layouts) return [];
  const container = layouts as XmlNode;
  const layoutList = ensureArray(container.layout);

  return layoutList.map((l) => ({
    id: generateId(),
    name: (l['@_name'] as string) || 'Unnamed',
    slots: parseSlots(l.slot),
    children: parseChildren(l),
    src: l['@_src'] as string | undefined,
  }));
}

function parseSlots(slots: unknown): Slot[] {
  const slotList = ensureArray(slots);

  return slotList.map((s) => ({
    id: generateId(),
    name: (s['@_name'] as string) || 'default',
    required: s['@_required'] === 'true',
    role: (s['@_role'] as ContainerRole) || undefined,
  }));
}

function parseComponents(components: unknown): ComponentDef[] {
  if (!components) return [];
  const container = components as XmlNode;
  const componentList = ensureArray(container.component);

  return componentList.map((c) => ({
    id: generateId(),
    name: (c['@_name'] as string) || 'Unnamed',
    props: parseProps(c.prop),
    children: parseChildren(c),
    src: c['@_src'] as string | undefined,
  }));
}

function parseProps(props: unknown): PropDef[] {
  const propList = ensureArray(props);

  return propList.map((p) => ({
    id: generateId(),
    name: (p['@_name'] as string) || 'unnamed',
    type: (p['@_type'] as string) || 'string',
    required: p['@_required'] === 'true',
    default: p['@_default'] as string,
  }));
}

function parsePages(pages: unknown): Page[] {
  if (!pages) return [];
  const container = pages as XmlNode;
  const pageList = ensureArray(container.page);

  return pageList.map((p) => ({
    id: generateId(),
    name: (p['@_name'] as string) || 'Unnamed',
    route: (p['@_route'] as string) || '/',
    layout: p['@_layout'] as string,
    title: p['@_title'] as string,
    children: parseChildren(p),
    src: p['@_src'] as string | undefined,
  }));
}

function parseNavigation(navigation: unknown): Navigation | undefined {
  if (!navigation) return undefined;
  const nav = navigation as XmlNode;

  return {
    id: generateId(),
    type: (nav['@_type'] as Navigation['type']) || 'sidebar',
    items: parseNavItems(nav.item),
  };
}

function parseNavItems(items: unknown): NavItem[] {
  const itemList = ensureArray(items);

  return itemList.map((i) => ({
    id: generateId(),
    label: (i['@_label'] as string) || 'Unnamed',
    page: i['@_page'] as string,
    icon: i['@_icon'] as string,
    children: i.item ? parseNavItems(i.item) : undefined,
  }));
}

function parseConfig(config: unknown): Config | undefined {
  if (!config) return undefined;
  const cfg = config as XmlNode;

  return {
    id: generateId(),
    theme: cfg.theme as Config['theme'],
    api: cfg.api as Config['api'],
    auth: cfg.auth as Config['auth'],
  };
}

function parseAssets(assets: unknown): Assets | undefined {
  if (!assets) return undefined;
  const assetsNode = assets as XmlNode;

  const groups: AssetGroup[] = [];

  // Parse each asset group (images, icons, fonts, etc.)
  for (const key of Object.keys(assetsNode)) {
    if (key.startsWith('@_')) continue; // Skip attributes

    const groupData = assetsNode[key] as XmlNode;
    if (!groupData || typeof groupData !== 'object') continue;

    const items: Asset[] = [];

    // Each child of the group is an asset
    for (const assetKey of Object.keys(groupData)) {
      if (assetKey.startsWith('@_')) continue;

      const assetItems = ensureArray(groupData[assetKey]);
      for (const item of assetItems) {
        items.push({
          id: generateId(),
          name: assetKey,
          src: (item['@_src'] as string) || '',
        });
      }
    }

    if (items.length > 0) {
      groups.push({
        id: generateId(),
        name: key,
        items,
      });
    }
  }

  if (groups.length === 0) return undefined;

  return {
    id: generateId(),
    groups,
  };
}

function parseMaterializedViews(views: unknown): MaterializedView[] {
  if (!views) return [];
  const container = views as XmlNode;
  const viewList = ensureArray(container.view);

  return viewList.map((v) => ({
    id: generateId(),
    name: (v['@_name'] as string) || 'Unnamed',
    baseEntity: (v['@_baseEntity'] as string) || '',
    joins: parseJoins(v.join),
    selectedFields: parseFieldSelections(v.field),
  }));
}

function parseJoins(joins: unknown): Join[] {
  const joinList = ensureArray(joins);

  return joinList.map((j) => ({
    id: generateId(),
    type: (j['@_type'] as Join['type']) || 'left',
    entity: (j['@_entity'] as string) || '',
    localField: (j['@_localField'] as string) || '',
    foreignField: (j['@_foreignField'] as string) || '',
    alias: j['@_alias'] as string,
  }));
}

function parseFieldSelections(fields: unknown): FieldSelection[] {
  const fieldList = ensureArray(fields);

  return fieldList.map((f) => ({
    id: generateId(),
    source: (f['@_source'] as string) || '',
    field: (f['@_name'] as string) || '',
    alias: f['@_alias'] as string,
    selected: true,
  }));
}

// List of known element types
const ELEMENT_TYPES: string[] = [
  // Layout containers
  'row', 'column', 'stack', 'grid', 'card', 'section', 'container', 'tabs', 'tab',
  // Basic elements
  'text', 'heading', 'button', 'link', 'image', 'icon', 'divider', 'spacer', 'badge', 'tag',
  // Form elements
  'form', 'input', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'datepicker', 'filepicker', 'search',
  // Data elements
  'list', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'chart', 'stat', 'pagination',
  // Interactive elements
  'modal', 'drawer', 'tooltip', 'popover', 'dropdown', 'menu', 'menuItem', 'trigger', 'alert', 'overlay', 'spinner',
  // Navigation
  'nav', 'navItem',
  // Component references
  'component', 'use', 'slot',
  // Logic/structure
  'if', 'else', 'each', 'for', 'sortable', 'dropZone', 'draggable',
  // Special
  'prompt', 'suffix', 'prefix',
];

// Metadata elements that should be skipped when parsing children
const SKIP_ELEMENTS = ['prop', 'field', 'item', 'join', 'data', 'query', 'localState', 'state', 'params', 'param', 'states', 'modals', 'guards', 'guard', 'actions', 'action', 'flows', 'flow'];

function parseChildren(parent: XmlNode): UIElement[] {
  const children: UIElement[] = [];

  for (const key of Object.keys(parent)) {
    if (key.startsWith('@_') || key === '#text') continue;
    // Skip metadata elements
    if (SKIP_ELEMENTS.includes(key)) continue;

    // Check if it's a known element type
    if (!ELEMENT_TYPES.includes(key)) continue;

    const elementType = key as UIElementType;
    const elements = ensureArray(parent[key]);
    for (const el of elements) {
      children.push(parseElement(elementType, el));
    }
  }

  return children;
}

// Map XML attribute names to internal property names (for namespaced attributes)
const ATTR_TO_PROP_MAP: Record<string, string> = {
  'prompt:context': 'promptContext',
  'prompt:constraints': 'promptConstraints',
  'prompt:override': 'promptOverride',
};

function parseElement(type: UIElementType, data: XmlNode): UIElement {
  const props: Record<string, unknown> = {};
  let role: ContainerRole | undefined;

  // Extract attributes as props
  for (const key of Object.keys(data)) {
    if (key.startsWith('@_')) {
      const rawPropName = key.substring(2);
      // Convert namespaced XML attributes to internal prop names
      const propName = ATTR_TO_PROP_MAP[rawPropName] || rawPropName;
      if (propName === 'role') {
        role = data[key] as ContainerRole;
      } else {
        props[propName] = data[key];
      }
    } else if (key === '#text') {
      props['content'] = data[key];
    }
  }

  return {
    id: generateId(),
    type,
    props,
    role,
    children: parseChildren(data),
  };
}

// ============================================
// Individual Item Parsers (for markup editing)
// ============================================

/**
 * Parse a single entity from XML string
 */
export function parseSingleEntity(xmlString: string): Entity {
  const parsed = parser.parse(xmlString);
  const e = parsed.entity || parsed;

  return {
    id: generateId(),
    name: (e['@_name'] as string) || 'Unnamed',
    fields: parseFields(e.field),
  };
}

/**
 * Parse a single layout from XML string
 */
export function parseSingleLayout(xmlString: string): Layout {
  const parsed = parser.parse(xmlString);
  const l = parsed.layout || parsed;

  return {
    id: generateId(),
    name: (l['@_name'] as string) || 'Unnamed',
    slots: parseSlots(l.slot),
    children: parseChildren(l),
  };
}

/**
 * Parse a single page from XML string
 */
export function parseSinglePage(xmlString: string): Page {
  const parsed = parser.parse(xmlString);
  const p = parsed.page || parsed;

  return {
    id: generateId(),
    name: (p['@_name'] as string) || 'Unnamed',
    route: (p['@_route'] as string) || '/',
    layout: p['@_layout'] as string,
    title: p['@_title'] as string,
    children: parseChildren(p),
  };
}

/**
 * Parse a single component from XML string
 */
export function parseSingleComponent(xmlString: string): ComponentDef {
  const parsed = parser.parse(xmlString);
  const c = parsed.component || parsed;

  return {
    id: generateId(),
    name: (c['@_name'] as string) || 'Unnamed',
    props: parseProps(c.prop),
    children: parseChildren(c),
  };
}

/**
 * Parse a single UI element from XML string
 */
export function parseSingleElement(xmlString: string): UIElement {
  const parsed = parser.parse(xmlString);

  // Find the root element type
  for (const key of Object.keys(parsed)) {
    if (ELEMENT_TYPES.includes(key)) {
      return parseElement(key as UIElementType, parsed[key] as XmlNode);
    }
  }

  throw new Error('No valid element found in XML');
}

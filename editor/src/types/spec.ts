// Core LLM UI Spec Types

export interface UISpecProject {
  name: string;
  version: string;
  designSystem?: string;
  entities: Entity[];
  layouts: Layout[];
  components: ComponentDef[];
  pages: Page[];
  navigation?: Navigation;
  config?: Config;
  assets?: Assets;
  materializedViews: MaterializedView[];
}

// Asset types
export interface Assets {
  id: string;
  groups: AssetGroup[];
}

export interface AssetGroup {
  id: string;
  name: string; // e.g., "images", "icons", "fonts"
  items: Asset[];
}

export interface Asset {
  id: string;
  name: string; // e.g., "logo", "logoWhite"
  src: string; // e.g., "/assets/logo.svg"
}

// Container/Slot role for layout editing behavior
export type ContainerRole = 'content' | 'chrome';

export interface Entity {
  id: string;
  name: string;
  fields: Field[];
  src?: string; // External file reference
}

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  default?: string;
  reference?: string; // @entity.EntityName
  enum?: string[];
}

export type FieldType =
  | 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'uuid'
  | 'json'
  | 'array';

export interface Layout {
  id: string;
  name: string;
  slots: Slot[];
  children: UIElement[];
  src?: string; // External file reference
}

export interface Slot {
  id: string;
  name: string;
  required?: boolean;
  role?: ContainerRole; // 'content' = expanded in editor, 'chrome' = readonly/collapsed
}

export interface ComponentDef {
  id: string;
  name: string;
  props: PropDef[];
  children: UIElement[];
  src?: string; // External file reference
}

export interface PropDef {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  default?: string;
}

export interface Page {
  id: string;
  name: string;
  route: string;
  layout?: string; // @layout.LayoutName
  title?: string;
  auth?: AuthConfig;
  children: UIElement[];
  src?: string; // External file reference
}

export interface AuthConfig {
  required?: boolean;
  roles?: string[];
  redirect?: string;
}

export interface UIElement {
  id: string;
  type: UIElementType;
  props: Record<string, unknown>;
  children: UIElement[];
  // Container role - determines behavior in page editor
  role?: ContainerRole; // 'content' = editable, 'chrome' = read-only layout element
  // Editor-specific metadata
  _collapsed?: boolean;
}

export type UIElementType =
  // Layout elements
  | 'row'
  | 'column'
  | 'stack'
  | 'grid'
  | 'card'
  | 'section'
  | 'container'
  | 'tabs'
  | 'tab'
  // Basic elements
  | 'text'
  | 'heading'
  | 'button'
  | 'link'
  | 'image'
  | 'icon'
  | 'divider'
  | 'spacer'
  | 'badge'
  | 'tag'
  // Form elements
  | 'form'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'datepicker'
  | 'filepicker'
  | 'search'
  // Data elements
  | 'list'
  | 'table'
  | 'thead'
  | 'tbody'
  | 'tr'
  | 'td'
  | 'th'
  | 'chart'
  | 'stat'
  | 'pagination'
  // Interactive elements
  | 'modal'
  | 'drawer'
  | 'tooltip'
  | 'popover'
  | 'dropdown'
  | 'menu'
  | 'menuItem'
  | 'trigger'
  | 'alert'
  | 'overlay'
  | 'spinner'
  // Navigation
  | 'nav'
  | 'navItem'
  // Component reference
  | 'component'
  | 'use'
  // Slot placeholder
  | 'slot'
  // Conditional/Logic
  | 'if'
  | 'else'
  | 'each'
  | 'for'
  | 'sortable'
  | 'dropZone'
  | 'draggable'
  // Special
  | 'prompt'
  | 'suffix'
  | 'prefix'
  // Allow any string for extensibility
  | string;

export interface Navigation {
  id: string;
  type: 'sidebar' | 'topbar' | 'both';
  items: NavItem[];
}

export interface NavItem {
  id: string;
  label: string;
  page?: string; // @page.PageName
  icon?: string;
  children?: NavItem[];
}

export interface Config {
  id: string;
  theme?: ThemeConfig;
  api?: ApiConfig;
  auth?: GlobalAuthConfig;
}

export interface ThemeConfig {
  primaryColor?: string;
  mode?: 'light' | 'dark' | 'system';
}

export interface ApiConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface GlobalAuthConfig {
  provider?: string;
  loginPage?: string;
  logoutRedirect?: string;
}

export interface MaterializedView {
  id: string;
  name: string;
  baseEntity: string; // @entity.EntityName
  joins: Join[];
  selectedFields: FieldSelection[];
}

export interface Join {
  id: string;
  type: 'inner' | 'left' | 'right';
  entity: string; // @entity.EntityName
  localField: string;
  foreignField: string;
  alias?: string;
}

export interface FieldSelection {
  id: string;
  source: string; // entity name or alias
  field: string;
  alias?: string;
  selected: boolean;
}

// Default empty project
export function createEmptyProject(name: string = 'New Project'): UISpecProject {
  const pageId = crypto.randomUUID();
  return {
    name,
    version: '1.0.0',
    entities: [],
    layouts: [],
    components: [],
    pages: [
      {
        id: pageId,
        name: 'Home',
        route: '/',
        children: [],
      },
    ],
    materializedViews: [],
  };
}

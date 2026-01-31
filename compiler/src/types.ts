// Parsed spec types

export interface Webapp {
  name: string;
  version?: string;
  designSystem?: string;
  entities: Entity[];
  layouts: Layout[];
  components: Component[];
  pages: Page[];
  navigation?: Navigation;
  config?: Config;
}

export interface Entity {
  name: string;
  fields: Field[];
  src?: string;
}

export interface Field {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  values?: string;
  ref?: string;
  cardinality?: 'one' | 'many';
  unique?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  ordered?: boolean;
}

export interface Layout {
  name: string;
  slots: Slot[];
  children: UIElement[];
  src?: string;
}

export interface Slot {
  name: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  sticky?: boolean;
  width?: string;
  height?: string;
  grow?: boolean;
  scroll?: boolean;
  collapsible?: boolean;
  role?: 'content' | 'chrome';
  prompt?: PromptInfo;
}

export interface Component {
  name: string;
  props: Prop[];
  actions: Action[];
  children: UIElement[];
  prompt?: PromptInfo;
  src?: string;
}

export interface Prop {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  values?: string;
}

export interface Action {
  name: string;
  params?: string;
}

export interface Page {
  name: string;
  route: string;
  layout?: string;
  auth?: 'required' | 'guest' | 'none';
  title?: string;
  params: Param[];
  data: Query[];
  localState: State[];
  children: UIElement[];
  states: PageState[];
  prompt?: PromptInfo;
  src?: string;
}

export interface Param {
  name: string;
  type: string;
}

export interface Query {
  name: string;
  type?: string;
  source?: string;
  filter?: string;
  include?: string;
  limit?: number;
  orderBy?: string;
  paginated?: boolean;
  pageSize?: number;
}

export interface State {
  name: string;
  type?: string;
  default?: string;
}

export interface PageState {
  name: string;
  children: UIElement[];
  prompt?: PromptInfo;
}

export interface PromptInfo {
  content: string;
  context?: boolean;
  constraints?: boolean;
}

export interface UIElement {
  type: string;
  props: Record<string, unknown>;
  children: UIElement[];
  prompt?: PromptInfo;
  textContent?: string;
}

export interface Navigation {
  guards: Guard[];
  flows: Flow[];
}

export interface Guard {
  name: string;
  redirect: string;
  message?: string;
  role?: string;
  condition?: string;
}

export interface Flow {
  name: string;
  prompt?: PromptInfo;
  children: UIElement[];
}

export interface Config {
  theme?: Theme;
  i18n?: I18n;
  assets?: Assets;
  llm?: LLMConfig;
}

export interface Theme {
  colors: Record<string, unknown>;
  spacing?: { unit?: string };
  borderRadius?: { default?: string };
  shadows?: Record<string, string>;
}

export interface I18n {
  default?: string;
  locales: Locale[];
}

export interface Locale {
  name: string;
  src?: string;
  strings: Record<string, string>;
}

export interface Assets {
  images?: Record<string, { src: string }>;
}

export interface LLMConfig {
  prompts: LLMPrompt[];
}

export interface LLMPrompt {
  type?: string;
  content: string;
}

// Compiler options
export interface CompilerOptions {
  input: string;
  output: string;
  format: 'single' | 'multi';
  includePrompts: boolean;
  includeExamples: boolean;
}

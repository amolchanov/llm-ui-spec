// Editor-specific types

import type { UIElement, UIElementType } from './spec';

export interface EditorState {
  selectedId: string | null;
  hoveredId: string | null;
  expandedNodes: Set<string>;
  clipboardItem: UIElement | null;
  isDragging: boolean;
  dragOverId: string | null;
}

export interface PaletteItem {
  type: UIElementType | 'entity' | 'layout' | 'component' | 'page' | 'view';
  label: string;
  icon: string;
  category: PaletteCategory;
  description?: string;
  defaultProps?: Record<string, unknown>;
  canHaveChildren?: boolean;
}

export type PaletteCategory =
  | 'layout'
  | 'basic'
  | 'form'
  | 'data'
  | 'interactive'
  | 'structure';

export interface DragItem {
  type: 'palette-item' | 'tree-node';
  itemType: UIElementType;
  id?: string; // For tree nodes
  data?: PaletteItem;
}

export interface DropResult {
  targetId: string;
  position: 'before' | 'after' | 'inside';
}

export interface TreeNodeData {
  id: string;
  label: string;
  type: 'entity' | 'layout' | 'component' | 'page' | 'view' | 'element';
  icon: string;
  children?: TreeNodeData[];
  canDrag?: boolean;
  canDrop?: boolean;
}

export interface PropertyDefinition {
  name: string;
  type: PropertyType;
  label?: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  placeholder?: string;
  group?: string;
}

export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'icon'
  | 'entity-ref'
  | 'component-ref'
  | 'page-ref'
  | 'field-ref'
  | 'prompt'
  | 'json';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  state: unknown;
}

export interface EditorCommand {
  id: string;
  label: string;
  shortcut?: string;
  execute: () => void;
  canExecute?: () => boolean;
}

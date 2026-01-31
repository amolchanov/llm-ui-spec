import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { TreeNode } from './TreeNode';
import { useProjectStore, useUIStore } from '@/store';
import type { UIElement } from '@/types/spec';

export function ProjectTree() {
  const { project, deleteEntity, deleteLayout, deleteComponent, deletePage, deleteView, deleteElement, deleteAssetGroup, deleteAsset } = useProjectStore();
  const { openDialog } = useUIStore();

  return (
    <div className="h-full flex flex-col border-l bg-background">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="text-sm font-semibold">Project</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Layouts */}
          <TreeNode
            id="layouts"
            label="Layouts"
            icon="Layout"
            type="category"
            hasChildren={project.layouts.length > 0}
          >
            {project.layouts.map((layout) => (
              <TreeNode
                key={layout.id}
                id={layout.id}
                label={layout.name}
                icon="LayoutTemplate"
                type="layout"
                depth={1}
                hasChildren={layout.children.length > 0}
                onDelete={() => deleteLayout(layout.id)}
              >
                {renderElementTree(layout.children, 2, layout.id, 'layout', (elementId) => deleteElement('layout', layout.id, elementId))}
              </TreeNode>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground mt-1 ml-4"
              onClick={() => openDialog('newLayout')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Layout
            </Button>
          </TreeNode>

          {/* Pages */}
          <TreeNode
            id="pages"
            label="Pages"
            icon="FileText"
            type="category"
            hasChildren={project.pages.length > 0}
          >
            {project.pages.map((page) => (
              <TreeNode
                key={page.id}
                id={page.id}
                label={page.name}
                icon="File"
                type="page"
                depth={1}
                hasChildren={page.children.length > 0}
                onDelete={() => deletePage(page.id)}
              >
                {renderElementTree(page.children, 2, page.id, 'page', (elementId) => deleteElement('page', page.id, elementId))}
              </TreeNode>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground mt-1 ml-4"
              onClick={() => openDialog('newPage')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Page
            </Button>
          </TreeNode>

          {/* Components */}
          <TreeNode
            id="components"
            label="Components"
            icon="Component"
            type="category"
            hasChildren={project.components.length > 0}
          >
            {project.components.map((component) => (
              <TreeNode
                key={component.id}
                id={component.id}
                label={component.name}
                icon="Box"
                type="component"
                depth={1}
                hasChildren={component.children.length > 0}
                onDelete={() => deleteComponent(component.id)}
              >
                {renderElementTree(component.children, 2, component.id, 'component', (elementId) => deleteElement('component', component.id, elementId))}
              </TreeNode>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground mt-1 ml-4"
              onClick={() => openDialog('newComponent')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Component
            </Button>
          </TreeNode>

          {/* Entities */}
          <TreeNode
            id="entities"
            label="Entities"
            icon="Database"
            type="category"
            hasChildren={project.entities.length > 0}
          >
            {project.entities.map((entity) => (
              <TreeNode
                key={entity.id}
                id={entity.id}
                label={entity.name}
                icon="Table2"
                type="entity"
                depth={1}
                hasChildren={entity.fields.length > 0}
                onDelete={() => deleteEntity(entity.id)}
              >
                {entity.fields.map((field) => (
                  <TreeNode
                    key={field.id}
                    id={field.id}
                    label={`${field.name}: ${field.type}`}
                    icon="Columns"
                    type="field"
                    depth={2}
                    parentId={entity.id}
                  />
                ))}
              </TreeNode>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground mt-1 ml-4"
              onClick={() => openDialog('newEntity')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Entity
            </Button>
          </TreeNode>

          {/* Assets */}
          <TreeNode
            id="assets"
            label="Assets"
            icon="Image"
            type="category"
            hasChildren={(project.assets?.groups.length ?? 0) > 0}
          >
            {project.assets?.groups.map((group) => (
              <TreeNode
                key={group.id}
                id={group.id}
                label={group.name}
                icon={getAssetGroupIcon(group.name)}
                type="assetGroup"
                depth={1}
                hasChildren={group.items.length > 0}
                onDelete={() => deleteAssetGroup(group.id)}
              >
                {group.items.map((asset) => (
                  <TreeNode
                    key={asset.id}
                    id={asset.id}
                    label={asset.name}
                    icon="FileImage"
                    type="asset"
                    depth={2}
                    parentId={group.id}
                    onDelete={() => deleteAsset(group.id, asset.id)}
                  />
                ))}
              </TreeNode>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground mt-1 ml-4"
              onClick={() => openDialog('newAssetGroup')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Asset Group
            </Button>
          </TreeNode>

          {/* Materialized Views */}
          <TreeNode
            id="views"
            label="Views"
            icon="Eye"
            type="category"
            hasChildren={project.materializedViews.length > 0}
          >
            {project.materializedViews.map((view) => (
              <TreeNode
                key={view.id}
                id={view.id}
                label={view.name}
                icon="Layers"
                type="view"
                depth={1}
                onDelete={() => deleteView(view.id)}
              />
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground mt-1 ml-4"
              onClick={() => openDialog('newView')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add View
            </Button>
          </TreeNode>
        </div>
      </ScrollArea>
    </div>
  );
}

function renderElementTree(
  elements: UIElement[],
  depth: number,
  parentId: string,
  parentType: 'page' | 'layout' | 'component',
  onDeleteElement: (elementId: string) => void
): React.ReactNode {
  return elements.map((element) => (
    <TreeNode
      key={element.id}
      id={element.id}
      label={getElementLabel(element)}
      icon={getElementIcon(element.type)}
      type="element"
      depth={depth}
      parentId={parentId}
      parentType={parentType}
      hasChildren={element.children.length > 0}
      onDelete={() => onDeleteElement(element.id)}
      role={element.role}
    >
      {element.children.length > 0 &&
        renderElementTree(element.children, depth + 1, parentId, parentType, onDeleteElement)}
    </TreeNode>
  ));
}

function getElementLabel(element: UIElement): string {
  const { type, props } = element;

  // Get a descriptive name based on element type
  switch (type) {
    // Slots - show slot name
    case 'slot':
      return `slot: ${props.name || props.target || 'default'}`;

    // Navigation - show label
    case 'nav':
      return props.label ? `nav: ${props.label}` : 'nav';
    case 'navItem':
      return props.label ? String(props.label) : 'navItem';

    // Headings - show content preview
    case 'heading': {
      const content = props.content ? String(props.content).slice(0, 20) : '';
      const level = props.level ? `h${props.level}` : 'heading';
      return content ? `${level}: ${content}${String(props.content).length > 20 ? '...' : ''}` : level;
    }

    // Text - show content preview
    case 'text': {
      const content = props.content ? String(props.content).slice(0, 25) : '';
      return content ? `"${content}${String(props.content).length > 25 ? '...' : ''}"` : 'text';
    }

    // Button/Link - show label
    case 'button':
    case 'link':
      return props.content ? `${type}: ${props.content}` : type;

    // Form elements - show label or name
    case 'input':
    case 'textarea':
    case 'select':
    case 'checkbox':
    case 'radio':
    case 'switch':
    case 'datepicker':
    case 'filepicker':
    case 'search':
      return props.label ? `${type}: ${props.label}` : props.name ? `${type}: ${props.name}` : type;

    // Form container - show name
    case 'form':
      return props.name ? `form: ${props.name}` : 'form';

    // Containers - show title or name if set
    case 'card':
    case 'section':
    case 'modal':
    case 'drawer':
      return props.title ? `${type}: ${props.title}` : props.name ? `${type}: ${props.name}` : type;

    // Tab - show label
    case 'tab':
      return props.label ? `tab: ${props.label}` : props.name ? `tab: ${props.name}` : 'tab';

    // Data elements - show entity or view
    case 'table':
    case 'list':
      return props.entity ? `${type}: ${String(props.entity).replace('@entity.', '')}` :
             props.view ? `${type}: ${String(props.view).replace('@view.', '')}` : type;

    // Component reference
    case 'component':
    case 'use':
      return props.ref ? `use: ${String(props.ref).replace('@component.', '')}` :
             props.component ? `use: ${String(props.component).replace('@component.', '')}` :
             props.name ? `use: ${props.name}` : 'component';

    // Conditionals - show condition
    case 'if':
      return props.condition ? `if: ${String(props.condition).slice(0, 20)}` : 'if';
    case 'each':
    case 'for':
      return props.items ? `each: ${String(props.items).slice(0, 15)}` :
             props.each ? `each: ${String(props.each).slice(0, 15)}` : 'each';

    // Stat - show label
    case 'stat':
      return props.label ? `stat: ${props.label}` : 'stat';

    // Alert - show variant or preview
    case 'alert':
      return props.variant ? `alert: ${props.variant}` : 'alert';

    // Default - just the type
    default:
      return type;
  }
}

function getElementIcon(type: string): string {
  const iconMap: Record<string, string> = {
    row: 'LayoutGrid',
    column: 'LayoutGrid',
    stack: 'Layers',
    grid: 'Grid3x3',
    card: 'CreditCard',
    section: 'SquareDashed',
    container: 'Square',
    tabs: 'Folder',
    text: 'Type',
    heading: 'Heading',
    button: 'MousePointer',
    link: 'Link',
    image: 'Image',
    icon: 'Smile',
    divider: 'Minus',
    form: 'FileInput',
    input: 'TextCursor',
    textarea: 'AlignLeft',
    select: 'ChevronDown',
    checkbox: 'CheckSquare',
    table: 'Table',
    list: 'List',
    chart: 'BarChart',
  };
  return iconMap[type] || 'Box';
}

function getAssetGroupIcon(name: string): string {
  const iconMap: Record<string, string> = {
    images: 'Image',
    icons: 'Smile',
    fonts: 'Type',
    videos: 'Video',
    audio: 'Music',
    documents: 'FileText',
  };
  return iconMap[name.toLowerCase()] || 'Folder';
}

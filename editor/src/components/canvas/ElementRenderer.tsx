import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Image, BarChart, Star, GripVertical, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSelectionStore, useProjectStore, useUIStore } from '@/store';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import type { UIElement } from '@/types/spec';

interface ElementRendererProps {
  element: UIElement;
  parentId: string;
  parentType: 'page' | 'layout' | 'component';
  depth?: number;
}

export function ElementRenderer({
  element,
  parentId,
  parentType,
  depth = 0,
}: ElementRendererProps) {
  const { selectedId, hoveredId, select, setHovered } = useSelectionStore();
  const { deleteElement, duplicateElement, moveElementInDirection } = useProjectStore();
  const { openDialog } = useUIStore();

  const isSelected = selectedId === element.id;
  const isHovered = hoveredId === element.id;

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `element-${element.id}`,
    data: {
      type: 'element',
      elementId: element.id,
      parentId,
      parentType,
      accepts: getAcceptsChildren(element.type),
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `drag-element-${element.id}`,
    data: {
      type: 'canvas-element',
      element,
      elementId: element.id,
      parentId,
      parentType,
    },
  });

  // Combine refs for both draggable and droppable
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    select(element.id, 'element', parentId, parentType);
  };

  const handleEditProperties = () => {
    openDialog('elementProperties', {
      element,
      parentId,
      parentType,
    });
  };

  const handleSplitHorizontal = () => {
    openDialog('splitContainer', {
      element,
      parentId,
      parentType,
      direction: 'horizontal',
    });
  };

  const handleSplitVertical = () => {
    openDialog('splitContainer', {
      element,
      parentId,
      parentType,
      direction: 'vertical',
    });
  };

  const handleDelete = () => {
    deleteElement(parentType, parentId, element.id);
  };

  const handleDuplicate = () => {
    duplicateElement(parentType, parentId, element.id);
  };

  const handleMoveUp = () => {
    moveElementInDirection(parentType, parentId, element.id, 'up');
  };

  const handleMoveDown = () => {
    moveElementInDirection(parentType, parentId, element.id, 'down');
  };

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return <p className="text-sm">{element.props.content as string || 'Text'}</p>;

      case 'heading': {
        const level = (element.props.level as string) || '2';
        const headingClass = cn('font-bold', level === '1' && 'text-2xl', level === '2' && 'text-xl', level === '3' && 'text-lg');
        const content = element.props.content as string || 'Heading';
        if (level === '1') return <h1 className={headingClass}>{content}</h1>;
        if (level === '2') return <h2 className={headingClass}>{content}</h2>;
        if (level === '3') return <h3 className={headingClass}>{content}</h3>;
        return <h4 className={headingClass}>{content}</h4>;
      }

      case 'button':
        return (
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            {element.props.content as string || 'Button'}
          </button>
        );

      case 'input':
        return (
          <input
            type={element.props.type as string || 'text'}
            placeholder={element.props.placeholder as string || 'Input...'}
            className="w-full px-3 py-2 border rounded-md text-sm"
            readOnly
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={element.props.placeholder as string || 'Enter text...'}
            className="w-full px-3 py-2 border rounded-md text-sm resize-none"
            rows={3}
            readOnly
          />
        );

      case 'image':
        return (
          <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
            <Image className="h-8 w-8 text-muted-foreground" />
          </div>
        );

      case 'divider':
        return <hr className="w-full border-t" />;

      case 'spacer': {
        const size = parseInt(element.props.size as string || '4') * 4;
        return <div style={{ height: size }} />;
      }

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" readOnly />
            {element.props.label as string || 'Checkbox'}
          </label>
        );

      case 'select':
        return (
          <select className="w-full px-3 py-2 border rounded-md text-sm" disabled>
            <option>Select...</option>
          </select>
        );

      case 'stat':
        return (
          <div className="text-center">
            <div className="text-2xl font-bold">{element.props.value as string || '0'}</div>
            <div className="text-sm text-muted-foreground">{element.props.label as string || 'Stat'}</div>
          </div>
        );

      case 'table':
        return (
          <div className="border rounded-md p-4 text-center text-muted-foreground text-sm">
            Table: {element.props.entity as string || 'No entity'}
          </div>
        );

      case 'list':
        return (
          <div className="border rounded-md p-4 text-center text-muted-foreground text-sm">
            List: {element.props.entity as string || 'No entity'}
          </div>
        );

      case 'chart':
        return (
          <div className="border rounded-md p-4 h-32 flex items-center justify-center text-muted-foreground text-sm">
            <BarChart className="h-8 w-8 mr-2" />
            Chart
          </div>
        );

      case 'icon':
        return <Star className="h-5 w-5" />;

      case 'link':
        return (
          <a href="#" className="text-primary underline text-sm" onClick={(e) => e.preventDefault()}>
            {element.props.content as string || 'Link'}
          </a>
        );

      case 'radio':
        return (
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" className="rounded" readOnly />
            {element.props.label as string || 'Radio'}
          </label>
        );

      case 'switch':
        return (
          <label className="flex items-center gap-2 text-sm">
            <div className="w-8 h-4 bg-muted rounded-full relative">
              <div className="w-3 h-3 bg-primary rounded-full absolute left-0.5 top-0.5" />
            </div>
            {element.props.label as string || 'Switch'}
          </label>
        );

      case 'datepicker':
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border rounded-md text-sm"
            readOnly
          />
        );

      case 'filepicker':
        return (
          <div className="w-full px-3 py-2 border rounded-md text-sm text-muted-foreground">
            Choose file...
          </div>
        );

      case 'component':
        return (
          <div className="border border-dashed border-primary/50 rounded-md p-2 text-center text-sm text-primary bg-primary/5">
            <span className="font-medium">Component:</span> {element.props.ref as string || element.props.name as string || 'unnamed'}
          </div>
        );

      case 'use':
        return (
          <div className="border border-dashed border-orange-500/50 rounded-md p-2 text-sm text-orange-700 bg-orange-50">
            <span className="font-medium">Use:</span> {element.props.component as string || 'component'}
          </div>
        );

      case 'slot':
        // Slot without children - show placeholder
        return (
          <div className="border border-dashed border-cyan-500/50 rounded-md p-2 text-center text-sm text-cyan-700 bg-cyan-50">
            <span className="font-medium">Slot:</span> {element.props.name as string || element.props.target as string || 'default'}
          </div>
        );

      case 'badge':
        return (
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
            {element.props.value as string || element.props.content as string || 'Badge'}
          </span>
        );

      case 'tag':
        return (
          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
            {element.props.content as string || element.children?.[0]?.props?.content as string || 'Tag'}
          </span>
        );

      case 'search':
        return (
          <input
            type="search"
            placeholder={element.props.placeholder as string || 'Search...'}
            className="w-full px-3 py-2 border rounded-md text-sm"
            readOnly
          />
        );

      case 'pagination':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>←</span>
            <span>1 2 3 ... 10</span>
            <span>→</span>
          </div>
        );

      case 'prompt':
        return (
          <div className="border border-dashed border-yellow-500/50 bg-yellow-50 rounded-md p-2 text-sm text-yellow-800">
            <span className="font-medium">Prompt: </span>
            {(element.props.content as string || '').slice(0, 100)}...
          </div>
        );

      case 'spinner':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {element.props.label as string || 'Loading...'}
          </div>
        );

      case 'alert':
        return (
          <div className={cn(
            "p-3 rounded-md text-sm",
            element.props.variant === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-muted'
          )}>
            {element.props.content as string || 'Alert message'}
          </div>
        );

      default:
        // Fallback for any unknown element types - show a helpful preview
        const content = element.props.content ? String(element.props.content).slice(0, 30) : null;
        const value = element.props.value ? String(element.props.value).slice(0, 30) : null;
        const label = element.props.label ? String(element.props.label).slice(0, 30) : null;
        return (
          <div className="border border-dashed border-muted-foreground/30 rounded-md p-2 text-center text-sm text-muted-foreground">
            <span className="font-medium">{element.type}</span>
            {content && <span>: {content}</span>}
            {value && <span>: {value}</span>}
            {label && <span>: {label}</span>}
          </div>
        );
    }
  };

  const isContainer = getAcceptsChildren(element.type);
  const hasChildren = element.children && element.children.length > 0;

  // Render a label for structural containers
  const renderContainerLabel = (el: UIElement) => {
    switch (el.type) {
      case 'if':
        return (
          <div className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
            <span className="bg-blue-100 px-1.5 py-0.5 rounded">IF</span>
            <span className="text-blue-500">{el.props.condition as string || 'condition'}</span>
          </div>
        );
      case 'else':
        return (
          <div className="text-xs text-blue-600 font-medium mb-2">
            <span className="bg-blue-100 px-1.5 py-0.5 rounded">ELSE</span>
          </div>
        );
      case 'each':
      case 'for':
        return (
          <div className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
            <span className="bg-blue-100 px-1.5 py-0.5 rounded">FOR EACH</span>
            <span className="text-blue-500">{el.props.each as string || el.props.items as string || el.props.in as string || 'items'}</span>
          </div>
        );
      case 'use':
        return (
          <div className="text-xs text-orange-600 font-medium mb-2 flex items-center gap-1">
            <span className="bg-orange-100 px-1.5 py-0.5 rounded">USE</span>
            <span className="text-orange-500">{el.props.component as string || 'component'}</span>
          </div>
        );
      case 'slot':
        return (
          <div className="text-xs text-cyan-600 font-medium mb-2 flex items-center gap-1">
            <span className="bg-cyan-100 px-1.5 py-0.5 rounded">SLOT</span>
            <span className="text-cyan-500">{el.props.name as string || el.props.target as string || 'default'}</span>
          </div>
        );
      case 'nav':
        return (
          <div className="text-xs text-green-600 font-medium mb-2">
            <span className="bg-green-100 px-1.5 py-0.5 rounded">NAV</span>
          </div>
        );
      case 'modal':
        return (
          <div className="text-xs text-purple-600 font-medium mb-2 flex items-center gap-1">
            <span className="bg-purple-100 px-1.5 py-0.5 rounded">MODAL</span>
            <span className="text-purple-500">{el.props.name as string || el.props.title as string || ''}</span>
          </div>
        );
      case 'drawer':
        return (
          <div className="text-xs text-purple-600 font-medium mb-2 flex items-center gap-1">
            <span className="bg-purple-100 px-1.5 py-0.5 rounded">DRAWER</span>
            <span className="text-purple-500">{el.props.name as string || el.props.title as string || ''}</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Render prompt indicator for containers/slots with prompts
  const renderPromptIndicator = (el: UIElement) => {
    const prompt = el.props.prompt as string;
    if (!prompt) return null;

    const hasContext = el.props.promptContext;
    const hasConstraints = el.props.promptConstraints;

    return (
      <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mb-2 flex items-start gap-1.5">
        <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="line-clamp-2">{prompt.slice(0, 100)}{prompt.length > 100 ? '...' : ''}</span>
          {(hasContext || hasConstraints) && (
            <div className="flex gap-1 mt-1">
              {hasContext && <span className="bg-yellow-200 text-yellow-800 px-1 rounded text-[10px]">context</span>}
              {hasConstraints && <span className="bg-yellow-200 text-yellow-800 px-1 rounded text-[10px]">constraints</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Recursively render all children
  const renderChildren = () => {
    if (!hasChildren) return null;
    return (
      <div className={getChildrenContainerStyles(element.type, element.props)}>
        {element.children.map((child) => (
          <ElementRenderer
            key={child.id}
            element={child}
            parentId={parentId}
            parentType={parentType}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          onClick={handleClick}
          onMouseEnter={() => setHovered(element.id)}
          onMouseLeave={() => setHovered(null)}
          style={style}
          className={cn(
            'relative rounded transition-all',
            (isContainer || hasChildren) && 'p-2',
            isContainer && 'min-h-[40px]',
            isContainer && getContainerStyles(element.type, element.props),
            isSelected && 'ring-2 ring-primary',
            isHovered && !isSelected && 'ring-1 ring-primary/50',
            isOver && 'bg-primary/10',
            isDragging && 'opacity-50 ring-2 ring-primary ring-dashed',
            depth > 0 && 'ml-1'
          )}
        >
          {/* Element type label with integrated drag handle */}
          {(isSelected || isHovered) && !isDragging && (
            <div className="absolute -top-5 left-0 flex items-center gap-1 bg-primary text-primary-foreground rounded-t z-10">
              <div
                {...attributes}
                {...listeners}
                className="px-1 py-0.5 cursor-grab active:cursor-grabbing hover:bg-primary-foreground/20"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-3 w-3" />
              </div>
              <span className="text-xs pr-1.5 py-0.5">{element.type}</span>
            </div>
          )}

          {/* Drop indicator line */}
          {isOver && !getAcceptsChildren(element.type) && (
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary z-20" />
          )}

          {/* Render element content */}
          {isContainer ? (
            // Container elements: render label (for some types) + children or empty drop zone
            <>
              {/* Show label for structural containers */}
              {renderContainerLabel(element)}
              {/* Show prompt indicator if element has a prompt */}
              {renderPromptIndicator(element)}
              {hasChildren ? (
                <>
                  {renderChildren()}
                  {isOver && (
                    <div className="h-8 border-2 border-dashed border-primary rounded flex items-center justify-center text-primary text-xs mt-2">
                      Drop here
                    </div>
                  )}
                </>
              ) : (
                <div className={cn(
                  "flex items-center justify-center h-full min-h-[40px] border-2 border-dashed rounded text-sm",
                  isOver ? "border-primary bg-primary/10 text-primary" : "border-muted-foreground/30 text-muted-foreground"
                )}>
                  Drop elements here
                </div>
              )}
            </>
          ) : (
            // Non-container elements: render content AND any children
            <>
              {renderContent()}
              {renderChildren()}
            </>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleEditProperties}>
          Edit Properties
        </ContextMenuItem>
        {isContainer && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleSplitHorizontal}>
              Split Horizontally (Columns)
            </ContextMenuItem>
            <ContextMenuItem onClick={handleSplitVertical}>
              Split Vertically (Rows)
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleMoveUp}>
          Move Up
        </ContextMenuItem>
        <ContextMenuItem onClick={handleMoveDown}>
          Move Down
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function getAcceptsChildren(type: string): boolean {
  const containerTypes = [
    // Layout containers
    'row', 'column', 'stack', 'grid', 'card', 'section', 'container', 'tabs', 'tab',
    // Form containers
    'form', 'select',
    // Interactive containers
    'modal', 'drawer', 'tooltip', 'popover', 'dropdown', 'menu', 'trigger', 'overlay',
    // Data containers
    'list', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
    // Navigation
    'nav', 'navItem',
    // Logic/structure containers
    'if', 'else', 'each', 'for', 'sortable', 'dropZone', 'draggable',
    // Special containers
    'suffix', 'prefix', 'use',
  ];
  return containerTypes.includes(type);
}

function getContainerStyles(type: string, _props: Record<string, unknown>): string {
  switch (type) {
    case 'card':
      return 'border bg-card shadow-sm rounded-lg';
    case 'section':
      return 'border-l-4 border-l-primary bg-muted/30';
    case 'row':
    case 'column':
    case 'stack':
    case 'grid':
    case 'container':
      return 'border border-dashed border-muted-foreground/30';
    case 'form':
      return 'border border-primary/30 bg-primary/5';
    case 'modal':
    case 'drawer':
      return 'border-2 border-dashed border-purple-500/50 bg-purple-50/30';
    case 'if':
    case 'else':
    case 'each':
    case 'for':
      return 'border border-dashed border-blue-500/50 bg-blue-50/30';
    case 'nav':
      return 'border border-dashed border-green-500/50 bg-green-50/30';
    case 'table':
    case 'thead':
    case 'tbody':
      return 'border border-muted-foreground/30';
    case 'tr':
      return 'border-b border-muted-foreground/20';
    case 'td':
    case 'th':
      return 'border-r border-muted-foreground/20 last:border-r-0';
    case 'use':
      return 'border border-dashed border-orange-500/50 bg-orange-50/30';
    case 'slot':
      return 'border border-dashed border-cyan-500/50 bg-cyan-50/30';
    default:
      return 'border border-dashed border-muted-foreground/30';
  }
}

function getChildrenContainerStyles(type: string, props: Record<string, unknown>): string {
  const gap = props.gap ? `gap-${props.gap}` : 'gap-2';

  switch (type) {
    case 'row':
      return `flex flex-row flex-wrap ${gap}`;
    case 'column':
    case 'stack':
      return `flex flex-col ${gap}`;
    case 'grid': {
      const cols = props.columns || '3';
      return `grid grid-cols-${cols} ${gap}`;
    }
    case 'table':
      return 'w-full';
    case 'thead':
    case 'tbody':
      return 'w-full';
    case 'tr':
      return 'flex flex-row';
    case 'td':
    case 'th':
      return 'flex-1 p-2';
    case 'nav':
      return 'flex flex-col gap-1';
    case 'menu':
      return 'flex flex-col gap-1';
    case 'form':
      return `flex flex-col ${gap}`;
    case 'if':
    case 'else':
    case 'each':
    case 'for':
      return `flex flex-col ${gap}`;
    default:
      return 'flex flex-col gap-2';
  }
}

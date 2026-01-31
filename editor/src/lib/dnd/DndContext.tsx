import { useState } from 'react';
import {
  DndContext as DndKitContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  pointerWithin,
  rectIntersection,
  type DragStartEvent,
  type DragEndEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useProjectStore } from '@/store';
import { getIcon } from '@/lib/utils/icons';
import { findNodeById } from '@/lib/utils/tree';
import type { PaletteItem } from '@/types/editor';
import type { UIElement, UIElementType } from '@/types/spec';

interface DraggedElement {
  element: UIElement;
  parentId: string;
  parentType: 'page' | 'layout' | 'component';
}

interface DndContextProps {
  children: React.ReactNode;
}

// Custom collision detection that prefers smaller/more specific droppables
const customCollisionDetection: CollisionDetection = (args) => {
  // First check pointer within - most accurate for nested elements
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    // Sort by droppable area (smallest first) to prefer nested elements over containers
    const sorted = [...pointerCollisions].sort((a, b) => {
      const aRect = args.droppableRects.get(a.id);
      const bRect = args.droppableRects.get(b.id);
      if (!aRect || !bRect) return 0;
      const aArea = aRect.width * aRect.height;
      const bArea = bRect.width * bRect.height;
      return aArea - bArea;
    });
    // Return the smallest droppable that's under the pointer
    return [sorted[0]];
  }
  // Fall back to rect intersection
  return rectIntersection(args);
};

export function DndContext({ children }: DndContextProps) {
  const [activeItem, setActiveItem] = useState<PaletteItem | null>(null);
  const [activeElement, setActiveElement] = useState<DraggedElement | null>(null);
  const { addElement, moveElement } = useProjectStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === 'palette-item') {
      setActiveItem(data.item);
      setActiveElement(null);
    } else if (data?.type === 'canvas-element') {
      setActiveElement({
        element: data.element,
        parentId: data.parentId,
        parentType: data.parentType,
      });
      setActiveItem(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveItem(null);
    setActiveElement(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    // Handle palette item dropped on canvas or element
    if (activeData.type === 'palette-item') {
      const paletteItem = activeData.item as PaletteItem;
      const elementType = paletteItem.type as UIElementType;

      // Determine drop target
      if (overData.type === 'canvas') {
        // Dropped on empty canvas
        const newElement: Omit<UIElement, 'id'> = {
          type: elementType,
          props: paletteItem.defaultProps || {},
          children: [],
        };
        addElement(overData.parentType, overData.parentId, newElement);
      } else if (overData.type === 'element') {
        // Dropped on an element
        const newElement: Omit<UIElement, 'id'> = {
          type: elementType,
          props: paletteItem.defaultProps || {},
          children: [],
        };

        if (overData.accepts) {
          // Element accepts children - add inside
          addElement(overData.parentType, overData.parentId, newElement, overData.elementId, 'inside');
        } else {
          // Element doesn't accept children - add after
          addElement(overData.parentType, overData.parentId, newElement, overData.elementId, 'after');
        }
      }
    }

    // Handle canvas element being moved
    if (activeData.type === 'canvas-element') {
      const sourceElementId = activeData.elementId;
      const sourceParentId = activeData.parentId;
      const sourceParentType = activeData.parentType;
      const sourceElement = activeData.element as UIElement;

      // Don't drop on self
      if (overData.elementId === sourceElementId) return;

      // Don't drop into a descendant of the source element (would create circular reference)
      if (overData.type === 'element' && overData.accepts) {
        const isDescendant = findNodeById(sourceElement.children || [], overData.elementId);
        if (isDescendant) return;
      }

      // Determine drop target
      if (overData.type === 'canvas') {
        // Dropped on empty canvas - move to end
        moveElement(
          sourceParentType,
          sourceParentId,
          sourceElementId,
          sourceParentId, // target is same parent (root level)
          'inside'
        );
      } else if (overData.type === 'element') {
        const targetElementId = overData.elementId;

        // Check if dropping on a container that accepts children
        if (overData.accepts) {
          // Move inside the container
          moveElement(
            sourceParentType,
            sourceParentId,
            sourceElementId,
            targetElementId,
            'inside'
          );
        } else {
          // Move after the target element
          moveElement(
            sourceParentType,
            sourceParentId,
            sourceElementId,
            targetElementId,
            'after'
          );
        }
      }
    }
  };

  return (
    <DndKitContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeItem && <DragPreview item={activeItem} />}
        {activeElement && <ElementDragPreview element={activeElement.element} />}
      </DragOverlay>
    </DndKitContext>
  );
}

function DragPreview({ item }: { item: PaletteItem }) {
  const IconComponent = getIcon(item.icon);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-background border rounded-md shadow-lg">
      <IconComponent className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{item.label}</span>
    </div>
  );
}

function ElementDragPreview({ element }: { element: UIElement }) {
  // Get a simple preview of the element content
  const getPreviewContent = () => {
    const content = element.props.content as string;
    const label = element.props.label as string;
    const value = element.props.value as string;
    return content || label || value || element.type;
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md shadow-lg">
      <span className="text-xs font-medium uppercase">{element.type}</span>
      <span className="text-sm truncate max-w-[150px]">{getPreviewContent()}</span>
    </div>
  );
}

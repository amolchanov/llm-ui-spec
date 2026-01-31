import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils/cn';
import { getIcon } from '@/lib/utils/icons';
import type { PaletteItem as PaletteItemType } from '@/types/editor';

interface PaletteItemProps {
  item: PaletteItemType;
}

export function PaletteItem({ item }: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: {
      type: 'palette-item',
      itemType: item.type,
      item,
    },
  });

  const IconComponent = getIcon(item.icon);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab text-sm',
        'hover:bg-accent hover:text-accent-foreground transition-colors',
        isDragging && 'opacity-50'
      )}
    >
      <IconComponent className="h-4 w-4 text-muted-foreground" />
      <span>{item.label}</span>
    </div>
  );
}

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils/cn';

interface CanvasDropZoneProps {
  id: string;
  parentId: string;
  parentType: 'page' | 'layout' | 'component';
  children?: React.ReactNode;
  isEmpty?: boolean;
}

export function CanvasDropZone({
  id,
  parentId,
  parentType,
  children,
  isEmpty = false,
}: CanvasDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'canvas',
      parentId,
      parentType,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-full min-h-full',
        isOver && 'bg-primary/10',
        isEmpty && 'flex items-center justify-center'
      )}
    >
      {isEmpty ? (
        <div className={cn(
          'flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors',
          isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
        )}>
          <p className="text-muted-foreground text-sm">
            Drag components here to start building
          </p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

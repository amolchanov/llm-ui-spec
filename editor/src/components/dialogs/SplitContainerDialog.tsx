import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProjectStore, useUIStore } from '@/store';
import type { UIElement } from '@/types/spec';
import { generateId } from '@/lib/utils/id';

interface SplitContainerData {
  element: UIElement;
  parentId: string;
  parentType: 'page' | 'layout' | 'component';
  direction: 'horizontal' | 'vertical';
}

export function SplitContainerDialog() {
  const { activeDialog, dialogData, closeDialog } = useUIStore();
  const { updateElement } = useProjectStore();
  const [count, setCount] = useState(2);

  const isOpen = activeDialog === 'splitContainer';
  const data = dialogData as SplitContainerData | null;

  useEffect(() => {
    if (isOpen) {
      setCount(2);
    }
  }, [isOpen]);

  if (!data?.element) return null;

  const direction = data.direction;
  const isHorizontal = direction === 'horizontal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create the child elements based on split direction
    const childType = isHorizontal ? 'column' : 'row';
    const newChildren: UIElement[] = [];

    for (let i = 0; i < count; i++) {
      newChildren.push({
        id: generateId(),
        type: childType,
        props: {},
        children: [],
      });
    }

    // Update the element to be a row (for horizontal split) or column (for vertical split)
    // and add the new children
    const containerType = isHorizontal ? 'row' : 'column';

    updateElement(data.parentType, data.parentId, data.element.id, {
      type: containerType,
      props: {
        ...data.element.props,
        gap: data.element.props.gap || '4',
      },
      children: [
        ...data.element.children, // Keep existing children in first slot
        ...newChildren.slice(data.element.children.length > 0 ? 1 : 0), // Add remaining empty slots
      ].length > 0
        ? data.element.children.length > 0
          ? [
              // If has existing children, put them in first new column/row
              {
                id: generateId(),
                type: childType,
                props: {},
                children: data.element.children,
              },
              ...newChildren.slice(1),
            ]
          : newChildren
        : newChildren,
    });

    closeDialog();
  };

  const handleClose = () => {
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Split {isHorizontal ? 'Horizontally' : 'Vertically'}
          </DialogTitle>
          <DialogDescription>
            Split this container into {isHorizontal ? 'columns' : 'rows'}.
            {data.element.children.length > 0 && (
              <span className="block mt-1 text-yellow-600">
                Existing content will be moved to the first {isHorizontal ? 'column' : 'row'}.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="split-count">
                Number of {isHorizontal ? 'Columns' : 'Rows'}
              </Label>
              <Input
                id="split-count"
                type="number"
                min={2}
                max={12}
                value={count}
                onChange={(e) => setCount(Math.max(2, Math.min(12, parseInt(e.target.value) || 2)))}
                autoFocus
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Preview</Label>
              <div
                className={`border rounded-md p-2 h-24 flex ${
                  isHorizontal ? 'flex-row' : 'flex-col'
                } gap-2`}
              >
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center text-xs text-muted-foreground"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Split</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { ChevronDown, ChevronRight, Code } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getIcon } from '@/lib/utils/icons';
import { useSelectionStore, useUIStore } from '@/store';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface TreeNodeProps {
  id: string;
  label: string;
  icon: string;
  type: 'entity' | 'layout' | 'component' | 'page' | 'view' | 'element' | 'field' | 'category' | 'assetGroup' | 'asset';
  depth?: number;
  children?: React.ReactNode;
  hasChildren?: boolean;
  parentId?: string;
  parentType?: 'page' | 'layout' | 'component';
  role?: 'content' | 'chrome';
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRename?: () => void;
}

export function TreeNode({
  id,
  label,
  icon,
  type,
  depth = 0,
  children,
  hasChildren = false,
  parentId,
  parentType,
  role,
  onDelete,
  onDuplicate,
  onRename,
}: TreeNodeProps) {
  const { expandedTreeNodes, toggleTreeNode, expandTreeNode, openDialog } = useUIStore();
  const { selectedId, select } = useSelectionStore();

  const handleViewMarkup = () => {
    openDialog('viewMarkup', { id, type, parentId });
  };

  const isExpanded = expandedTreeNodes.has(id);
  const isSelected = selectedId === id;

  const IconComponent = getIcon(icon);

  // Single click - toggle expand for categories, or just visual highlight
  const handleClick = () => {
    if (type === 'category') {
      toggleTreeNode(id);
    }
  };

  // Double click - select and open in editor
  const handleDoubleClick = () => {
    if (type === 'category') return;

    // Select the item
    select(id, type, parentId, parentType);

    // If it's a container with children, expand it
    if (hasChildren) {
      expandTreeNode(id);
    }

    // If it's an element, also select its parent to show in canvas
    if (type === 'element' && parentId && parentType) {
      select(parentId, parentType);
    }
  };

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-sm cursor-pointer text-sm select-none',
              'hover:bg-accent transition-colors',
              isSelected && 'bg-accent'
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTreeNode(id);
                }}
                className="p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <IconComponent className={cn(
              "h-4 w-4",
              role === 'chrome' ? 'text-orange-500' : 'text-muted-foreground'
            )} />
            <span className="truncate flex-1">{label}</span>
            {role && (
              <span className={cn(
                "text-[10px] px-1 rounded",
                role === 'chrome' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
              )}>
                {role}
              </span>
            )}
          </div>
        </ContextMenuTrigger>
        {type !== 'category' && (
          <ContextMenuContent>
            <ContextMenuItem onClick={handleViewMarkup} className="gap-2">
              <Code className="h-4 w-4" />
              View Markup
            </ContextMenuItem>
            {(onRename || onDuplicate || onDelete) && <ContextMenuSeparator />}
            {onRename && (
              <ContextMenuItem onClick={onRename}>
                Rename
              </ContextMenuItem>
            )}
            {onDuplicate && (
              <ContextMenuItem onClick={onDuplicate}>
                Duplicate
              </ContextMenuItem>
            )}
            {(onRename || onDuplicate) && onDelete && <ContextMenuSeparator />}
            {onDelete && (
              <ContextMenuItem onClick={onDelete} className="text-destructive">
                Delete
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        )}
      </ContextMenu>
      {isExpanded && children}
    </div>
  );
}

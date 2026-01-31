import { cn } from '@/lib/utils/cn';
import type { UIElement } from '@/types/spec';

interface ChromeRendererProps {
  element: UIElement;
}

/**
 * Renders layout chrome elements as read-only visual placeholders.
 * These elements show the layout structure but are not editable when viewing a page.
 */
export function ChromeRenderer({ element }: ChromeRendererProps) {
  const renderContent = () => {
    switch (element.type) {
      case 'nav':
        return (
          <div className="flex flex-col gap-1 p-2">
            {element.children.length > 0 ? (
              element.children.map((child) => (
                <ChromeRenderer key={child.id} element={child} />
              ))
            ) : (
              <span className="text-xs">Navigation</span>
            )}
          </div>
        );

      case 'navItem':
        return (
          <div className="px-3 py-1.5 text-sm rounded hover:bg-muted/50">
            {element.props.label as string || element.props.icon as string || 'Nav Item'}
          </div>
        );

      case 'heading':
        return (
          <div className="font-semibold">
            {element.props.content as string || 'Heading'}
          </div>
        );

      case 'text':
        return (
          <span className="text-sm">
            {element.props.content as string || 'Text'}
          </span>
        );

      case 'button':
        return (
          <button className="px-3 py-1 bg-primary/20 text-primary rounded text-sm" disabled>
            {element.props.content as string || 'Button'}
          </button>
        );

      case 'image':
        return (
          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs">
            IMG
          </div>
        );

      case 'slot': {
        const slotName = element.props.name as string || element.props.target as string || 'content';
        // Content slots are where page content goes - show a placeholder
        if (slotName === 'content' || element.role === 'content') {
          return (
            <div className="border-2 border-dashed border-primary/30 rounded p-4 text-center text-primary/50 text-sm bg-primary/5">
              Page Content
            </div>
          );
        }
        // Other slots show their name
        return (
          <div className="border border-dashed border-muted-foreground/30 rounded p-2 text-center text-muted-foreground text-xs">
            Slot: {slotName}
          </div>
        );
      }

      case 'row':
        return (
          <div className="flex flex-row gap-2 items-center">
            {element.children.map((child) => (
              <ChromeRenderer key={child.id} element={child} />
            ))}
          </div>
        );

      case 'column':
      case 'stack':
        return (
          <div className="flex flex-col gap-2">
            {element.children.map((child) => (
              <ChromeRenderer key={child.id} element={child} />
            ))}
          </div>
        );

      case 'container':
      case 'section':
      case 'card':
        return (
          <div className={cn(
            element.type === 'card' && 'border rounded-lg p-2',
            element.type === 'section' && 'border-l-2 border-l-muted-foreground/30 pl-2'
          )}>
            {element.children.map((child) => (
              <ChromeRenderer key={child.id} element={child} />
            ))}
          </div>
        );

      default:
        // For unknown types, try to render children or show type name
        if (element.children && element.children.length > 0) {
          return (
            <div className="flex flex-col gap-1">
              {element.children.map((child) => (
                <ChromeRenderer key={child.id} element={child} />
              ))}
            </div>
          );
        }
        return (
          <div className="text-xs text-muted-foreground">
            {element.type}
          </div>
        );
    }
  };

  return (
    <div className="chrome-element opacity-60 pointer-events-none select-none">
      {renderContent()}
    </div>
  );
}

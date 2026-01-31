import { Image, BarChart, Star, ChevronDown, Search, Calendar, Upload } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { UIElement } from '@/types/spec';

interface PreviewRendererProps {
  element: UIElement;
}

export function PreviewRenderer({ element }: PreviewRendererProps) {
  const renderElement = (el: UIElement): React.ReactNode => {
    const hasChildren = el.children && el.children.length > 0;

    // Get layout styles for containers
    const getLayoutStyles = (type: string, props: Record<string, unknown>): string => {
      const gap = props.gap ? `gap-${props.gap}` : 'gap-4';

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
        case 'container':
          return `${gap}`;
        case 'card':
          return 'bg-card border rounded-lg shadow-sm p-4';
        case 'section':
          return 'py-4';
        case 'form':
          return `flex flex-col ${gap}`;
        case 'nav':
          return 'flex flex-col gap-1';
        case 'table':
          return 'w-full border-collapse';
        case 'thead':
        case 'tbody':
          return 'w-full';
        case 'tr':
          return 'flex flex-row border-b';
        case 'td':
        case 'th':
          return 'flex-1 p-2 text-left';
        default:
          return 'flex flex-col gap-2';
      }
    };

    // Render based on element type
    switch (el.type) {
      // Text elements
      case 'text':
        return (
          <p className={cn('text-sm', el.props.muted === true && 'text-muted-foreground')}>
            {(el.props.content as string) || (el.props.value as string) || 'Text'}
          </p>
        );

      case 'heading': {
        const level = (el.props.level as string) || '2';
        const content = el.props.content as string || 'Heading';
        const classes = cn(
          'font-bold',
          level === '1' && 'text-3xl',
          level === '2' && 'text-2xl',
          level === '3' && 'text-xl',
          level === '4' && 'text-lg'
        );

        switch (level) {
          case '1': return <h1 className={classes}>{content}</h1>;
          case '2': return <h2 className={classes}>{content}</h2>;
          case '3': return <h3 className={classes}>{content}</h3>;
          default: return <h4 className={classes}>{content}</h4>;
        }
      }

      // Interactive elements
      case 'button':
        return (
          <button className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            el.props.variant === 'outline'
              ? 'border border-input bg-background hover:bg-accent'
              : el.props.variant === 'ghost'
              ? 'hover:bg-accent'
              : el.props.variant === 'secondary'
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
            el.props.fullWidth === true && 'w-full'
          )}>
            {el.props.content as string || 'Button'}
          </button>
        );

      case 'link':
        return (
          <a href="#" className="text-primary hover:underline text-sm" onClick={(e) => e.preventDefault()}>
            {el.props.content as string || 'Link'}
            {hasChildren && el.children.map((child, i) => (
              <span key={child.id || i}>{renderElement(child)}</span>
            ))}
          </a>
        );

      // Form elements
      case 'input':
        return (
          <div className="w-full">
            {el.props.label ? (
              <label className="block text-sm font-medium mb-1">
                {String(el.props.label)}
                {el.props.required ? <span className="text-destructive ml-1">*</span> : null}
              </label>
            ) : null}
            <input
              type={(el.props.type as string) || 'text'}
              placeholder={(el.props.placeholder as string) || ''}
              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              readOnly
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="w-full">
            {el.props.label ? (
              <label className="block text-sm font-medium mb-1">{String(el.props.label)}</label>
            ) : null}
            <textarea
              placeholder={(el.props.placeholder as string) || ''}
              className="w-full px-3 py-2 border rounded-md text-sm resize-none bg-background"
              rows={3}
              readOnly
            />
          </div>
        );

      case 'select':
        return (
          <div className="w-full">
            {el.props.label ? (
              <label className="block text-sm font-medium mb-1">{String(el.props.label)}</label>
            ) : null}
            <div className="relative">
              <select className="w-full px-3 py-2 border rounded-md text-sm appearance-none bg-background pr-8">
                <option>{(el.props.placeholder as string) || 'Select...'}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded border-input" />
            {el.props.label as string || 'Checkbox'}
          </label>
        );

      case 'radio':
        return (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" className="border-input" />
            {el.props.label as string || 'Radio'}
          </label>
        );

      case 'switch':
        return (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <div className="w-10 h-5 bg-muted rounded-full relative">
              <div className="w-4 h-4 bg-background rounded-full absolute left-0.5 top-0.5 shadow transition-transform" />
            </div>
            {el.props.label as string || ''}
          </label>
        );

      case 'search':
        return (
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={el.props.placeholder as string || 'Search...'}
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-background"
              readOnly
            />
          </div>
        );

      case 'datepicker':
        return (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Select date..."
              className="w-full px-3 py-2 border rounded-md text-sm bg-background pr-10"
              readOnly
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        );

      case 'filepicker':
        return (
          <div className="w-full border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
          </div>
        );

      // Display elements
      case 'image':
        return (
          <div className={cn(
            'bg-muted rounded-md flex items-center justify-center',
            el.props.height ? `h-[${el.props.height}]` : 'h-40'
          )}>
            <Image className="h-12 w-12 text-muted-foreground" />
          </div>
        );

      case 'icon':
        return <Star className="h-5 w-5" />;

      case 'divider':
        return <hr className="w-full border-t my-2" />;

      case 'spacer': {
        const size = parseInt(el.props.size as string || '4') * 4;
        return <div style={{ height: size }} />;
      }

      case 'badge':
        return (
          <span className={cn(
            'px-2 py-0.5 text-xs rounded-full',
            el.props.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
            el.props.variant === 'outline' ? 'border' :
            'bg-primary text-primary-foreground'
          )}>
            {el.props.value as string || el.props.content as string || 'Badge'}
          </span>
        );

      case 'tag':
        return (
          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
            {el.props.content as string || 'Tag'}
          </span>
        );

      // Data display
      case 'stat':
        return (
          <div className="text-center p-4">
            <div className="text-3xl font-bold">{el.props.value as string || '0'}</div>
            <div className="text-sm text-muted-foreground">{el.props.label as string || 'Stat'}</div>
          </div>
        );

      case 'table':
        if (hasChildren) {
          return (
            <div className="w-full border rounded-md overflow-hidden">
              <table className="w-full">
                {el.children.map((child, i) => (
                  <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
                ))}
              </table>
            </div>
          );
        }
        return (
          <div className="border rounded-md p-8 text-center text-muted-foreground">
            <p className="text-sm">Table: {el.props.entity as string || 'No data source'}</p>
          </div>
        );

      case 'thead':
        return (
          <thead className="bg-muted/50">
            {hasChildren && el.children.map((child, i) => (
              <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
            ))}
          </thead>
        );

      case 'tbody':
        return (
          <tbody>
            {hasChildren && el.children.map((child, i) => (
              <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
            ))}
          </tbody>
        );

      case 'tr':
        return (
          <tr className="border-b last:border-0">
            {hasChildren && el.children.map((child, i) => (
              <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
            ))}
          </tr>
        );

      case 'td':
        return (
          <td className="p-3 text-sm">
            {hasChildren ? el.children.map((child, i) => (
              <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
            )) : el.props.content as string || ''}
          </td>
        );

      case 'th':
        return (
          <th className="p-3 text-sm font-medium text-left">
            {hasChildren ? el.children.map((child, i) => (
              <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
            )) : el.props.content as string || ''}
          </th>
        );

      case 'list':
        return (
          <div className="border rounded-md p-4 text-center text-muted-foreground">
            <p className="text-sm">List: {el.props.entity as string || 'No data source'}</p>
          </div>
        );

      case 'chart':
        return (
          <div className="border rounded-md p-8 h-48 flex items-center justify-center text-muted-foreground">
            <BarChart className="h-12 w-12 mr-2" />
            <span>Chart</span>
          </div>
        );

      case 'pagination':
        return (
          <div className="flex items-center justify-center gap-1">
            <button className="px-3 py-1 border rounded text-sm hover:bg-muted">←</button>
            <button className="px-3 py-1 border rounded text-sm bg-primary text-primary-foreground">1</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-muted">2</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-muted">3</button>
            <span className="px-2">...</span>
            <button className="px-3 py-1 border rounded text-sm hover:bg-muted">10</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-muted">→</button>
          </div>
        );

      // Special elements
      case 'alert':
        return (
          <div className={cn(
            'p-4 rounded-md text-sm',
            el.props.variant === 'error' || el.props.variant === 'destructive'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : el.props.variant === 'warning'
              ? 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20'
              : el.props.variant === 'success'
              ? 'bg-green-500/10 text-green-700 border border-green-500/20'
              : 'bg-muted'
          )}>
            {el.props.content as string || 'Alert message'}
          </div>
        );

      case 'spinner':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            {el.props.label as string || 'Loading...'}
          </div>
        );

      // Component references
      case 'component':
      case 'use':
        return (
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Component: {el.props.component as string || el.props.ref as string || el.props.name as string || 'Unknown'}
            </p>
            {hasChildren && (
              <div className="mt-2">
                {el.children.map((child, i) => (
                  <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
                ))}
              </div>
            )}
          </div>
        );

      case 'slot':
        return (
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-md p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Slot: {el.props.name as string || el.props.target as string || 'default'}
            </p>
            {hasChildren && (
              <div className="mt-2">
                {el.children.map((child, i) => (
                  <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
                ))}
              </div>
            )}
          </div>
        );

      // Logic elements - just render children
      case 'if':
      case 'else':
      case 'each':
      case 'for':
        return hasChildren ? (
          <div className={getLayoutStyles(el.type, el.props)}>
            {el.children.map((child, i) => (
              <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
            ))}
          </div>
        ) : null;

      // Prompt elements - show as placeholder in preview
      case 'prompt':
        return (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800 italic">
              {(el.props.content as string || '').slice(0, 150)}
              {(el.props.content as string || '').length > 150 ? '...' : ''}
            </p>
          </div>
        );

      // Navigation
      case 'nav':
        return (
          <nav className="flex flex-col gap-1">
            {hasChildren && el.children.map((child, i) => (
              <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
            ))}
          </nav>
        );

      case 'navItem':
        return (
          <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted" onClick={(e) => e.preventDefault()}>
            {el.props.icon ? <Star className="h-4 w-4" /> : null}
            {(el.props.label as string) || 'Nav Item'}
          </a>
        );

      // Form container
      case 'form':
        return (
          <form className={getLayoutStyles('form', el.props)} onSubmit={(e) => e.preventDefault()}>
            {hasChildren && el.children.map((child, i) => (
              <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
            ))}
          </form>
        );

      // Container elements - render children with layout
      case 'row':
      case 'column':
      case 'stack':
      case 'grid':
      case 'container':
      case 'card':
      case 'section':
      case 'modal':
      case 'drawer':
      case 'tabs':
      case 'tab':
      case 'menu':
      case 'dropdown':
      case 'tooltip':
      case 'popover':
      case 'trigger':
      case 'overlay':
      case 'sortable':
      case 'dropZone':
      case 'draggable':
      case 'suffix':
      case 'prefix':
        return (
          <div className={getLayoutStyles(el.type, el.props)}>
            {hasChildren && el.children.map((child, i) => (
              <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
            ))}
          </div>
        );

      // Default fallback
      default:
        return (
          <div className="p-2">
            {hasChildren ? (
              el.children.map((child, i) => (
                <Fragment key={child.id || i}>{renderElement(child)}</Fragment>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                {el.props.content as string || el.props.value as string || el.props.label as string || el.type}
              </span>
            )}
          </div>
        );
    }
  };

  return <>{renderElement(element)}</>;
}

// Fragment helper for cleaner JSX
const Fragment = ({ children }: { children: React.ReactNode }) => <>{children}</>;

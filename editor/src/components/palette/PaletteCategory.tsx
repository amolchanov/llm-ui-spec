import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PaletteItem } from './PaletteItem';
import type { PaletteItem as PaletteItemType, PaletteCategory as PaletteCategoryType } from '@/types/editor';

interface PaletteCategoryProps {
  category: PaletteCategoryType;
  label: string;
  items: PaletteItemType[];
  defaultExpanded?: boolean;
}

export function PaletteCategory({
  label,
  items,
  defaultExpanded = true,
}: PaletteCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-1 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider',
          'text-muted-foreground hover:text-foreground transition-colors'
        )}
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {label}
      </button>
      {isExpanded && (
        <div className="ml-2">
          {items.map((item) => (
            <PaletteItem key={item.type} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

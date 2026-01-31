import { ScrollArea } from '@/components/ui/scroll-area';
import { PaletteCategory } from './PaletteCategory';
import {
  categoryLabels,
  categoryOrder,
  getPaletteItemsByCategory,
} from './palette-items';

export function ComponentPalette() {
  return (
    <div className="h-full flex flex-col border-r bg-background">
      <div className="p-3 border-b">
        <h2 className="text-sm font-semibold">Components</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {categoryOrder.map((category) => (
            <PaletteCategory
              key={category}
              category={category}
              label={categoryLabels[category]}
              items={getPaletteItemsByCategory(category)}
              defaultExpanded={category === 'layout' || category === 'basic'}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

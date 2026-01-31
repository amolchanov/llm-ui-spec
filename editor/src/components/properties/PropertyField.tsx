import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PropertyDefinition } from '@/types/editor';

interface PropertyFieldProps {
  definition: PropertyDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function PropertyField({ definition, value, onChange }: PropertyFieldProps) {
  const { name, type, label, placeholder, options, description } = definition;

  const displayLabel = label || name.charAt(0).toUpperCase() + name.slice(1);

  switch (type) {
    case 'string':
    case 'number':
    case 'prompt':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name} className="text-xs">
            {displayLabel}
          </Label>
          <Input
            id={name}
            type={type === 'number' ? 'number' : 'text'}
            value={(value as string) || ''}
            placeholder={placeholder}
            onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            className="h-8 text-sm"
          />
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={name}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <Label htmlFor={name} className="text-xs">
            {displayLabel}
          </Label>
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name} className="text-xs">
            {displayLabel}
          </Label>
          <Select
            value={(value as string) || ''}
            onValueChange={onChange}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'color':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name} className="text-xs">
            {displayLabel}
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id={name}
              value={(value as string) || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 w-8 rounded border cursor-pointer"
            />
            <Input
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 text-sm flex-1"
            />
          </div>
        </div>
      );

    case 'entity-ref':
    case 'component-ref':
    case 'page-ref':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name} className="text-xs">
            {displayLabel}
          </Label>
          <Input
            id={name}
            value={(value as string) || ''}
            placeholder={placeholder || `@${type.replace('-ref', '')}.Name`}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-sm font-mono"
          />
        </div>
      );

    case 'json':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name} className="text-xs">
            {displayLabel}
          </Label>
          <textarea
            id={name}
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                onChange(e.target.value);
              }
            }}
            className="w-full h-24 px-3 py-2 text-sm font-mono border rounded-md resize-none"
          />
        </div>
      );

    default:
      return (
        <div className="space-y-1.5">
          <Label htmlFor={name} className="text-xs">
            {displayLabel}
          </Label>
          <Input
            id={name}
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      );
  }
}

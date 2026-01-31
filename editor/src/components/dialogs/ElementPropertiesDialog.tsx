import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjectStore, useUIStore } from '@/store';
import type { UIElement } from '@/types/spec';

interface ElementPropertiesData {
  element: UIElement;
  parentId: string;
  parentType: 'page' | 'layout' | 'component';
}

// Define properties schema for each element type
const ELEMENT_PROPERTIES: Record<string, PropertyDef[]> = {
  // Text elements
  text: [
    { name: 'content', label: 'Content', type: 'text' },
    { name: 'muted', label: 'Muted', type: 'boolean' },
  ],
  heading: [
    { name: 'content', label: 'Content', type: 'string' },
    { name: 'level', label: 'Level', type: 'select', options: ['1', '2', '3', '4', '5', '6'] },
  ],

  // Button/Link
  button: [
    { name: 'content', label: 'Label', type: 'string' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'secondary', 'outline', 'ghost', 'destructive'] },
    { name: 'size', label: 'Size', type: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    { name: 'fullWidth', label: 'Full Width', type: 'boolean' },
    { name: 'disabled', label: 'Disabled', type: 'boolean' },
    { name: 'onClick', label: 'On Click', type: 'string', placeholder: '@action.actionName' },
  ],
  link: [
    { name: 'content', label: 'Label', type: 'string' },
    { name: 'href', label: 'URL/Route', type: 'string', placeholder: '/page or https://...' },
    { name: 'target', label: 'Target', type: 'select', options: ['_self', '_blank'] },
  ],

  // Form inputs
  input: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'placeholder', label: 'Placeholder', type: 'string' },
    { name: 'type', label: 'Type', type: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
    { name: 'name', label: 'Field Name', type: 'string' },
    { name: 'bind', label: 'Bind To', type: 'string', placeholder: '@state.fieldName' },
    { name: 'required', label: 'Required', type: 'boolean' },
    { name: 'disabled', label: 'Disabled', type: 'boolean' },
  ],
  textarea: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'placeholder', label: 'Placeholder', type: 'string' },
    { name: 'name', label: 'Field Name', type: 'string' },
    { name: 'bind', label: 'Bind To', type: 'string', placeholder: '@state.fieldName' },
    { name: 'rows', label: 'Rows', type: 'number' },
    { name: 'required', label: 'Required', type: 'boolean' },
  ],
  select: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'placeholder', label: 'Placeholder', type: 'string' },
    { name: 'name', label: 'Field Name', type: 'string' },
    { name: 'bind', label: 'Bind To', type: 'string', placeholder: '@state.fieldName' },
    { name: 'options', label: 'Options (comma separated)', type: 'string' },
    { name: 'required', label: 'Required', type: 'boolean' },
  ],
  checkbox: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'name', label: 'Field Name', type: 'string' },
    { name: 'bind', label: 'Bind To', type: 'string', placeholder: '@state.fieldName' },
    { name: 'checked', label: 'Default Checked', type: 'boolean' },
  ],
  radio: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'name', label: 'Group Name', type: 'string' },
    { name: 'value', label: 'Value', type: 'string' },
    { name: 'bind', label: 'Bind To', type: 'string', placeholder: '@state.fieldName' },
  ],
  switch: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'name', label: 'Field Name', type: 'string' },
    { name: 'bind', label: 'Bind To', type: 'string', placeholder: '@state.fieldName' },
    { name: 'checked', label: 'Default On', type: 'boolean' },
  ],
  search: [
    { name: 'placeholder', label: 'Placeholder', type: 'string' },
    { name: 'bind', label: 'Bind To', type: 'string', placeholder: '@state.searchQuery' },
    { name: 'onSearch', label: 'On Search', type: 'string', placeholder: '@action.search' },
  ],
  datepicker: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'placeholder', label: 'Placeholder', type: 'string' },
    { name: 'bind', label: 'Bind To', type: 'string', placeholder: '@state.date' },
    { name: 'required', label: 'Required', type: 'boolean' },
  ],
  filepicker: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'accept', label: 'Accept Types', type: 'string', placeholder: '.pdf,.doc,image/*' },
    { name: 'multiple', label: 'Multiple Files', type: 'boolean' },
    { name: 'onUpload', label: 'On Upload', type: 'string', placeholder: '@action.upload' },
  ],

  // Form container
  form: [
    { name: 'name', label: 'Form Name', type: 'string' },
    { name: 'onSubmit', label: 'On Submit', type: 'string', placeholder: '@action.submit' },
    { name: 'gap', label: 'Gap', type: 'select', options: ['1', '2', '3', '4', '6', '8'] },
  ],

  // Layout containers
  row: [
    { name: 'gap', label: 'Gap', type: 'select', options: ['1', '2', '3', '4', '6', '8'] },
    { name: 'align', label: 'Align', type: 'select', options: ['start', 'center', 'end', 'stretch'] },
    { name: 'justify', label: 'Justify', type: 'select', options: ['start', 'center', 'end', 'between', 'around'] },
    { name: 'wrap', label: 'Wrap', type: 'boolean' },
    { name: '_role', label: 'Role', type: 'select', options: ['none', 'content', 'chrome'], isElementProp: true },
    { name: 'prompt', label: 'Prompt', type: 'text', placeholder: 'LLM guidance for this area...' },
    { name: 'promptContext', label: 'Prompt Sets Context', type: 'boolean' },
    { name: 'promptConstraints', label: 'Prompt Has Constraints', type: 'boolean' },
  ],
  column: [
    { name: 'gap', label: 'Gap', type: 'select', options: ['1', '2', '3', '4', '6', '8'] },
    { name: 'align', label: 'Align', type: 'select', options: ['start', 'center', 'end', 'stretch'] },
    { name: '_role', label: 'Role', type: 'select', options: ['none', 'content', 'chrome'], isElementProp: true },
    { name: 'prompt', label: 'Prompt', type: 'text', placeholder: 'LLM guidance for this area...' },
    { name: 'promptContext', label: 'Prompt Sets Context', type: 'boolean' },
    { name: 'promptConstraints', label: 'Prompt Has Constraints', type: 'boolean' },
  ],
  stack: [
    { name: 'gap', label: 'Gap', type: 'select', options: ['1', '2', '3', '4', '6', '8'] },
    { name: '_role', label: 'Role', type: 'select', options: ['none', 'content', 'chrome'], isElementProp: true },
    { name: 'prompt', label: 'Prompt', type: 'text', placeholder: 'LLM guidance for this area...' },
    { name: 'promptContext', label: 'Prompt Sets Context', type: 'boolean' },
    { name: 'promptConstraints', label: 'Prompt Has Constraints', type: 'boolean' },
  ],
  grid: [
    { name: 'columns', label: 'Columns', type: 'select', options: ['1', '2', '3', '4', '5', '6'] },
    { name: 'gap', label: 'Gap', type: 'select', options: ['1', '2', '3', '4', '6', '8'] },
    { name: '_role', label: 'Role', type: 'select', options: ['none', 'content', 'chrome'], isElementProp: true },
    { name: 'prompt', label: 'Prompt', type: 'text', placeholder: 'LLM guidance for this area...' },
    { name: 'promptContext', label: 'Prompt Sets Context', type: 'boolean' },
    { name: 'promptConstraints', label: 'Prompt Has Constraints', type: 'boolean' },
  ],
  card: [
    { name: 'title', label: 'Title', type: 'string' },
    { name: 'padding', label: 'Padding', type: 'select', options: ['none', 'sm', 'md', 'lg'] },
    { name: '_role', label: 'Role', type: 'select', options: ['none', 'content', 'chrome'], isElementProp: true },
    { name: 'prompt', label: 'Prompt', type: 'text', placeholder: 'LLM guidance for this area...' },
    { name: 'promptContext', label: 'Prompt Sets Context', type: 'boolean' },
    { name: 'promptConstraints', label: 'Prompt Has Constraints', type: 'boolean' },
  ],
  section: [
    { name: 'title', label: 'Title', type: 'string' },
    { name: '_role', label: 'Role', type: 'select', options: ['none', 'content', 'chrome'], isElementProp: true },
    { name: 'prompt', label: 'Prompt', type: 'text', placeholder: 'LLM guidance for this area...' },
    { name: 'promptContext', label: 'Prompt Sets Context', type: 'boolean' },
    { name: 'promptConstraints', label: 'Prompt Has Constraints', type: 'boolean' },
  ],
  container: [
    { name: 'maxWidth', label: 'Max Width', type: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'] },
    { name: 'padding', label: 'Padding', type: 'select', options: ['none', 'sm', 'md', 'lg'] },
    { name: '_role', label: 'Role', type: 'select', options: ['none', 'content', 'chrome'], isElementProp: true },
    { name: 'prompt', label: 'Prompt', type: 'text', placeholder: 'LLM guidance for this area...' },
    { name: 'promptContext', label: 'Prompt Sets Context', type: 'boolean' },
    { name: 'promptConstraints', label: 'Prompt Has Constraints', type: 'boolean' },
  ],

  // Data display
  table: [
    { name: 'entity', label: 'Entity', type: 'string', placeholder: '@entity.EntityName' },
    { name: 'view', label: 'View', type: 'string', placeholder: '@view.ViewName' },
    { name: 'columns', label: 'Columns (comma separated)', type: 'string' },
    { name: 'sortable', label: 'Sortable', type: 'boolean' },
    { name: 'selectable', label: 'Selectable', type: 'boolean' },
  ],
  list: [
    { name: 'entity', label: 'Entity', type: 'string', placeholder: '@entity.EntityName' },
    { name: 'view', label: 'View', type: 'string', placeholder: '@view.ViewName' },
    { name: 'emptyText', label: 'Empty Text', type: 'string' },
  ],
  stat: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'value', label: 'Value', type: 'string' },
    { name: 'change', label: 'Change', type: 'string' },
    { name: 'trend', label: 'Trend', type: 'select', options: ['up', 'down', 'neutral'] },
  ],
  chart: [
    { name: 'type', label: 'Chart Type', type: 'select', options: ['line', 'bar', 'pie', 'area', 'donut'] },
    { name: 'entity', label: 'Data Source', type: 'string', placeholder: '@entity.EntityName' },
    { name: 'xAxis', label: 'X Axis Field', type: 'string' },
    { name: 'yAxis', label: 'Y Axis Field', type: 'string' },
  ],
  pagination: [
    { name: 'pageSize', label: 'Page Size', type: 'number' },
    { name: 'total', label: 'Total Bind', type: 'string', placeholder: '@state.total' },
    { name: 'current', label: 'Current Page Bind', type: 'string', placeholder: '@state.page' },
  ],

  // Display elements
  image: [
    { name: 'src', label: 'Source URL', type: 'string' },
    { name: 'alt', label: 'Alt Text', type: 'string' },
    { name: 'width', label: 'Width', type: 'string' },
    { name: 'height', label: 'Height', type: 'string' },
    { name: 'fit', label: 'Object Fit', type: 'select', options: ['cover', 'contain', 'fill', 'none'] },
  ],
  icon: [
    { name: 'name', label: 'Icon Name', type: 'string' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    { name: 'color', label: 'Color', type: 'string' },
  ],
  badge: [
    { name: 'content', label: 'Content', type: 'string' },
    { name: 'value', label: 'Value', type: 'string' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'secondary', 'outline', 'destructive'] },
  ],
  tag: [
    { name: 'content', label: 'Content', type: 'string' },
    { name: 'removable', label: 'Removable', type: 'boolean' },
  ],
  divider: [
    { name: 'orientation', label: 'Orientation', type: 'select', options: ['horizontal', 'vertical'] },
  ],
  spacer: [
    { name: 'size', label: 'Size', type: 'select', options: ['1', '2', '4', '6', '8', '12', '16'] },
  ],
  alert: [
    { name: 'content', label: 'Message', type: 'text' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'success', 'warning', 'error', 'info'] },
    { name: 'dismissible', label: 'Dismissible', type: 'boolean' },
  ],
  spinner: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
  ],

  // Interactive
  modal: [
    { name: 'name', label: 'Modal Name', type: 'string' },
    { name: 'title', label: 'Title', type: 'string' },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    { name: 'closable', label: 'Closable', type: 'boolean' },
  ],
  drawer: [
    { name: 'name', label: 'Drawer Name', type: 'string' },
    { name: 'title', label: 'Title', type: 'string' },
    { name: 'position', label: 'Position', type: 'select', options: ['left', 'right', 'top', 'bottom'] },
    { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'] },
  ],
  tabs: [
    { name: 'defaultTab', label: 'Default Tab', type: 'string' },
    { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'pills', 'underline'] },
  ],
  tab: [
    { name: 'name', label: 'Tab ID', type: 'string' },
    { name: 'label', label: 'Tab Label', type: 'string' },
    { name: 'icon', label: 'Icon', type: 'string' },
  ],
  dropdown: [
    { name: 'trigger', label: 'Trigger Text', type: 'string' },
    { name: 'align', label: 'Alignment', type: 'select', options: ['start', 'center', 'end'] },
  ],
  tooltip: [
    { name: 'content', label: 'Tooltip Text', type: 'string' },
    { name: 'position', label: 'Position', type: 'select', options: ['top', 'bottom', 'left', 'right'] },
  ],

  // Logic elements
  if: [
    { name: 'condition', label: 'Condition', type: 'string', placeholder: '@state.isVisible' },
  ],
  each: [
    { name: 'items', label: 'Items', type: 'string', placeholder: '@entity.Items or @state.list' },
    { name: 'as', label: 'Item Variable', type: 'string', placeholder: 'item' },
    { name: 'key', label: 'Key Field', type: 'string', placeholder: 'id' },
  ],
  for: [
    { name: 'each', label: 'Each Item In', type: 'string', placeholder: '@entity.Items' },
    { name: 'as', label: 'Item Variable', type: 'string', placeholder: 'item' },
  ],

  // Component references
  component: [
    { name: 'ref', label: 'Component Reference', type: 'string', placeholder: '@component.ComponentName' },
    { name: 'name', label: 'Component Name', type: 'string' },
  ],
  use: [
    { name: 'component', label: 'Component', type: 'string', placeholder: '@component.ComponentName' },
  ],
  slot: [
    { name: 'name', label: 'Slot Name', type: 'string' },
    { name: 'target', label: 'Target Slot', type: 'string', placeholder: '@layout.LayoutName.slotName' },
    { name: 'role', label: 'Role', type: 'select', options: ['none', 'content', 'chrome'] },
    { name: 'prompt', label: 'Prompt', type: 'text', placeholder: 'LLM guidance for this slot...' },
    { name: 'promptContext', label: 'Prompt Sets Context', type: 'boolean' },
    { name: 'promptConstraints', label: 'Prompt Has Constraints', type: 'boolean' },
  ],

  // Navigation
  nav: [
    { name: 'orientation', label: 'Orientation', type: 'select', options: ['vertical', 'horizontal'] },
    { name: '_role', label: 'Role', type: 'select', options: ['none', 'content', 'chrome'], isElementProp: true },
  ],
  navItem: [
    { name: 'label', label: 'Label', type: 'string' },
    { name: 'page', label: 'Page', type: 'string', placeholder: '@page.PageName' },
    { name: 'icon', label: 'Icon', type: 'string' },
    { name: 'active', label: 'Active Condition', type: 'string' },
  ],

  // Special
  prompt: [
    { name: 'content', label: 'Prompt Text', type: 'text' },
    { name: 'type', label: 'Type', type: 'select', options: ['none', 'global', 'components', 'style', 'behavior'] },
    { name: 'context', label: 'Sets Context', type: 'boolean' },
    { name: 'for', label: 'Target Element', type: 'string', placeholder: 'Element name to apply to' },
  ],
};

interface PropertyDef {
  name: string;
  label: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  placeholder?: string;
  isElementProp?: boolean; // If true, this property is set on the element itself, not in props
}

export function ElementPropertiesDialog() {
  const { activeDialog, dialogData, closeDialog } = useUIStore();
  const { updateElement } = useProjectStore();
  const [props, setProps] = useState<Record<string, unknown>>({});

  const isOpen = activeDialog === 'elementProperties';
  const data = dialogData as ElementPropertiesData | null;

  useEffect(() => {
    if (data?.element) {
      // Load props and element-level properties (prefixed with _)
      setProps({
        ...data.element.props,
        _role: data.element.role || 'none',
      });
    }
  }, [data]);

  if (!data?.element) return null;

  const elementType = data.element.type;
  const propertyDefs = ELEMENT_PROPERTIES[elementType] || [];

  const handleChange = (name: string, value: unknown) => {
    setProps((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Separate element-level properties from regular props
    const { _role, ...regularProps } = props;
    const role = _role === 'none' ? undefined : _role as 'content' | 'chrome';
    updateElement(data.parentType, data.parentId, data.element.id, { props: regularProps, role });
    closeDialog();
  };

  const handleClose = () => {
    closeDialog();
  };

  const renderPropertyField = (prop: PropertyDef) => {
    const value = props[prop.name];

    switch (prop.type) {
      case 'string':
        return (
          <Input
            id={prop.name}
            value={(value as string) || ''}
            onChange={(e) => handleChange(prop.name, e.target.value)}
            placeholder={prop.placeholder}
          />
        );

      case 'text':
        return (
          <Textarea
            id={prop.name}
            value={(value as string) || ''}
            onChange={(e) => handleChange(prop.name, e.target.value)}
            placeholder={prop.placeholder}
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            id={prop.name}
            type="number"
            value={(value as number) || ''}
            onChange={(e) => handleChange(prop.name, e.target.value ? Number(e.target.value) : '')}
            placeholder={prop.placeholder}
          />
        );

      case 'boolean':
        return (
          <Checkbox
            id={prop.name}
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleChange(prop.name, checked)}
          />
        );

      case 'select':
        return (
          <Select
            value={(value as string) || prop.options?.[0] || 'none'}
            onValueChange={(val) => handleChange(prop.name, val === 'none' ? '' : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {prop.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt === 'none' ? 'None' : opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit {elementType} Properties</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-4 py-4">
              {propertyDefs.length > 0 ? (
                propertyDefs.map((prop) => (
                  <div key={prop.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={prop.name}>{prop.label}</Label>
                      {prop.type === 'boolean' && renderPropertyField(prop)}
                    </div>
                    {prop.type !== 'boolean' && renderPropertyField(prop)}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No specific properties defined for this element type.
                </p>
              )}

              {/* Always show a generic "Custom Properties" section */}
              <div className="border-t pt-4 mt-4">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                  Other Properties
                </Label>
                <div className="mt-2 space-y-2">
                  {Object.entries(props)
                    .filter(([key]) => !propertyDefs.some((p) => p.name === key))
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground w-24 truncate">
                          {key}:
                        </span>
                        <Input
                          value={String(value || '')}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="flex-1 h-8 text-sm"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyField } from './PropertyField';
import { useProjectStore, useSelectionStore } from '@/store';
import type { PropertyDefinition } from '@/types/editor';
import type { UIElement, ContainerRole } from '@/types/spec';
import { findNodeById } from '@/lib/utils/tree';

export function PropertiesPanel() {
  const { project, updateEntity, updatePage, updateLayout, updateComponent, updateElement, updateView } = useProjectStore();
  const { selectedId, selectedType, parentId, parentType } = useSelectionStore();

  if (!selectedId || !selectedType) {
    return (
      <div className="h-full border-t bg-background flex items-center justify-center text-muted-foreground text-sm">
        Select an element to edit its properties
      </div>
    );
  }

  const renderEntityProperties = () => {
    const entity = project.entities.find((e) => e.id === selectedId);
    if (!entity) return null;

    return (
      <div className="space-y-4">
        <PropertyField
          definition={{ name: 'name', type: 'string', label: 'Name' }}
          value={entity.name}
          onChange={(value) => updateEntity(selectedId, { name: value as string })}
        />
        <Separator />
        <div className="text-xs font-semibold text-muted-foreground uppercase">
          Fields ({entity.fields.length})
        </div>
        {entity.fields.map((field) => (
          <div key={field.id} className="p-2 bg-muted rounded-md text-sm">
            <span className="font-medium">{field.name}</span>
            <span className="text-muted-foreground ml-2">{field.type}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderPageProperties = () => {
    const page = project.pages.find((p) => p.id === selectedId);
    if (!page) return null;

    return (
      <div className="space-y-4">
        <PropertyField
          definition={{ name: 'name', type: 'string', label: 'Name' }}
          value={page.name}
          onChange={(value) => updatePage(selectedId, { name: value as string })}
        />
        <PropertyField
          definition={{ name: 'route', type: 'string', label: 'Route' }}
          value={page.route}
          onChange={(value) => updatePage(selectedId, { route: value as string })}
        />
        <PropertyField
          definition={{ name: 'title', type: 'string', label: 'Page Title' }}
          value={page.title}
          onChange={(value) => updatePage(selectedId, { title: value as string })}
        />
        <PropertyField
          definition={{
            name: 'layout',
            type: 'select',
            label: 'Layout',
            options: [
              { label: 'None', value: '' },
              ...project.layouts.map((l) => ({
                label: l.name,
                value: `@layout.${l.name}`,
              })),
            ],
          }}
          value={page.layout}
          onChange={(value) => updatePage(selectedId, { layout: value as string })}
        />
      </div>
    );
  };

  const renderLayoutProperties = () => {
    const layout = project.layouts.find((l) => l.id === selectedId);
    if (!layout) return null;

    const updateSlotRole = (slotId: string, roleValue: string) => {
      const role = roleValue === 'none' ? undefined : roleValue as ContainerRole;
      const updatedSlots = layout.slots.map((s) =>
        s.id === slotId ? { ...s, role } : s
      );
      updateLayout(selectedId, { slots: updatedSlots });
    };

    return (
      <div className="space-y-4">
        <PropertyField
          definition={{ name: 'name', type: 'string', label: 'Name' }}
          value={layout.name}
          onChange={(value) => updateLayout(selectedId, { name: value as string })}
        />
        <Separator />
        <div className="text-xs font-semibold text-muted-foreground uppercase">
          Slots ({layout.slots.length})
        </div>
        {layout.slots.map((slot) => (
          <div key={slot.id} className="p-2 bg-muted rounded-md text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{slot.name}</span>
              {slot.required && <span className="text-destructive">*</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Role:</span>
              <Select
                value={slot.role || 'none'}
                onValueChange={(value) => updateSlotRole(slot.id, value)}
              >
                <SelectTrigger className="h-7 text-xs flex-1">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="chrome">Chrome</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderComponentProperties = () => {
    const component = project.components.find((c) => c.id === selectedId);
    if (!component) return null;

    return (
      <div className="space-y-4">
        <PropertyField
          definition={{ name: 'name', type: 'string', label: 'Name' }}
          value={component.name}
          onChange={(value) => updateComponent(selectedId, { name: value as string })}
        />
        <Separator />
        <div className="text-xs font-semibold text-muted-foreground uppercase">
          Props ({component.props.length})
        </div>
        {component.props.map((prop) => (
          <div key={prop.id} className="p-2 bg-muted rounded-md text-sm">
            <span className="font-medium">{prop.name}</span>
            <span className="text-muted-foreground ml-2">{prop.type}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderViewProperties = () => {
    const view = project.materializedViews.find((v) => v.id === selectedId);
    if (!view) return null;

    return (
      <div className="space-y-4">
        <PropertyField
          definition={{ name: 'name', type: 'string', label: 'Name' }}
          value={view.name}
          onChange={(value) => updateView(selectedId, { name: value as string })}
        />
        <PropertyField
          definition={{
            name: 'baseEntity',
            type: 'select',
            label: 'Base Entity',
            options: project.entities.map((e) => ({
              label: e.name,
              value: `@entity.${e.name}`,
            })),
          }}
          value={view.baseEntity}
          onChange={(value) => updateView(selectedId, { baseEntity: value as string })}
        />
        <Separator />
        <div className="text-xs font-semibold text-muted-foreground uppercase">
          Joins ({view.joins.length})
        </div>
        {view.joins.map((join) => (
          <div key={join.id} className="p-2 bg-muted rounded-md text-sm">
            <span className="uppercase text-xs">{join.type}</span>
            <span className="font-medium ml-2">{join.entity}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderElementProperties = () => {
    if (!parentId || !parentType) return null;

    let parent: { children: UIElement[] } | undefined;
    if (parentType === 'page') {
      parent = project.pages.find((p) => p.id === parentId);
    } else if (parentType === 'layout') {
      parent = project.layouts.find((l) => l.id === parentId);
    } else if (parentType === 'component') {
      parent = project.components.find((c) => c.id === parentId);
    }

    if (!parent) return null;

    const element = findNodeById(parent.children, selectedId);
    if (!element) return null;

    const handlePropChange = (propName: string, value: unknown) => {
      updateElement(parentType, parentId, selectedId, {
        props: { ...element.props, [propName]: value },
      });
    };

    const propertyDefs = getElementPropertyDefinitions(element.type);

    return (
      <div className="space-y-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase">
          {element.type}
        </div>
        {propertyDefs.map((def) => (
          <PropertyField
            key={def.name}
            definition={def}
            value={element.props[def.name]}
            onChange={(value) => handlePropChange(def.name, value)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-full border-t bg-background">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold capitalize">{selectedType} Properties</h3>
      </div>
      <ScrollArea className="h-[calc(100%-44px)]">
        <div className="p-3">
          {selectedType === 'entity' && renderEntityProperties()}
          {selectedType === 'page' && renderPageProperties()}
          {selectedType === 'layout' && renderLayoutProperties()}
          {selectedType === 'component' && renderComponentProperties()}
          {selectedType === 'view' && renderViewProperties()}
          {selectedType === 'element' && renderElementProperties()}
        </div>
      </ScrollArea>
    </div>
  );
}

function getElementPropertyDefinitions(type: string): PropertyDefinition[] {
  const commonProps: PropertyDefinition[] = [
    { name: 'id', type: 'string', label: 'ID', description: 'Unique identifier' },
  ];

  const typeProps: Record<string, PropertyDefinition[]> = {
    text: [
      { name: 'content', type: 'string', label: 'Content' },
      { name: 'size', type: 'select', label: 'Size', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ]},
    ],
    heading: [
      { name: 'content', type: 'string', label: 'Content' },
      { name: 'level', type: 'select', label: 'Level', options: [
        { label: 'H1', value: '1' },
        { label: 'H2', value: '2' },
        { label: 'H3', value: '3' },
        { label: 'H4', value: '4' },
      ]},
    ],
    button: [
      { name: 'content', type: 'string', label: 'Label' },
      { name: 'variant', type: 'select', label: 'Variant', options: [
        { label: 'Default', value: 'default' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
        { label: 'Destructive', value: 'destructive' },
      ]},
      { name: 'onClick', type: 'string', label: 'On Click' },
    ],
    input: [
      { name: 'name', type: 'string', label: 'Name' },
      { name: 'placeholder', type: 'string', label: 'Placeholder' },
      { name: 'type', type: 'select', label: 'Type', options: [
        { label: 'Text', value: 'text' },
        { label: 'Email', value: 'email' },
        { label: 'Password', value: 'password' },
        { label: 'Number', value: 'number' },
      ]},
      { name: 'required', type: 'boolean', label: 'Required' },
    ],
    row: [
      { name: 'gap', type: 'string', label: 'Gap' },
      { name: 'align', type: 'select', label: 'Align', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Stretch', value: 'stretch' },
      ]},
      { name: 'justify', type: 'select', label: 'Justify', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Between', value: 'between' },
      ]},
    ],
    column: [
      { name: 'gap', type: 'string', label: 'Gap' },
      { name: 'align', type: 'select', label: 'Align', options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Stretch', value: 'stretch' },
      ]},
    ],
    grid: [
      { name: 'columns', type: 'string', label: 'Columns' },
      { name: 'gap', type: 'string', label: 'Gap' },
    ],
    image: [
      { name: 'src', type: 'string', label: 'Source URL' },
      { name: 'alt', type: 'string', label: 'Alt Text' },
      { name: 'width', type: 'string', label: 'Width' },
      { name: 'height', type: 'string', label: 'Height' },
    ],
    link: [
      { name: 'content', type: 'string', label: 'Text' },
      { name: 'href', type: 'string', label: 'URL' },
      { name: 'target', type: 'select', label: 'Target', options: [
        { label: 'Same Window', value: '_self' },
        { label: 'New Window', value: '_blank' },
      ]},
    ],
    table: [
      { name: 'entity', type: 'entity-ref', label: 'Entity' },
      { name: 'columns', type: 'json', label: 'Columns' },
    ],
    list: [
      { name: 'entity', type: 'entity-ref', label: 'Entity' },
    ],
    form: [
      { name: 'entity', type: 'entity-ref', label: 'Entity' },
      { name: 'onSubmit', type: 'string', label: 'On Submit' },
    ],
    if: [
      { name: 'condition', type: 'string', label: 'Condition' },
    ],
    each: [
      { name: 'items', type: 'string', label: 'Items' },
      { name: 'as', type: 'string', label: 'Item Variable' },
    ],
    component: [
      { name: 'ref', type: 'component-ref', label: 'Component' },
    ],
    slot: [
      { name: 'name', type: 'string', label: 'Slot Name' },
    ],
  };

  return [...commonProps, ...(typeProps[type] || [])];
}

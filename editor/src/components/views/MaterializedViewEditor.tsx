import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useProjectStore } from '@/store';
import { generateId } from '@/lib/utils/id';
import type { Join, Entity } from '@/types/spec';

interface MaterializedViewEditorProps {
  viewId: string;
}

export function MaterializedViewEditor({ viewId }: MaterializedViewEditorProps) {
  const { project, updateView } = useProjectStore();
  const view = project.materializedViews.find((v) => v.id === viewId);

  if (!view) {
    return <div className="p-4 text-muted-foreground">View not found</div>;
  }

  const baseEntityName = view.baseEntity.replace('@entity.', '');
  const baseEntity = project.entities.find((e) => e.name === baseEntityName);

  const handleAddJoin = () => {
    const newJoin: Join = {
      id: generateId(),
      type: 'left',
      entity: '',
      localField: '',
      foreignField: '',
    };
    updateView(viewId, { joins: [...view.joins, newJoin] });
  };

  const handleUpdateJoin = (joinId: string, updates: Partial<Join>) => {
    updateView(viewId, {
      joins: view.joins.map((j) => (j.id === joinId ? { ...j, ...updates } : j)),
    });
  };

  const handleRemoveJoin = (joinId: string) => {
    updateView(viewId, {
      joins: view.joins.filter((j) => j.id !== joinId),
    });
  };

  const handleToggleField = (fieldId: string) => {
    const existing = view.selectedFields.find((f) => f.id === fieldId);
    if (existing) {
      updateView(viewId, {
        selectedFields: view.selectedFields.map((f) =>
          f.id === fieldId ? { ...f, selected: !f.selected } : f
        ),
      });
    }
  };

  const handleUpdateFieldAlias = (fieldId: string, alias: string) => {
    updateView(viewId, {
      selectedFields: view.selectedFields.map((f) =>
        f.id === fieldId ? { ...f, alias } : f
      ),
    });
  };

  // Get all available fields from base entity and joined entities
  const getAvailableFields = (): { source: string; entity: Entity; alias?: string }[] => {
    const sources: { source: string; entity: Entity; alias?: string }[] = [];

    if (baseEntity) {
      sources.push({ source: baseEntityName, entity: baseEntity });
    }

    for (const join of view.joins) {
      const entityName = join.entity.replace('@entity.', '');
      const entity = project.entities.find((e) => e.name === entityName);
      if (entity) {
        sources.push({ source: join.alias || entityName, entity, alias: join.alias });
      }
    }

    return sources;
  };

  const fieldSources = getAvailableFields();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">{view.name}</h2>
        <p className="text-sm text-muted-foreground">Base: {view.baseEntity}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Joins Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold">Joins</Label>
              <Button variant="outline" size="sm" onClick={handleAddJoin}>
                <Plus className="h-4 w-4 mr-1" />
                Add Join
              </Button>
            </div>

            <div className="space-y-3">
              {view.joins.map((join) => (
                <JoinEditor
                  key={join.id}
                  join={join}
                  entities={project.entities}
                  baseEntity={baseEntity}
                  onUpdate={(updates) => handleUpdateJoin(join.id, updates)}
                  onRemove={() => handleRemoveJoin(join.id)}
                />
              ))}

              {view.joins.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  No joins configured. Add a join to combine data from multiple entities.
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Fields Section */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Select Fields</Label>

            <div className="space-y-4">
              {fieldSources.map(({ source, entity }) => (
                <div key={source} className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase">
                    {source}
                  </div>
                  {entity.fields.map((field) => {
                    const fieldId = `${source}.${field.name}`;
                    const selection = view.selectedFields.find(
                      (f) => f.source === source && f.field === field.name
                    );
                    const isSelected = selection?.selected ?? false;

                    return (
                      <div key={fieldId} className="flex items-center gap-3">
                        <Checkbox
                          id={fieldId}
                          checked={isSelected}
                          onCheckedChange={() => {
                            if (!selection) {
                              // Add new field selection
                              updateView(viewId, {
                                selectedFields: [
                                  ...view.selectedFields,
                                  {
                                    id: generateId(),
                                    source,
                                    field: field.name,
                                    selected: true,
                                  },
                                ],
                              });
                            } else {
                              handleToggleField(selection.id);
                            }
                          }}
                        />
                        <label htmlFor={fieldId} className="text-sm flex-1">
                          {field.name}
                          <span className="text-muted-foreground ml-2">
                            {field.type}
                          </span>
                        </label>
                        {isSelected && selection && (
                          <Input
                            value={selection.alias || ''}
                            onChange={(e) =>
                              handleUpdateFieldAlias(selection.id, e.target.value)
                            }
                            placeholder="alias"
                            className="w-32 h-7 text-xs"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Preview Section */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Preview</Label>
            <div className="bg-muted p-3 rounded-md font-mono text-xs space-y-1">
              {view.selectedFields
                .filter((f) => f.selected)
                .map((f) => (
                  <div key={f.id}>
                    @view.{view.name}.{f.alias || f.field}
                  </div>
                ))}
              {view.selectedFields.filter((f) => f.selected).length === 0 && (
                <div className="text-muted-foreground">
                  Select fields to see preview
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

interface JoinEditorProps {
  join: Join;
  entities: Entity[];
  baseEntity?: Entity;
  onUpdate: (updates: Partial<Join>) => void;
  onRemove: () => void;
}

function JoinEditor({ join, entities, baseEntity, onUpdate, onRemove }: JoinEditorProps) {
  const joinedEntityName = join.entity.replace('@entity.', '');
  const joinedEntity = entities.find((e) => e.name === joinedEntityName);

  return (
    <div className="p-3 border rounded-md bg-muted/30 space-y-3">
      <div className="flex items-center gap-2">
        <Select value={join.type} onValueChange={(value) => onUpdate({ type: value as Join['type'] })}>
          <SelectTrigger className="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inner">INNER</SelectItem>
            <SelectItem value="left">LEFT</SelectItem>
            <SelectItem value="right">RIGHT</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">JOIN</span>

        <Select value={join.entity} onValueChange={(value) => onUpdate({ entity: value })}>
          <SelectTrigger className="flex-1 h-8">
            <SelectValue placeholder="Select entity..." />
          </SelectTrigger>
          <SelectContent>
            {entities.map((entity) => (
              <SelectItem key={entity.id} value={`@entity.${entity.name}`}>
                {entity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">ON</span>

        <Select value={join.localField} onValueChange={(value) => onUpdate({ localField: value })}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Local field" />
          </SelectTrigger>
          <SelectContent>
            {baseEntity?.fields.map((field) => (
              <SelectItem key={field.id} value={field.name}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground">=</span>

        <Select value={join.foreignField} onValueChange={(value) => onUpdate({ foreignField: value })}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Foreign field" />
          </SelectTrigger>
          <SelectContent>
            {joinedEntity?.fields.map((field) => (
              <SelectItem key={field.id} value={field.name}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Alias:</Label>
        <Input
          value={join.alias || ''}
          onChange={(e) => onUpdate({ alias: e.target.value })}
          placeholder="optional"
          className="h-7 text-sm w-32"
        />
      </div>
    </div>
  );
}

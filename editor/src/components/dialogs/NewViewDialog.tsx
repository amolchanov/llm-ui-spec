import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectStore, useUIStore } from '@/store';

export function NewViewDialog() {
  const { activeDialog, closeDialog } = useUIStore();
  const { project, addView } = useProjectStore();
  const [name, setName] = useState('');
  const [baseEntity, setBaseEntity] = useState('');

  const isOpen = activeDialog === 'newView';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && baseEntity) {
      addView({
        name: name.trim(),
        baseEntity,
        joins: [],
        selectedFields: [],
      });
      setName('');
      setBaseEntity('');
      closeDialog();
    }
  };

  const handleClose = () => {
    setName('');
    setBaseEntity('');
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Materialized View</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., UserOrdersView"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="base-entity">Base Entity</Label>
              <Select value={baseEntity} onValueChange={setBaseEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an entity..." />
                </SelectTrigger>
                <SelectContent>
                  {project.entities.map((entity) => (
                    <SelectItem key={entity.id} value={`@entity.${entity.name}`}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {project.entities.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Create entities first to build views.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !baseEntity}>
              Create View
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

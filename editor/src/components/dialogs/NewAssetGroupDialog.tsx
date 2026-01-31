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
import { useProjectStore, useUIStore } from '@/store';

export function NewAssetGroupDialog() {
  const { activeDialog, closeDialog } = useUIStore();
  const { addAssetGroup } = useProjectStore();
  const [name, setName] = useState('');

  const isOpen = activeDialog === 'newAssetGroup';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addAssetGroup({
        name: name.trim().toLowerCase(),
        items: [],
      });
      setName('');
      closeDialog();
    }
  };

  const handleClose = () => {
    setName('');
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Asset Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., images, icons, fonts"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Reference assets with @asset.{name || 'groupname'}.assetname
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

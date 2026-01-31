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

export function NewLayoutDialog() {
  const { activeDialog, closeDialog } = useUIStore();
  const { addLayout } = useProjectStore();
  const [name, setName] = useState('');

  const isOpen = activeDialog === 'newLayout';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addLayout({
        name: name.trim(),
        slots: [{ id: crypto.randomUUID(), name: 'content', required: true }],
        children: [],
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
          <DialogTitle>New Layout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="layout-name">Layout Name</Label>
              <Input
                id="layout-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., MainLayout, DashboardLayout"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Layout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

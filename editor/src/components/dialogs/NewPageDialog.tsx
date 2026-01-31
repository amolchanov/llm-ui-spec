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

export function NewPageDialog() {
  const { activeDialog, closeDialog } = useUIStore();
  const { addPage } = useProjectStore();
  const [name, setName] = useState('');
  const [route, setRoute] = useState('/');

  const isOpen = activeDialog === 'newPage';

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate route from name
    const routePath = '/' + value.toLowerCase().replace(/\s+/g, '-');
    setRoute(routePath);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addPage({
        name: name.trim(),
        route: route.trim() || '/',
        children: [],
      });
      setName('');
      setRoute('/');
      closeDialog();
    }
  };

  const handleClose = () => {
    setName('');
    setRoute('/');
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Page</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="page-name">Page Name</Label>
              <Input
                id="page-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Dashboard, Settings, Profile"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-route">Route</Label>
              <Input
                id="page-route"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="e.g., /dashboard, /settings"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Page
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

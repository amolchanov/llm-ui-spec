import {
  Save,
  Download,
  Upload,
  Plus,
  Undo,
  Redo,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjectStore, useUIStore, useHistoryStore } from '@/store';
import { saveProject } from '@/lib/storage/localStorage';
import { exportToFile, importFromFile } from '@/lib/storage/fileSystem';

export function Header() {
  const { project, isDirty, setProject, newProject, markClean } = useProjectStore();
  const { openDialog } = useUIStore();
  const { canUndo, canRedo, undo, redo } = useHistoryStore();

  const handleSave = () => {
    saveProject(project);
    markClean();
  };

  const handleExport = () => {
    exportToFile(project);
  };

  const handleImport = async () => {
    const imported = await importFromFile();
    if (imported) {
      setProject(imported);
    }
  };

  const handleNew = () => {
    if (isDirty) {
      // TODO: Show confirmation dialog
    }
    newProject();
  };

  const handleUndo = () => {
    const state = undo();
    if (state) {
      setProject(state);
    }
  };

  const handleRedo = () => {
    const state = redo();
    if (state) {
      setProject(state);
    }
  };

  return (
    <header className="h-12 border-b bg-background flex items-center px-4 gap-2">
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              File <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleNew}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import XML...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export XML...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Edit <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleUndo} disabled={!canUndo()}>
              <Undo className="mr-2 h-4 w-4" />
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRedo} disabled={!canRedo()}>
              <Redo className="mr-2 h-4 w-4" />
              Redo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Add <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => openDialog('newEntity')}>
              New Entity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog('newLayout')}>
              New Layout
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog('newComponent')}>
              New Component
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog('newPage')}>
              New Page
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog('newView')}>
              New View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1" />

      <span className="text-sm text-muted-foreground">
        {project.name}
        {isDirty && <span className="text-destructive ml-1">*</span>}
      </span>
    </header>
  );
}

import { useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EditorLayout } from '@/components/layout';
import { DialogManager } from '@/components/dialogs';
import { DndContext } from '@/lib/dnd';
import { useProjectStore } from '@/store';
import { loadProject } from '@/lib/storage/localStorage';

function App() {
  const { setProject } = useProjectStore();

  // Load saved project on mount
  useEffect(() => {
    const saved = loadProject();
    if (saved) {
      setProject(saved);
    }
  }, [setProject]);

  return (
    <TooltipProvider>
      <DndContext>
        <EditorLayout />
        <DialogManager />
      </DndContext>
    </TooltipProvider>
  );
}

export default App;

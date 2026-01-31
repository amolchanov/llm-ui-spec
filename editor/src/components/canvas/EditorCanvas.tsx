import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit2, ZoomIn, ZoomOut, Layout, PanelTop, PanelTopDashed } from 'lucide-react';
import { useProjectStore, useUIStore, useSelectionStore } from '@/store';
import { CanvasDropZone } from './CanvasDropZone';
import { ElementRenderer } from './ElementRenderer';
import { PreviewRenderer } from './PreviewRenderer';
import { ChromeRenderer } from './ChromeRenderer';
import { cn } from '@/lib/utils/cn';
import type { UIElement, Layout as LayoutType, ContainerRole } from '@/types/spec';

export function EditorCanvas() {
  const { project } = useProjectStore();
  const { canvasZoom, canvasMode, showChrome, setCanvasZoom, setCanvasMode, setShowChrome } = useUIStore();
  const { selectedId, selectedType, parentId, parentType, deselectElement } = useSelectionStore();

  // Determine what's being edited based on selection
  const getEditingState = () => {
    // If an element is selected, use its parent context
    if (selectedType === 'element' && parentId && parentType) {
      if (parentType === 'page') {
        const page = project.pages.find(p => p.id === parentId);
        if (page) return { type: 'page' as const, item: page };
      } else if (parentType === 'layout') {
        const layout = project.layouts.find(l => l.id === parentId);
        if (layout) return { type: 'layout' as const, item: layout };
      } else if (parentType === 'component') {
        const component = project.components.find(c => c.id === parentId);
        if (component) return { type: 'component' as const, item: component };
      }
    }

    // If a page/layout/component is directly selected
    if (selectedType === 'page') {
      const page = project.pages.find(p => p.id === selectedId);
      if (page) return { type: 'page' as const, item: page };
    } else if (selectedType === 'layout') {
      const layout = project.layouts.find(l => l.id === selectedId);
      if (layout) return { type: 'layout' as const, item: layout };
    } else if (selectedType === 'component') {
      const component = project.components.find(c => c.id === selectedId);
      if (component) return { type: 'component' as const, item: component };
    }

    // Default to first page if nothing selected
    if (project.pages.length > 0) {
      return { type: 'page' as const, item: project.pages[0] };
    }

    return null;
  };

  const editingState = getEditingState();
  const editingType = editingState?.type || 'page';
  const editingItem = editingState?.item;

  // Get layout if editing a page with a layout
  const getPageLayout = () => {
    if (editingType !== 'page' || !editingItem) return null;
    const page = editingItem as { layout?: string };
    if (!page.layout) return null;

    // Layout ref format: "@layout.LayoutName" - extract the name
    const match = page.layout.match(/@layout\.(\w+)/);
    const layoutName = match ? match[1] : null;
    if (!layoutName) return null;

    return project.layouts.find(l => l.name === layoutName) || null;
  };

  const pageLayout = getPageLayout();
  const layoutName = pageLayout?.name || null;

  // Get the effective role for an element, considering inherited roles from layout slots
  const getEffectiveRole = (element: UIElement, layout: LayoutType | null): ContainerRole | undefined => {
    // If element has its own role (on element or in props for slots), use that (override)
    if (element.role) return element.role;

    // For slot elements, check props.role as well (slots store role in props)
    if (element.type === 'slot') {
      const propsRole = element.props.role as string | undefined;
      if (propsRole && propsRole !== 'none' && propsRole !== '') {
        return propsRole as ContainerRole;
      }
    }

    // If it's a slot element targeting a layout slot, inherit the layout slot's role
    if (element.type === 'slot' && layout) {
      const target = element.props.target as string | undefined;
      const name = element.props.name as string | undefined;
      const slotRef = target || name;

      if (slotRef) {
        // Extract slot name from reference (handles various formats)
        // "@layout.LayoutName.slotName" -> "slotName"
        // "@layout.slotName" -> "slotName"
        // "slotName" -> "slotName"
        const parts = slotRef.split('.');
        const slotName = parts[parts.length - 1].toLowerCase();

        // Find the slot in the layout (case-insensitive)
        const layoutSlot = layout.slots.find(s => s.name.toLowerCase() === slotName);
        if (layoutSlot?.role) {
          return layoutSlot.role;
        }
      }

      // If no specific slot found, check if there's a default content slot with role
      const defaultSlot = layout.slots.find(s => s.name === 'content' || s.name === 'default');
      if (defaultSlot?.role) {
        return defaultSlot.role;
      }
    }

    return undefined;
  };

  // Get chrome elements from layout (elements with role="chrome" or slot elements targeting chrome slots)
  const getLayoutChromeElements = () => {
    if (!pageLayout) return [];
    return pageLayout.children.filter(el => {
      // Direct role on element
      if (el.role === 'chrome') return true;
      // Slot elements that reference a chrome layout slot
      if (el.type === 'slot') {
        const slotName = (el.props.name as string) || (el.props.target as string);
        if (slotName) {
          const layoutSlot = pageLayout.slots.find(s => s.name.toLowerCase() === slotName.toLowerCase());
          if (layoutSlot?.role === 'chrome') return true;
        }
      }
      return false;
    });
  };

  // Separate page elements into chrome and content based on effective role
  const getPageElementsByRole = () => {
    if (editingType !== 'page' || !editingItem) {
      return { chromeElements: [], contentElements: editingItem?.children || [] };
    }

    const chromeElements: UIElement[] = [];
    const contentElements: UIElement[] = [];

    for (const element of editingItem.children) {
      const effectiveRole = getEffectiveRole(element, pageLayout);
      if (effectiveRole === 'chrome') {
        chromeElements.push(element);
      } else {
        contentElements.push(element);
      }
    }

    return { chromeElements, contentElements };
  };

  const layoutChromeElements = getLayoutChromeElements();
  const { chromeElements: pageChromeElements, contentElements: pageContentElements } = getPageElementsByRole();

  // Total chrome elements (from layout + from page targeting chrome slots)
  const hasChromeElements = layoutChromeElements.length > 0 || pageChromeElements.length > 0;

  const handleSelectType = (type: 'page' | 'layout' | 'component') => {
    // Select the first item of that type
    if (type === 'page' && project.pages.length > 0) {
      useSelectionStore.getState().select(project.pages[0].id, 'page');
    } else if (type === 'layout' && project.layouts.length > 0) {
      useSelectionStore.getState().select(project.layouts[0].id, 'layout');
    } else if (type === 'component' && project.components.length > 0) {
      useSelectionStore.getState().select(project.components[0].id, 'component');
    }
  };

  const handleSelectItem = (id: string) => {
    useSelectionStore.getState().select(id, editingType);
  };

  const handleZoomIn = () => setCanvasZoom(canvasZoom + 10);
  const handleZoomOut = () => setCanvasZoom(canvasZoom - 10);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect element if clicking directly on canvas background
    // This keeps the current page/layout/component being edited
    if (e.target === e.currentTarget) {
      deselectElement();
    }
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Toolbar */}
      <div className="h-10 border-b bg-background flex items-center px-3 gap-2">
        <Select
          value={editingType}
          onValueChange={(value) => handleSelectType(value as 'page' | 'layout' | 'component')}
        >
          <SelectTrigger className="w-28 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="page">Page</SelectItem>
            <SelectItem value="layout">Layout</SelectItem>
            <SelectItem value="component">Component</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={editingItem?.id || ''}
          onValueChange={handleSelectItem}
        >
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {editingType === 'page' && project.pages.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
            {editingType === 'layout' && project.layouts.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
            {editingType === 'component' && project.components.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {/* Layout indicator and chrome toggle for pages */}
        {layoutName && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/80 rounded-md text-xs text-muted-foreground border">
              <Layout className="h-3 w-3" />
              <span>{layoutName}</span>
            </div>
            {hasChromeElements && (
              <Button
                variant={showChrome ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowChrome(!showChrome)}
                title={showChrome ? 'Hide chrome elements' : 'Show chrome elements'}
              >
                {showChrome ? <PanelTop className="h-4 w-4" /> : <PanelTopDashed className="h-4 w-4" />}
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant={canvasMode === 'design' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setCanvasMode('design')}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Design
          </Button>
          <Button
            variant={canvasMode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setCanvasMode('preview')}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>

        <div className="flex items-center gap-1 ml-2 border-l pl-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">{canvasZoom}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <ScrollArea className="flex-1">
        <div
          className="min-h-full p-8"
          onClick={handleCanvasClick}
          style={{ transform: `scale(${canvasZoom / 100})`, transformOrigin: 'top left' }}
        >
          <div className={cn(
            'mx-auto bg-background rounded-lg shadow-lg border min-h-[600px] p-4 relative',
            'max-w-4xl'
          )}>
            {editingItem ? (
              canvasMode === 'preview' ? (
                // Preview Mode - clean rendering without editing UI
                <div className="flex flex-col gap-2">
                  {editingItem.children.length > 0 ? (
                    editingItem.children.map((element) => (
                      <PreviewRenderer
                        key={element.id}
                        element={element}
                      />
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
                      <p className="text-sm">No elements to preview</p>
                    </div>
                  )}
                </div>
              ) : (
                // Design Mode - with editing UI
                <div className="flex flex-col gap-2">
                  {/* Chrome elements (from layout and page slots targeting chrome) */}
                  {showChrome && hasChromeElements && (
                    <div className="border-b border-dashed border-orange-300/50 pb-3 mb-2 bg-orange-50/30 -m-4 p-4 mb-2 rounded-t-lg">
                      <div className="text-xs text-orange-600 font-medium mb-2 flex items-center gap-1">
                        <PanelTop className="h-3 w-3" />
                        Chrome Elements
                      </div>
                      {/* Layout chrome elements (read-only preview) */}
                      {layoutChromeElements.map((element) => (
                        <ChromeRenderer key={element.id} element={element} />
                      ))}
                      {/* Page chrome elements (editable, targeting chrome slots) */}
                      {pageChromeElements.map((element) => (
                        <ElementRenderer
                          key={element.id}
                          element={element}
                          parentId={editingItem.id}
                          parentType={editingType}
                        />
                      ))}
                    </div>
                  )}

                  {/* Page content (editable) */}
                  <CanvasDropZone
                    id={`canvas-${editingItem.id}`}
                    parentId={editingItem.id}
                    parentType={editingType}
                    isEmpty={editingType === 'page' ? pageContentElements.length === 0 : editingItem.children.length === 0}
                  >
                    <div className="flex flex-col gap-2">
                      {editingType === 'page' ? (
                        // For pages, only show non-chrome elements in main content area
                        pageContentElements.map((element) => (
                          <ElementRenderer
                            key={element.id}
                            element={element}
                            parentId={editingItem.id}
                            parentType={editingType}
                          />
                        ))
                      ) : (
                        // For layouts/components, show all elements
                        editingItem.children.map((element) => (
                          <ElementRenderer
                            key={element.id}
                            element={element}
                            parentId={editingItem.id}
                            parentType={editingType}
                          />
                        ))
                      )}
                    </div>
                  </CanvasDropZone>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
                <div className="text-center">
                  <p className="mb-2">No {editingType} to edit</p>
                  <p className="text-sm">Create a new {editingType} using the Add menu or the Project Tree</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

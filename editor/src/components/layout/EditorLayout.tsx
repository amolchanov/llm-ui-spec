import { useRef, useState, useCallback } from 'react';
import { Header } from './Header';
import { ComponentPalette } from '@/components/palette/ComponentPalette';
import { EditorCanvas } from '@/components/canvas/EditorCanvas';
import { ProjectTree } from '@/components/tree/ProjectTree';
import { PropertiesPanel } from '@/components/properties/PropertiesPanel';
import { useUIStore } from '@/store';
import { cn } from '@/lib/utils/cn';

interface ResizeHandleProps {
  orientation: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
}

function ResizeHandle({ orientation, onResize }: ResizeHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    lastPos.current = orientation === 'horizontal' ? e.clientX : e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const currentPos = orientation === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - lastPos.current;
      lastPos.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [orientation, onResize]);

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className={cn(
        'flex-shrink-0 bg-border hover:bg-primary/50 transition-colors flex items-center justify-center',
        orientation === 'horizontal'
          ? 'w-1.5 cursor-col-resize'
          : 'h-1.5 cursor-row-resize'
      )}
    >
      <div className={cn(
        'bg-muted-foreground/40 rounded',
        orientation === 'horizontal' ? 'w-0.5 h-8' : 'h-0.5 w-8'
      )} />
    </div>
  );
}

export function EditorLayout() {
  const { panels } = useUIStore();
  const [leftWidth, setLeftWidth] = useState(250);
  const [rightWidth, setRightWidth] = useState(300);
  const [bottomHeight, setBottomHeight] = useState(200);

  const handleLeftResize = useCallback((delta: number) => {
    setLeftWidth(w => Math.max(180, Math.min(400, w + delta)));
  }, []);

  const handleRightResize = useCallback((delta: number) => {
    setRightWidth(w => Math.max(200, Math.min(450, w - delta)));
  }, []);

  const handleBottomResize = useCallback((delta: number) => {
    setBottomHeight(h => Math.max(100, Math.min(400, h - delta)));
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Component Palette */}
        {!panels.isLeftCollapsed && (
          <>
            <div style={{ width: leftWidth }} className="flex-shrink-0">
              <ComponentPalette />
            </div>
            <ResizeHandle orientation="horizontal" onResize={handleLeftResize} />
          </>
        )}

        {/* Center - Canvas + Properties */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <EditorCanvas />
          </div>

          {!panels.isBottomCollapsed && (
            <>
              <ResizeHandle orientation="vertical" onResize={handleBottomResize} />
              <div style={{ height: bottomHeight }} className="flex-shrink-0">
                <PropertiesPanel />
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Project Tree */}
        {!panels.isRightCollapsed && (
          <>
            <ResizeHandle orientation="horizontal" onResize={handleRightResize} />
            <div style={{ width: rightWidth }} className="flex-shrink-0">
              <ProjectTree />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

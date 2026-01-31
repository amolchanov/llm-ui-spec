import { create } from 'zustand';

type DialogType =
  | 'newPage'
  | 'newEntity'
  | 'newComponent'
  | 'newLayout'
  | 'newView'
  | 'newAssetGroup'
  | 'newAsset'
  | 'import'
  | 'export'
  | 'settings'
  | 'elementProperties'
  | 'splitContainer'
  | 'viewMarkup'
  | null;

interface PanelState {
  leftWidth: number;
  rightWidth: number;
  bottomHeight: number;
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
  isBottomCollapsed: boolean;
}

interface UIState {
  // Dialogs
  activeDialog: DialogType;
  dialogData: unknown;

  // Panels
  panels: PanelState;

  // Canvas
  canvasZoom: number;
  canvasMode: 'design' | 'preview';
  showChrome: boolean;

  // Tree
  expandedTreeNodes: Set<string>;

  // Actions
  openDialog: (dialog: DialogType, data?: unknown) => void;
  closeDialog: () => void;

  setPanelWidth: (panel: 'left' | 'right', width: number) => void;
  setPanelHeight: (panel: 'bottom', height: number) => void;
  togglePanel: (panel: 'left' | 'right' | 'bottom') => void;

  setCanvasZoom: (zoom: number) => void;
  setCanvasMode: (mode: 'design' | 'preview') => void;
  setShowChrome: (show: boolean) => void;

  toggleTreeNode: (id: string) => void;
  expandTreeNode: (id: string) => void;
  collapseTreeNode: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeDialog: null,
  dialogData: null,

  panels: {
    leftWidth: 240,
    rightWidth: 280,
    bottomHeight: 200,
    isLeftCollapsed: false,
    isRightCollapsed: false,
    isBottomCollapsed: true,
  },

  canvasZoom: 100,
  canvasMode: 'design',
  showChrome: false,

  expandedTreeNodes: new Set(['entities', 'layouts', 'components', 'pages', 'assets', 'views']),

  openDialog: (dialog, data) =>
    set({
      activeDialog: dialog,
      dialogData: data,
    }),

  closeDialog: () =>
    set({
      activeDialog: null,
      dialogData: null,
    }),

  setPanelWidth: (panel, width) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [`${panel}Width`]: width,
      },
    })),

  setPanelHeight: (panel, height) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [`${panel}Height`]: height,
      },
    })),

  togglePanel: (panel) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [`is${panel.charAt(0).toUpperCase() + panel.slice(1)}Collapsed`]:
          !state.panels[`is${panel.charAt(0).toUpperCase() + panel.slice(1)}Collapsed` as keyof PanelState],
      },
    })),

  setCanvasZoom: (zoom) =>
    set({
      canvasZoom: Math.max(25, Math.min(200, zoom)),
    }),

  setCanvasMode: (mode) =>
    set({
      canvasMode: mode,
    }),

  setShowChrome: (show) =>
    set({
      showChrome: show,
    }),

  toggleTreeNode: (id) =>
    set((state) => {
      const newSet = new Set(state.expandedTreeNodes);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { expandedTreeNodes: newSet };
    }),

  expandTreeNode: (id) =>
    set((state) => {
      const newSet = new Set(state.expandedTreeNodes);
      newSet.add(id);
      return { expandedTreeNodes: newSet };
    }),

  collapseTreeNode: (id) =>
    set((state) => {
      const newSet = new Set(state.expandedTreeNodes);
      newSet.delete(id);
      return { expandedTreeNodes: newSet };
    }),
}));

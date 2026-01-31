import { create } from 'zustand';

type SelectionType = 'entity' | 'layout' | 'component' | 'page' | 'view' | 'element' | 'field' | 'assetGroup' | 'asset';

interface SelectionState {
  selectedId: string | null;
  selectedType: SelectionType | null;
  parentId: string | null;
  parentType: 'page' | 'layout' | 'component' | null;
  hoveredId: string | null;

  // Actions
  select: (id: string, type: SelectionType, parentId?: string, parentType?: 'page' | 'layout' | 'component') => void;
  deselect: () => void;
  deselectElement: () => void; // Only deselects element, keeps page/layout/component context
  setHovered: (id: string | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedId: null,
  selectedType: null,
  parentId: null,
  parentType: null,
  hoveredId: null,

  select: (id, type, parentId, parentType) =>
    set({
      selectedId: id,
      selectedType: type,
      parentId: parentId ?? null,
      parentType: parentType ?? null,
    }),

  deselect: () =>
    set({
      selectedId: null,
      selectedType: null,
      parentId: null,
      parentType: null,
    }),

  deselectElement: () =>
    set((state) => {
      // If an element is selected, revert to selecting its parent context
      if (state.selectedType === 'element' && state.parentId && state.parentType) {
        return {
          selectedId: state.parentId,
          selectedType: state.parentType,
          parentId: null,
          parentType: null,
        };
      }
      // Otherwise, keep the current selection (no-op for page/layout/component)
      return state;
    }),

  setHovered: (id) =>
    set({
      hoveredId: id,
    }),
}));

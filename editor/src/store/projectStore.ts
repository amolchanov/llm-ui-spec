import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { generateId } from '@/lib/utils/id';
import { removeNode, updateNode, insertNode, moveNode, findNodeById, findParentNode, cloneElement } from '@/lib/utils/tree';
import type {
  UISpecProject,
  Entity,
  Layout,
  ComponentDef,
  Page,
  UIElement,
  MaterializedView,
  Field,
  AssetGroup,
  Asset,
} from '@/types/spec';
import { createEmptyProject } from '@/types/spec';

interface ProjectState {
  project: UISpecProject;
  isDirty: boolean;
  fileName: string | null;

  // Project operations
  setProject: (project: UISpecProject) => void;
  newProject: (name?: string) => void;
  setProjectName: (name: string) => void;
  setFileName: (fileName: string | null) => void;
  markClean: () => void;

  // Entity operations
  addEntity: (entity: Omit<Entity, 'id'>) => string;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  addField: (entityId: string, field: Omit<Field, 'id'>) => string;
  updateField: (entityId: string, fieldId: string, updates: Partial<Field>) => void;
  deleteField: (entityId: string, fieldId: string) => void;

  // Layout operations
  addLayout: (layout: Omit<Layout, 'id'>) => string;
  updateLayout: (id: string, updates: Partial<Layout>) => void;
  deleteLayout: (id: string) => void;

  // Component operations
  addComponent: (component: Omit<ComponentDef, 'id'>) => string;
  updateComponent: (id: string, updates: Partial<ComponentDef>) => void;
  deleteComponent: (id: string) => void;

  // Page operations
  addPage: (page: Omit<Page, 'id'>) => string;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;

  // Element operations (within pages/layouts/components)
  addElement: (parentType: 'page' | 'layout' | 'component', parentId: string, element: Omit<UIElement, 'id'>, targetId?: string, position?: 'before' | 'after' | 'inside') => string;
  updateElement: (parentType: 'page' | 'layout' | 'component', parentId: string, elementId: string, updates: Partial<UIElement>) => void;
  deleteElement: (parentType: 'page' | 'layout' | 'component', parentId: string, elementId: string) => void;
  moveElement: (parentType: 'page' | 'layout' | 'component', parentId: string, sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  duplicateElement: (parentType: 'page' | 'layout' | 'component', parentId: string, elementId: string) => string | null;
  moveElementInDirection: (parentType: 'page' | 'layout' | 'component', parentId: string, elementId: string, direction: 'up' | 'down') => void;

  // View operations
  addView: (view: Omit<MaterializedView, 'id'>) => string;
  updateView: (id: string, updates: Partial<MaterializedView>) => void;
  deleteView: (id: string) => void;

  // Asset operations
  addAssetGroup: (group: Omit<AssetGroup, 'id'>) => string;
  updateAssetGroup: (id: string, updates: Partial<AssetGroup>) => void;
  deleteAssetGroup: (id: string) => void;
  addAsset: (groupId: string, asset: Omit<Asset, 'id'>) => string;
  updateAsset: (groupId: string, assetId: string, updates: Partial<Asset>) => void;
  deleteAsset: (groupId: string, assetId: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  immer((set) => ({
    project: createEmptyProject(),
    isDirty: false,
    fileName: null,

    setProject: (project) =>
      set((state) => {
        state.project = project;
        state.isDirty = false;
      }),

    newProject: (name = 'New Project') =>
      set((state) => {
        state.project = createEmptyProject(name);
        state.isDirty = false;
        state.fileName = null;
      }),

    setProjectName: (name) =>
      set((state) => {
        state.project.name = name;
        state.isDirty = true;
      }),

    setFileName: (fileName) =>
      set((state) => {
        state.fileName = fileName;
      }),

    markClean: () =>
      set((state) => {
        state.isDirty = false;
      }),

    // Entity operations
    addEntity: (entity) => {
      const id = generateId();
      set((state) => {
        state.project.entities.push({ ...entity, id });
        state.isDirty = true;
      });
      return id;
    },

    updateEntity: (id, updates) =>
      set((state) => {
        const entity = state.project.entities.find((e) => e.id === id);
        if (entity) {
          Object.assign(entity, updates);
          state.isDirty = true;
        }
      }),

    deleteEntity: (id) =>
      set((state) => {
        state.project.entities = state.project.entities.filter((e) => e.id !== id);
        state.isDirty = true;
      }),

    addField: (entityId, field) => {
      const id = generateId();
      set((state) => {
        const entity = state.project.entities.find((e) => e.id === entityId);
        if (entity) {
          entity.fields.push({ ...field, id });
          state.isDirty = true;
        }
      });
      return id;
    },

    updateField: (entityId, fieldId, updates) =>
      set((state) => {
        const entity = state.project.entities.find((e) => e.id === entityId);
        if (entity) {
          const field = entity.fields.find((f) => f.id === fieldId);
          if (field) {
            Object.assign(field, updates);
            state.isDirty = true;
          }
        }
      }),

    deleteField: (entityId, fieldId) =>
      set((state) => {
        const entity = state.project.entities.find((e) => e.id === entityId);
        if (entity) {
          entity.fields = entity.fields.filter((f) => f.id !== fieldId);
          state.isDirty = true;
        }
      }),

    // Layout operations
    addLayout: (layout) => {
      const id = generateId();
      set((state) => {
        state.project.layouts.push({ ...layout, id });
        state.isDirty = true;
      });
      return id;
    },

    updateLayout: (id, updates) =>
      set((state) => {
        const layout = state.project.layouts.find((l) => l.id === id);
        if (layout) {
          Object.assign(layout, updates);
          state.isDirty = true;
        }
      }),

    deleteLayout: (id) =>
      set((state) => {
        state.project.layouts = state.project.layouts.filter((l) => l.id !== id);
        state.isDirty = true;
      }),

    // Component operations
    addComponent: (component) => {
      const id = generateId();
      set((state) => {
        state.project.components.push({ ...component, id });
        state.isDirty = true;
      });
      return id;
    },

    updateComponent: (id, updates) =>
      set((state) => {
        const component = state.project.components.find((c) => c.id === id);
        if (component) {
          Object.assign(component, updates);
          state.isDirty = true;
        }
      }),

    deleteComponent: (id) =>
      set((state) => {
        state.project.components = state.project.components.filter((c) => c.id !== id);
        state.isDirty = true;
      }),

    // Page operations
    addPage: (page) => {
      const id = generateId();
      set((state) => {
        state.project.pages.push({ ...page, id });
        state.isDirty = true;
      });
      return id;
    },

    updatePage: (id, updates) =>
      set((state) => {
        const page = state.project.pages.find((p) => p.id === id);
        if (page) {
          Object.assign(page, updates);
          state.isDirty = true;
        }
      }),

    deletePage: (id) =>
      set((state) => {
        state.project.pages = state.project.pages.filter((p) => p.id !== id);
        state.isDirty = true;
      }),

    // Element operations
    addElement: (parentType, parentId, element, targetId, position = 'inside') => {
      const id = generateId();
      const newElement: UIElement = { ...element, id } as UIElement;

      set((state) => {
        let parent: { children: UIElement[] } | undefined;

        if (parentType === 'page') {
          parent = state.project.pages.find((p) => p.id === parentId);
        } else if (parentType === 'layout') {
          parent = state.project.layouts.find((l) => l.id === parentId);
        } else if (parentType === 'component') {
          parent = state.project.components.find((c) => c.id === parentId);
        }

        if (parent) {
          if (targetId && position !== 'inside') {
            parent.children = insertNode(parent.children, null, newElement, position, targetId);
          } else if (targetId && position === 'inside') {
            parent.children = insertNode(parent.children, targetId, newElement, position);
          } else {
            parent.children.push(newElement);
          }
          state.isDirty = true;
        }
      });

      return id;
    },

    updateElement: (parentType, parentId, elementId, updates) =>
      set((state) => {
        let parent: { children: UIElement[] } | undefined;

        if (parentType === 'page') {
          parent = state.project.pages.find((p) => p.id === parentId);
        } else if (parentType === 'layout') {
          parent = state.project.layouts.find((l) => l.id === parentId);
        } else if (parentType === 'component') {
          parent = state.project.components.find((c) => c.id === parentId);
        }

        if (parent) {
          parent.children = updateNode(parent.children, elementId, updates);
          state.isDirty = true;
        }
      }),

    deleteElement: (parentType, parentId, elementId) =>
      set((state) => {
        let parent: { children: UIElement[] } | undefined;

        if (parentType === 'page') {
          parent = state.project.pages.find((p) => p.id === parentId);
        } else if (parentType === 'layout') {
          parent = state.project.layouts.find((l) => l.id === parentId);
        } else if (parentType === 'component') {
          parent = state.project.components.find((c) => c.id === parentId);
        }

        if (parent) {
          parent.children = removeNode(parent.children, elementId);
          state.isDirty = true;
        }
      }),

    moveElement: (parentType, parentId, sourceId, targetId, position) =>
      set((state) => {
        let parent: { children: UIElement[] } | undefined;

        if (parentType === 'page') {
          parent = state.project.pages.find((p) => p.id === parentId);
        } else if (parentType === 'layout') {
          parent = state.project.layouts.find((l) => l.id === parentId);
        } else if (parentType === 'component') {
          parent = state.project.components.find((c) => c.id === parentId);
        }

        if (parent) {
          parent.children = moveNode(parent.children, sourceId, targetId, position);
          state.isDirty = true;
        }
      }),

    duplicateElement: (parentType, parentId, elementId) => {
      let newId: string | null = null;
      set((state) => {
        let parent: { children: UIElement[] } | undefined;

        if (parentType === 'page') {
          parent = state.project.pages.find((p) => p.id === parentId);
        } else if (parentType === 'layout') {
          parent = state.project.layouts.find((l) => l.id === parentId);
        } else if (parentType === 'component') {
          parent = state.project.components.find((c) => c.id === parentId);
        }

        if (parent) {
          const element = findNodeById(parent.children, elementId);
          if (element) {
            const cloned = cloneElement(element, generateId);
            newId = cloned.id;
            // Insert after the original element
            parent.children = insertNode(parent.children, null, cloned, 'after', elementId);
            state.isDirty = true;
          }
        }
      });
      return newId;
    },

    moveElementInDirection: (parentType, parentId, elementId, direction) =>
      set((state) => {
        let parent: { children: UIElement[] } | undefined;

        if (parentType === 'page') {
          parent = state.project.pages.find((p) => p.id === parentId);
        } else if (parentType === 'layout') {
          parent = state.project.layouts.find((l) => l.id === parentId);
        } else if (parentType === 'component') {
          parent = state.project.components.find((c) => c.id === parentId);
        }

        if (parent) {
          // Find the element and its parent container
          const elementParent = findParentNode(parent.children, elementId);
          const siblings = elementParent ? elementParent.children : parent.children;

          if (siblings) {
            const currentIndex = siblings.findIndex((el) => el.id === elementId);
            if (currentIndex === -1) return;

            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex < 0 || targetIndex >= siblings.length) return;

            // Swap the elements
            const temp = siblings[currentIndex];
            siblings[currentIndex] = siblings[targetIndex];
            siblings[targetIndex] = temp;
            state.isDirty = true;
          }
        }
      }),

    // View operations
    addView: (view) => {
      const id = generateId();
      set((state) => {
        state.project.materializedViews.push({ ...view, id });
        state.isDirty = true;
      });
      return id;
    },

    updateView: (id, updates) =>
      set((state) => {
        const view = state.project.materializedViews.find((v) => v.id === id);
        if (view) {
          Object.assign(view, updates);
          state.isDirty = true;
        }
      }),

    deleteView: (id) =>
      set((state) => {
        state.project.materializedViews = state.project.materializedViews.filter((v) => v.id !== id);
        state.isDirty = true;
      }),

    // Asset operations
    addAssetGroup: (group) => {
      const id = generateId();
      set((state) => {
        if (!state.project.assets) {
          state.project.assets = { id: generateId(), groups: [] };
        }
        state.project.assets.groups.push({ ...group, id });
        state.isDirty = true;
      });
      return id;
    },

    updateAssetGroup: (id, updates) =>
      set((state) => {
        if (!state.project.assets) return;
        const group = state.project.assets.groups.find((g) => g.id === id);
        if (group) {
          Object.assign(group, updates);
          state.isDirty = true;
        }
      }),

    deleteAssetGroup: (id) =>
      set((state) => {
        if (!state.project.assets) return;
        state.project.assets.groups = state.project.assets.groups.filter((g) => g.id !== id);
        if (state.project.assets.groups.length === 0) {
          state.project.assets = undefined;
        }
        state.isDirty = true;
      }),

    addAsset: (groupId, asset) => {
      const id = generateId();
      set((state) => {
        if (!state.project.assets) return;
        const group = state.project.assets.groups.find((g) => g.id === groupId);
        if (group) {
          group.items.push({ ...asset, id });
          state.isDirty = true;
        }
      });
      return id;
    },

    updateAsset: (groupId, assetId, updates) =>
      set((state) => {
        if (!state.project.assets) return;
        const group = state.project.assets.groups.find((g) => g.id === groupId);
        if (group) {
          const asset = group.items.find((a) => a.id === assetId);
          if (asset) {
            Object.assign(asset, updates);
            state.isDirty = true;
          }
        }
      }),

    deleteAsset: (groupId, assetId) =>
      set((state) => {
        if (!state.project.assets) return;
        const group = state.project.assets.groups.find((g) => g.id === groupId);
        if (group) {
          group.items = group.items.filter((a) => a.id !== assetId);
          state.isDirty = true;
        }
      }),
  }))
);

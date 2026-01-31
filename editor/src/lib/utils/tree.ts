import type { UIElement } from '@/types/spec';

export interface TreeNode {
  id: string;
  children?: TreeNode[];
}

// Find a node by ID in a tree
export function findNodeById<T extends TreeNode>(
  nodes: T[],
  id: string
): T | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children as T[], id);
      if (found) return found;
    }
  }
  return null;
}

// Find parent of a node
export function findParentNode<T extends TreeNode>(
  nodes: T[],
  id: string,
  parent: T | null = null
): T | null {
  for (const node of nodes) {
    if (node.id === id) {
      return parent;
    }
    if (node.children) {
      const found = findParentNode(node.children as T[], id, node);
      if (found) return found;
    }
  }
  return null;
}

// Get path to a node (array of IDs from root to node)
export function getNodePath<T extends TreeNode>(
  nodes: T[],
  id: string,
  path: string[] = []
): string[] | null {
  for (const node of nodes) {
    const currentPath = [...path, node.id];
    if (node.id === id) {
      return currentPath;
    }
    if (node.children) {
      const found = getNodePath(node.children as T[], id, currentPath);
      if (found) return found;
    }
  }
  return null;
}

// Insert a node at a specific position
export function insertNode<T extends TreeNode>(
  nodes: T[],
  parentId: string | null,
  newNode: T,
  position: 'before' | 'after' | 'inside',
  referenceId?: string
): T[] {
  if (!parentId) {
    // Insert at root level
    if (!referenceId) {
      return [...nodes, newNode];
    }
    const index = nodes.findIndex((n) => n.id === referenceId);
    if (index === -1) return [...nodes, newNode];
    const insertIndex = position === 'after' ? index + 1 : index;
    return [...nodes.slice(0, insertIndex), newNode, ...nodes.slice(insertIndex)];
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      if (position === 'inside') {
        // Insert as last child
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      } else if (referenceId && node.children) {
        // Insert before/after referenceId within this parent's children
        const index = node.children.findIndex((n) => n.id === referenceId);
        if (index !== -1) {
          const insertIndex = position === 'after' ? index + 1 : index;
          const newChildren = [
            ...node.children.slice(0, insertIndex),
            newNode,
            ...node.children.slice(insertIndex),
          ];
          return {
            ...node,
            children: newChildren,
          };
        }
      }
    }
    if (node.children) {
      return {
        ...node,
        children: insertNode(node.children as T[], parentId, newNode, position, referenceId),
      };
    }
    return node;
  });
}

// Remove a node by ID
export function removeNode<T extends TreeNode>(nodes: T[], id: string): T[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children) {
        return {
          ...node,
          children: removeNode(node.children as T[], id),
        };
      }
      return node;
    });
}

// Update a node by ID
export function updateNode<T extends TreeNode>(
  nodes: T[],
  id: string,
  updates: Partial<T>
): T[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children) {
      return {
        ...node,
        children: updateNode(node.children as T[], id, updates),
      };
    }
    return node;
  });
}

// Move a node to a new position
export function moveNode<T extends TreeNode>(
  nodes: T[],
  sourceId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): T[] {
  const node = findNodeById(nodes, sourceId);
  if (!node) return nodes;

  // First remove the node
  let result = removeNode(nodes, sourceId);

  // Then insert at new position
  if (position === 'inside') {
    result = insertNode(result, targetId, node, 'inside');
  } else {
    const parent = findParentNode(result, targetId);
    result = insertNode(
      result,
      parent?.id || null,
      node,
      position,
      targetId
    );
  }

  return result;
}

// Traverse all nodes with a callback
export function traverseTree<T extends TreeNode>(
  nodes: T[],
  callback: (node: T, depth: number) => void,
  depth: number = 0
): void {
  for (const node of nodes) {
    callback(node, depth);
    if (node.children) {
      traverseTree(node.children as T[], callback, depth + 1);
    }
  }
}

// Count all nodes in a tree
export function countNodes<T extends TreeNode>(nodes: T[]): number {
  let count = 0;
  traverseTree(nodes, () => count++);
  return count;
}

// Clone a UI element tree with new IDs
export function cloneElement(
  element: UIElement,
  generateId: () => string
): UIElement {
  return {
    ...element,
    id: generateId(),
    children: element.children.map((child) => cloneElement(child, generateId)),
  };
}

import type { UISpecProject } from '@/types/spec';

const STORAGE_KEY = 'llm-ui-spec-project';
const RECENT_KEY = 'llm-ui-spec-recent';

export function saveProject(project: UISpecProject): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    updateRecentProjects(project.name);
  } catch (error) {
    console.error('Failed to save project to localStorage:', error);
    throw new Error('Failed to save project');
  }
}

export function loadProject(): UISpecProject | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const project = JSON.parse(data) as UISpecProject;

    // Ensure project has at least one page for editing
    if (!project.pages || project.pages.length === 0) {
      project.pages = [{
        id: crypto.randomUUID(),
        name: 'Home',
        route: '/',
        children: [],
      }];
    }

    // Ensure materializedViews exists
    if (!project.materializedViews) {
      project.materializedViews = [];
    }

    return project;
  } catch (error) {
    console.error('Failed to load project from localStorage:', error);
    return null;
  }
}

export function clearProject(): void {
  localStorage.removeItem(STORAGE_KEY);
}

interface RecentProject {
  name: string;
  lastModified: number;
}

function updateRecentProjects(name: string): void {
  try {
    const recent = getRecentProjects();
    const filtered = recent.filter((p) => p.name !== name);
    filtered.unshift({ name, lastModified: Date.now() });
    // Keep only last 10
    const trimmed = filtered.slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to update recent projects:', error);
  }
}

export function getRecentProjects(): RecentProject[] {
  try {
    const data = localStorage.getItem(RECENT_KEY);
    if (!data) return [];
    return JSON.parse(data) as RecentProject[];
  } catch {
    return [];
  }
}

import { parseXML, parseExternalSpec, type SectionSources } from '@/lib/xml/parser';
import { serializeToXML } from '@/lib/xml/serializer';
import type { UISpecProject, Entity, Layout, ComponentDef, Page } from '@/types/spec';

// Store for loaded external files (path -> content)
export type ExternalFiles = Map<string, string>;

export async function importFromFile(): Promise<UISpecProject | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml,.spec.xml';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const text = await file.text();
        const project = parseXML(text);
        resolve(project);
      } catch (error) {
        console.error('Failed to import file:', error);
        resolve(null);
      }
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}

/**
 * Import a spec project from a directory containing multiple spec files.
 * Uses the File System Access API to pick a directory.
 */
export async function importFromDirectory(): Promise<UISpecProject | null> {
  try {
    // Check if the API is available
    if (!('showDirectoryPicker' in window)) {
      console.error('File System Access API not supported');
      return null;
    }

    // Pick a directory
    const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();

    // Find and read all .spec.xml files
    const externalFiles: ExternalFiles = new Map();
    let mainSpecContent: string | null = null;
    let mainSpecName: string | null = null;

    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.spec.xml')) {
        const file = await entry.getFile();
        const content = await file.text();

        // Check if this is the main spec file (contains <webapp>)
        if (content.includes('<webapp')) {
          mainSpecContent = content;
          mainSpecName = entry.name;
        } else {
          // Store external file with relative path
          externalFiles.set(`./${entry.name}`, content);
        }
      }
    }

    if (!mainSpecContent) {
      console.error('No main spec file found (file containing <webapp>)');
      return null;
    }

    // Parse main spec with external file resolver
    const project = parseXML(mainSpecContent, async (src: string) => {
      const content = externalFiles.get(src);
      if (!content) {
        console.warn(`External file not found: ${src}`);
        return null;
      }
      return parseExternalSpec(content);
    });

    // Wait for any async resolution
    await resolveExternalRefs(project, externalFiles);

    return project;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled
      return null;
    }
    console.error('Failed to import directory:', error);
    return null;
  }
}

/**
 * Resolve external references in a parsed project
 */
async function resolveExternalRefs(project: UISpecProject & { _sectionSources?: SectionSources }, externalFiles: ExternalFiles): Promise<void> {
  // Resolve section-level sources first (entire sections in external files)
  const sectionSources = project._sectionSources;
  if (sectionSources) {
    // Resolve entities section
    if (sectionSources.entities) {
      const content = externalFiles.get(sectionSources.entities);
      if (content) {
        const external = parseExternalSpec(content);
        if (external?.type === 'entities' && Array.isArray(external.data)) {
          project.entities = external.data as Entity[];
        }
      }
    }

    // Resolve layouts section
    if (sectionSources.layouts) {
      const content = externalFiles.get(sectionSources.layouts);
      if (content) {
        const external = parseExternalSpec(content);
        if (external?.type === 'layouts' && Array.isArray(external.data)) {
          project.layouts = external.data as Layout[];
        }
      }
    }

    // Resolve components section
    if (sectionSources.components) {
      const content = externalFiles.get(sectionSources.components);
      if (content) {
        const external = parseExternalSpec(content);
        if (external?.type === 'components' && Array.isArray(external.data)) {
          project.components = external.data as ComponentDef[];
        }
      }
    }

    // Resolve pages section
    if (sectionSources.pages) {
      const content = externalFiles.get(sectionSources.pages);
      if (content) {
        const external = parseExternalSpec(content);
        if (external?.type === 'pages' && Array.isArray(external.data)) {
          project.pages = external.data as Page[];
        }
      }
    }

    // Clean up the internal property
    delete project._sectionSources;
  }

  // Resolve individual item refs
  // Resolve layout refs
  for (let i = 0; i < project.layouts.length; i++) {
    const layout = project.layouts[i];
    if (layout.src) {
      const content = externalFiles.get(layout.src);
      if (content) {
        const external = parseExternalSpec(content);
        if (external?.type === 'layout' && external.data && !Array.isArray(external.data)) {
          // Merge external data into the placeholder, keeping the id
          const id = layout.id;
          Object.assign(project.layouts[i], external.data, { id, src: layout.src });
        }
      }
    }
  }

  // Resolve component refs
  for (let i = 0; i < project.components.length; i++) {
    const component = project.components[i];
    if (component.src) {
      const content = externalFiles.get(component.src);
      if (content) {
        const external = parseExternalSpec(content);
        if (external?.type === 'component' && external.data && !Array.isArray(external.data)) {
          const id = component.id;
          Object.assign(project.components[i], external.data, { id, src: component.src });
        }
      }
    }
  }

  // Resolve page refs
  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i];
    if (page.src) {
      const content = externalFiles.get(page.src);
      if (content) {
        const external = parseExternalSpec(content);
        if (external?.type === 'page' && external.data && !Array.isArray(external.data)) {
          const id = page.id;
          Object.assign(project.pages[i], external.data, { id, src: page.src });
        }
      }
    }
  }

  // Resolve entity refs
  for (let i = 0; i < project.entities.length; i++) {
    const entity = project.entities[i];
    if (entity.src) {
      const content = externalFiles.get(entity.src);
      if (content) {
        const external = parseExternalSpec(content);
        if (external?.type === 'entity' && external.data && !Array.isArray(external.data)) {
          const id = entity.id;
          Object.assign(project.entities[i], external.data, { id, src: entity.src });
        }
      }
    }
  }
}

export function exportToFile(project: UISpecProject, filename?: string): void {
  const xml = serializeToXML(project);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${project.name.toLowerCase().replace(/\s+/g, '-')}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromText(xmlText: string): Promise<UISpecProject> {
  return parseXML(xmlText);
}

export function exportToText(project: UISpecProject): string {
  return serializeToXML(project);
}

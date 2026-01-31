import { useMemo, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Save, AlertTriangle, AlertCircle } from 'lucide-react';
import { useUIStore, useProjectStore } from '@/store';
import {
  getValidator,
  parseSingleEntity,
  parseSingleLayout,
  parseSinglePage,
  parseSingleComponent,
  parseSingleElement,
  type ValidationError,
} from '@/lib/xml';

// Generate XML for specific items
function generateEntityXml(entity: { name: string; fields: Array<{ name: string; type: string; required?: boolean; unique?: boolean; default?: string; reference?: string; enum?: string[] }> }): string {
  const lines: string[] = [];
  lines.push(`<entity name="${entity.name}">`);
  for (const field of entity.fields) {
    let attrs = `name="${field.name}" type="${field.type}"`;
    if (field.required) attrs += ' required="true"';
    if (field.unique) attrs += ' unique="true"';
    if (field.default) attrs += ` default="${field.default}"`;
    if (field.reference) attrs += ` reference="${field.reference}"`;
    if (field.enum) attrs += ` enum="${field.enum.join(',')}"`;
    lines.push(`  <field ${attrs} />`);
  }
  lines.push('</entity>');
  return lines.join('\n');
}

function generateLayoutXml(layout: { name: string; slots: Array<{ name: string; required?: boolean; role?: string }>; children: unknown[] }, serializeChildren: (children: unknown[], indent: number) => string[]): string {
  const lines: string[] = [];
  lines.push(`<layout name="${layout.name}">`);
  for (const slot of layout.slots) {
    let attrs = `name="${slot.name}"`;
    if (slot.required) attrs += ' required="true"';
    if (slot.role) attrs += ` role="${slot.role}"`;
    lines.push(`  <slot ${attrs} />`);
  }
  lines.push(...serializeChildren(layout.children, 1));
  lines.push('</layout>');
  return lines.join('\n');
}

function generatePageXml(page: { name: string; route: string; layout?: string; title?: string; children: unknown[] }, serializeChildren: (children: unknown[], indent: number) => string[]): string {
  const lines: string[] = [];
  let attrs = `name="${page.name}" route="${page.route}"`;
  if (page.layout) attrs += ` layout="${page.layout}"`;
  if (page.title) attrs += ` title="${page.title}"`;
  lines.push(`<page ${attrs}>`);
  lines.push(...serializeChildren(page.children, 1));
  lines.push('</page>');
  return lines.join('\n');
}

function generateComponentXml(component: { name: string; props: Array<{ name: string; type: string; required?: boolean; default?: string }>; children: unknown[] }, serializeChildren: (children: unknown[], indent: number) => string[]): string {
  const lines: string[] = [];
  lines.push(`<component name="${component.name}">`);
  for (const prop of component.props) {
    let attrs = `name="${prop.name}" type="${prop.type}"`;
    if (prop.required) attrs += ' required="true"';
    if (prop.default) attrs += ` default="${prop.default}"`;
    lines.push(`  <prop ${attrs} />`);
  }
  lines.push(...serializeChildren(component.children, 1));
  lines.push('</component>');
  return lines.join('\n');
}

function generateElementXml(element: { type: string; role?: string; props: Record<string, unknown>; children: unknown[] }, indent: number = 0): string[] {
  const lines: string[] = [];
  const pad = '  '.repeat(indent);
  const { type, role, props, children } = element;

  const attrParts: string[] = [];
  const textContent = props.content;

  // Add role attribute if present
  if (role) {
    attrParts.push(`role="${role}"`);
  }

  for (const [key, value] of Object.entries(props)) {
    if (key === 'content') continue;
    if (value !== undefined && value !== null && value !== '') {
      attrParts.push(`${key}="${String(value)}"`);
    }
  }

  const attrs = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';

  if (children.length === 0 && !textContent) {
    lines.push(`${pad}<${type}${attrs} />`);
  } else if (children.length === 0 && textContent) {
    lines.push(`${pad}<${type}${attrs}>${String(textContent)}</${type}>`);
  } else {
    lines.push(`${pad}<${type}${attrs}>`);
    if (textContent) {
      lines.push(`${pad}  ${String(textContent)}`);
    }
    for (const child of children as Array<{ type: string; role?: string; props: Record<string, unknown>; children: unknown[] }>) {
      lines.push(...generateElementXml(child, indent + 1));
    }
    lines.push(`${pad}</${type}>`);
  }

  return lines;
}

function serializeChildren(children: unknown[], indent: number): string[] {
  const lines: string[] = [];
  for (const child of children as Array<{ type: string; role?: string; props: Record<string, unknown>; children: unknown[] }>) {
    lines.push(...generateElementXml(child, indent));
  }
  return lines;
}

export function ViewMarkupDialog() {
  const { activeDialog, dialogData, closeDialog } = useUIStore();
  const { project, updateEntity, updateLayout, updatePage, updateComponent, updateElement } = useProjectStore();
  const [copied, setCopied] = useState(false);
  const [editedMarkup, setEditedMarkup] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = activeDialog === 'viewMarkup';
  const data = dialogData as { id: string; type: string; parentId?: string } | null;

  const originalMarkup = useMemo(() => {
    if (!data) return '';

    const { id, type } = data;

    switch (type) {
      case 'entity': {
        const entity = project.entities.find(e => e.id === id);
        if (entity) return generateEntityXml(entity);
        break;
      }
      case 'layout': {
        const layout = project.layouts.find(l => l.id === id);
        if (layout) return generateLayoutXml(layout, serializeChildren);
        break;
      }
      case 'page': {
        const page = project.pages.find(p => p.id === id);
        if (page) return generatePageXml(page, serializeChildren);
        break;
      }
      case 'component': {
        const component = project.components.find(c => c.id === id);
        if (component) return generateComponentXml(component, serializeChildren);
        break;
      }
      case 'element': {
        const parentId = data.parentId;
        if (parentId) {
          const page = project.pages.find(p => p.id === parentId);
          const layout = project.layouts.find(l => l.id === parentId);
          const component = project.components.find(c => c.id === parentId);
          const parent = page || layout || component;

          if (parent) {
            const findElement = (children: unknown[], targetId: string): unknown | null => {
              for (const child of children as Array<{ id: string; children: unknown[] }>) {
                if (child.id === targetId) return child;
                const found = findElement(child.children || [], targetId);
                if (found) return found;
              }
              return null;
            };
            const element = findElement(parent.children, id);
            if (element) {
              return generateElementXml(element as { type: string; role?: string; props: Record<string, unknown>; children: unknown[] }, 0).join('\n');
            }
          }
        }
        break;
      }
      case 'assetGroup': {
        const group = project.assets?.groups.find(g => g.id === id);
        if (group) {
          const lines = [`<${group.name}>`];
          for (const asset of group.items) {
            lines.push(`  <${asset.name} src="${asset.src}" />`);
          }
          lines.push(`</${group.name}>`);
          return lines.join('\n');
        }
        break;
      }
      case 'asset': {
        const parentId = data.parentId;
        const group = project.assets?.groups.find(g => g.id === parentId);
        const asset = group?.items.find(a => a.id === id);
        if (asset) {
          return `<${asset.name} src="${asset.src}" />`;
        }
        break;
      }
    }

    return '<!-- No markup available -->';
  }, [data, project]);

  // Current markup (either edited or original)
  const currentMarkup = editedMarkup ?? originalMarkup;
  const hasChanges = editedMarkup !== null && editedMarkup !== originalMarkup;

  // Validate on change
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    setEditedMarkup(value);

    // Validate
    if (data) {
      const validator = getValidator(data.type);
      const result = validator(value);
      setValidationErrors(result.errors);
    }
  }, [data]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentMarkup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    closeDialog();
    setCopied(false);
    setEditedMarkup(null);
    setValidationErrors([]);
  };

  const handleApply = async () => {
    if (!data || !editedMarkup) return;

    // Validate first
    const validator = getValidator(data.type);
    const result = validator(editedMarkup);

    if (!result.valid) {
      setValidationErrors(result.errors);
      return;
    }

    setIsSaving(true);

    try {
      const { id, type, parentId } = data;

      switch (type) {
        case 'entity': {
          const parsed = parseSingleEntity(editedMarkup);
          updateEntity(id, { name: parsed.name, fields: parsed.fields });
          break;
        }
        case 'layout': {
          const parsed = parseSingleLayout(editedMarkup);
          updateLayout(id, { name: parsed.name, slots: parsed.slots, children: parsed.children });
          break;
        }
        case 'page': {
          const parsed = parseSinglePage(editedMarkup);
          updatePage(id, { name: parsed.name, route: parsed.route, layout: parsed.layout, title: parsed.title, children: parsed.children });
          break;
        }
        case 'component': {
          const parsed = parseSingleComponent(editedMarkup);
          updateComponent(id, { name: parsed.name, props: parsed.props, children: parsed.children });
          break;
        }
        case 'element': {
          if (parentId) {
            const page = project.pages.find(p => p.id === parentId);
            const layout = project.layouts.find(l => l.id === parentId);
            const component = project.components.find(c => c.id === parentId);
            const parentType = page ? 'page' : layout ? 'layout' : 'component';

            const parsed = parseSingleElement(editedMarkup);
            updateElement(parentType, parentId, id, { type: parsed.type, props: parsed.props, role: parsed.role, children: parsed.children });
          }
          break;
        }
      }

      // Reset state after successful save
      setEditedMarkup(null);
      setValidationErrors([]);
    } catch (error) {
      setValidationErrors([{
        message: `Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      }]);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if type is editable
  const isEditable = data?.type && ['entity', 'layout', 'page', 'component', 'element'].includes(data.type);

  // Calculate line count for editor height (bigger max height)
  const lineCount = currentMarkup.split('\n').length;
  const editorHeight = Math.min(Math.max(lineCount * 20 + 20, 200), 500);

  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <DialogTitle>{isEditable ? 'Edit' : 'View'} Markup</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </DialogHeader>

        <div className="rounded-md border overflow-hidden bg-zinc-100">
          <Editor
            height={editorHeight}
            defaultLanguage="xml"
            value={currentMarkup}
            onChange={isEditable ? handleEditorChange : undefined}
            theme="vs"
            options={{
              readOnly: !isEditable,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              folding: true,
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: isEditable ? 'line' : 'none',
            }}
            beforeMount={(monaco) => {
              // Define custom theme with grey background
              monaco.editor.defineTheme('light-grey', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#f4f4f5',
                  'editorLineNumber.foreground': '#a1a1aa',
                },
              });
            }}
            onMount={(_editor, monaco) => {
              monaco.editor.setTheme('light-grey');
            }}
          />
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="max-h-32 overflow-y-auto rounded-md border bg-muted/50 p-2 space-y-1">
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 text-sm ${error.severity === 'error' ? 'text-destructive' : 'text-yellow-600'}`}
              >
                {error.severity === 'error' ? (
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span>
                  {error.line && `Line ${error.line}: `}
                  {error.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer with Apply button */}
        {isEditable && (
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {errorCount > 0 && (
                <span className="text-destructive">{errorCount} error{errorCount > 1 ? 's' : ''}</span>
              )}
              {errorCount > 0 && warningCount > 0 && ', '}
              {warningCount > 0 && (
                <span className="text-yellow-600">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>
              )}
              {errorCount === 0 && warningCount === 0 && hasChanges && (
                <span className="text-green-600">Valid XML</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!hasChanges || errorCount > 0 || isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Applying...' : 'Apply Changes'}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

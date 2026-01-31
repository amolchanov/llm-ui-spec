// Schema validation for LLM UI Spec XML

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Valid element types
const VALID_ELEMENT_TYPES = new Set([
  // Layout containers
  'row', 'column', 'stack', 'grid', 'card', 'section', 'container', 'tabs', 'tab',
  // Basic elements
  'text', 'heading', 'button', 'link', 'image', 'icon', 'divider', 'spacer', 'badge', 'tag',
  // Form elements
  'form', 'input', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'datepicker', 'filepicker', 'search',
  // Data elements
  'list', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'chart', 'stat', 'pagination',
  // Interactive elements
  'modal', 'drawer', 'tooltip', 'popover', 'dropdown', 'menu', 'menuItem', 'trigger', 'alert', 'overlay', 'spinner',
  // Navigation
  'nav', 'navItem',
  // Component references
  'component', 'use', 'slot',
  // Logic/structure
  'if', 'else', 'each', 'for', 'sortable', 'dropZone', 'draggable',
  // Special
  'prompt', 'suffix', 'prefix',
]);

// Valid field types
const VALID_FIELD_TYPES = new Set([
  'string', 'text', 'number', 'boolean', 'date', 'datetime', 'email', 'url', 'uuid', 'json', 'array'
]);

// Valid container roles
const VALID_ROLES = new Set(['content', 'chrome']);

// Required attributes for different element types
const REQUIRED_ATTRIBUTES: Record<string, string[]> = {
  entity: ['name'],
  field: ['name', 'type'],
  layout: ['name'],
  slot: ['name'],
  component: ['name'],
  prop: ['name', 'type'],
  page: ['name', 'route'],
};

/**
 * Validates XML string for basic well-formedness
 */
export function validateXmlSyntax(xml: string): ValidationResult {
  const errors: ValidationError[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    // Check for parser errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      const errorText = parserError.textContent || 'XML parsing error';
      // Try to extract line/column info
      const match = errorText.match(/line (\d+)/i);
      const line = match ? parseInt(match[1]) : undefined;

      errors.push({
        line,
        message: errorText.split('\n')[0] || 'Invalid XML syntax',
        severity: 'error',
      });
    }
  } catch (e) {
    errors.push({
      message: `XML parsing error: ${e instanceof Error ? e.message : 'Unknown error'}`,
      severity: 'error',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates entity XML
 */
export function validateEntityXml(xml: string): ValidationResult {
  const syntaxResult = validateXmlSyntax(xml);
  if (!syntaxResult.valid) return syntaxResult;

  const errors: ValidationError[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const entity = doc.documentElement;

  if (entity.tagName !== 'entity') {
    errors.push({
      message: `Expected root element 'entity', got '${entity.tagName}'`,
      severity: 'error',
    });
    return { valid: false, errors };
  }

  // Check required attributes
  if (!entity.getAttribute('name')) {
    errors.push({
      message: "Entity is missing required attribute 'name'",
      severity: 'error',
    });
  }

  // Validate fields
  const fields = entity.querySelectorAll('field');
  fields.forEach((field, index) => {
    if (!field.getAttribute('name')) {
      errors.push({
        message: `Field ${index + 1} is missing required attribute 'name'`,
        severity: 'error',
      });
    }

    const type = field.getAttribute('type');
    if (!type) {
      errors.push({
        message: `Field '${field.getAttribute('name') || index + 1}' is missing required attribute 'type'`,
        severity: 'error',
      });
    } else if (!VALID_FIELD_TYPES.has(type)) {
      errors.push({
        message: `Field '${field.getAttribute('name')}' has invalid type '${type}'. Valid types: ${[...VALID_FIELD_TYPES].join(', ')}`,
        severity: 'warning',
      });
    }
  });

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Validates layout XML
 */
export function validateLayoutXml(xml: string): ValidationResult {
  const syntaxResult = validateXmlSyntax(xml);
  if (!syntaxResult.valid) return syntaxResult;

  const errors: ValidationError[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const layout = doc.documentElement;

  if (layout.tagName !== 'layout') {
    errors.push({
      message: `Expected root element 'layout', got '${layout.tagName}'`,
      severity: 'error',
    });
    return { valid: false, errors };
  }

  if (!layout.getAttribute('name')) {
    errors.push({
      message: "Layout is missing required attribute 'name'",
      severity: 'error',
    });
  }

  // Validate slots
  const slots = layout.querySelectorAll(':scope > slot');
  slots.forEach((slot, index) => {
    if (!slot.getAttribute('name')) {
      errors.push({
        message: `Slot ${index + 1} is missing required attribute 'name'`,
        severity: 'error',
      });
    }

    const role = slot.getAttribute('role');
    if (role && !VALID_ROLES.has(role)) {
      errors.push({
        message: `Slot '${slot.getAttribute('name')}' has invalid role '${role}'. Valid roles: content, chrome`,
        severity: 'warning',
      });
    }
  });

  // Validate child elements
  validateChildElements(layout, errors);

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Validates page XML
 */
export function validatePageXml(xml: string): ValidationResult {
  const syntaxResult = validateXmlSyntax(xml);
  if (!syntaxResult.valid) return syntaxResult;

  const errors: ValidationError[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const page = doc.documentElement;

  if (page.tagName !== 'page') {
    errors.push({
      message: `Expected root element 'page', got '${page.tagName}'`,
      severity: 'error',
    });
    return { valid: false, errors };
  }

  if (!page.getAttribute('name')) {
    errors.push({
      message: "Page is missing required attribute 'name'",
      severity: 'error',
    });
  }

  if (!page.getAttribute('route')) {
    errors.push({
      message: "Page is missing required attribute 'route'",
      severity: 'error',
    });
  }

  // Validate layout reference format
  const layoutRef = page.getAttribute('layout');
  if (layoutRef && !layoutRef.startsWith('@layout.')) {
    errors.push({
      message: `Layout reference should be in format '@layout.LayoutName', got '${layoutRef}'`,
      severity: 'warning',
    });
  }

  // Validate child elements
  validateChildElements(page, errors);

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Validates component XML
 */
export function validateComponentXml(xml: string): ValidationResult {
  const syntaxResult = validateXmlSyntax(xml);
  if (!syntaxResult.valid) return syntaxResult;

  const errors: ValidationError[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const component = doc.documentElement;

  if (component.tagName !== 'component') {
    errors.push({
      message: `Expected root element 'component', got '${component.tagName}'`,
      severity: 'error',
    });
    return { valid: false, errors };
  }

  if (!component.getAttribute('name')) {
    errors.push({
      message: "Component is missing required attribute 'name'",
      severity: 'error',
    });
  }

  // Validate props
  const props = component.querySelectorAll(':scope > prop');
  props.forEach((prop, index) => {
    if (!prop.getAttribute('name')) {
      errors.push({
        message: `Prop ${index + 1} is missing required attribute 'name'`,
        severity: 'error',
      });
    }
    if (!prop.getAttribute('type')) {
      errors.push({
        message: `Prop '${prop.getAttribute('name') || index + 1}' is missing required attribute 'type'`,
        severity: 'error',
      });
    }
  });

  // Validate child elements
  validateChildElements(component, errors);

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Validates a single UI element XML
 */
export function validateElementXml(xml: string): ValidationResult {
  const syntaxResult = validateXmlSyntax(xml);
  if (!syntaxResult.valid) return syntaxResult;

  const errors: ValidationError[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const element = doc.documentElement;

  if (!VALID_ELEMENT_TYPES.has(element.tagName)) {
    errors.push({
      message: `Unknown element type '${element.tagName}'`,
      severity: 'warning',
    });
  }

  // Validate role attribute if present
  const role = element.getAttribute('role');
  if (role && !VALID_ROLES.has(role)) {
    errors.push({
      message: `Invalid role '${role}'. Valid roles: content, chrome`,
      severity: 'warning',
    });
  }

  // Validate child elements
  validateChildElements(element, errors);

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Helper to validate child elements recursively
 */
function validateChildElements(parent: Element, errors: ValidationError[]): void {
  const skipTags = new Set(['slot', 'prop', 'field', 'item', 'join', 'data', 'query', 'params', 'param']);

  for (const child of parent.children) {
    if (skipTags.has(child.tagName)) continue;

    if (!VALID_ELEMENT_TYPES.has(child.tagName)) {
      errors.push({
        message: `Unknown element type '${child.tagName}'`,
        severity: 'warning',
      });
    }

    // Validate role attribute if present
    const role = child.getAttribute('role');
    if (role && !VALID_ROLES.has(role)) {
      errors.push({
        message: `Element '${child.tagName}' has invalid role '${role}'. Valid roles: content, chrome`,
        severity: 'warning',
      });
    }

    // Recursively validate children
    validateChildElements(child, errors);
  }
}

/**
 * Get validator for a specific type
 */
export function getValidator(type: string): (xml: string) => ValidationResult {
  switch (type) {
    case 'entity':
      return validateEntityXml;
    case 'layout':
      return validateLayoutXml;
    case 'page':
      return validatePageXml;
    case 'component':
      return validateComponentXml;
    case 'element':
      return validateElementXml;
    default:
      return validateXmlSyntax;
  }
}

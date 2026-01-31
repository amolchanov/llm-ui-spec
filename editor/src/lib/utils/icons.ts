import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] || LucideIcons.Box;
}

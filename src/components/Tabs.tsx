import * as RadixTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';
import './tabs.css';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultId?: string;
  'aria-label': string;
}

// Roving tabindex, arrow/Home/End navigation and tab/tabpanel aria are handled by
// Radix Tabs. It sets aria-selected on the active trigger, which our CSS underline hooks.
export function Tabs({ items, defaultId, 'aria-label': ariaLabel }: TabsProps) {
  return (
    <RadixTabs.Root defaultValue={defaultId ?? items[0]?.id}>
      <RadixTabs.List className="pm-tabs__list" aria-label={ariaLabel}>
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.id}
            value={item.id}
            className="pm-tab"
            disabled={item.disabled}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.id} value={item.id} className="pm-tabs__panel">
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}

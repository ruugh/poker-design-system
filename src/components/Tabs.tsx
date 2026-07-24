import { useId, useRef, useState } from 'react';
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

export function Tabs({ items, defaultId, 'aria-label': ariaLabel }: TabsProps) {
  const base = useId();
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusable = items.filter((i) => !i.disabled);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = focusable.findIndex((i) => i.id === active);
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % focusable.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + focusable.length) % focusable.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = focusable.length - 1;
    else return;
    e.preventDefault();
    const id = focusable[next].id;
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <div>
      <div className="pm-tabs__list" role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(n) => {
                tabRefs.current[item.id] = n;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              className="pm-tab"
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          className="pm-tabs__panel"
          hidden={item.id !== active}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

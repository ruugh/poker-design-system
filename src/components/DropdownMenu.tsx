import * as Menu from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import './dropdown-menu.css';

export interface DropdownMenuProps {
  /** the control that opens the menu — rendered as-is */
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export interface DropdownMenuItemProps {
  onSelect?: () => void;
  disabled?: boolean;
  /** destructive actions carry the danger ink — the only tone an item may take */
  tone?: 'default' | 'danger';
  /** trailing hint, e.g. a keyboard shortcut */
  shortcut?: string;
  children: ReactNode;
}

/**
 * Actions on a thing — the row menu, the club switcher's overflow. Compound, like Table:
 * <DropdownMenu trigger={…}><DropdownMenu.Item>…
 * Roving focus, typeahead, Esc and the aria roles come from Radix.
 */
export function DropdownMenu({ trigger, children, align = 'end', side = 'bottom' }: DropdownMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          className="pm-menu"
          align={align}
          side={side}
          sideOffset={8}
          collisionPadding={8}
        >
          {children}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

DropdownMenu.Item = function Item({
  onSelect,
  disabled,
  tone = 'default',
  shortcut,
  children,
}: DropdownMenuItemProps) {
  return (
    <Menu.Item
      className={`pm-menu__item pm-menu__item--${tone}`}
      disabled={disabled}
      onSelect={onSelect}
    >
      <span className="pm-menu__label">{children}</span>
      {shortcut ? <span className="pm-menu__shortcut">{shortcut}</span> : null}
    </Menu.Item>
  );
};

DropdownMenu.Label = function Label({ children }: { children: ReactNode }) {
  return <Menu.Label className="pm-menu__group-label">{children}</Menu.Label>;
};

DropdownMenu.Separator = function Separator() {
  return <Menu.Separator className="pm-menu__separator" />;
};

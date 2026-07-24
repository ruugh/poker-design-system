import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes, HTMLAttributes } from 'react';
import './table.css';

export type SortDirection = 'ascending' | 'descending' | 'none';

/* Compound table: <Table><Table.Head>…<Table.Row><Table.Cell> */
export function Table({ children, className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="pm-table-wrap">
      <table className={['pm-table', className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </table>
    </div>
  );
}

Table.Head = function Head({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
};

Table.Body = function Body({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
};

interface HeaderProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onClick'> {
  numeric?: boolean;
  sort?: SortDirection;
  onSort?: () => void;
  children: ReactNode;
}
Table.Header = function Header({ numeric, sort, onSort, children, ...rest }: HeaderProps) {
  const cls = ['pm-table__th', numeric && 'pm-table__th--num'].filter(Boolean).join(' ');
  if (!onSort) {
    return (
      <th className={cls} {...rest}>
        {children}
      </th>
    );
  }
  const dir = sort ?? 'none';
  return (
    <th className={cls} aria-sort={dir} {...rest}>
      <button type="button" className="pm-table__sort" aria-sort={dir} onClick={onSort}>
        {children}
        <svg className="pm-table__sort-icon" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d={dir === 'descending' ? 'M3.5 5L6 7.5L8.5 5' : 'M3.5 7L6 4.5L8.5 7'}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={dir === 'none' ? 0.4 : 1}
          />
        </svg>
      </button>
    </th>
  );
};

Table.Row = function Row({
  selected,
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }) {
  const cls = ['pm-table__row', selected && 'pm-table__row--selected', className]
    .filter(Boolean)
    .join(' ');
  return (
    <tr className={cls} aria-selected={selected || undefined} {...rest}>
      {children}
    </tr>
  );
};

interface CellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
  /** colours a numeric amount by sign */
  sign?: 'pos' | 'neg';
}
Table.Cell = function Cell({ numeric, sign, children, className, ...rest }: CellProps) {
  const cls = [
    'pm-table__td',
    numeric && 'pm-table__td--num',
    sign === 'pos' && 'pm-table__td--pos',
    sign === 'neg' && 'pm-table__td--neg',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <td className={cls} {...rest}>
      {children}
    </td>
  );
};

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';
import type { SortDirection } from './Table';
import { Badge } from './Badge';
import { Avatar } from './Avatar';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
};
export default meta;
type Story = StoryObj<typeof Table>;

interface Txn {
  time: string;
  player: string;
  handle: string;
  type: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral' | 'brand';
  amount: number;
  balance: number;
  status: string;
  statusTone: 'success' | 'warning' | 'danger';
}

const rows: Txn[] = [
  { time: 'Jun 18, 20:24', player: 'pokerrrgirl', handle: '#k6uyt', type: 'Withdraw', tone: 'neutral', amount: -50, balance: 1210, status: 'Pending', statusTone: 'warning' },
  { time: 'Jun 18, 20:11', player: 'pokerrrgirl', handle: '#k6uyt', type: 'Deposit', tone: 'success', amount: 200, balance: 1294, status: 'Completed', statusTone: 'success' },
  { time: 'Jun 18, 20:09', player: 'Yanis Macegora', handle: '#fg78t', type: 'Adjustment', tone: 'brand', amount: 40, balance: 1094, status: 'Completed', statusTone: 'success' },
  { time: 'Jun 17, 22:40', player: 'pokerrrwoman', handle: '#h2ozn', type: 'Withdraw', tone: 'neutral', amount: -120, balance: 529, status: 'Failed', statusTone: 'danger' },
];

export const Transactions: Story = {
  render: () => {
    const [sort, setSort] = useState<SortDirection>('descending');
    const [selected, setSelected] = useState(2);
    const sorted = [...rows].sort((a, b) =>
      sort === 'ascending' ? a.amount - b.amount : b.amount - a.amount,
    );
    return (
      <Table aria-label="Transactions">
        <Table.Head>
          <Table.Header>Player</Table.Header>
          <Table.Header>Type</Table.Header>
          <Table.Header
            numeric
            sort={sort}
            onSort={() => setSort(sort === 'ascending' ? 'descending' : 'ascending')}
          >
            Amount, ₵
          </Table.Header>
          <Table.Header numeric>Balance, ₵</Table.Header>
          <Table.Header>Status</Table.Header>
        </Table.Head>
        <Table.Body>
          {sorted.map((r, i) => (
            <Table.Row
              key={r.time}
              selected={i === selected}
              onClick={() => setSelected(i)}
              style={{ cursor: 'pointer' }}
            >
              <Table.Cell>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--gap-inline)' }}>
                  <Avatar name={r.player} size="sm" />
                  <span>
                    {r.player}{' '}
                    <span style={{ color: 'var(--color-text-muted)' }}>{r.handle}</span>
                  </span>
                </span>
              </Table.Cell>
              <Table.Cell>
                <Badge tone={r.tone}>{r.type}</Badge>
              </Table.Cell>
              <Table.Cell numeric sign={r.amount < 0 ? 'neg' : 'pos'}>
                {r.amount > 0 ? '+' : ''}
                {r.amount.toLocaleString('en-US')}
              </Table.Cell>
              <Table.Cell numeric>{r.balance.toLocaleString('en-US')}</Table.Cell>
              <Table.Cell>
                <Badge tone={r.statusTone}>{r.status}</Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  },
};

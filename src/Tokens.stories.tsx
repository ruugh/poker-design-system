import type { Meta, StoryObj } from '@storybook/react';
import tokens from '../dist/tokens.json';

const meta: Meta = { title: 'Foundations/Tokens' };
export default meta;
type Story = StoryObj;

const cell: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '0.8125rem',
  color: 'var(--color-text-primary)',
  padding: 'var(--gap-inline) var(--pad-block)',
  borderBottom: '1px solid var(--color-border-base)',
};
const muted: React.CSSProperties = { ...cell, color: 'var(--color-text-secondary)' };

function Swatch({ varName }: { varName: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '1.25rem',
        height: '1.25rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border-base)',
        background: `var(--color-${varName})`,
        verticalAlign: 'middle',
      }}
    />
  );
}

// Reads the SAME dist/tokens.json the components are built from — the docs can't drift.
export const Semantic: Story = {
  render: () => {
    const entries = Object.entries(tokens.semantic as Record<string, { light: string; dark: string }>);
    return (
      <div className="pm-story">
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
          Semantic colour tokens
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {entries.length} tokens · generated from Figma via Style Dictionary. Toggle the theme in
          the toolbar to see both modes.
        </p>
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '40rem' }}>
          <tbody>
            {entries.map(([name, v]) => (
              <tr key={name}>
                <td style={cell}>
                  <Swatch varName={name} /> <code>--color-{name}</code>
                </td>
                <td style={muted}>{v.light}</td>
                <td style={muted}>{v.dark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};

export const Scale: Story = {
  render: () => (
    <div className="pm-story">
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
        Spacing & radius
      </h2>
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {Object.entries(tokens.scale as Record<string, number>).map(([name, val]) => (
            <tr key={name}>
              <td style={cell}>
                <code>--{name}</code>
              </td>
              <td style={muted}>{val}px</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

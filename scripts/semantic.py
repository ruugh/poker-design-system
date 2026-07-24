"""PM semantic layer: every token is an alias into a primitive ramp, per theme.
Prints the full Light/Dark map and audits every text/UI pair that actually occurs.
"""
import json
from oklch import contrast
from build_ramps import build

R = build()
def p(ref):
    ramp, step = ref.split('-')
    return R[ramp][step]

# name: (light primitive, dark primitive)
SEMANTIC = {
    # elevation ladder — light separates quiet/raised by shadow, dark by lightness
    'surface/sunken':   ('slate-100', 'slate-975'),
    'surface/page':     ('slate-50',  'slate-1000'),
    'surface/base':     ('slate-0',   'slate-950'),
    'surface/quiet':    ('slate-0',   'slate-950'),
    'surface/raised':   ('slate-0',   'slate-900'),
    'surface/hover':    ('slate-50',  'slate-900'),
    'surface/selected': ('teal-50',   'teal-900'),
    'surface/ink':      ('teal-950',  'teal-950'),

    'border/base':      ('slate-200', 'slate-850'),
    'border/strong':    ('slate-300', 'slate-800'),
    # 3:1 against BOTH page and card — slate-500 fails on the tinted page (2.83)
    'border/control':   ('slate-600', 'slate-600'),

    'text/primary':     ('slate-975', 'slate-50'),
    'text/secondary':   ('slate-700', 'slate-400'),
    'text/muted':       ('slate-500', 'slate-600'),
    'text/on-brand':    ('slate-0',   'teal-950'),
    'text/inverse':     ('slate-0',   'slate-975'),

    'brand/base':       ('teal-600',  'teal-500'),
    'brand/ink':        ('teal-700',  'teal-300'),
    'brand/wash':       ('teal-50',   'teal-900'),
    'brand/border':     ('teal-200',  'teal-800'),

    'success/base':     ('jade-600',  'jade-500'),
    'success/ink':      ('jade-700',  'jade-300'),
    'success/wash':     ('jade-50',   'jade-900'),
    'danger/base':      ('rose-600',  'rose-500'),
    'danger/ink':       ('rose-700',  'rose-300'),
    'danger/wash':      ('rose-50',   'rose-900'),
    'warning/base':     ('amber-600', 'amber-500'),
    'warning/ink':      ('amber-700', 'amber-300'),
    'warning/wash':     ('amber-50',  'amber-900'),
    'neutral/ink':      ('slate-700', 'slate-400'),
    'neutral/wash':     ('slate-100', 'slate-900'),

    'focus/ring':       ('teal-600',  'teal-400'),

    'seg/loyal':        ('jade-600',   'jade-500'),
    'seg/active':       ('teal-600',   'teal-500'),
    'seg/sleeping':     ('amber-600',  'amber-500'),
    'seg/pro':          ('violet-600', 'violet-500'),
    'seg/bot':          ('rose-600',   'rose-500'),
    'seg/newbie':       ('azure-600',  'azure-500'),
    'seg/loyal-wash':   ('jade-50',    'jade-900'),
    'seg/pro-wash':     ('violet-50',  'violet-900'),
    'seg/sleeping-wash':('amber-50',   'amber-900'),

    'nav/bg':           ('teal-950',  'teal-950'),
    'nav/hover':        ('teal-900',  'teal-900'),
    'nav/active':       ('teal-600',  'teal-600'),
    'nav/text':         ('teal-200',  'teal-200'),
    'nav/text-active':  ('slate-0',   'slate-0'),
    'nav/brand':        ('teal-300',  'teal-300'),
    'nav/border':       ('teal-900',  'teal-900'),

    'ink/on-teal':      ('slate-0',   'teal-950'),
    'ink/on-teal-soft': ('teal-100',  'teal-900'),  # LARGE TEXT ONLY — see note below
    'ink/on-ink':       ('slate-0',   'slate-0'),
    'ink/on-ink-soft':  ('teal-200',  'teal-200'),
    'chart/line':       ('teal-300',  'teal-300'),
    'overlay/scrim':    ('slate-1000','slate-1000'),
}

def val(token, theme):
    return p(SEMANTIC[token][0 if theme == 'L' else 1])

# (fg token, bg token, px | 'ui', label)
PAIRS = [
    ('text/primary',   'surface/base',   14, 'body on card'),
    ('text/primary',   'surface/page',   14, 'body on page'),
    ('text/primary',   'surface/quiet',  14, 'body on quiet card'),
    ('text/primary',   'surface/raised', 14, 'body on raised card'),
    ('text/primary',   'surface/sunken', 14, 'body on sunken strip'),
    ('text/primary',   'surface/selected',14,'body on selected row'),
    ('text/secondary', 'surface/base',   14, 'secondary on card'),
    ('text/secondary', 'surface/page',   14, 'secondary on page'),
    ('text/secondary', 'surface/sunken', 14, 'secondary on sunken'),
    ('text/secondary', 'surface/raised', 14, 'secondary on raised'),
    ('text/secondary', 'surface/quiet',  11, 'overline 11 on quiet'),
    ('text/muted',     'surface/base',  'ui','disabled/icon on card'),
    ('brand/ink',      'surface/base',   14, 'link on card'),
    ('brand/ink',      'brand/wash',     12, 'brand tag text'),
    ('brand/base',     'surface/base',  'ui','brand icon on card'),
    ('text/on-brand',  'brand/base',     14, 'button label on brand'),
    ('success/ink',    'surface/base',   14, 'positive amount'),
    ('success/ink',    'success/wash',   12, 'success tag text'),
    ('danger/ink',     'surface/base',   14, 'negative amount'),
    ('danger/ink',     'danger/wash',    12, 'danger tag text'),
    ('warning/ink',    'surface/base',   14, 'warning text'),
    ('warning/ink',    'warning/wash',   12, 'warning tag text'),
    ('neutral/ink',    'neutral/wash',   12, 'neutral tag text'),
    ('border/control', 'surface/base',  'ui','input border on card'),
    ('border/control', 'surface/page',  'ui','input border on page'),
    ('focus/ring',     'surface/base',  'ui','focus ring on card'),
    ('focus/ring',     'surface/page',  'ui','focus ring on page'),
    ('nav/text',       'nav/bg',         14, 'sidebar item'),
    ('nav/text-active','nav/active',     14, 'sidebar active item'),
    ('nav/brand',      'nav/bg',         14, 'sidebar logo'),
    ('ink/on-ink',     'surface/ink',    14, 'hero metric'),
    ('ink/on-ink-soft','surface/ink',    12, 'hero caption'),
    ('chart/line',     'surface/ink',   'ui','hero sparkline'),
    ('ink/on-teal',    'brand/base',     14, 'teal panel text'),
    ('ink/on-teal-soft','brand/base',    24, 'teal panel caption (large only)'),
    ('seg/loyal',      'surface/base',  'ui','segment loyal dot'),
    ('seg/active',     'surface/base',  'ui','segment active dot'),
    ('seg/sleeping',   'surface/base',  'ui','segment sleeping dot'),
    ('seg/pro',        'surface/base',  'ui','segment pro dot'),
    ('seg/bot',        'surface/base',  'ui','segment bot dot'),
    ('seg/newbie',     'surface/base',  'ui','segment newbie dot'),
    ('text/primary',   'seg/loyal-wash', 12, 'text on loyal wash'),
    ('text/primary',   'seg/pro-wash',   12, 'text on pro wash'),
    ('text/primary',   'brand/wash',     12, 'text on brand wash'),
]

if __name__ == '__main__':
    print(f"{'token':20} {'Light':9} {'Dark':9}  primitives")
    print('-' * 72)
    for t, (lp, dp) in SEMANTIC.items():
        print(f'{t:20} {p(lp)}   {p(dp)}   {lp} / {dp}')

    fails = 0
    for theme, tname in (('L', 'LIGHT'), ('D', 'DARK')):
        print(f'\n=== {tname} ===')
        print(f"{'pair':26} {'fg':9} {'bg':9} {'ratio':>6} {'need':>5}  verdict")
        print('-' * 72)
        for fg, bg, size, label in PAIRS:
            f, b = val(fg, theme), val(bg, theme)
            ratio = contrast(f, b)
            need = 3.0 if size == 'ui' else (3.0 if isinstance(size, int) and size >= 24 else 4.5)
            ok = ratio >= need
            fails += 0 if ok else 1
            print(f'{label:26} {f} {b} {ratio:6.2f} {need:5.1f}  {"PASS" if ok else "FAIL <<<"}')
    print(f'\nTOTAL FAILS: {fails}')
    with open('semantic.json', 'w') as fh:
        json.dump({t: {'light': p(l), 'dark': p(d), 'ref': [l, d]}
                   for t, (l, d) in SEMANTIC.items()}, fh, indent=2)

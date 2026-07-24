"""Generate PM primitive ramps in OKLCH with perceptually even lightness steps."""
import json
from oklch import oklch_to_hex, hex_to_oklch, contrast

# Neutral ramp needs extra dark steps: dark-theme elevation lives in a narrow band.
SLATE_L = {
    0: 1.000, 50: 0.975, 100: 0.945, 200: 0.895, 300: 0.830, 400: 0.755,
    500: 0.665, 600: 0.585, 700: 0.485, 800: 0.395, 850: 0.355,
    900: 0.310, 950: 0.265, 975: 0.230, 1000: 0.175,
}
# Chroma rises slightly toward the dark end — keeps dark surfaces from going flat grey.
SLATE_C = {
    0: 0.000, 50: 0.003, 100: 0.005, 200: 0.008, 300: 0.010, 400: 0.013,
    500: 0.015, 600: 0.016, 700: 0.017, 800: 0.018, 850: 0.018,
    900: 0.018, 950: 0.017, 975: 0.014, 1000: 0.012,
}

COLOR_L = {50: 0.965, 100: 0.930, 200: 0.875, 300: 0.800, 400: 0.720,
           500: 0.665, 600: 0.555, 700: 0.470, 800: 0.390, 900: 0.310, 950: 0.240}

# hue + peak chroma per ramp; chroma follows a bell centred on 500-600
HUES = {
    'teal':   (220.3, 0.110),   # brand — anchored so teal-600 == #00809C
    'jade':   (175.0, 0.130),   # success
    'rose':   ( 22.0, 0.190),   # danger + bot segment
    'amber':  ( 73.0, 0.160),   # warning + sleeping segment
    'violet': (285.0, 0.190),   # pro segment
    'azure':  (245.0, 0.140),   # newbie segment
}
CHROMA_SHAPE = {50: 0.14, 100: 0.28, 200: 0.48, 300: 0.68, 400: 0.86,
                500: 0.97, 600: 1.00, 700: 0.88, 800: 0.74, 900: 0.58, 950: 0.44}


def build():
    ramps = {}
    ramps['slate'] = {str(k): oklch_to_hex(SLATE_L[k], SLATE_C[k], 250.0) for k in SLATE_L}
    for name, (hue, peak) in HUES.items():
        ramps[name] = {str(k): oklch_to_hex(COLOR_L[k], peak * CHROMA_SHAPE[k], hue)
                       for k in COLOR_L}
    return ramps


if __name__ == '__main__':
    ramps = build()
    for name, steps in ramps.items():
        print(f'\n{name}')
        for k, v in steps.items():
            L, C, H = hex_to_oklch(v)
            on_white = contrast(v, '#ffffff')
            on_dark = contrast(v, ramps['slate']['975'])
            print(f'  {name}-{k:<4} {v}  L{L:.3f} C{C:.3f}  onWhite {on_white:5.2f}  onDark {on_dark:5.2f}')
    with open('ramps.json', 'w') as f:
        json.dump(ramps, f, indent=2)
    print('\nanchor check: teal-600 =', ramps['teal']['600'], '(target #00809c)')

"""Extract the supplied QL2 reference pixels; never redraw badge artwork.

Usage: python3 scripts/assets/extract_rank_badges.py /path/to/QL2_HuyHieu_AnhThamChieu
Requires Pillow and NumPy. Outputs 24 RGBA PNGs and their display registry.
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(sys.argv[1])
OUTPUT = ROOT / 'public/assets/rank-badges'
SIZE = 224
MARGIN = 8

# Windows exclude labels and grid lines; the pixel-derived silhouette determines
# the actual crop, including the outer rim. Coordinates refer to full-size sources.
GROUPS = [
    ('01_Hoc_Vien', [('academy', 'hoc-vien', None)]),
    ('02_Binh_Bet', [('enlisted_1', 'binh-bet', None)]),
    ('03_Binh_Nhi', [('enlisted_2', 'binh-nhi', None)]),
    ('04_Binh_Nhat', [('enlisted_3', 'binh-nhat', None)]),
    ('05_Ha_Si', [('nco_1', 'ha-si', None)]),
    ('06_Trung_Si', [('nco_2', 'trung-si', None)]),
    ('07_Thuong_Si', [('nco_3', 'thuong-si', None)]),
    ('08_Cap_Uy', [
        ('junior_1', 'thieu-uy', (10, 320, 370, 665)),
        ('junior_2', 'trung-uy', (370, 320, 720, 665)),
        ('junior_3', 'thuong-uy', (720, 320, 1070, 665)),
        ('junior_4', 'dai-uy', (1070, 320, 1430, 665)),
    ]),
    ('09_Cap_Ta', [
        ('field_1', 'thieu-ta', (10, 280, 360, 680)),
        ('field_2', 'trung-ta', (370, 280, 720, 680)),
        ('field_3', 'thuong-ta', (730, 280, 1080, 680)),
        ('field_4', 'dai-ta', (1090, 280, 1440, 680)),
    ]),
    ('10_Cap_Tuong', [
        ('general_1', 'thieu-tuong', (70, 45, 555, 500)),
        ('general_2', 'trung-tuong', (700, 45, 1180, 500)),
        ('general_3', 'thuong-tuong', (70, 665, 555, 1120)),
        ('general_4', 'dai-tuong', (700, 665, 1180, 1120)),
    ]),
    ('11_Cap_Thong_Soai', [
        ('endgame_1', 'thong-soai', (65, 35, 590, 520)),
        ('endgame_grand_marshal', 'dai-thong-soai', (660, 35, 1185, 520)),
        ('endgame_2', 'nguyen-soai', (65, 630, 590, 1115)),
        ('endgame_3', 'dai-nguyen-soai', (660, 630, 1185, 1115)),
    ]),
    ('12_Tong_Tu_Lenh', [('endgame_4', 'tong-tu-lenh', (35, 15, 1215, 1195))]),
]


def convex_silhouette(mask):
    """Trace the source's convex outer rim, retaining every enclosed RGB pixel.

    All supplied board badges have convex outlines. Using row extrema avoids
    interior color thresholds ever erasing black, white, metallic or leaf detail.
    No side count, symmetry or legacy geometry is imposed on the source.
    """
    points = []
    for y, row in enumerate(mask):
        xs = np.flatnonzero(row)
        if xs.size:
            points.extend([(int(xs[0]), y), (int(xs[-1]), y)])
    points = sorted(set(points))
    if len(points) < 3:
        raise ValueError('No source silhouette found')

    def cross(o, a, b):
        return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])

    lower, upper = [], []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    # Subpixel coverage at the traced edge; original RGB remains untouched.
    alpha = Image.new('L', (mask.shape[1]*4, mask.shape[0]*4))
    ImageDraw.Draw(alpha).polygon([(x*4+2, y*4+2) for x,y in lower[:-1]+upper[:-1]], fill=255)
    return alpha.resize((mask.shape[1], mask.shape[0]), Image.Resampling.LANCZOS)


OUTPUT.mkdir(parents=True, exist_ok=True)
entries = []
for source_name, badges in GROUPS:
    original = Image.open(SOURCE / f'REF_{source_name}.png').convert('RGBA')
    for family, filename, window in badges:
        art = original.crop(window) if window else original.copy()
        if window:
            rgb = np.array(art)[:, :, :3].astype(int)
            if source_name.startswith('08'):
                # Cream backdrop, white rim with a fine gray outer edge.
                rim = (rgb.min(axis=2) < 210) | (rgb.min(axis=2) > 249)
            elif source_name.startswith('10'):
                # Keep the light gray outer keyline around the white rim.
                rim = rgb.min(axis=2) < 228
            elif source_name.startswith('09'):
                rim = rgb.min(axis=2) < 200
            else:
                # Gold outer rim against neutral cream; enclosed blacks survive.
                rim = (rgb.max(axis=2)-rgb.min(axis=2) > 45) & (rgb[:, :, 2] < 190)
            art.putalpha(convex_silhouette(rim))
        # Standalone square sources already end at their thin dark outer rim;
        # retain that rim and preserve the academy source's existing alpha.
        art = art.crop(art.getbbox())
        art.thumbnail((SIZE-2*MARGIN, SIZE-2*MARGIN), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (SIZE, SIZE))
        canvas.paste(art, ((SIZE-art.width)//2, (SIZE-art.height)//2))
        canvas.save(OUTPUT / f'{filename}.png', optimize=True)
        visible = canvas.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
        width = visible[2]-visible[0]
        entries.append(f'  badge_{family}: {{ src: "/assets/rank-badges/{filename}.png", outerWidthRatio: {width} / {SIZE} }},')
        print(f'{family}: {filename}.png, visible width {width}/{SIZE}')

registry = '''// Generated from the supplied reference pixels by scripts/assets/extract_rank_badges.py.
// One artwork per existing badge ID; URLs and visible bounds never enter save data.
export const RANK_BADGE_ASSETS = {
''' + '\n'.join(entries) + '''
} as const;

export type RankBadgeAssetId = keyof typeof RANK_BADGE_ASSETS;

export const getRankBadgeAsset = (badgeId: string | undefined) =>
  badgeId && Object.prototype.hasOwnProperty.call(RANK_BADGE_ASSETS, badgeId)
    ? RANK_BADGE_ASSETS[badgeId as RankBadgeAssetId]
    : undefined;

// Unknown badges use a neutral square placeholder with the same safe margin.
export const DEFAULT_RANK_BADGE_OUTER_WIDTH_RATIO = 208 / 224;
'''
(ROOT / 'src/game/rankBadgeAssets.ts').write_text(registry)

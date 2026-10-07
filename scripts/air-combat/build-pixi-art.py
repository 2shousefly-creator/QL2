"""Pack generated raster material into versioned, deterministic Pixi atlas pages.

Pixel preparation only. No gameplay is executed. Generation is never done in CI.
"""
from pathlib import Path
from collections import defaultdict
import json, math
import runpy
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art/khong-kich/26.25.0'
OUT = ROOT / 'public/assets/khong-kich/26.25.0'
REGISTRY = ROOT / 'src/assets/khong-kich/26.25.0/registry.json'
INPUT = json.loads((ART/'art-inputs.json').read_text(encoding='utf-8'))
bindings_module=runpy.run_path(str(ROOT/'scripts/air-combat/pixi-art-bindings.py'))
effect_source=bindings_module['effect_source']
frame_key=bindings_module['frame_key']
JOBS = json.loads((ART/'generation-jobs.json').read_text(encoding='utf-8'))
JOBS += json.loads((ART/'extra-generation-jobs.json').read_text(encoding='utf-8'))
for key in INPUT['aircraft']:
    JOBS.append(dict(id=key,group='aircraft',owner=key,output=str(ART/'source-images/aircraft'/f'{key}.png')))

OUT.mkdir(parents=True,exist_ok=True)
(OUT/'portraits').mkdir(exist_ok=True)
REGISTRY.parent.mkdir(parents=True,exist_ok=True)
items, bundles, pages = {}, defaultdict(list), {}
URL = '/assets/khong-kich/26.25.0/'

def partition(image):
    """Seam-aligned sections: the deformation is zero at each shared joint.

    This retains every generated pixel; no missing hidden surfaces are fabricated.
    Rigs bend away from these joints instead of rotating a cut edge into a hole.
    """
    a=np.array(image)
    n=image.width
    left,right=round(n*.375),round(n*.625)
    layers=[]
    for lo,hi in [(left,right),(0,left),(right,n)]:
        b=a.copy();b[:,:lo,3]=0;b[:,hi:,3]=0
        layers.append(Image.fromarray(b))
    light=a.copy()
    rgb=a[:,:,:3].astype(float)/255
    maximum=rgb.max(axis=2);minimum=rgb.min(axis=2)
    # Isolate painted luminous/color highlights; no procedural shapes are drawn.
    luminous=np.clip((maximum-.55)*2.0,0,1)*np.clip((maximum-minimum)*2.4+.12,0,1)
    light[:,:,3]=(a[:,:,3]*luminous*.75).astype('uint8')
    return layers+[Image.fromarray(light)]

for job in JOBS:
    key,group=job['id'],job['group']
    source=Path(job['output'])
    if not source.is_absolute(): source=ROOT/source
    if not source.exists(): raise SystemExit(f'Artwork not generated: {key} ({source})')
    image=Image.open(source).convert('RGBA')
    box=image.getchannel('A').getbbox()
    if not box: raise SystemExit(f'No painted pixels: {key}')
    n=384 if group=='bosses' else 256 if group=='aircraft' else 192 if group in ('enemies','skills','helpers') else 128
    # Content-aware alpha crop with explicit padding; never guess AI atlas cells.
    image=image.crop(box)
    image.thumbnail((round(n*.86),round(n*.86)),Image.Resampling.LANCZOS)
    flat=Image.new('RGBA',(n,n));flat.alpha_composite(image,((n-image.width)//2,(n-image.height)//2))
    if group in ('aircraft','skills'):
        thumb=flat.copy();thumb.thumbnail((192,192),Image.Resampling.LANCZOS)
        thumb.save(OUT/'portraits'/f'{key}.png',optimize=True)
    bundle=('aircraft-'+job['owner'] if group in ('aircraft','skills') else
            'stage-'+str(job['stage']) if group in ('bosses','enemies','helpers') else 'shared')
    mode='fluid' if key.startswith(('riptide_','sylva_')) or key in ('shared_smoke','shared_flame','shared_acid_pool') else 'mechanical'
    entry=dict(id=key,kind=group,owner=job.get('owner'),stage=job.get('stage'),bundle=bundle,
               source=str(source.relative_to(ROOT)).replace('\\','/'),size=n,
               bounds=list(flat.getchannel('A').getbbox()),pivot=[.5,.5],mode=mode,
               thumb=URL+'portraits/'+key+'.png' if group in ('aircraft','skills') else None,frames={})
    items[key]=entry
    bundles[bundle].append((key,'flat',flat))
    if group in ('aircraft','bosses','enemies','helpers','skills'):
        for layer,pixels in zip(('core','port','starboard','light'),partition(flat)):
            bundles[bundle].append((key,layer,pixels))

PAD=3
for bundle,tiles in bundles.items():
    # Shelf pack each bundle independently so other stages/owners are not loaded.
    batch=[];x=y=row=0;usedWidth=0;number=0
    def save_page():
        global batch,x,y,row,usedWidth,number
        if not batch:return
        name=f'{bundle}-{number}.png';width=usedWidth;height=y+row
        page=Image.new('RGBA',(width,height))
        for key,layer,pixels,px,py in batch:
            page.alpha_composite(pixels,(px,py))
            # Alpha-preserving edge extrusion inside the reserved margin.
            w,h=pixels.size
            for k in range(1,PAD+1):
                page.paste(pixels.crop((0,0,1,h)),(px-k,py))
                page.paste(pixels.crop((w-1,0,w,h)),(px+w-1+k,py))
                page.paste(pixels.crop((0,0,w,1)),(px,py-k))
                page.paste(pixels.crop((0,h-1,w,h)),(px,py+h-1+k))
            items[key]['frames'][layer]=dict(page=name,rect=[px,py,w,h],orig=[w,h],trim=[0,0,w,h])
        page.save(OUT/name,optimize=True)
        pages[name]=dict(url=URL+name,width=width,height=height,bundle=bundle)
        number+=1;batch=[];x=y=row=usedWidth=0
    for key,layer,pixels in tiles:
        w,h=pixels.size;tw,th=w+PAD*2,h+PAD*2
        if x+tw>2048:x=0;y+=row;row=0
        if y+th>2048:save_page()
        batch.append((key,layer,pixels,x+PAD,y+PAD));x+=tw;row=max(row,th);usedWidth=max(usedWidth,x)
    save_page()

registry=dict(version='26.25.0',alpha='straight',padding=PAD,pages=pages,items=items)
REGISTRY.write_text(json.dumps(registry,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
effect_bindings={key:effect_source(key) for key in INPUT['vfx'] if effect_source(key)}
frame_bindings={frame_key(INPUT['vfx'][key]):target for key,target in effect_bindings.items()}
for group in ('stage2','stage3','stage4'):
    for key,frame in INPUT[group].items():
        if key!='boss':frame_bindings[frame_key(frame)]=key
for key,frame in INPUT['helpers'].items():frame_bindings[frame_key(frame)]=key
for i,frame in enumerate(INPUT['bossFrames']):
    frame_bindings[frame_key(frame)]=['leviathan','tempest_crown','stormbreaker_omega','parallax_zero'][i]
# All phase rectangles share a subject, with their state expressed by the rig.
for atlas,boss in [('stage3Boss','stormbreaker_omega'),('stage4Boss','parallax_zero')]:
    for i in range(4):frame_bindings[frame_key(dict(atlas=atlas,rect=[i%2/2,i//2/2,.5,.5]))]=boss
(REGISTRY.parent/'frame-bindings.json').write_text(json.dumps(dict(effects=effect_bindings,frames=frame_bindings),separators=(',',':'))+'\n',encoding='utf-8')
print(f'Packed {len(items)} generated subjects into {len(pages)} versioned pages; wrote registry and portraits.')

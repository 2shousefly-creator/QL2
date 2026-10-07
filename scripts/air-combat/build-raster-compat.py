"""Author compatibility PNG atlases from generated pixels and existing exact UV definitions.

These pages replace legacy SVG art for remaining Canvas/specialized consumers.
No vector drawing or SVG rasterization is involved.
"""
from pathlib import Path
import json,re,os,runpy
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'art/khong-kich/26.25.0'
OUT=ROOT/'src/assets/khong-kich/26.25.0/compat';OUT.mkdir(parents=True,exist_ok=True)
INPUT=json.loads((ART/'art-inputs.json').read_text(encoding='utf-8'))
registry=json.loads((ROOT/'src/assets/khong-kich/26.25.0/registry.json').read_text(encoding='utf-8'))
effect_source=runpy.run_path(str(ROOT/'scripts/air-combat/pixi-art-bindings.py'))['effect_source']
flat={}
def tile(key):
 if key not in flat:
  frame=registry['items'][key]['frames']['flat'];x,y,w,h=frame['rect']
  flat[key]=Image.open(ROOT/'public/assets/khong-kich/26.25.0'/frame['page']).crop((x,y,x+w,y+h))
 return flat[key]
atlases={
 'astra/effects.svg':'astraEffects','astra/combat-vfx.svg':'astraVfx',
 'v2/player-basic-ammo-atlas.svg':'basicAmmo','v2/hardcore-ammo-atlas.svg':'ammo',
 'v2/ranked-skill-vfx-atlas.svg':'rankedVfx','v2/ranked-skill-projectiles.svg':'rankedProjectiles',
 'v2/ultimate-vfx-atlas.svg':'ultimateVfx','stage2/stage2-elite-atlas.svg':'stage2Elite',
}
singles={'v2/phantom-firing-beam.svg':'focus_laser','v2/healing-cross.svg':'shared_heal',
 'v2/bigbang-missile.svg':'heavy_bomb','v2/missile-engine-flame.svg':'shared_flame'}
replacements={}
for file,atlas in atlases.items():
 source=ROOT/'src/assets/khong-kich'/file
 view=re.search(r'viewBox="([^"]+)"',source.read_text(encoding='utf-8'))
 size=tuple(int(float(v)) for v in view[1].split()[2:])
 page=Image.new('RGBA',size)
 frames={k:f for k,f in INPUT['vfx'].items() if f['atlas']==atlas}
 if atlas=='stage2Elite':frames.update({k:f for k,f in INPUT['stage2'].items() if f['atlas']==atlas})
 for key,f in frames.items():
  target=key if key in registry['items'] else effect_source(key)
  if not target:continue
  x,y,w,h=f['rect'];box=(round(x*size[0]),round(y*size[1]),round(w*size[0]),round(h*size[1]))
  page.alpha_composite(tile(target).resize(box[2:],Image.Resampling.LANCZOS),box[:2])
 name=file.replace('/','-').replace('.svg','.png');page.save(OUT/name,optimize=True);replacements[source.resolve()]=OUT/name
for file,key in singles.items():
 source=ROOT/'src/assets/khong-kich'/file
 name=file.replace('/','-').replace('.svg','.png');tile(key).save(OUT/name,optimize=True);replacements[source.resolve()]=OUT/name
# Emissive decorations reuse each enemy's painted light map in the exact 4x4 cells.
source=ROOT/'src/assets/khong-kich/stage3/stage3-emissive-atlas.svg';page=Image.new('RGBA',(1024,1024))
for key,f in INPUT['stage3'].items():
 if key=='boss' or f['atlas']!='stage3Enemy':continue
 frame=registry['items'][key]['frames']['light'];x,y,w,h=frame['rect']
 image=Image.open(ROOT/'public/assets/khong-kich/26.25.0'/frame['page']).crop((x,y,x+w,y+h)).resize((256,256))
 u,v,_,_=f['rect'];page.alpha_composite(image,(round(u*1024),round(v*1024)))
name='stage3-stage3-emissive-atlas.png';page.save(OUT/name,optimize=True);replacements[source.resolve()]=OUT/name
# Retain the 40 equipment families and all eight temporal cells. Their already
# painted individual equipment icons supply identity; generated material supplies motion.
source=ROOT/'src/assets/khong-kich/v2/equipment-vfx.svg'
page=Image.new('RGBA',(512,2560))
icons=Image.open(ROOT/'src/assets/khong-kich/v2/equipment-icons.png').convert('RGBA')
for family in range(40):
 index=family+8 if family<36 else 80 if family==36 else 4 if family==37 else 2 if family==38 else 11
 ix,iy=index%9,index//9
 motif=icons.crop((round(ix*icons.width/9),round(iy*icons.height/9),round((ix+1)*icons.width/9),round((iy+1)*icons.height/9)))
 for frame in range(8):
  t=frame/7;size=round(25+29*min(1,t*3));cell=Image.new('RGBA',(64,64))
  glow=tile('shared_spark' if family==12 else 'shared_wave').resize((64,64));glow.putalpha(glow.getchannel('A').point(lambda a:round(a*.24*(1-t*.55))))
  cell.alpha_composite(glow)
  sprite=motif.resize((size,size),Image.Resampling.LANCZOS);sprite.putalpha(sprite.getchannel('A').point(lambda a:round(a*(1-t*.64))))
  cell.alpha_composite(sprite,((64-size)//2,(64-size)//2));page.alpha_composite(cell,(frame*64,family*64))
name='v2-equipment-vfx.png';page.save(OUT/name,optimize=True);replacements[source.resolve()]=OUT/name
for path in (ROOT/'src/features/entertainment/khong_kich').rglob('*'):
 if path.suffix not in ('.ts','.tsx') or '.test.' in path.name:continue
 text=path.read_text(encoding='utf-8');original=text
 def replace(match):
  target=(path.parent/match[2]).resolve()
  return match[1]+os.path.relpath(replacements[target],path.parent).replace('\\','/')+match[1] if target in replacements else match[0]
 text=re.sub(r'''(["'])([^"']+\.svg)\1''',replace,text)
 if text!=original:path.write_text(text,encoding='utf-8')
print(f'Authored {len(replacements)} compatibility raster pages.')

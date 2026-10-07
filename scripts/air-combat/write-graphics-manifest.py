"""Author the release inventory from packed art and the existing rank definitions."""
from pathlib import Path
import json,re

ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'art/khong-kich/26.25.0'
FEATURE=ROOT/'src/features/entertainment/khong_kich'
registry=json.loads((ROOT/'src/assets/khong-kich/26.25.0/registry.json').read_text(encoding='utf-8'))
inputs=json.loads((ART/'art-inputs.json').read_text(encoding='utf-8'))
bindings=json.loads((ROOT/'src/assets/khong-kich/26.25.0/frame-bindings.json').read_text(encoding='utf-8'))
jobs=[]
for name in ('generation-jobs.json','extra-generation-jobs.json'):
    path=ART/name
    data=json.loads(path.read_text(encoding='utf-8'))
    for item in data:
        for field in ('output','reference'):
            if field in item:
                value=Path(item[field])
                if value.is_absolute():item[field]=value.relative_to(ROOT).as_posix()
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    jobs.extend(data)
job_by_id={j['id']:j for j in jobs}
renderer='src/features/entertainment/khong_kich/pixi/AirCombatPixiRenderer.ts'
canvas='src/features/entertainment/khong_kich/AirCombatLegacyRenderer.ts'
sources=[]
for id,item in registry['items'].items():
    rig='core' in item['frames']
    sources.append(dict(gameplayId=id,kind=item['kind'],owner=item['owner'],stage=item['stage'],
        sourceAsset=item['source'],generationTool='built-in image_gen',
        reference=job_by_id.get(id,{}).get('reference','generation-prompts.md#aircraft'),
        runtimeFrames=item['frames'],runtimeAssets=list(dict.fromkeys('public'+registry['pages'][f['page']]['url'] for f in item['frames'].values())),
        rig='pixi/GeneratedRigPool.ts: core/port/starboard MeshPlane + emissive Sprite' if rig else None,
        animations=['keyframe envelope','joint-constrained mesh deformation','charge/recoil/hit presentation','pooled termination'] if rig else ['existing projectile/effect trajectory and lifetime'],
        icon=item['thumb'],thumbnail=item['thumb'] or 'GeneratedThumbnail.tsx: flat frame',
        effectBindings=[key for key,value in bindings['effects'].items() if value==id],
        integratedAt=[renderer,canvas]+(['AircraftPreview.tsx','AircraftGlyph.tsx'] if item['kind']=='aircraft' else ['SkillIcon.tsx'] if item['kind']=='skills' else []),
        fallback='Same generated flat raster in Canvas and reduced-detail presentation; same runtime positions/lifetimes'))

named={}
for owner in ('argent','sylva','terra'):
    text=(FEATURE/f'airCombat{owner.title()}Art.ts').read_text(encoding='utf-8')
    if owner=='argent':
        mapping=re.search(r'ARGENT_UPGRADE_ICONS=\{(.*?)\} as const',text,re.S)[1]
        cells=re.search(r'ARGENT_ICON_CELLS=\{(.*?)\} as const',text,re.S)[1]
        icon_cells={k:[int(x),int(y)] for k,x,y in re.findall(r'(\w+):\[(\d+),(\d+)\]',cells)}
        for skill,values in re.findall(r'(\w+):\[([^\]]+)\]',mapping):
            named[skill]=[(name,icon_cells[name]) for name in re.findall(r"'([^']+)'",values)]
    else:
        cell=5 if owner=='sylva' else 1
        for index,skill in enumerate(inputs['aircraft'][owner]['skillIds']):
            named[skill]=[]
            for rank in range(1,4 if index==3 else 6):
                if owner=='sylva' and rank==1:pos=[index+1,0]
                else:pos=[cell%5,cell//5];cell+=1
                named[skill].append((skill if rank==1 else f'{skill}_r{rank}',pos))

upgrades=[]
for owner,aircraft in inputs['aircraft'].items():
    for index,skill in enumerate(aircraft['skillIds']):
        for rank in inputs['ranks'][skill][1:]:
            number=rank['rank']
            if owner in ('argent','sylva','terra'):
                icon,cell=named[skill][number-1]
                file=f'src/assets/khong-kich/{owner}/icons.png';grid=[5,4]
                if icon in ('argent_myriad','argent_array_return'):
                    file='src/assets/khong-kich/argent/'+('myriad' if icon=='argent_myriad' else 'array-return')+'-26-22-2.png';cell=[0,0];grid=[1,1]
            else:
                icon=f'{skill}_r{number}';offset=index*4+number-2
                file=f'src/assets/khong-kich/upgrades/{dict(black_eagle="viper",breaker="titan").get(owner,owner)}.png';cell=[offset%4,offset//4];grid=[4,4]
            upgrades.append(dict(gameplayId=skill,owner=owner,rank=number,name=rank['name'],iconId=icon,asset=file,cell=cell,grid=grid,
                status='Retained individual rank illustration',integratedAt='SkillUpgradeIcon.tsx',runtimeArt=skill,
                animation='Existing rank-specific entities and state painters use generated primary frames; no new hit events'))

passive_ids=['viper_follow_up','titan_alloy_rounds','phantom_backup_battery','astra_stellar_mark','cinder_thermal_round','riptide_afterwash','argent_blade_genesis','sylva_acid_rounds','terra_geopressure_core']
owners=['black_eagle','breaker','phantom','astra','cinder','riptide','argent','sylva','terra']
passives=[]
for i,(owner,id) in enumerate(zip(owners,passive_ids)):
    file='src/assets/khong-kich/v2/aircraft-skills-lowpoly.png' if i<5 else f'src/assets/khong-kich/{owner}/icons.png'
    ammo=dict(black_eagle='viper',breaker='titan').get(owner,owner)+'_basic_ammo'
    passives.append(dict(gameplayId=id,owner=owner,icon=file,cell=[0,i] if i<5 else [0,0],
        grid=[5,5] if i<5 else [3,2] if owner=='riptide' else [5,4],generatedAmmunition=ammo,
        sharedEffects=['shared_muzzle','shared_trail','shared_impact'],
        integratedAt=['SkillIcon.tsx',renderer,canvas],fallback='Retained passive identity icon; generated flat projectile/feedback'))

manifest=dict(schemaVersion=2,targetRelease='26.25.0',createdAt='2026-10-08',baseCommit='2aaef5a156faa107b2dc563fa2dd0f78657007a6',
    technology=dict(renderer='pixi.js 8.20.0',animation='Layered generated raster, keyframe envelopes, constrained meshes, local shader, existing particle pools',editorRequired=False),
    counts=dict(generatedSources=len(sources),aircraft=9,activeSkills=36,passives=len(passives),upgradeIllustrations=len(upgrades),enemyTypes=58,stageBosses=4,helpers=2,atlasPages=len(registry['pages'])),
    registry='src/assets/khong-kich/26.25.0/registry.json',sources=sources,passives=passives,upgrades=upgrades,
    states=dict(authority='CombatWorld entities, active effects, existing timers and visual events; no animation callbacks deal damage',
                ownership='Independent renderer/pools per player, Solo opponent and stage-4 mirror',
                visibility='Manual renderer delta; no ticker; hidden-tab return; destruction stops caster mechanisms',
                graphics='low/medium/high in pause menu; reduced-motion disables decorative deformation; Canvas uses generated flat art'),
    preserved=['gameplay and rank values','hitboxes and target points','save schemas and keys','126 individual upgrade illustrations','specialized raster strips and technical warning geometry'],
    authoring=['prepare-generated-art.py','build-pixi-art.py','build-raster-compat.py','write-graphics-manifest.py'],
    validationPolicy='Only npm run build:web. No tests, QA, simulations, browser checks or benchmarks.')
(ART/'graphics-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Wrote production graphics inventory and portable generation metadata.')

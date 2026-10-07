"""Authoring: crop existing reference frames and describe individual generation jobs."""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art/khong-kich/26.25.0'
data = json.loads((ART / 'art-inputs.json').read_text(encoding='utf-8'))
refs = ART / 'references'
refs.mkdir(exist_ok=True)
jobs = []
atlases = {
    'aircraft': 'v2/aircraft-atlas.png', 'fortress': 'v2/fortress-clouds-atlas.png',
    'stage2Enemy': 'stage2/stage2-enemy-atlas.png',
    'stage3Enemy': 'stage3/stage3-enemy-atlas.png', 'stage3Boss': 'stage3/stage3-boss-atlas.png',
    'stage4Enemy': 'stage4/stage4-enemy-atlas.png', 'stage4Boss': 'stage4/stage4-boss-atlas.png',
}
style = (' Production painted raster game sprite with layered material depth, strong readable silhouette, '
         'overhead camera, nose oriented UP. One complete subject only, centered in a square canvas with '
         '12 percent transparent margin beyond every tip. True transparent RGBA background. '
         'No text, symbols used as labels, numbers, UI, watermark, scenery, ground, shadow plane, grid, '
         'checkerboard, geometric vector placeholder or blur. Restrained emissive details, no huge halo. '
         'Preserve palette and faction from the reference while upgrading design and dimensional detail.')
palettes = {1:'crimson armor and charcoal steel, amber engines',2:'teal magnetic alloy, violet and gold electromagnetic cores',
            3:'navy blue heavy alloy, gold electrical coils and blue lightning cores',4:'dark violet alloy, magenta cyan refractive crystal facets'}
def crop_ref(key, frame):
    atlas = frame['atlas']
    if atlas not in atlases:
        return crop_ref(key, data['stage2']['arc_reaver'])
    img = Image.open(ROOT / 'src/assets/khong-kich' / atlases[atlas])
    x,y,w,h = frame['rect']
    region = img.crop((round(x*img.width),round(y*img.height),round((x+w)*img.width),round((y+h)*img.height)))
    path = refs / (key + '.png')
    region.save(path)
    return str(path)
def job(key, group, brief, reference, owner=None, stage=None):
    output = ART / 'source-images' / group / (key+'.png')
    output.parent.mkdir(parents=True,exist_ok=True)
    jobs.append(dict(id=key,group=group,owner=owner,stage=stage,reference=reference,
                     output=str(output),prompt='Use case: stylized-concept. '+brief+style))
for key, config in data['enemies'].items():
    if key == 'boss': continue
    stage = 4 if key in data['stage4'] else 3 if key in data['stage3'] else 2 if key in data['stage2'] else 1
    frame = data['enemyFrames'][key]
    role = key.replace('_',' ')
    job(key,'enemies',f'Enemy unit {role}, called {config["name"]}. Faction: {palettes[stage]}. '
        f'Its equipment must visually express its specific role: {role}. This is a distinct design, '
        'not a recolor of another enemy. Mechanical armor, role-specific weapons, readable engine sockets. ',crop_ref(key,frame),stage=stage)
bosses=['leviathan','tempest_crown','stormbreaker_omega','parallax_zero']
briefs=['wide armored flying fortress, layered wing armor, four articulated artillery batteries, missile bay doors and central reactor',
        'magnetic crown reactor surrounded by articulated floating vanes, concentric alloy crown mechanisms and satellite emitter mounts',
        'heavy electrical fortress with thick armor panels, openable core shutters, large electrical coils and lightning emitter cannons',
        'refractive crystal machine with a central void core, segmented crystalline armor shell, floating mirror vanes and fracture seams']
for i,key in enumerate(bosses):
    job(key,'bosses',f'Principal boss {key.replace("_"," ")}: {briefs[i]}. {palettes[i+1]}. '
        'Strong asymmetric surface details on a coherent balanced silhouette, visible overlapping joints for articulated animation. ',
        crop_ref(key,data['bossFrames'][i]),stage=i+1)
for key,frame in data['helpers'].items():
    job(key,'helpers',f'Isolated {key.replace("_"," ")} enemy support mechanism, complete mechanical body and luminous core. ',crop_ref(key,frame),stage=2 if key.startswith('tempest') else 4)

subjects={
 'decoy':'tactical blue steel decoy flare pod with opening armored petals and a hot luminous decoy core',
 'afterburner':'paired blue tactical machinegun deployment mechanism with sliding gun sleeves, cold blue capacitor and central cooling vents; no movement-speed flames',
 'predator_lock':'four articulated blue-metal targeting jaws surrounding a completely empty transparent circular center, miniature missile tube details',
 'missile_swarm':'blue steel deployable missile rack with several distinct missile bodies seated in opening launch cells',
 'armor_shield':'amber armored shield emitter with layered translucent honeycomb energy shell, open transparent interior',
 'heavy_bomb':'large heavy BigBang bomb, amber armored casing with expanding metal fins, dark explosive core and charged golden seam',
 'gravity_anchor':'heavy amber gravity anchor with hinged radial plates and a deep imploding blue-gold reactor, sparse orbiting rock debris',
 'sweeping_cannon':'heavy amber multi-barrel artillery turret with deployable side armor and glowing cannon breeches',
 'invisibility':'violet phase projector device, translucent segmented refractive shroud around an empty transparent center',
 'focus_laser':'long narrow straight purple plasma laser shaft with a sharply defined bright inner ray, textured filaments and soft edge falloff, beam aligned vertically',
 'electronic_interference':'violet interference wave: thin broken annular plasma waveform with transparent center and electronic filament edge',
 'escort_drone':'Phantom HawkEye escort combat drone with violet armored body, articulated wings, two laser cannons and twin engines',
 'orbit_reversal':'orange stellar orbit: three layered thin curved orange energy ribbons around a transparent circular center, metallic emitter shards',
 'stellar_lance':'long pointed orange stellar spear assembled from silver crystal segments, luminous bright tip and slender energy shaft pointing up',
 'twin_reflection':'one silver orange reflective stellar crystal on an articulated mechanical emitter base',
 'starfall':'one jagged orange molten meteor core with dark rocky plates and a short fiery tail, nose up',
 'cinder_fire_shield':'thin annular orange-red flame shield with empty transparent center, curling detailed tongues of fire, yellow hot edge',
 'cinder_fuel_barrage':'one cylindrical red-black mechanical fuel canister with open dispersal fins and burning orange liquid fuel droplets',
 'cinder_heat_wave':'one broad crescent of orange fire, bright yellow edge and twisting red-orange flame filaments with clear transparent center',
 'cinder_inferno_beam':'vertical straight destructive inferno beam with dense bright golden center, dark orange lava fire edges and flowing heat filaments',
 'riptide_wellspring':'one long curling ribbon of translucent teal healing water, white foam edge and clear fluid volume',
 'riptide_tidal_blades':'one large crescent blade made of transparent turquoise water, sharp white foamy cutting edge and flowing curved body',
 'riptide_confluence':'thin annular water vortex spiralling inward, open completely transparent center without a central core, teal depth and white foam',
 'riptide_waterform':'hollow translucent water shell with several circulating curved water ribbons, foam highlights and empty transparent center, no forward beam',
 'argent_guard_stance':'layered silver metallic parrying blade plates on gold mechanical hinges arranged around a transparent center',
 'argent_blade_cast':'one whole bright silver sword blade with gold spine and sharp complete tip, no cropped point, nose up',
 'argent_blade_recall':'one silver-gold recall blade with articulated metallic segments and curved luminous silver trail, complete point up',
 'argent_heavenly_blade_array':'one large ornate silver-gold celestial sword launcher with opening side blade panels, a bright metal core and complete pointed tip up',
 'sylva_symbiosis':'dark green living roots and fleshy leaf armor curling around a completely empty transparent center, lime sap veins',
 'sylva_acid_burst':'one detailed chemical missile with dark green armored canister, glass acid chamber and bright green corrosive liquid',
 'sylva_parasitic_seed':'one parasitic glowing green seed with unfurling dangerous roots and sharp thorns, readable central seed body',
 'sylva_deathbloom':'large bioluminescent deathbloom thorn tree seed with a vivid lime core, dark green woody roots and branching spear thorns',
 'terra_reactive_rock_armor':'layered dark brown stone armor slabs on metal hinges surrounding an open center, amber seams and fractured rock depth',
 'terra_seismic_cannon':'heavy brown stone-armored seismic cannon mechanism, dense central amber barrel and opening side rock plates',
 'terra_strata_clamp':'one thick jagged geological stratum wall slab, stacked dark brown rock layers, bright amber compression fractures, not a fist',
 'terra_geocore_overdrive':'opened heavy geological reactor core with articulated brown rock armor panels, glowing amber crystal and fractured metal seams, no explosion aura',
}
for key,config in data['skills'].items():
    owner=config['aircraftId']
    reference=str(ART/'source-images/aircraft'/f'{owner}.png')
    job(key,'skills',f'Isolated combat VFX source for {config["name"]}, {owner}: {subjects[key]}. '
        'Use aircraft reference ONLY for material and color, do NOT draw the aircraft. '
        'A single neutral deformable subject for layered mesh animation, not a storyboard. ',reference,owner)
(ART/'generation-jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Prepared {len(jobs)} individual artwork jobs and exact reference crops.')

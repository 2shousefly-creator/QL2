"""Named presentation bindings; old gameplay IDs and rank illustrations are retained."""
import re

def effect_source(key):
    exact={
      'bigbang_missile':'heavy_bomb','bigbang_descent':'heavy_bomb','bigbang_sigil':'shared_mark',
      'bigbang_impact':'shared_explosion','bigbang_shockwave':'shared_wave',
      'rankLock':'predator_lock','rankLockPips':'predator_lock','rankMicroImpact':'shared_impact',
      'rankAnchor':'gravity_anchor','rankAnchorRings':'shared_wave','rankCompression':'shared_wave',
      'rankImplosion':'shared_impact','rankCrystal':'twin_reflection','rankConvergence':'shared_trail',
      'rankSignalBand':'electronic_interference','rankRelay':'shared_spark','rankGlitch':'shared_spark',
      'rankNoise':'electronic_interference','rankDebris':'shared_rock','rankCrystalCharge':'twin_reflection',
      'rankInterferenceMark':'shared_mark','rankMicroMissile':'shared_missile','rankMicroTrail':'shared_trail',
      'rankTwinShot':'astra_basic_ammo','rankMiniLance':'stellar_lance',
      'rankDestructiveBand':'electronic_interference','rankDisintegrate':'shared_spark',
      'ultimateViperMissile':'shared_missile','ultimateViperExhaust':'shared_flame',
      'ultimateViperLaunch':'missile_swarm','ultimateViperIntercept':'shared_impact',
      'ultimateViperImpact':'shared_explosion','ultimateViperBurn':'shared_flame','ultimateViperData':'shared_mark',
      'ultimateTitanShell':'titan_basic_ammo','ultimateTitanTrail':'shared_trail','ultimateTitanMuzzle':'shared_muzzle',
      'ultimateTitanImpact':'shared_impact','ultimateHawk':'escort_drone','ultimateHawkGate':'invisibility',
      'ultimateHawkDock':'invisibility','ultimateHawkEngine':'shared_flame','ultimateHawkBolt':'phantom_basic_ammo',
      'ultimateHawkRage':'shared_spark','ultimateHawkSync':'shared_mark','ultimateMeteor':'starfall',
      'ultimateDoom':'starfall','ultimateMeteorTrail':'shared_flame','ultimateMeteorTarget':'shared_mark',
      'ultimateMeteorImpact':'shared_explosion','ultimateDoomTarget':'shared_mark','ultimateDoomImpact':'shared_explosion',
      'ultimateInterferenceBand':'electronic_interference','ultimateDisintegrate':'shared_spark',
      'riptide_body':'riptide','riptide_ring':'riptide_confluence','riptide_slash':'riptide_tidal_blades',
      'riptide_splash':'shared_impact','riptide_pressure':'shared_mark',
      'argent_metal_blade':'argent_blade_cast','argent_return':'argent_blade_recall',
      'argent_guard':'argent_guard_stance','argent_greatsword':'argent_blade_cast',
      'argent_blade_array':'argent_heavenly_blade_array','argent_array_emitter':'argent_heavenly_blade_array',
      'argent_array_blade':'argent_blade_cast','argent_empowered_return':'argent_blade_recall',
      'argent_trail':'shared_trail','argent_metal_light':'shared_impact','argent_guard_hit':'shared_impact',
      'argent_muzzle':'shared_muzzle','argent_core':'shared_impact',
      'terra_armor':'terra_reactive_rock_armor','terra_strataLeft':'terra_strata_clamp',
      'terra_strataRight':'terra_strata_clamp','terra_coreOpen':'terra_geocore_overdrive',
      'terra_shard':'shared_rock','terra_shardTrail':'shared_trail','terra_muzzle':'shared_muzzle',
      'sylva_missile':'sylva_acid_burst','sylva_skull':'shared_skull','sylva_pool':'shared_acid_pool',
      'sylva_tissue':'sylva_symbiosis','sylva_seed':'sylva_parasitic_seed','sylva_roots':'shared_root',
      'sylva_tree':'sylva_deathbloom','sylva_tree_burst':'sylva_deathbloom',
      'sylva_death0':'sylva_deathbloom','sylva_death1':'sylva_deathbloom',
      'sylva_death2':'sylva_deathbloom','sylva_death3':'sylva_deathbloom',
      'sylva_wither':'sylva_deathbloom','sylva_exhaust':'shared_flame',
      'cinder_canister':'cinder_fuel_barrage','cinder_ember':'cinder_basic_ammo',
      'passive_viper':'viper_basic_ammo','passive_titan':'titan_basic_ammo','passive_battery':'shared_spark',
      'passive_mark':'twin_reflection','cinder_proc':'shared_flame',
      'healingCross':'shared_heal','basicAmmoTrail':'shared_trail','muzzle':'shared_muzzle',
      'tracer':'shared_trail','enemyTracer':'shared_trail','missile':'shared_missile',
      'smallExplosion':'shared_explosion','mediumExplosion':'shared_explosion','largeExplosion':'shared_explosion',
      'bossExplosion':'shared_explosion','sparks':'shared_impact','smoke':'shared_smoke',
      'damageSmoke':'shared_smoke','fire':'shared_flame','shield':'shared_shield','charge':'shared_impact',
      'laser':'focus_laser','shockwave':'shared_wave','drone':'escort_drone',
      'astra_lance':'stellar_lance','astra_guard':'orbit_reversal','astra_spearBeam':'stellar_lance',
      'astra_spearTip':'stellar_lance','astra_reticle':'shared_mark','astra_segments':'orbit_reversal',
      'astra_scorch':'shared_smoke','astra_flame':'shared_flame','astra_flame1':'shared_flame',
      'astra_corona':'shared_wave','astra_trail':'shared_trail','astra_debris':'shared_rock',
      'acidDrop':'sylva_basic_ammo','acidSplash':'shared_acid_pool',
    }
    if key in exact:return exact[key]
    if key.endswith('_basic_ammo'):return key
    if re.match(r'^(terra|sylva|argent)_(body|left|right|open|closed|portrait|emissive)$',key):return key.split('_')[0]
    if key.startswith('astra_meteor'):return 'starfall'
    if re.match(r'cinder_ring\d',key):return 'cinder_fire_shield'
    if re.match(r'cinder_beam\d',key):return 'cinder_inferno_beam'
    if re.match(r'cinder_burst\d',key):return 'cinder_heat_wave'
    if re.match(r'cinder_fuel\d',key):return 'shared_flame'
    if key in ('viper_missile','tomahawk_missile','boss_missile'):return 'shared_missile'
    if key.endswith('_ammo'):return 'titan_basic_ammo' if 'boss' in key else 'cinder_basic_ammo'
    # Already painted raster material stays available for specialized shapes (e.g.
    # Terra's center damage strip); the new generated mechanism is layered above it.
    return None

def frame_key(frame):
    return frame['atlas']+':'+','.join(str(math_round(v*1e6)) for v in frame['rect'])
def math_round(v):return int(v+.5)

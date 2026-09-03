import React, { useEffect, useRef, useState } from "react";
import type { JourneyChapterId, JourneyStageThemeId } from "../game/types";
import { JOURNEY_CHAPTERS } from "../game/journeyChapters";
import {
  getStageTheme,
  getStageThemeCssVariables,
  type StageThemeDefinition,
} from "../game/stageThemes";

type HomeJourneyBackdropProps = {
  chapterId: JourneyChapterId;
  reducedMotion?: boolean;
};

type AmbientEventKind =
  | "flag"
  | "horizon"
  | "patrol"
  | "searchlight"
  | "smoke"
  | "vehicle"
  | "signal"
  | "radar"
  | "route"
  | "scanline"
  | "dust"
  | "ring"
  | "motifs"
  | "ceremonial";

type AmbientEvent = {
  id: number;
  kind: AmbientEventKind;
};

type SceneTransitionState = {
  activeThemeId: JourneyStageThemeId;
  previousThemeId: JourneyStageThemeId | null;
  revision: number;
};

const AMBIENT_EVENT_KINDS: Record<JourneyStageThemeId, readonly AmbientEventKind[]> = {
  training_dawn: ["flag", "horizon", "patrol"],
  simple_barracks: ["searchlight", "patrol", "smoke"],
  organized_assembly: ["signal", "vehicle", "flag"],
  map_room: ["radar", "route", "signal"],
  command_room: ["scanline", "radar", "signal"],
  ceremonial_abstract: ["ceremonial", "dust", "ring"],
  supreme_obsidian: ["dust", "ring", "motifs"],
  supreme_sovereign: ["ceremonial", "ring", "dust"],
};

const CROSSFADE_MS = 700;
const AMBIENT_EVENT_MS = 8_000;
const AMBIENT_DELAY_MIN_MS = 20_000;
const AMBIENT_DELAY_MAX_MS = 60_000;

function resolveThemeId(chapterId: JourneyChapterId): JourneyStageThemeId {
  const chapter = JOURNEY_CHAPTERS.find((candidate) => candidate.id === chapterId);
  return getStageTheme(chapter?.themeId).id;
}

function SceneArtwork({ themeId }: { themeId: JourneyStageThemeId }) {
  if (themeId === "training_dawn") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g data-layer="background-environment">
          <circle cx="600" cy="575" r="118" fill="var(--theme-primary-soft)" opacity="0.7" />
          <path d="M0 566 H1200" stroke="var(--theme-border)" strokeWidth="2" opacity="0.45" />
        </g>
        <g data-layer="midground-scene" fill="#111827" stroke="var(--theme-border)" strokeWidth="2" opacity="0.78">
          <path d="M32 575h235v-72l-36-30H87l-55 43z" />
          <path d="M917 575h250v-60l-42-28H969l-52 40z" />
          <path d="M76 514h128M984 525h132" opacity="0.6" />
          <path d="M188 474v-145" />
          <path d="M190 337l72 20-72 25z" fill="var(--theme-primary-soft)" />
          <path d="M0 610h352M848 610h352" strokeDasharray="14 12" opacity="0.55" />
          <path d="M333 575v-54h34v54m466 0v-50h34v50" />
          <path d="M377 550h94m-47-48v73M729 550h94m-47-48v73" opacity="0.65" />
        </g>
        <g data-layer="foreground-silhouette" fill="#020617" opacity="0.9">
          <path d="M0 676l94-38 122 18 96-25 87 35 90-18 103 32 108-33 108 20 105-37 107 28 80-22v164H0z" />
          <circle cx="76" cy="614" r="10" /><path d="M66 624h20l9 54H57z" />
          <circle cx="1120" cy="605" r="9" /><path d="M1111 614h18l12 52h-42z" />
          <path d="M0 628h118l28 34H0zm1200 0h-125l-30 34h155z" opacity="0.95" />
        </g>
      </svg>
    );
  }

  if (themeId === "simple_barracks") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g data-layer="background-environment" opacity="0.55">
          <circle cx="1030" cy="142" r="54" fill="var(--theme-primary-soft)" />
          <path d="M0 535 Q220 470 420 532 T840 528 T1200 522V650H0z" fill="#101711" />
        </g>
        <g data-layer="midground-scene" stroke="var(--theme-border)" strokeWidth="2" opacity="0.75">
          <path d="M26 575h262v-98H72l-46 44zM900 575h275v-104H956l-56 46z" fill="#141c19" />
          <path d="M72 477l82-48 134 48m668-6l86-52 133 52" fill="#0b1110" />
          <path d="M126 514h36v28h-36zm80 0h36v28h-36zm786-4h38v29h-38zm84 0h38v29h-38z" fill="var(--theme-primary-soft)" stroke="none" />
          <path d="M330 557V350h82v207m-96-207h112l-18-38h-76z" fill="#0b1110" />
          <path d="M371 311V263m-19 0h38" />
          <path d="M0 606h432M768 606h432" strokeDasharray="7 10" opacity="0.7" />
          <path d="M476 566v-96m247 96v-96M476 487h247" opacity="0.35" />
        </g>
        <g data-layer="foreground-silhouette" fill="#020605" opacity="0.92">
          <path d="M0 672l132-42 125 20 112-18 100 43 124-24 118 21 111-34 124 18 127-37 127 44v137H0z" />
          <path d="M18 610h116v54H18zm1008 5h152v53h-152z" />
          <path d="M58 594h38v16H58zm1012 4h46v17h-46z" fill="var(--theme-primary-muted)" />
        </g>
      </svg>
    );
  }

  if (themeId === "organized_assembly") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="assembly-grid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M52 0H0v52" fill="none" stroke="var(--theme-border)" strokeWidth="1" opacity="0.28" />
          </pattern>
        </defs>
        <g data-layer="background-environment">
          <rect width="1200" height="650" fill="url(#assembly-grid)" opacity="0.5" />
          <path d="M0 535H1200" stroke="var(--theme-border)" strokeWidth="2" opacity="0.5" />
        </g>
        <g data-layer="midground-scene" stroke="var(--theme-border)" strokeWidth="2" opacity="0.72">
          <path d="M28 500h260v94H28zm884-18h260v112H912z" fill="#0b1724" />
          <path d="M42 521h232m-232 29h232m884-39H928m216 32H928" opacity="0.5" />
          <path d="M321 590h162v-70H321zm396 0h177v-76H717z" fill="#0a1520" />
          <path d="M332 532h140m256-5h154" opacity="0.5" />
          <path d="M172 478v-153m0 0l65 18-65 24M1014 482V342m0 0l-62 18 62 22" fill="var(--theme-primary-soft)" />
          <path d="M510 560h180m-90-58v88" strokeDasharray="6 7" opacity="0.42" />
        </g>
        <g data-layer="foreground-silhouette" fill="#030b12" opacity="0.92">
          <path d="M0 674h1200v126H0z" />
          <path d="M0 635h218l52 39H0zm1200 0H970l-45 39h275z" />
          <path d="M810 617h150l42 40H768zM75 617h112l28 31H43z" />
          {[330, 365, 400, 800, 835, 870].map((x) => (
            <g key={x}><circle cx={x} cy="620" r="7" /><path d={`M${x - 7} 628h14l6 34h-26z`} /></g>
          ))}
        </g>
      </svg>
    );
  }

  if (themeId === "map_room") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="map-contours" width="140" height="110" patternUnits="userSpaceOnUse">
            <path d="M-10 65Q30 18 78 57t76 0M-8 92q62-42 150 0" fill="none" stroke="var(--theme-border)" strokeWidth="1.5" opacity="0.55" />
          </pattern>
        </defs>
        <g data-layer="background-environment">
          <rect x="252" y="92" width="696" height="472" rx="14" fill="#061713" stroke="var(--theme-border)" strokeWidth="3" opacity="0.82" />
          <rect x="275" y="116" width="650" height="424" rx="8" fill="url(#map-contours)" opacity="0.72" />
          <path d="M330 428C430 320 520 390 608 274s168-70 258-142" fill="none" stroke="var(--theme-accent)" strokeWidth="2" strokeDasharray="10 12" opacity="0.32" />
          <circle cx="332" cy="427" r="7" fill="var(--theme-accent)" opacity="0.45" />
          <circle cx="607" cy="275" r="7" fill="var(--theme-accent)" opacity="0.45" />
        </g>
        <g data-layer="midground-scene" opacity="0.82">
          <path d="M22 174h190v352H22zm966 0h190v352H988z" fill="#06110f" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M47 209h140v74H47zm0 98h140v74H47zm0 98h140v74H47zm966-196h140v74h-140zm0 98h140v74h-140zm0 98h140v74h-140z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" />
          <path d="M68 231h95m-95 24h66m900-23h96m-96 24h70M67 329h84m883 0h82M67 427h71m896 0h92" stroke="var(--theme-accent)" strokeWidth="2" opacity="0.4" />
        </g>
        <g data-layer="foreground-silhouette" fill="#020706" opacity="0.94">
          <path d="M0 682h1200v118H0z" />
          <path d="M260 800l82-202h516l90 202z" />
          <path d="M354 616h492l-26 64H380z" fill="#06110f" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M0 618h158l55 64H0zm1200 0h-163l-54 64h217z" />
        </g>
      </svg>
    );
  }

  if (themeId === "command_room") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g data-layer="background-environment">
          <path d="M0 86h1200v478H0z" fill="#080c1d" opacity="0.72" />
          <rect x="326" y="92" width="548" height="300" rx="12" fill="#080d24" stroke="var(--theme-border)" strokeWidth="3" />
          <path d="M361 135h478M361 176h478M361 217h478M361 258h478M361 299h478M361 340h478" stroke="var(--theme-border)" opacity="0.15" />
          <path d="M600 112v260M463 112v260M737 112v260" stroke="var(--theme-border)" opacity="0.18" />
        </g>
        <g data-layer="midground-scene" opacity="0.8">
          <path d="M22 148h258v355H22zm898 0h258v355H920z" fill="#080d1d" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M48 182h206v124H48zm0 150h206v136H48zm898-150h206v124H946zm0 150h206v136H946z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" />
          <path d="M70 209h90l42 52h31m-163 99h153m-153 34h112m786-185h96l38 52h28m-162 99h151m-151 34h111" fill="none" stroke="var(--theme-accent)" strokeWidth="2" opacity="0.38" />
          <circle cx="214" cy="438" r="5" fill="var(--theme-accent)" /><circle cx="1092" cy="438" r="5" fill="var(--theme-accent)" />
        </g>
        <g data-layer="foreground-silhouette" fill="#02040b" opacity="0.95">
          <path d="M0 678h1200v122H0z" />
          <path d="M0 564h310l90 114H0zm1200 0H890l-90 114h400z" />
          <path d="M332 800l74-215h388l74 215z" />
          <path d="M429 600h342l-20 69H449z" fill="#080d1d" stroke="var(--theme-border)" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  if (themeId === "ceremonial_abstract") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g data-layer="background-environment" opacity="0.7">
          <path d="M151 565V118h120v447m658 0V118h120v447" fill="#160911" stroke="var(--theme-border)" strokeWidth="3" />
          <path d="M118 118h186V82H118zm778 0h186V82H896z" fill="#240b16" />
          <path d="M267 565V208h64v357m538 0V208h64v357" fill="#10070d" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M300 106Q600-75 900 106" fill="none" stroke="var(--theme-border)" strokeWidth="4" opacity="0.5" />
          <path d="M600 122l44 44-44 44-44-44z" fill="var(--theme-primary-soft)" stroke="var(--theme-border-strong)" strokeWidth="2" />
        </g>
        <g data-layer="midground-scene" opacity="0.62">
          <path d="M355 565V274h490v291" fill="#130810" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M396 315h408M396 364h408M396 413h408" stroke="var(--theme-border)" opacity="0.28" />
          <circle cx="600" cy="388" r="96" fill="none" stroke="var(--theme-border)" strokeWidth="2" />
          <circle cx="600" cy="388" r="66" fill="none" stroke="var(--theme-border)" strokeWidth="1" opacity="0.5" />
        </g>
        <g data-layer="foreground-silhouette" fill="#060205" opacity="0.94">
          <path d="M0 650h1200v150H0z" />
          <path d="M0 574h256l70 76H0zm1200 0H944l-70 76h326z" />
          <path d="M368 650h464l-44-42H412zm76-42h312l-38-39H482z" />
          <path d="M44 800V315h74v485m964 0V315h74v485" />
        </g>
      </svg>
    );
  }

  if (themeId === "supreme_obsidian") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g data-layer="background-environment">
          <path d="M0 0h1200v584H0z" fill="#020203" opacity="0.5" />
          <path d="M182 565V78h132v487m572 0V78h132v487" fill="#08090b" stroke="var(--theme-border)" strokeWidth="3" />
          <path d="M134 79h228L320 31H176zm704 0h228l-42-48H880z" fill="#0d0d0f" stroke="var(--theme-border)" />
          <circle cx="600" cy="296" r="172" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.4" />
          <circle cx="600" cy="296" r="130" fill="none" stroke="var(--theme-border)" strokeWidth="1" opacity="0.34" />
        </g>
        <g data-layer="midground-scene" opacity="0.78">
          {[
            [110, 222], [110, 420], [1090, 222], [1090, 420],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
              <path d="M0-24 24 0 0 24-24 0z" fill="var(--theme-primary-soft)" stroke="var(--theme-border-strong)" strokeWidth="2" />
              <circle r="8" fill="var(--theme-accent)" opacity="0.42" />
            </g>
          ))}
          <path d="M316 152h122m324 0h122M314 490h126m320 0h126" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M356 565V208h94v357m300 0V208h94v357" fill="#070708" stroke="var(--theme-border)" />
          <path d="M470 524h260l48 41H422z" fill="#0b0a08" stroke="var(--theme-border)" strokeWidth="2" />
        </g>
        <g data-layer="foreground-silhouette" fill="#010101" opacity="0.96">
          <path d="M0 648h1200v152H0z" />
          <path d="M0 518h174l104 130H0zm1200 0h-174L922 648h278z" />
          <path d="M350 800l78-200h344l78 200z" />
          <path d="M429 618h342l-18 62H447z" fill="#090807" stroke="var(--theme-border)" />
        </g>
      </svg>
    );
  }

  return (
    <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <g data-layer="background-environment">
        <path d="M0 0h1200v590H0z" fill="#070101" opacity="0.58" />
        <path d="M128 578V90h164v488m616 0V90h164v488" fill="#130405" stroke="var(--theme-border)" strokeWidth="3" />
        <path d="M70 92h280l-58-58H128zm780 0h280l-58-58H908z" fill="#1d0507" stroke="var(--theme-border)" />
        <path d="M292 122L600 30l308 92" fill="none" stroke="var(--theme-border-strong)" strokeWidth="3" opacity="0.48" />
        <path d="M600 30v165" stroke="var(--theme-border)" strokeWidth="2" opacity="0.55" />
        <circle cx="600" cy="244" r="142" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.33" />
      </g>
      <g data-layer="midground-scene" opacity="0.82">
        <path d="M292 578V190h126v388m364 0V190h126v388" fill="#0d0304" stroke="var(--theme-border)" strokeWidth="2" />
        <path d="M318 225h74v112h-74zm490 0h74v112h-74z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" />
        <path d="M446 540V218h308v322" fill="#110305" stroke="var(--theme-border)" strokeWidth="2" />
        <path d="M476 256h248M476 304h248M476 352h248" stroke="var(--theme-border)" opacity="0.28" />
        <path d="M85 418h152m726 0h152M82 466h112m812 0h112" stroke="var(--theme-border-strong)" strokeWidth="2" opacity="0.44" />
        <path d="M600 160l34 34-34 34-34-34z" fill="var(--theme-primary-soft)" stroke="var(--theme-accent)" strokeWidth="2" opacity="0.72" />
      </g>
      <g data-layer="foreground-silhouette" fill="#020000" opacity="0.97">
        <path d="M0 648h1200v152H0z" />
        <path d="M0 506h124l150 142H0zm1200 0h-124L926 648h274z" />
        <path d="M286 800l116-224h396l116 224z" />
        <path d="M419 595h362l-32 70H451z" fill="#120304" stroke="var(--theme-border-strong)" strokeWidth="2" />
        <path d="M485 575h230l28 20H457z" fill="var(--theme-primary-muted)" />
      </g>
    </svg>
  );
}

function AmbientEventLayer({ event }: { event: AmbientEvent | null }) {
  if (!event) return null;

  if (event.kind === "patrol") {
    return (
      <div key={event.id} className="home-ambient-event home-ambient-patrol">
        <span className="home-patrol-unit" />
        <span className="home-patrol-unit" />
        <span className="home-patrol-unit" />
      </div>
    );
  }

  if (event.kind === "smoke") {
    return (
      <div key={event.id} className="home-ambient-event home-ambient-smoke">
        <span /><span /><span />
      </div>
    );
  }

  if (event.kind === "route") {
    return (
      <div key={event.id} className="home-ambient-event home-ambient-route">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M58 536C176 402 286 500 372 382S560 298 650 360s188 14 258-86 166-40 236-146" />
        </svg>
      </div>
    );
  }

  if (event.kind === "dust") {
    return (
      <div key={event.id} className="home-ambient-event home-ambient-dust">
        <span /><span /><span /><span /><span /><span />
      </div>
    );
  }

  if (event.kind === "motifs") {
    return (
      <div key={event.id} className="home-ambient-event home-ambient-motifs">
        <span /><span /><span /><span />
      </div>
    );
  }

  if (event.kind === "flag") {
    return (
      <div key={event.id} className="home-ambient-event home-ambient-flag">
        <svg viewBox="0 0 90 60"><path d="M2 6C28-3 50 17 86 7v37C54 54 31 35 2 47z" /></svg>
      </div>
    );
  }

  return <div key={event.id} className={`home-ambient-event home-ambient-${event.kind}`} />;
}

function SceneLayer({
  theme,
  transition,
  ambientEvent,
}: {
  theme: StageThemeDefinition;
  transition: "steady" | "enter" | "exit";
  ambientEvent: AmbientEvent | null;
}) {
  const style = {
    ...getStageThemeCssVariables(theme),
    background: theme.sceneBackgroundCss,
  } as React.CSSProperties;

  return (
    <div
      className={`home-backdrop-layer ${
        transition === "steady" ? "" : `home-backdrop-layer--${transition}`
      }`}
      data-home-scene={theme.id}
      style={style}
    >
      <div className="home-scene-atmosphere" />
      <SceneArtwork themeId={theme.id} />
      <AmbientEventLayer event={ambientEvent} />
      <div className="home-backdrop-safe-zone" />
      <div className="home-backdrop-vignette" />
    </div>
  );
}

export const HomeJourneyBackdrop: React.FC<HomeJourneyBackdropProps> = ({
  chapterId,
  reducedMotion = false,
}) => {
  const requestedThemeId = resolveThemeId(chapterId);
  const [sceneState, setSceneState] = useState<SceneTransitionState>(() => ({
    activeThemeId: requestedThemeId,
    previousThemeId: null,
    revision: 0,
  }));
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => typeof document === "undefined" || !document.hidden
  );
  const [ambientEvent, setAmbientEvent] = useState<AmbientEvent | null>(null);
  const ambientSequenceRef = useRef(0);

  useEffect(() => {
    setSceneState((previous) => {
      if (previous.activeThemeId === requestedThemeId) return previous;
      return {
        activeThemeId: requestedThemeId,
        previousThemeId: previous.activeThemeId,
        revision: previous.revision + 1,
      };
    });
  }, [requestedThemeId]);

  useEffect(() => {
    if (!sceneState.previousThemeId) return;

    if (reducedMotion) {
      setSceneState((previous) => ({ ...previous, previousThemeId: null }));
      return;
    }

    const timer = window.setTimeout(() => {
      setSceneState((previous) => ({ ...previous, previousThemeId: null }));
    }, CROSSFADE_MS);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, sceneState.previousThemeId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsDocumentVisible(visible);
      if (!visible) setAmbientEvent(null);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    setAmbientEvent(null);
    if (reducedMotion || !isDocumentVisible) return;

    let cancelled = false;
    let eventTimer: number | undefined;
    let clearEventTimer: number | undefined;

    const scheduleNextEvent = () => {
      const delay = Math.floor(
        AMBIENT_DELAY_MIN_MS +
          Math.random() * (AMBIENT_DELAY_MAX_MS - AMBIENT_DELAY_MIN_MS + 1)
      );

      eventTimer = window.setTimeout(() => {
        if (cancelled || document.hidden) return;

        const kinds = AMBIENT_EVENT_KINDS[sceneState.activeThemeId];
        const sequence = ambientSequenceRef.current;
        const kind = kinds[sequence % kinds.length];
        ambientSequenceRef.current = sequence + 1;
        setAmbientEvent({ id: sequence, kind });

        clearEventTimer = window.setTimeout(() => {
          if (cancelled) return;
          setAmbientEvent(null);
          scheduleNextEvent();
        }, AMBIENT_EVENT_MS);
      }, delay);
    };

    scheduleNextEvent();

    return () => {
      cancelled = true;
      if (eventTimer !== undefined) window.clearTimeout(eventTimer);
      if (clearEventTimer !== undefined) window.clearTimeout(clearEventTimer);
    };
  }, [isDocumentVisible, reducedMotion, sceneState.activeThemeId]);

  const activeTheme = getStageTheme(sceneState.activeThemeId);
  const previousTheme = sceneState.previousThemeId
    ? getStageTheme(sceneState.previousThemeId)
    : null;
  const isTransitioning = previousTheme !== null && !reducedMotion;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 bg-slate-950 ${
        reducedMotion ? "home-backdrop--reduced" : ""
      }`}
      aria-hidden="true"
    >
      {previousTheme && (
        <SceneLayer theme={previousTheme} transition="exit" ambientEvent={null} />
      )}
      <SceneLayer
        key={`${activeTheme.id}-${sceneState.revision}`}
        theme={activeTheme}
        transition={isTransitioning ? "enter" : "steady"}
        ambientEvent={reducedMotion || !isDocumentVisible ? null : ambientEvent}
      />
    </div>
  );
};

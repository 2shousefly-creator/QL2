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
  map_room: ["radar", "route"],
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

// The shared landscape canvas deliberately keeps every chapter-defining shape
// inside the central portrait-safe band; edge silhouettes are supplemental.
function SceneArtwork({ themeId }: { themeId: JourneyStageThemeId }) {
  if (themeId === "training_dawn") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="training-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b211f" />
            <stop offset="1" stopColor="#05080a" />
          </linearGradient>
        </defs>
        <g data-layer="background-environment">
          <circle cx="600" cy="145" r="92" fill="var(--theme-primary-soft)" opacity="0.58" />
          <path d="M390 0l96 242M810 0l-96 242M510 0l40 218M690 0l-40 218" stroke="var(--theme-border)" strokeWidth="2" opacity="0.2" />
          <path d="M0 352Q180 292 352 338t318-8 294 10 236-28" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.38" />
          <path d="M352 84h496M394 108h412" stroke="var(--theme-accent)" strokeWidth="4" opacity="0.2" />
        </g>
        <g data-layer="midground-scene" fill="#111817" stroke="var(--theme-border)" strokeWidth="2" opacity="0.8">
          <path d="M315 486h178V374l-31-28H350l-35 34zm392 0h178V374l-31-28H742l-35 34z" />
          <path d="M338 401h132m268 0h124M366 430h38v32h-38zm430 0h38v32h-38z" fill="var(--theme-primary-muted)" />
          <path d="M420 365V176m360 189V176" />
          <path d="M422 184l78 24-78 34zm356 0l-78 24 78 34z" fill="var(--theme-primary-soft)" />
          <path d="M474 470v-92h38v92m176 0v-92h38v92M510 405h180" fill="none" />
          <path d="M538 432h124m-62-55v93" opacity="0.62" />
          <path d="M334 510h532" strokeDasharray="12 10" opacity="0.5" />
        </g>
        <g data-layer="foreground-silhouette">
          <path d="M0 566L600 486l600 80v234H0z" fill="url(#training-ground)" opacity="0.94" />
          <path d="M600 492L448 800m152-308L752 800M600 492v308" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.48" />
          <path d="M310 610h146l-28 50H284zm434 0h146l26 50H772z" fill="#070d0e" stroke="var(--theme-border)" strokeWidth="2" opacity="0.9" />
          <path d="M342 628h76m364 0h76M260 706h184m312 0h184" stroke="var(--theme-accent)" strokeWidth="3" opacity="0.3" />
          <g fill="#020617" opacity="0.9">
            <circle cx="450" cy="558" r="9" /><path d="M441 568h18l11 50h-40z" />
            <circle cx="750" cy="558" r="9" /><path d="M741 568h18l11 50h-40z" />
            <path d="M0 598l212-46 82 24-88 224H0zm1200 0l-212-46-82 24 88 224h206z" />
          </g>
        </g>
      </svg>
    );
  }

  if (themeId === "simple_barracks") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="barracks-road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#17201b" />
            <stop offset="1" stopColor="#030706" />
          </linearGradient>
        </defs>
        <g data-layer="background-environment" opacity="0.68">
          <circle cx="746" cy="112" r="52" fill="var(--theme-primary-soft)" />
          <path d="M330 0v258m540-258v258M330 76l540 64M330 138l540-32" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.34" />
          <path d="M0 410Q196 348 352 398t284-14 292 12 272-22" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.28" />
          <path d="M375 344V155h82v189m-98-189h114l-20-40h-74z" fill="#0a100d" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M416 114V65m-22 0h44" stroke="var(--theme-accent)" strokeWidth="3" opacity="0.55" />
        </g>
        <g data-layer="midground-scene" stroke="var(--theme-border)" strokeWidth="2" opacity="0.75">
          <path d="M302 510h254V386H346l-44 48zm342 0h254V386H688l-44 48z" fill="#121b17" />
          <path d="M346 386l86-56 124 56m132 0l84-56 126 56" fill="#0a100e" />
          <path d="M348 420h54v42h-54zm94 0h54v42h-54zm262 0h54v42h-54zm94 0h54v42h-54z" fill="var(--theme-primary-muted)" stroke="none" />
          <path d="M292 522h616M322 542h556" strokeDasharray="8 9" opacity="0.52" />
          <path d="M518 500v-118m164 118V382M518 402h164" opacity="0.5" />
          <path d="M544 430h112M544 457h78" stroke="var(--theme-accent)" opacity="0.34" />
        </g>
        <g data-layer="foreground-silhouette">
          <path d="M0 590L600 505l600 85v210H0z" fill="url(#barracks-road)" opacity="0.96" />
          <path d="M600 510L480 800m120-290L720 800M600 510v290" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.38" />
          <path d="M555 582h90l18 44H537zm-36 96h162l32 77H487z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" strokeWidth="2" opacity="0.7" />
          <path d="M390 608h96v70h-96zm324 0h96v70h-96z" fill="#050907" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M408 588h60v20h-60zm324 0h60v20h-60z" fill="var(--theme-primary-soft)" />
          <path d="M0 620l250-68 74 38-76 210H0zm1200 0l-250-68-74 38 76 210h248z" fill="#020605" opacity="0.92" />
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
          <linearGradient id="assembly-deck" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#102233" />
            <stop offset="1" stopColor="#030b12" />
          </linearGradient>
        </defs>
        <g data-layer="background-environment">
          <rect width="1200" height="800" fill="url(#assembly-grid)" opacity="0.42" />
          <path d="M300 76h600M340 112h520M354 76v144m492-144v144" stroke="var(--theme-border)" strokeWidth="3" opacity="0.48" />
          <path d="M390 104v92m420-92v92" stroke="var(--theme-accent)" strokeWidth="5" opacity="0.36" />
          <path d="M394 188l58 18-58 27zm412 0l-58 18 58 27z" fill="var(--theme-primary-soft)" stroke="var(--theme-border)" />
          <circle cx="600" cy="102" r="9" fill="var(--theme-accent)" opacity="0.58" />
        </g>
        <g data-layer="midground-scene" stroke="var(--theme-border)" strokeWidth="2" opacity="0.72">
          <path d="M302 492h196V350H302zm400 0h196V350H702z" fill="#0b1724" />
          <path d="M320 378h160m-160 36h160m-160 36h160m240-72h160m-160 36h160m-160 36h160" opacity="0.5" />
          <path d="M508 475h184v-92H508z" fill="#0a1520" />
          <path d="M530 404h140m-140 31h112" stroke="var(--theme-accent)" opacity="0.42" />
          <path d="M364 338V236m472 102V236" />
          <path d="M364 244l58 18-58 25zm472 0l-58 18 58 25z" fill="var(--theme-primary-soft)" />
          {[410, 450, 490, 710, 750, 790].map((x) => (
            <g key={x} fill="#07111a">
              <circle cx={x} cy="516" r="7" />
              <path d={`M${x - 7} 524h14l7 34h-28z`} />
            </g>
          ))}
        </g>
        <g data-layer="foreground-silhouette">
          <path d="M0 590L600 520l600 70v210H0z" fill="url(#assembly-deck)" opacity="0.94" />
          <path d="M600 526L414 800m186-274L786 800M600 526v274" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.46" />
          <path d="M362 618h158l-34 66H330zm318 0h158l32 66H714z" fill="#06111b" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M392 641h88m240 0h88" stroke="var(--theme-accent)" strokeWidth="4" opacity="0.42" />
          <path d="M548 594h104l15 39H533zm-40 120h184l25 66H483z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" opacity="0.82" />
          <path d="M0 624l262-64 76 30-90 210H0zm1200 0l-262-64-76 30 90 210h248z" fill="#030b12" opacity="0.88" />
        </g>
      </svg>
    );
  }

  if (themeId === "map_room") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="map-console" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b211c" />
            <stop offset="1" stopColor="#020706" />
          </linearGradient>
          <radialGradient id="map-focus-halo">
            <stop offset="0" stopColor="var(--theme-primary-soft)" stopOpacity="0.9" />
            <stop offset="0.58" stopColor="var(--theme-primary-muted)" stopOpacity="0.42" />
            <stop offset="1" stopColor="#020706" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g data-layer="background-environment" data-density="quiet">
          <ellipse cx="600" cy="326" rx="292" ry="286" fill="url(#map-focus-halo)" opacity="0.74" />
          <path d="M304 0h592l-54 78H358z" fill="#06110f" opacity="0.78" />
          <path d="M424 48h352" stroke="var(--theme-accent)" strokeWidth="3" opacity="0.2" />
          <rect x="350" y="104" width="500" height="410" rx="30" fill="#061713" opacity="0.34" />
          <path
            d="M372 176c68-55 126-48 178-5s111 36 166-8 92-42 126-22M382 454c72-61 144-53 202-8s128 45 220-22"
            fill="none"
            stroke="var(--theme-border)"
            strokeWidth="2"
            opacity="0.16"
          />
          <path
            d="M414 430c56-78 105-39 151-111s97-62 139-105 68-36 92-50"
            fill="none"
            stroke="var(--theme-accent)"
            strokeWidth="2"
            strokeDasharray="14 16"
            opacity="0.2"
          />
          <circle cx="414" cy="430" r="4" fill="var(--theme-accent)" opacity="0.3" />
          <circle cx="796" cy="164" r="4" fill="var(--theme-accent)" opacity="0.3" />
        </g>
        <g data-layer="midground-scene" opacity="0.5">
          <path d="M388 150h66v344h-66zm358 0h66v344h-66z" fill="#06110f" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M408 198h26v232h-26zm358 0h26v232h-26z" fill="var(--theme-primary-muted)" />
          <path d="M420 220v188m360-188v188" stroke="var(--theme-accent)" strokeWidth="2" opacity="0.26" />
        </g>
        <g data-layer="foreground-silhouette">
          <path d="M0 594L600 536l600 58v206H0z" fill="url(#map-console)" opacity="0.96" />
          <path d="M600 540L476 800m124-260L724 800" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.14" />
          <path d="M0 626l286-78 94 40-102 212H0zm1200 0l-286-78-94 40 102 212h278z" fill="#020706" opacity="0.76" />
        </g>
      </svg>
    );
  }

  if (themeId === "command_room") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="command-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#10152c" />
            <stop offset="1" stopColor="#02040b" />
          </linearGradient>
        </defs>
        <g data-layer="background-environment">
          <path d="M276 0h648l-70 92H346z" fill="#080c1d" stroke="var(--theme-border)" strokeWidth="2" opacity="0.9" />
          <path d="M350 42h500M405 70h390" stroke="var(--theme-accent)" strokeWidth="5" opacity="0.3" />
          <path d="M318 94v438m564-438v438M342 118h516" stroke="var(--theme-border)" strokeWidth="2" opacity="0.42" />
          <rect x="370" y="118" width="460" height="302" rx="12" fill="#080d24" stroke="var(--theme-border)" strokeWidth="3" />
          <path d="M398 154h404M398 196h404M398 238h404M398 280h404M398 322h404M398 364h404" stroke="var(--theme-border)" opacity="0.16" />
          <path d="M600 138v262M484 138v262M716 138v262" stroke="var(--theme-border)" opacity="0.2" />
          <path d="M420 334l78-72 72 38 91-106 116 76" fill="none" stroke="var(--theme-accent)" strokeWidth="3" opacity="0.38" />
        </g>
        <g data-layer="midground-scene" opacity="0.8">
          <path d="M414 164h72v330h-72zm300 0h72v330h-72z" fill="#080d1d" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M428 188h44v116h-44zm0 139h44v132h-44zm300-139h44v116h-44zm0 139h44v132h-44z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" />
          <path d="M438 213h24l-12 54h12m-24 89h24m-24 28h20m280-171h24l-12 54h12m-24 89h24m-24 28h20" fill="none" stroke="var(--theme-accent)" strokeWidth="2" opacity="0.46" />
          <path d="M410 458h380l48 92H362z" fill="#080d1d" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M438 478h132v44H438zm192 0h132v44H630z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" />
          <circle cx="468" cy="536" r="5" fill="var(--theme-accent)" /><circle cx="732" cy="536" r="5" fill="var(--theme-accent)" />
        </g>
        <g data-layer="foreground-silhouette">
          <path d="M0 594L600 530l600 64v206H0z" fill="url(#command-floor)" opacity="0.96" />
          <path d="M600 536L438 800m162-264L762 800M600 536v264" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.44" />
          <path d="M382 590h178l-36 82H340zm258 0h178l42 82H676z" fill="#070b19" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M412 614h108m160 0h108" stroke="var(--theme-accent)" strokeWidth="4" opacity="0.48" />
          <path d="M514 692h172l28 66H486z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" opacity="0.76" />
          <path d="M0 622l280-70 82 38-94 210H0zm1200 0l-280-70-82 38 94 210h268z" fill="#02040b" opacity="0.9" />
        </g>
      </svg>
    );
  }

  if (themeId === "ceremonial_abstract") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ceremonial-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#210c18" />
            <stop offset="1" stopColor="#060205" />
          </linearGradient>
        </defs>
        <g data-layer="background-environment" opacity="0.76">
          <path d="M292 136Q600-112 908 136M332 158Q600-54 868 158" fill="none" stroke="var(--theme-border)" strokeWidth="4" opacity="0.62" />
          <path d="M346 546V126h82v420m344 0V126h82v420" fill="#160911" stroke="var(--theme-border)" strokeWidth="3" />
          <path d="M320 126h134V88H320zm426 0h134V88H746z" fill="#240b16" stroke="var(--theme-border)" />
          <path d="M408 546V216h52v330m280 0V216h52v330" fill="#10070d" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M600 92l42 42-42 42-42-42z" fill="var(--theme-primary-soft)" stroke="var(--theme-border-strong)" strokeWidth="2" />
          <path d="M600 136v378" stroke="var(--theme-accent)" strokeWidth="2" opacity="0.22" />
        </g>
        <g data-layer="midground-scene" opacity="0.62">
          <path d="M442 546V246h316v300" fill="#130810" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M470 284h260M470 330h260M470 376h260M470 422h260" stroke="var(--theme-border)" opacity="0.34" />
          <circle cx="600" cy="354" r="104" fill="none" stroke="var(--theme-border)" strokeWidth="3" />
          <circle cx="600" cy="354" r="72" fill="none" stroke="var(--theme-border)" strokeWidth="1.5" opacity="0.58" />
          <path d="M600 292l62 62-62 62-62-62z" fill="var(--theme-primary-muted)" stroke="var(--theme-border-strong)" strokeWidth="2" />
          <path d="M360 476h84m312 0h84" stroke="var(--theme-accent)" strokeWidth="3" opacity="0.34" />
        </g>
        <g data-layer="foreground-silhouette">
          <path d="M0 594L600 522l600 72v206H0z" fill="url(#ceremonial-floor)" opacity="0.95" />
          <path d="M600 528L430 800m170-272L770 800M600 528v272" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.46" />
          <path d="M406 586h388l-42-46H448zm34 64h320l-38-46H478zm50 70h220l-30-46H520z" fill="#090307" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M458 618h284m-246 68h208m-144 72h80" stroke="var(--theme-accent)" strokeWidth="3" opacity="0.35" />
          <path d="M0 626l280-76 82 42-98 208H0zm1200 0l-280-76-82 42 98 208h264z" fill="#060205" opacity="0.88" />
          <path d="M326 800V418h42v382m464 0V418h42v382" fill="#060205" stroke="var(--theme-border)" opacity="0.86" />
        </g>
      </svg>
    );
  }

  if (themeId === "supreme_obsidian") {
    return (
      <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="obsidian-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#11100d" />
            <stop offset="1" stopColor="#010101" />
          </linearGradient>
        </defs>
        <g data-layer="background-environment">
          <path d="M302 0h596l-70 92H372z" fill="#08090b" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M344 552V82h90v470m332 0V82h90v470" fill="#08090b" stroke="var(--theme-border)" strokeWidth="3" />
          <path d="M318 82h142l-28-48h-86zm422 0h142l-28-48h-86z" fill="#0d0d0f" stroke="var(--theme-border)" />
          <path d="M390 116h420M430 144h340" stroke="var(--theme-accent)" strokeWidth="3" opacity="0.3" />
          <circle cx="600" cy="292" r="158" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.44" />
          <circle cx="600" cy="292" r="118" fill="none" stroke="var(--theme-border)" strokeWidth="1.5" opacity="0.38" />
        </g>
        <g data-layer="midground-scene" opacity="0.78">
          {[
            [438, 218], [438, 414], [762, 218], [762, 414],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
              <path d="M0-24 24 0 0 24-24 0z" fill="var(--theme-primary-soft)" stroke="var(--theme-border-strong)" strokeWidth="2" />
              <circle r="8" fill="var(--theme-accent)" opacity="0.42" />
            </g>
          ))}
          <path d="M462 218h62m152 0h62M462 414h62m152 0h62" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M430 552V188h72v364m196 0V188h72v364" fill="#070708" stroke="var(--theme-border)" />
          <path d="M500 514h200l52 38H448z" fill="#0b0a08" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M534 474h132l30 40H504z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" />
          <path d="M600 178l38 38-38 38-38-38z" fill="var(--theme-primary-soft)" stroke="var(--theme-accent)" strokeWidth="2" />
        </g>
        <g data-layer="foreground-silhouette">
          <path d="M0 598L600 526l600 72v202H0z" fill="url(#obsidian-floor)" opacity="0.98" />
          <path d="M600 532L424 800m176-268L776 800M600 532v268" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.52" />
          <path d="M420 604h360l-34-58H454zm42 74h276l-28-52H490zm56 72h164l-20-44H538z" fill="#090807" stroke="var(--theme-border)" strokeWidth="2" />
          <path d="M460 642h280m-236 73h192m-128 50h64" stroke="var(--theme-accent)" strokeWidth="3" opacity="0.42" />
          <path d="M0 630l282-80 88 44-102 206H0zm1200 0l-282-80-88 44 102 206h268z" fill="#010101" opacity="0.92" />
        </g>
      </svg>
    );
  }

  return (
    <svg className="home-scene-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sovereign-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#240607" />
          <stop offset="1" stopColor="#020000" />
        </linearGradient>
      </defs>
      <g data-layer="background-environment">
        <path d="M286 0h628l-76 104H362z" fill="#130405" stroke="var(--theme-border)" strokeWidth="2" />
        <path d="M332 566V92h104v474m328 0V92h104v474" fill="#130405" stroke="var(--theme-border)" strokeWidth="3" />
        <path d="M300 92h168l-34-54H334zm432 0h168l-34-54H766z" fill="#1d0507" stroke="var(--theme-border)" />
        <path d="M362 122L600 34l238 88M408 146h384" fill="none" stroke="var(--theme-border-strong)" strokeWidth="3" opacity="0.54" />
        <path d="M600 34v166" stroke="var(--theme-border)" strokeWidth="2" opacity="0.62" />
        <circle cx="600" cy="262" r="146" fill="none" stroke="var(--theme-border)" strokeWidth="2" opacity="0.4" />
        <circle cx="600" cy="262" r="108" fill="none" stroke="var(--theme-border)" strokeWidth="1" opacity="0.32" />
      </g>
      <g data-layer="midground-scene" opacity="0.82">
        <path d="M404 566V190h90v376m212 0V190h90v376" fill="#0d0304" stroke="var(--theme-border)" strokeWidth="2" />
        <path d="M422 226h54v112h-54zm302 0h54v112h-54z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" />
        <path d="M488 530V236h224v294" fill="#110305" stroke="var(--theme-border)" strokeWidth="2" />
        <path d="M514 274h172M514 320h172M514 366h172M514 412h172" stroke="var(--theme-border)" opacity="0.32" />
        <path d="M360 430h44m392 0h44M360 476h44m392 0h44" stroke="var(--theme-border-strong)" strokeWidth="3" opacity="0.5" />
        <path d="M600 164l38 38-38 38-38-38z" fill="var(--theme-primary-soft)" stroke="var(--theme-accent)" strokeWidth="2" opacity="0.82" />
        <path d="M526 494h148l38 36H488z" fill="var(--theme-primary-muted)" stroke="var(--theme-border)" />
      </g>
      <g data-layer="foreground-silhouette">
        <path d="M0 600L600 526l600 74v200H0z" fill="url(#sovereign-floor)" opacity="0.98" />
        <path d="M600 532L404 800m196-268L796 800M600 532v268" fill="none" stroke="var(--theme-border-strong)" strokeWidth="2" opacity="0.5" />
        <path d="M398 604h404l-42-58H440zm48 76h308l-34-54H480zm58 74h192l-24-48H528z" fill="#120304" stroke="var(--theme-border-strong)" strokeWidth="2" />
        <path d="M444 646h312m-264 72h216m-144 50h72" stroke="var(--theme-accent)" strokeWidth="4" opacity="0.44" />
        <path d="M0 630l278-82 92 46-106 206H0zm1200 0l-278-82-92 46 106 206h264z" fill="#020000" opacity="0.92" />
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
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <path d="M350 540c66-104 116-34 168-142s116-68 168-8 92-6 164-154" />
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
      <React.Fragment key={`${activeTheme.id}-${sceneState.revision}`}>
        <SceneLayer
          theme={activeTheme}
          transition={isTransitioning ? "enter" : "steady"}
          ambientEvent={reducedMotion || !isDocumentVisible ? null : ambientEvent}
        />
      </React.Fragment>
    </div>
  );
};

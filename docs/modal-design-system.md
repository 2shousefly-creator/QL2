# Modal, popup and result design system

This migration replaces feature-owned outer panels with a shared visual contract across Home/global, profile, Tăng Gia, training, entertainment and Chiến Tuyến. It covers 70 modal/sheet call sites, three fullscreen result compositions, the promotion ceremony, and the existing toast/notification surfaces. Gameplay fullscreen shells remain gameplay surfaces; their nested dialogs and results use these contracts.

## Archetypes and anatomy

| Archetype | Default maximum width | Content contract |
| --- | --- | --- |
| Result | 27rem | Small status hero, supporting copy, compact data, primary action and lighter secondary actions |
| Confirm | 23rem | Short title/message, optional 40px status container, two or three actions; destructive action uses red |
| Info/detail/tutorial | 30rem | Readable header, accessible close, independently scrolling sections, optional footer |
| Transaction/management | 34rem | Compact wallet/tabs, scrollable lists and quantity controls, explicit costs and actions |
| Ceremony | 32rem for dialogs | Milestone hero and rewards; fullscreen promotion keeps its own scroll body and fixed footer |

Compact (24rem) and wide (38rem) sizes are explicit exceptions. Quantity purchase/sale dialogs are compact transactions because they contain editable quantity controls. Confirmation dialogs without a form use the smaller confirmation contract.

## Shared implementation

- `src/components/overlay/AppOverlay.tsx`: requires an archetype on `AppModal` and `AppBottomSheet`; provides `GameResultModal` and `ConfirmationDialog`; keeps existing portal, focus stack, Escape behavior, backdrop behavior, layers, scroll locks and viewport metrics.
- `src/components/overlay/ModalContent.tsx`: `ModalButton`, `ModalActions`, `ResultHero`, `ResultStats`, `ResultStat`, `GameResultScreen`. Native button attributes and refs are forwarded. Fullscreen results compose within their existing exclusive layer.
- `src/styles/modal-design-system.css`: scoped tokens and visual rules. `src/styles/responsive-overlays.css` continues to own safe-area/viewport geometry and scroll containment. `src/main.tsx` loads the visual contract after structural overlay CSS.

Result dialogs use the common hero/actions composition. Gomoku and Campaign use shared stat rows; games with richer breakdowns retain their existing data layout with lighter sections. Tank Battle, Air Combat and Campaign keep only the result body scrollable; their actions are outside that scroll region. Promotion retains its independently scrolling narrative and persistent footer.

## Tokens, color, spacing and controls

- Radius: 18px outer, 10px inner; horizontal page gutter 16–24px; header/body padding 16–20px horizontally and 16px vertically; default section gap 12px. Short viewports reduce vertical padding to 12px and section gap to 8px.
- Text: 18px title (20px result, 22px ceremony), 14px body, 12px metadata. Values use semibold/tabular numerals; paragraphs use regular weight. Titles wrap instead of overflowing.
- Buttons: primary/destructive 48px minimum height, secondary/ghost/icon 44px. Icon controls use an 18px glyph on a 30px backplate within the 44px target. Action groups wrap at small widths; inputs retain 16px text and 44px targets.
- Chapter theme supplies the primary action and border/accent. Success, loss/danger, warning, reward and information use separate green, rose, amber, gold and blue tokens.
- Default/military and farm surfaces use bright text; Gomoku retains warm paper with darker ink and status colors. Item rarity and combat attribute identities remain meaningful feature accents.
- Backdrop fade: 140ms; modal entry: 180ms; confirm: 160ms; sheet: 220ms. Reduced motion removes panel movement and respects the existing application setting. Close callbacks remain immediate; no new delayed state transitions are introduced.

## Coverage audit

The source audit includes named modal files and inline dialogs in game/screen components, exclusive result flows, notification banners and portal toasts. Mastery, Uniform and ID Card were inspected: their regular pages are not converted into dialogs; related profile editing and hub sheets use the shared contract. Dice/bowl reveal covers and game pause state remain feature-owned gameplay; their actual pause/exit dialogs are migrated.

Counts by composition: 23 info, 16 confirm, 16 transaction, 15 result (including three fullscreen results), and four ceremony surfaces (including fullscreen promotion). Rank-up banner and four portal toast call sites also adopt shared tokens.

| Source | Migrated archetypes and call-site counts |
| --- | --- |
| `src/app-update/MandatoryUpdateModal.tsx` | info ×1 |
| `src/components/DelegationReportModal.tsx` | result ×1 |
| `src/components/HubNavigation.tsx` | info ×2 |
| `src/components/JourneyDutySheet.tsx` | info ×1 |
| `src/components/MedalInspectModal.tsx` | info ×1 |
| `src/components/MedalUnlockModal.tsx` | ceremony ×1 |
| `src/components/PromotionCeremony.tsx` | ceremony ×1 |
| `src/components/PromotionChallenge.tsx` | confirm ×1, ceremony ×1 |
| `src/components/RankDetailSheet.tsx` | info ×1 |
| `src/features/entertainment/bau_cua/BauCuaBetModal.tsx` | transaction ×1 |
| `src/features/entertainment/bau_cua/BauCuaResultModal.tsx` | result ×1 |
| `src/features/entertainment/big_small/BigSmallBetModal.tsx` | transaction ×1 |
| `src/features/entertainment/big_small/BigSmallResultModal.tsx` | result ×1 |
| `src/features/entertainment/big_small/BigSmallRulesModal.tsx` | info ×1 |
| `src/features/entertainment/chien_tuyen/ChienTuyenGame.tsx` | info ×1, confirm ×1 |
| `src/features/entertainment/chien_tuyen/ChienTuyenScreen.tsx` | ceremony ×1, info ×1 |
| `src/features/entertainment/chien_tuyen/components/CampaignResult.tsx` | info ×1, result ×1 |
| `src/features/entertainment/chien_tuyen/components/QuickFinishConfirmModal.tsx` | confirm ×1 |
| `src/features/entertainment/chien_tuyen/components/TroopDetailModal.tsx` | info ×1 |
| `src/features/entertainment/chien_tuyen/components/TroopUpgradeModal.tsx` | transaction ×1 |
| `src/features/entertainment/khong_kich/AirCombatCanvas.tsx` | transaction ×1, confirm ×2 |
| `src/features/entertainment/khong_kich/AirCombatResult.tsx` | result ×1 |
| `src/features/entertainment/khong_kich/KhongKichScreen.tsx` | info ×1 |
| `src/features/entertainment/tank_battle/TankBattleCanvas.tsx` | transaction ×1, confirm ×2 |
| `src/features/entertainment/tank_battle/TankBattleResult.tsx` | result ×1 |
| `src/features/journey/JourneyMapScreen.tsx` | info ×1 |
| `src/features/profile/JournalScreen.tsx` | info ×1 |
| `src/features/profile/ProfileScreen.tsx` | transaction ×2 |
| `src/features/tang_gia/TangGiaScreen.tsx` | confirm ×1 |
| `src/features/tang_gia/components/ApplyFertilizerModal.tsx` | transaction ×1 |
| `src/features/tang_gia/components/EggStorageModal.tsx` | transaction ×1 |
| `src/features/tang_gia/components/EnterPenModal.tsx` | transaction ×1 |
| `src/features/tang_gia/components/FarmStoreModal.tsx` | transaction ×2 |
| `src/features/tang_gia/components/FeedModal.tsx` | transaction ×1 |
| `src/features/tang_gia/components/KhoModal.tsx` | transaction ×2 |
| `src/features/tang_gia/components/PlantSeedModal.tsx` | transaction ×1 |
| `src/features/tang_gia/components/RewardSummaryModal.tsx` | result ×1 |
| `src/features/tang_gia/components/TroughInfoModal.tsx` | info ×1 |
| `src/features/tang_gia/components/WeatherModal.tsx` | info ×1 |
| `src/features/training/MarchRhythmGame.tsx` | confirm ×1 |
| `src/features/training/MarchRhythmResult.tsx` | result ×1 |
| `src/features/training/MarchRhythmTutorialModal.tsx` | info ×1 |
| `src/features/training/SignalCommandGame.tsx` | confirm ×1 |
| `src/features/training/SignalCommandResult.tsx` | result ×1 |
| `src/features/training/SignalCommandTutorialModal.tsx` | info ×1 |
| `src/features/training/TimingCalibrationModal.tsx` | info ×1 |
| `src/features/training/formationAssembly/FormationAssemblyGame.tsx` | result ×1, confirm ×1 |
| `src/features/training/formationAssembly/FormationAssemblyResult.tsx` | result ×1 |
| `src/features/training/formationAssembly/FormationTutorialModal.tsx` | info ×1 |
| `src/features/training/gomoku-v13/ui/GomokuGameScreen.tsx` | confirm ×1 |
| `src/features/training/gomoku-v13/ui/GomokuResultModal.tsx` | result ×1 |
| `src/features/training/gomoku-v13/ui/GomokuTutorialModal.tsx` | info ×1 |
| `src/features/training/radarTracking/RadarTrackingGame.tsx` | confirm ×3, result ×1 |
| `src/features/training/radarTracking/RadarTrackingResult.tsx` | result ×1 |
| `src/features/training/radarTracking/RadarTrackingTutorialModal.tsx` | info ×1 |
| `src/features/training/shootingRange/ShootingGame.tsx` | confirm ×1 |
| `src/features/training/shootingRange/ShootingResult.tsx` | result ×1 |
| `src/features/training/shootingRange/ShootingTutorialModal.tsx` | info ×1 |

## Legacy cleanup

Removed feature-owned outer modal width/background/padding/animation stacks, the military modal/sheet wrappers and their unused selectors, the old battle result surface rules, CT modal/result/statistics shells, old profile sheet styling, and Gomoku-specific result/backdrop/keyframes. Shared structural overlay spacing/button duplicates and the unused legacy scroll-body compatibility class are removed. CT detail/statistics styles now use the common readable typography and separators at their original definitions. Board ink/win effects and gameplay styles remain in their feature files.

## Static validation and scope

- `npm run lint` (`tsc --noEmit`) and `git diff --check`.
- AST comparison of feature callbacks, form-control attributes and conditional expressions against the source base; added stat-value props contain the existing display expressions.
- AST comparison with JSX and imports excluded confirms feature calculations/state transitions are unchanged. The only component-level removal is the unused `MilitaryModal`/`MilitarySheet` presentation wrappers.
- Source review of dialog coverage, class ownership, mobile wrapping, footer/scroll structure, theme/semantic colors, focus refs, labels, and legacy CSS. CSS is parsed statically.

No gameplay tests, simulations, runtime rendering, screenshots or device QA were run, as requested. Visual behavior on actual devices has not been measured. Gameplay, rewards, score/XP, economy, timers, prices, saves, AI, combat, RNG and unlock calculations are unchanged. GitHub test workflows are skipped for this delivery via the commit's `[skip ci]` marker.

## Changed files

- `docs/modal-design-system.md`
- `src/App.tsx`
- `src/app-update/MandatoryUpdateModal.tsx`
- `src/components/DelegationReportModal.tsx`
- `src/components/HubNavigation.tsx`
- `src/components/JourneyDutySheet.tsx`
- `src/components/MedalInspectModal.tsx`
- `src/components/MedalUnlockModal.tsx`
- `src/components/PromotionCeremony.tsx`
- `src/components/PromotionChallenge.tsx`
- `src/components/RankDetailSheet.tsx`
- `src/components/RankUpNotificationBanner.tsx`
- `src/components/military/MilitaryUI.tsx`
- `src/components/overlay/AppOverlay.tsx`
- `src/components/overlay/ModalContent.tsx`
- `src/features/entertainment/bau_cua/BauCuaBetModal.tsx`
- `src/features/entertainment/bau_cua/BauCuaResultModal.tsx`
- `src/features/entertainment/big_small/BigSmallBetModal.tsx`
- `src/features/entertainment/big_small/BigSmallResultModal.tsx`
- `src/features/entertainment/big_small/BigSmallRulesModal.tsx`
- `src/features/entertainment/chien_tuyen/ChienTuyenGame.tsx`
- `src/features/entertainment/chien_tuyen/ChienTuyenScreen.tsx`
- `src/features/entertainment/chien_tuyen/chienTuyen.css`
- `src/features/entertainment/chien_tuyen/chienTuyenUxPolish.css`
- `src/features/entertainment/chien_tuyen/components/CampaignResult.tsx`
- `src/features/entertainment/chien_tuyen/components/QuickFinishConfirmModal.tsx`
- `src/features/entertainment/chien_tuyen/components/TroopDetailModal.tsx`
- `src/features/entertainment/chien_tuyen/components/TroopUpgradeModal.tsx`
- `src/features/entertainment/khong_kich/AirCombatCanvas.tsx`
- `src/features/entertainment/khong_kich/AirCombatResult.tsx`
- `src/features/entertainment/khong_kich/KhongKichScreen.tsx`
- `src/features/entertainment/tank_battle/TankBattleCanvas.tsx`
- `src/features/entertainment/tank_battle/TankBattleResult.tsx`
- `src/features/entertainment/tank_battle/TankBattleScreen.tsx`
- `src/features/journey/JourneyMapScreen.tsx`
- `src/features/profile/JournalScreen.tsx`
- `src/features/profile/MedalsScreen.tsx`
- `src/features/profile/ProfileScreen.tsx`
- `src/features/tang_gia/TangGiaScreen.tsx`
- `src/features/tang_gia/components/ApplyFertilizerModal.tsx`
- `src/features/tang_gia/components/EggStorageModal.tsx`
- `src/features/tang_gia/components/EnterPenModal.tsx`
- `src/features/tang_gia/components/FarmStoreModal.tsx`
- `src/features/tang_gia/components/FeedModal.tsx`
- `src/features/tang_gia/components/KhoModal.tsx`
- `src/features/tang_gia/components/PlantSeedModal.tsx`
- `src/features/tang_gia/components/RewardSummaryModal.tsx`
- `src/features/tang_gia/components/TroughInfoModal.tsx`
- `src/features/tang_gia/components/WeatherModal.tsx`
- `src/features/training/MarchRhythmGame.tsx`
- `src/features/training/MarchRhythmResult.tsx`
- `src/features/training/MarchRhythmTutorialModal.tsx`
- `src/features/training/SignalCommandGame.tsx`
- `src/features/training/SignalCommandResult.tsx`
- `src/features/training/SignalCommandTutorialModal.tsx`
- `src/features/training/TimingCalibrationModal.tsx`
- `src/features/training/formationAssembly/FormationAssemblyGame.tsx`
- `src/features/training/formationAssembly/FormationAssemblyResult.tsx`
- `src/features/training/formationAssembly/FormationTutorialModal.tsx`
- `src/features/training/gomoku-v13/ui/GomokuGameScreen.tsx`
- `src/features/training/gomoku-v13/ui/GomokuResultModal.tsx`
- `src/features/training/gomoku-v13/ui/GomokuTutorialModal.tsx`
- `src/features/training/gomoku-v13/ui/gomokuPaper.css`
- `src/features/training/radarTracking/RadarTrackingGame.tsx`
- `src/features/training/radarTracking/RadarTrackingResult.tsx`
- `src/features/training/radarTracking/RadarTrackingTutorialModal.tsx`
- `src/features/training/shootingRange/ShootingGame.tsx`
- `src/features/training/shootingRange/ShootingResult.tsx`
- `src/features/training/shootingRange/ShootingTutorialModal.tsx`
- `src/main.tsx`
- `src/styles/military-ui.css`
- `src/styles/modal-design-system.css`
- `src/styles/responsive-overlays.css`

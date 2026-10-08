import icons from './tool-icons.png?url';
import normal from '../ui/shared/panel-normal.png?url';
import selected from '../ui/shared/panel-selected.png?url';
import pressed from '../ui/shared/panel-pressed.png?url';
import disabled from '../ui/shared/panel-disabled.png?url';

/** Management materials, intentionally separate from farm/day and farm/night. */
export default {
  version: 1, kind: 'farm-ui',
  skins: { normal, selected, pressed, disabled },
  icons: { src: icons, columns: 4, rows: 3, cellWidth: 128, cellHeight: 128 },
};

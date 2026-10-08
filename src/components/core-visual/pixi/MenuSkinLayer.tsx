import { Container, type NineSliceSprite } from "pixi.js";
import { PixiSceneHost } from "./PixiSceneHost";
import { acquirePixiTexture, type PixiAssetLease } from "./pixiAssets";
import { UI_SKIN_URLS } from "./UiSkinAtlas";
import { createUiSpriteSkin, layoutUiSpriteSkin } from "./UiSpriteSkin";
import type { DomVisualAnchor } from "../DomVisualAnchors";
import type { PixiLayerCallbacks } from "./useDeferredPixiLayer";
import type { PixiSceneFactory } from "./pixiSceneTypes";
import type { Texture } from "pixi.js";
type Props = { anchors: DomVisualAnchor[] };

const factory: PixiSceneFactory<Props> = (app, initial) => {
  const root = new Container(); root.eventMode = "none"; app.stage.addChild(root);
  const nodes: NineSliceSprite[] = [], leases: PixiAssetLease<Texture>[] = [];
  let props = initial, disposed = false;
  const draw = () => {
    if (disposed || leases.length < 2) return;
    while (nodes.length > props.anchors.length) nodes.pop()!.destroy();
    props.anchors.forEach((anchor, i) => {
      const texture = leases[anchor.selected ? 1 : 0].value;
      if (!texture) return;
      if (!nodes[i]) nodes[i] = root.addChild(createUiSpriteSkin(texture, anchor.x, anchor.y, anchor.width, anchor.height));
      nodes[i].texture = texture;
      layoutUiSpriteSkin(nodes[i], anchor.x, anchor.y, anchor.width, anchor.height);
    });
    if (!document.hidden) app.render();
  };
  const ready = Promise.all([acquirePixiTexture(UI_SKIN_URLS.normal), acquirePixiTexture(UI_SKIN_URLS.selected)]).then(values => {
    if (disposed) { values.forEach(lease => lease.release()); return false; }
    leases.push(...values); draw(); return values.every(lease => !!lease.value);
  });
  return { ready, update(next) { props = next; draw(); }, resize: draw, setReducedMotion() {}, tick() {},
    destroy() { disposed = true; root.destroy({ children: true }); leases.forEach(lease => lease.release()); } };
};
export default function MenuSkinLayer({ anchors, ...callbacks }: Props & PixiLayerCallbacks) {
  // Skin geometry is static between DOM events; no continuous rendering required.
  return <PixiSceneHost factory={factory} visualProps={{ anchors }} {...callbacks} reducedMotion />;
}

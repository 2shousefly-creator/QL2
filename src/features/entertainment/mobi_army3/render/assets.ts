import type { Animation } from "../types";
export interface AssetManifest {
  version: number;
  atlas: string;
  background: string;
  sourceSize: [number, number];
  frames: Record<string, [number, number, number, number]>;
  animations: Record<
    Animation,
    { frames: string[]; fps: number; loop: boolean }
  >;
}
export interface Assets {
  manifest: AssetManifest;
  atlas: HTMLImageElement;
  background: HTMLImageElement;
  destroy: () => void;
}
async function loadImage(
  url: string,
  signal: AbortSignal,
): Promise<HTMLImageElement> {
  const response = await fetch(url, { signal });
  if (!response.ok)
    throw new Error(`Không tải được hình (${response.status}).`);
  const blob = await response.blob(),
    objectUrl = URL.createObjectURL(blob),
    img = new Image();
  try {
    img.src = objectUrl;
    await img.decode();
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    return img;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
export async function loadAssets(
  signal: AbortSignal,
  onProgress: (n: number) => void,
): Promise<Assets> {
  const response = await fetch("/assets/mobi_army3/manifest-v1.json", {
    signal,
  });
  if (!response.ok) throw new Error("Không tải được danh mục đồ họa.");
  const manifest: AssetManifest = await response.json();
  if (
    manifest.version !== 1 ||
    !manifest.frames?.gunner ||
    !manifest.animations?.walk
  )
    throw new Error("Phiên bản đồ họa không tương thích.");
  for (const path of [manifest.atlas, manifest.background])
    if (typeof path !== "string" || !path.startsWith("/assets/mobi_army3/"))
      throw new Error("Đường dẫn đồ họa không hợp lệ.");
  if (!Array.isArray(manifest.sourceSize) || manifest.sourceSize.length !== 2)
    throw new Error("Thiếu kích thước atlas.");
  for (const frame of Object.values(manifest.frames)) {
    if (
      !Array.isArray(frame) ||
      frame.length !== 4 ||
      !frame.every(Number.isFinite) ||
      frame[0] < 0 ||
      frame[1] < 0 ||
      frame[2] <= 0 ||
      frame[3] <= 0 ||
      frame[0] + frame[2] > manifest.sourceSize[0] ||
      frame[1] + frame[3] > manifest.sourceSize[1]
    )
      throw new Error("Vùng cắt sprite không hợp lệ.");
  }
  for (const animation of Object.values(manifest.animations)) {
    if (
      !Array.isArray(animation.frames) ||
      !animation.frames.length ||
      !animation.frames.every((id) => Object.hasOwn(manifest.frames, id)) ||
      !Number.isFinite(animation.fps) ||
      animation.fps <= 0
    )
      throw new Error("Animation không hợp lệ.");
  }
  onProgress(15);
  const atlas = await loadImage(manifest.atlas, signal);
  onProgress(60);
  let background: HTMLImageElement;
  try {
    background = await loadImage(manifest.background, signal);
  } catch (error) {
    atlas.src = "";
    throw error;
  }
  onProgress(100);
  if (
    atlas.width !== manifest.sourceSize[0] ||
    atlas.height !== manifest.sourceSize[1]
  ) {
    atlas.src = "";
    background.src = "";
    throw new Error("Kích thước atlas không khớp metadata.");
  }
  return {
    manifest,
    atlas,
    background,
    destroy() {
      atlas.src = "";
      background.src = "";
    },
  };
}
export function sprite(
  ctx: CanvasRenderingContext2D,
  a: Assets,
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  anchorX = 0.5,
  anchorY = 1,
) {
  const frame = a.manifest.frames[id] ?? a.manifest.frames.gunner;
  ctx.drawImage(
    a.atlas,
    ...frame,
    x - width * anchorX,
    y - height * anchorY,
    width,
    height,
  );
}

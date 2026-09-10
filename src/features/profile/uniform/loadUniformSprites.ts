import { getUniformArtConfig } from "./uniformArtCatalog";

const pendingImages = new Map<string, Promise<void>>();

function decodeSprite(src: string, priority: "high" | "low" | "auto"): Promise<void> {
  const cached = pendingImages.get(src);
  if (cached) return cached;
  const image = new Image();
  image.fetchPriority = priority;
  image.src = src;
  const ready = image.decode().catch((error: unknown) => {
    pendingImages.delete(src);
    throw error;
  });
  pendingImages.set(src, ready);
  return ready;
}

/** Decode both layers before committing a preview selection. Failed loads may retry. */
export async function loadUniformSprites(familyId: string, priority: "high" | "low" | "auto" = "high"): Promise<void> {
  const config = getUniformArtConfig(familyId);
  await Promise.all([decodeSprite(config.uniformSrc, priority), decodeSprite(config.shoulderSrc, priority)]);
}

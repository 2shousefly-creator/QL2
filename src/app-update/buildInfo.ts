declare const __APP_BUILD_ID__: string | undefined;
declare const __APP_PUBLISHED_AT__: string | undefined;

export const APP_BUILD_ID: string =
  typeof __APP_BUILD_ID__ !== "undefined"
    ? __APP_BUILD_ID__
    : "dev-local-build";

export const APP_PUBLISHED_AT: string =
  typeof __APP_PUBLISHED_AT__ !== "undefined"
    ? __APP_PUBLISHED_AT__
    : new Date().toISOString();

export function getShortBuildId(buildId: string = APP_BUILD_ID): string {
  if (buildId.length > 12) {
    return buildId.slice(0, 10) + "...";
  }
  return buildId;
}

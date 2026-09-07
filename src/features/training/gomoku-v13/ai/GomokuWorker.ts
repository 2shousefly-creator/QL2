import { search } from "./SearchEngine";
import { identityOf, type AiRequest, type AiResponse } from "./aiTypes";
import { emptyResult, validRequest } from "./WorkerProtocol";

// Dedicated module worker. No UI, rewards, storage, network, or React imports.
const scope = self as unknown as { onmessage: ((event: MessageEvent<AiRequest>) => void) | null;
  postMessage: (message: AiResponse) => void };
scope.onmessage = ({ data: request }) => {
  if (!validRequest(request)) return;
  try {
    let lastProgress = -Infinity;
    const result = search(request, { onProgress: progress => {
      const now = performance.now();
      if (now - lastProgress < 100 && progress.proofStatus !== "proven_win") return;
      lastProgress = now;
      scope.postMessage({ ...identityOf(request), ...progress, kind: "progress" });
    } });
    scope.postMessage({ ...identityOf(request), ...result, kind: "result" });
  } catch {
    scope.postMessage({ ...identityOf(request), ...emptyResult("error", "search_failed"), kind: "result" });
  }
};

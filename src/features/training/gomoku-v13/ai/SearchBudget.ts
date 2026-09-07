export class SearchStopped extends Error {}
export class SearchBudget {
  nodes = 0;
  constructor(readonly deadline: number, readonly maxNodes: number,
    readonly cancelled: () => boolean = () => false, readonly now: () => number = () => performance.now()) {}
  check(): void {
    if (this.nodes >= this.maxNodes || this.now() >= this.deadline || this.cancelled()) throw new SearchStopped();
  }
  visit(): void { this.check(); this.nodes++; }
}

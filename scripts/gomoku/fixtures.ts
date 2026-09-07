import type { GomokuMark } from '../../src/features/training/gomoku-v13/domain/gomokuTypes';
import type { SearchStone } from '../../src/features/training/gomoku-v13/ai/BoardCore';
import type { WinProof } from '../../src/features/training/gomoku-v13/ai/TacticalSolver';
import { GOMOKU_RULE_ID } from '../../src/features/training/gomoku-v13/domain/GomokuRules';
export const stones = (X: number[][], O: number[][] = []): SearchStone[] => [
  ...X.map(([x,y]) => ({x,y,mark:'X' as const})), ...O.map(([x,y]) => ({x,y,mark:'O' as const}))
];
export const p = (x:number,y:number) => ({x,y});
export type Fixture = {id:string; ruleId:typeof GOMOKU_RULE_ID; split:'development'|'holdout'; side:GomokuMark;
 stones:SearchStone[]; accepted?:ReturnType<typeof p>[]; certificate?:WinProof; difficulty:string; source:string};
const common = {ruleId:GOMOKU_RULE_ID,side:'X' as const,source:'Hand-authored position; expected tactics checked by independent checkWinAt oracle/certificate verifier. Not an expert-rated puzzle.'};
export const FIXTURES:Fixture[] = [
 {...common,id:'broken-four',split:'development',difficulty:'immediate',stones:stones([[0,0],[1,0],[3,0],[4,0]]),accepted:[p(2,0)]},
 {...common,id:'open-four',split:'development',difficulty:'immediate',stones:stones([[0,0],[1,0],[2,0],[3,0]]),accepted:[p(-1,0),p(4,0)]},
 {...common,id:'block-far-cluster',split:'development',difficulty:'defense',stones:stones([[0,0],[0,1],[1,0],[2,2]],[[1000,-500],[1001,-500],[1003,-500],[1004,-500]]),accepted:[p(1002,-500)]},
 {...common,id:'cross-three',split:'development',difficulty:'VCT',stones:stones([[-1,0],[1,0],[0,-1],[0,1]],[[10,10],[12,9],[9,13]]),accepted:[p(0,0)]},
 {...common,id:'seven-ply-ladder',split:'development',difficulty:'VCF',stones:stones([[0,0],[1,0],[3,0],[2,1],[2,2],[4,3],[5,3]],[[-1,0],[2,-1],[5,4]]),
 certificate:{kind:'four',move:p(2,0),reply:p(4,0),next:{kind:'four',move:p(2,3),reply:p(2,4),next:{kind:'fork',move:p(3,3),wins:[p(1,3),p(6,3)]}}}},
 {...common,id:'holdout-two-gap-completion',split:'holdout',difficulty:'immediate',stones:stones([[-8,4],[-7,5],[-5,7],[-4,8]],[[1,2],[3,2]]),accepted:[p(-6,6)]},
 {...common,id:'holdout-six-connection',split:'holdout',difficulty:'overline',stones:stones([[21,-9],[22,-9],[23,-9],[25,-9],[26,-9]],[[20,-9]]),accepted:[p(24,-9)]},
 {...common,id:'holdout-counter-kill',split:'holdout',difficulty:'counter-kill',stones:stones([[8,1],[8,2],[8,3],[8,4]],[[0,0],[1,0],[2,0],[3,0]]),accepted:[p(8,0),p(8,5)]},
 {...common,id:'holdout-four-three',split:'holdout',difficulty:'VCF',stones:stones([[-2,0],[-1,0],[1,0],[0,-1],[0,-2]],[[-3,0],[10,7],[12,7]]),
 certificate:{kind:'four',move:p(0,0),reply:p(2,0),next:{kind:'fork',move:p(0,-3),wins:[p(0,-4),p(0,1)]}}},
 {...common,id:'holdout-cross-cost',split:'holdout',difficulty:'double-four',stones:stones([[-3,0],[-2,0],[-1,0],[0,-3],[0,-2],[0,-1]],[[-4,0],[0,-4],[9,10]]),
 certificate:{kind:'fork',move:p(0,0),wins:[p(1,0),p(0,1)]}},
 {...common,id:'holdout-remote-defense',split:'holdout',difficulty:'defense',stones:stones([[2,2],[3,2],[4,3],[3,4]],[[8000,9000],[8000,9001],[8000,9002],[8000,9004]]),accepted:[p(8000,9003)]},
];

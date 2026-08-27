export type BauCuaSymbol = "bau" | "cua" | "tom" | "ca" | "ga" | "nai";

export type BauCuaWinType =
  | "perfect_win"
  | "big_win"
  | "regular_win"
  | "draw"
  | "loss";

export type BauCuaBets = Record<BauCuaSymbol, number>;

export type BauCuaRound = {
  id: string;
  timestamp: number;
  bets: BauCuaBets;
  result: [BauCuaSymbol, BauCuaSymbol, BauCuaSymbol];
  totalBet: number;
  totalReturn: number;
  net: number;
  preGold: number;
  postGold: number;
};

export type EntertainmentGameId = "bau_cua" | "big_small" | "khong_kich" | "tank_battle" | "chien_tuyen";

export type BigSmallBetId = "small" | "big";

export type BigSmallBets = Record<BigSmallBetId, number>;

export type BigSmallWinType =
  | "big_win"
  | "regular_win"
  | "draw"
  | "loss";

export type BigSmallRound = {
  id: string;
  timestamp: number;
  bets: BigSmallBets;
  dice: [number, number, number];
  total: number;
  isTriple: boolean;
  tripleValue: number | null;
  winningDoor: BigSmallBetId;
  totalBet: number;
  totalReturn: number;
  net: number;
  preGold: number;
  postGold: number;
};

export type EntertainmentGameMeta = {
  id: EntertainmentGameId;
  title: string;
  subtitle: string;
  description: string;
  status: "available" | "coming_soon";
  badge?: string;
  icon?: string;
};

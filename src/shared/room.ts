import type { Direction, RoundContent } from "./api";

export interface RoomPlayer {
  username: string;
  score: number;
  answeredCard: number;
  choiceIdx: number | null;
  correct: boolean | null;
}

export interface RoomChatMessage {
  id: string;
  username: string;
  text: string;
  ts: number;
}

export interface RoomState {
  code: string;
  host: string;
  direction: Direction;
  status: "lobby" | "playing" | "ended";
  currentCard: number;
  cards: RoundContent[];
  players: RoomPlayer[];
  chat: RoomChatMessage[];
  updatedAt: number;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function canStart(room: RoomState, username: string): boolean {
  return room.host === username && room.players.length >= 1;
}

export function canAdvance(room: RoomState): boolean {
  return room.players.every((p) => p.answeredCard > room.currentCard);
}

export function everyoneAnswered(room: RoomState): boolean {
  return room.players.every((p) => p.answeredCard > room.currentCard);
}

export function sanitizeChatText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[<>&"']/g, "")
    .slice(0, 140)
    .trim();
}
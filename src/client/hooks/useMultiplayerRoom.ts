import { useState, useCallback, useEffect, useRef } from "react";
import type { RoomState, RoomPlayer } from "@/shared/room";
import type { Direction } from "@/shared/api";

export function useMultiplayerRoom() {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pollRoom = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
        }
      }
    } catch {
      // Polling error - keep existing room state
    }
  }, []);

  useEffect(() => {
    if (room?.code) {
      pollRef.current = setInterval(() => {
        void pollRoom(room.code);
      }, 1500);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [room?.code, pollRoom]);

  const createRoom = useCallback(async (direction: Direction) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  }, []);

  const startRoom = useCallback(async () => {
    if (!room) return;
    try {
      const res = await fetch(`/api/rooms/${room.code}/start`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start room");
    }
  }, [room]);

  const submitRoomAnswer = useCallback(async (choiceIdx: number, correct: boolean, points: number) => {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.code}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choiceIdx, correct, points }),
      });
    } catch {
      // Answer submission error
    }
  }, [room]);

  const nextRoomCard = useCallback(async () => {
    if (!room) return;
    try {
      const res = await fetch(`/api/rooms/${room.code}/next`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
        }
      }
    } catch {
      // Next card error
    }
  }, [room]);

  const sendChat = useCallback(async (text: string) => {
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.code}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch {
      // Chat error
    }
  }, [room]);

  const leaveRoom = useCallback(() => {
    setRoom(null);
    setError(null);
  }, []);

  return {
    room,
    loading,
    error,
    createRoom,
    joinRoom,
    startRoom,
    submitRoomAnswer,
    nextRoomCard,
    sendChat,
    leaveRoom,
  };
}
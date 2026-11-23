import { Hono } from "hono";
import { redis, reddit } from "@devvit/web/server";
import type { ErrorResponse } from "../../shared/api";
import { validateWord } from "../../shared/validateWord";

export const community = new Hono();

const store = redis.global ?? redis;

async function getUsername(): Promise<string | null> {
  try {
    return (await reddit.getCurrentUsername()) ?? null;
  } catch {
    return null;
  }
}

// ===== Leaderboard =====

community.get("/leaderboard", async (c) => {
  try {
    const direction = c.req.query("direction") || "zh2ja";
    if (!["zh2ja", "ja2zh", "en"].includes(direction)) {
      return c.json<ErrorResponse>({ status: "error", message: "Invalid direction" }, 400);
    }

    const key = `leaderboard:${direction}`;
    const entries = await store.zRange(key, 0, 9);
    const scores: { username: string; score: number }[] = [];

    for (const entry of entries) {
      // Devvit Redis zRange returns { member, score } objects
      const member = typeof entry === "string" ? entry : (entry as { member: string }).member;
      const score = typeof entry === "string" ? 0 : (entry as { score: number }).score;
      scores.push({ username: member, score: score ?? 0 });
    }

    return c.json({ type: "leaderboard", direction, scores });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return c.json<ErrorResponse>({ status: "error", message: "Failed to fetch leaderboard" }, 400);
  }
});

// ===== Community Word Pool =====

community.get("/words", async (c) => {
  try {
    const relation = c.req.query("relation");
    const q = c.req.query("q")?.toLowerCase();

    const raw = await store.hGetAll("words:community");
    const words = Object.entries(raw || {}).map(([, data]) => {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }).filter(Boolean);

    let filtered = words as Array<{ id: number; form: string; reading: string; meaning_ja: string; meaning_zh: string; relation: string; author: string; votes: number }>;

    if (relation) {
      filtered = filtered.filter((w) => w.relation === relation);
    }
    if (q) {
      filtered = filtered.filter((w) =>
        w.form.includes(q) || w.reading.toLowerCase().includes(q) ||
        w.meaning_ja.toLowerCase().includes(q) || w.meaning_zh.toLowerCase().includes(q)
      );
    }

    return c.json({ type: "words", words: filtered });
  } catch (error) {
    console.error("Words list error:", error);
    return c.json<ErrorResponse>({ status: "error", message: "Failed to fetch words" }, 400);
  }
});

community.post("/words", async (c) => {
  try {
    const username = await getUsername();
    if (!username) {
      return c.json<ErrorResponse>({ status: "error", message: "username required" }, 400);
    }

    const body = await c.req.json<Record<string, unknown>>();
    const errors = validateWord(body);
    if (Object.keys(errors).length > 0) {
      return c.json<ErrorResponse>({ status: "error", message: "Validation failed" }, 400);
    }

    const id = Date.now();
    const word = {
      id,
      form: String(body.form ?? ""),
      reading: String(body.reading ?? ""),
      meaning_ja: String(body.meaning_ja ?? ""),
      meaning_zh: String(body.meaning_zh ?? ""),
      relation: String(body.relation ?? "false"),
      note: String(body.note ?? ""),
      author: username,
      votes: 1,
      createdAt: Date.now(),
    };

    await store.hSet("words:community", { [id]: JSON.stringify(word) });

    return c.json({ type: "word", word });
  } catch (error) {
    console.error("Word submit error:", error);
    return c.json<ErrorResponse>({ status: "error", message: "Failed to submit word" }, 400);
  }
});

community.patch("/words/:id", async (c) => {
  try {
    const username = await getUsername();
    if (!username) {
      return c.json<ErrorResponse>({ status: "error", message: "username required" }, 400);
    }

    const id = c.req.param("id");
    const raw = await store.hGet("words:community", id);
    if (!raw) {
      return c.json<ErrorResponse>({ status: "error", message: "Word not found" }, 404);
    }

    const existing = JSON.parse(raw);
    if (existing.author !== username) {
      return c.json<ErrorResponse>({ status: "error", message: "Only the author can edit" }, 400);
    }

    const body = await c.req.json<Record<string, unknown>>();
    const errors = validateWord({ ...existing, ...body });
    if (Object.keys(errors).length > 0) {
      return c.json<ErrorResponse>({ status: "error", message: "Validation failed" }, 400);
    }

    const updated = { ...existing, ...body, id: parseInt(id, 10) };
    await store.hSet("words:community", { [id]: JSON.stringify(updated) });

    return c.json({ type: "word", word: updated });
  } catch (error) {
    console.error("Word edit error:", error);
    return c.json<ErrorResponse>({ status: "error", message: "Failed to edit word" }, 400);
  }
});

community.delete("/words/:id", async (c) => {
  try {
    const username = await getUsername();
    if (!username) {
      return c.json<ErrorResponse>({ status: "error", message: "username required" }, 400);
    }

    const id = c.req.param("id");
    const raw = await store.hGet("words:community", id);
    if (!raw) {
      return c.json<ErrorResponse>({ status: "error", message: "Word not found" }, 404);
    }

    const existing = JSON.parse(raw);
    if (existing.author !== username) {
      return c.json<ErrorResponse>({ status: "error", message: "Only the author can delete" }, 400);
    }

    await store.hDel("words:community", [id]);

    return c.json({ type: "word", deleted: parseInt(id, 10) });
  } catch (error) {
    console.error("Word delete error:", error);
    return c.json<ErrorResponse>({ status: "error", message: "Failed to delete word" }, 400);
  }
});

community.put("/words/:id/vote", async (c) => {
  try {
    const id = c.req.param("id");
    const raw = await store.hGet("words:community", id);
    if (!raw) {
      return c.json<ErrorResponse>({ status: "error", message: "Word not found" }, 404);
    }

    const existing = JSON.parse(raw);
    const body = await c.req.json<{ vote: number }>();
    const vote = body.vote === -1 ? -1 : 1;

    existing.votes = (existing.votes || 0) + vote;
    await store.hSet("words:community", { [id]: JSON.stringify(existing) });

    return c.json({ type: "vote", id: parseInt(id, 10), votes: existing.votes });
  } catch (error) {
    console.error("Vote error:", error);
    return c.json<ErrorResponse>({ status: "error", message: "Failed to vote" }, 400);
  }
});

// ===== Personal Missed Words (My Traps) =====

community.get("/me/missed", async (c) => {
  try {
    const username = await getUsername();
    if (!username) {
      return c.json<ErrorResponse>({ status: "error", message: "username required" }, 400);
    }

    const raw = await store.hGetAll(`missed:${username}`);
    const missed = Object.entries(raw || {}).map(([, data]) => {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return c.json({ type: "missed", missed });
  } catch (error) {
    console.error("Missed words error:", error);
    return c.json<ErrorResponse>({ status: "error", message: "Failed to fetch missed words" }, 400);
  }
});

community.delete("/me/missed/:wordId", async (c) => {
  try {
    const username = await getUsername();
    if (!username) {
      return c.json<ErrorResponse>({ status: "error", message: "username required" }, 400);
    }

    const wordId = c.req.param("wordId");
    await store.hDel(`missed:${username}`, [wordId]);

    return c.json({ type: "missed", cleared: parseInt(wordId, 10) });
  } catch (error) {
    console.error("Clear trap error:", error);
    return c.json<ErrorResponse>({ status: "error", message: "Failed to clear trap" }, 400);
  }
});
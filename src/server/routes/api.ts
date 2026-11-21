import { Hono } from "hono";
import { context, redis, reddit } from "@devvit/web/server";
import type {
  DailyResponse,
  ScoreRequest,
  ScoreResponse,
  ShareRequest,
  ShareResponse,
  ErrorResponse,
  RoundContent,
  Word,
  OptionSet,
  InitResponse,
  IncrementResponse,
  DecrementResponse,
} from "../../shared/api";
import { wordPool, type PoolWord } from "../../shared/wordPool";

export const api = new Hono();

const EPOCH_START = new Date("2025-01-01T00:00:00Z");

function getPuzzleNumber(date: Date = new Date()): number {
  const diff = date.getTime() - EPOCH_START.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function getDailySeed(date: Date = new Date()): string {
  return date.toISOString().split("T")[0]!;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

// Convert PoolWord to Word for server-side use
function toServerWord(p: PoolWord): Word {
  const hit = /JP:\s*(.+?)\s*;\s*ZH:\s*(.+)$/i.exec(p.meaning_en.trim());
  let ja: string, zh: string;
  if (hit) {
    ja = hit[1]!.trim();
    zh = hit[2]!.trim().replace(/[.;]+$/, "");
  } else {
    const same = p.meaning_en.trim().replace(/[.;]+$/, "");
    ja = same;
    zh = same;
  }
  const REL: Record<string, Word["relation"]> = {
    true_friend: "true",
    false_friend: "false",
    half_friend: "partial",
  };
  const relation = REL[p.relation] ?? "partial";
  return {
    id: p.id,
    form: p.kanji,
    zhForm: p.kanji,
    reading: p.jp_reading,
    pinyin: p.zh_pinyin,
    ja,
    zh,
    relation,
    category: relation === "true" ? "a true friend — trust your instinct" :
              relation === "false" ? "a false friend — your instinct is a trap" :
              "a half friend — related, but shifted",
    example: `Japanese: ${p.jp_reading} · Chinese: ${p.zh_pinyin}`,
    facts: [p.fun_fact],
    clues: p.clues,
    radical: p.radical,
  };
}

// Convert the entire word pool
const SERVER_WORD_POOL: Word[] = wordPool.map(toServerWord);

function isFalseFriend(word: Word): boolean {
  return word.relation === "false";
}

function pickDrop(correct: number, n: number): number[] {
  const wrong = [0, 1, 2, 3].filter((i) => i !== correct);
  const keep = wrong[n % 3]!;
  return wrong.filter((i) => i !== keep);
}

function optionSet(
  answer: string,
  trap: string | null,
  pool: string[],
  n: number,
  salt: string
): OptionSet {
  const norm = (x: string) => x.trim().toLowerCase();
  const picks: string[] = [];
  if (trap && norm(trap) !== norm(answer)) picks.push(trap);
  let k = hash(`${n}-${salt}-d`);
  for (let tries = 0; picks.length < 3 && tries < 500; tries++) {
    const o = pool[k % pool.length]!;
    if (norm(o) !== norm(answer) && !picks.some((p) => norm(p) === norm(o))) picks.push(o);
    k = (Math.imul(k, 31) + 7) >>> 0;
  }
  const correct = hash(`${n}-${salt}-c`) % 4;
  const options = [...picks];
  options.splice(correct, 0, answer);
  return { options, correct, drop: pickDrop(correct, hash(`${n}-${salt}-e`)) };
}

function dealWord(w: Word, pool: Word[], n: number): RoundContent {
  const others = pool.filter((x) => x.id !== w.id);
  const trapJa = w.relation === "true" ? null : w.zh;
  const trapZh = w.relation === "true" ? null : w.ja;
  const ja = optionSet(w.ja, trapJa, others.map((x) => x.ja), n, "ja");
  const zh = optionSet(w.zh, trapZh, others.map((x) => x.zh), n, "zh");
  return { word: { ...w, kind: "falseFriend" }, ...ja, zh };
}

function dealRound(
  n: number,
  avoid: number[] = [],
  pool: Word[]
): RoundContent {
  let idx = n % pool.length;
  for (let t = 0; t < pool.length && avoid.includes(pool[idx]!.id); t++) idx = (idx + 1) % pool.length;
  return dealWord(pool[idx]!, pool, n);
}

function dealDailyCards(
  puzzleNum: number,
  pool: Word[]
): RoundContent[] {
  const cards: RoundContent[] = [];
  const usedIds = new Set<number>();

  for (let i = 0; i < 5; i++) {
    let n = puzzleNum * 5 + i;
    let card: RoundContent;

    if (i === 0) {
      const nonFalsePool = pool.filter((w) => !isFalseFriend(w));
      let idx = n % nonFalsePool.length;
      for (let t = 0; t < nonFalsePool.length && usedIds.has(nonFalsePool[idx]!.id); t++) {
        idx = (idx + 1) % nonFalsePool.length;
      }
      card = dealWord(nonFalsePool[idx]!, nonFalsePool, n);
    } else {
      card = dealRound(n, Array.from(usedIds), pool);
    }

    usedIds.add(card.word.id);
    cards.push(card);
  }

  return cards;
}

async function getStats(puzzleNumber: number): Promise<Record<string, { [choice: string]: number }>> {
  const stats: Record<string, { [choice: string]: number }> = {};
  for (let i = 0; i < 5; i++) {
    const key = `stats:${puzzleNumber}:${i}`;
    const data = await redis.hGetAll(key);
    const cardStats: { [choice: string]: number } = {};
    for (const [k, v] of Object.entries(data || {})) {
      cardStats[k] = parseInt(v, 10);
    }
    stats[`card_${i}`] = cardStats;
  }
  return stats;
}

api.get("/daily", async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error("API Daily Error: postId not found in devvit context");
    return c.json<ErrorResponse>(
      {
        status: "error",
        message: "postId is required but missing from context",
      },
      400
    );
  }

  try {
    const username = await reddit.getCurrentUsername();
    const [streakStr, playedToday] = await Promise.all([
      redis.get(`streak:${username}`),
      redis.get(`played:${username}:${getPuzzleNumber(new Date())}`),
    ]);

    const streak = streakStr ? parseInt(streakStr, 10) : 0;
    const puzzleNumber = getPuzzleNumber(new Date());
    const seed = getDailySeed(new Date());
    const cards = dealDailyCards(puzzleNumber, SERVER_WORD_POOL);
    const stats = await getStats(puzzleNumber);

    return c.json<DailyResponse>({
      type: "daily",
      puzzleNumber,
      seed,
      username: username ?? "anonymous",
      streak,
      alreadyPlayed: !!playedToday,
      cards,
      stats,
    });
  } catch (error) {
    console.error(`API Daily Error for post ${postId}:`, error);
    let errorMessage = "Unknown error during daily fetch";
    if (error instanceof Error) {
      errorMessage = `Failed to fetch daily: ${error.message}`;
    }
    return c.json<ErrorResponse>({ status: "error", message: errorMessage }, 400);
  }
});

api.post("/score", async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>({ status: "error", message: "postId is required" }, 400);
  }

  try {
    const body = await c.req.json<ScoreRequest>();
    const username = await reddit.getCurrentUsername();
    if (!username) {
      return c.json<ErrorResponse>({ status: "error", message: "username required" }, 400);
    }

    const puzzleNumber = getPuzzleNumber(new Date());
    const playedKey = `played:${username}:${puzzleNumber}`;
    const alreadyPlayed = await redis.get(playedKey);
    if (alreadyPlayed) {
      return c.json<ErrorResponse>({ status: "error", message: "Already played today" }, 400);
    }

    const streakKey = `streak:${username}`;
    let streakStr = await redis.get(streakKey);
    let streak = streakStr ? parseInt(streakStr, 10) : 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayPuzzle = getPuzzleNumber(yesterday);
    const playedYesterday = await redis.get(`played:${username}:${yesterdayPuzzle}`);

    if (playedYesterday) {
      streak += 1;
    } else {
      streak = 1;
    }

    await redis.set(streakKey, streak.toString());
    await redis.set(playedKey, "1");

    for (const ans of body.answers) {
      const statKey = `stats:${puzzleNumber}:${ans.cardIdx}`;
      await redis.hIncrBy(statKey, ans.choiceIdx.toString(), 1);
    }

    let flair: string | undefined;
    try {
      if (body.score === 500 && streak >= 7) {
        flair = "🏆 Tandem Master";
      } else if (body.score === 500) {
        flair = "⭐ Perfect Day";
      } else if (streak >= 30) {
        flair = "💎 Month Streak";
      } else if (streak >= 7) {
        flair = "🔥 Week Streak";
      } else {
        flair = "🎴 Tandem Player";
      }
      await reddit.setUserFlair({ subredditName: context.subredditName, username, flair: flair } as never);
    } catch (e) {
      console.warn("Failed to set user flair:", e);
    }

    return c.json<ScoreResponse>({
      type: "score",
      score: body.score,
      streak,
      flair,
    });
  } catch (error) {
    console.error("API Score Error:", error);
    let errorMessage = "Unknown error during score submission";
    if (error instanceof Error) {
      errorMessage = `Score submission failed: ${error.message}`;
    }
    return c.json<ErrorResponse>({ status: "error", message: errorMessage }, 400);
  }
});

api.post("/share", async (c) => {
  const { postId } = context;
  const postIdStr = String(postId ?? "");
  if (!postIdStr) {
    return c.json<ErrorResponse>({ status: "error", message: "postId is required" }, 400);
  }

  try {
    const body = await c.req.json<ShareRequest>();
    const text = `Tandem Daily #${body.puzzleNumber} · ${body.score}/${body.maxScore} ${body.emoji} · 🔥 ${body.streak}-day streak`;
    
    // Ensure postId has t3_ prefix
    const fullPostId = postIdStr.startsWith("t3_") ? postIdStr : `t3_${postIdStr}`;
    
    let comment;
    try {
      // Try posting as the user first
      comment = await reddit.submitComment({ id: fullPostId as `t3_${string}`, text, runAs: "USER" });
    } catch {
      // Fallback to posting as the app
      comment = await reddit.submitComment({ id: fullPostId as `t3_${string}`, text });
    }
    
    return c.json<ShareResponse>({ type: "share", commentId: comment.id, ok: true });
  } catch (error) {
    console.error("API Share Error:", error);
    let errorMessage = "Unknown error during share";
    if (error instanceof Error) {
      errorMessage = `Share failed: ${error.message}`;
    }
    return c.json<ShareResponse>({ type: "share", commentId: "", ok: false, error: errorMessage });
  }
});

api.get("/init", async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error("API Init Error: postId not found in devvit context");
    return c.json<ErrorResponse>(
      {
        status: "error",
        message: "postId is required but missing from context",
      },
      400
    );
  }

  try {
    const [count, username] = await Promise.all([
      redis.get("count"),
      reddit.getCurrentUsername(),
    ]);

    return c.json<InitResponse>({
      type: "init",
      postId: String(postId),
      count: count ? parseInt(count) : 0,
      username: username ?? "anonymous",
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    let errorMessage = "Unknown error during initialization";
    if (error instanceof Error) {
      errorMessage = `Initialization failed: ${error.message}`;
    }
    return c.json<ErrorResponse>(
      { status: "error", message: errorMessage },
      400
    );
  }
});

api.post("/increment", async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: "error",
        message: "postId is required",
      },
      400
    );
  }

  const count = await redis.incrBy("count", 1);
  return c.json<IncrementResponse>({
    count,
    postId: String(postId),
    type: "increment",
  });
});

api.post("/decrement", async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: "error",
        message: "postId is required",
      },
      400
    );
  }

  const count = await redis.incrBy("count", -1);
  return c.json<DecrementResponse>({
    count,
    postId: String(postId),
    type: "decrement",
  });
});
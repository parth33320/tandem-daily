import { useState, useEffect } from "react";
import { validateWord } from "../../shared/validateWord";

interface WordPoolModalProps {
  open: boolean;
  onClose: () => void;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
}

interface CommunityWord {
  id: number;
  form: string;
  reading: string;
  meaning_ja: string;
  meaning_zh: string;
  relation: string;
  author: string;
  votes: number;
}

export function WordPoolModal({ open, onClose, onToast }: WordPoolModalProps) {
  const [words, setWords] = useState<CommunityWord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "true" | "false" | "partial">("all");
  const [newWord, setNewWord] = useState({
    form: "",
    reading: "",
    meaning_ja: "",
    meaning_zh: "",
    relation: "false",
    note: "",
  });

  useEffect(() => {
    fetch("/api/words")
      .then((res) => res.json())
      .then((data) => {
        if (data.words) setWords(data.words);
      })
      .catch(() => {});
  }, []);

  const handleAddWord = async () => {
    const errors = validateWord(newWord);
    if (Object.keys(errors).length > 0) {
      onToast(Object.values(errors).join(", "), "error");
      return;
    }
    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWord),
      });
      if (res.ok) {
        const data = await res.json();
        setWords((prev) => [data.word, ...prev]);
        setNewWord({ form: "", reading: "", meaning_ja: "", meaning_zh: "", relation: "false", note: "" });
        onToast("Word added!", "success");
      }
    } catch {
      onToast("Failed to add word", "error");
    }
  };

  const handleVote = async (id: number, vote: number) => {
    try {
      await fetch(`/api/words/${id}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      setWords((prev) => prev.map((w) => (w.id === id ? { ...w, votes: w.votes + (vote > 0 ? 1 : -1) } : w)));
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/words/${id}`, { method: "DELETE" });
      setWords((prev) => prev.filter((w) => w.id !== id));
      onToast("Word deleted", "success");
    } catch {
      onToast("Failed to delete", "error");
    }
  };

  if (!open) return null;

  const filtered = words
    .filter((w) => !search || w.form.includes(search) || w.reading.includes(search) || w.meaning_ja.includes(search) || w.meaning_zh.includes(search))
    .filter((w) => filter === "all" || w.relation === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-3xl p-6 max-w-3xl w-full max-h-[80dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold gold-text">Community Word Pool</h2>
          <button onClick={onClose} className="text-2xl hover:text-gold transition-colors">✕</button>
        </div>

        {/* Search & Filter */}
        <div className="mb-4 space-y-2">
          <input
            type="text"
            placeholder="Search words..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass rounded-xl px-4 py-2 text-paper-ink placeholder:text-paper-ink/40"
          />
          <div className="flex gap-2">
            {["all", "true", "false", "partial"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  filter === f ? "bg-primary text-primary-foreground" : "glass hover:bg-primary/10"
                }`}
              >
                {f === "all" ? "All" : f === "true" ? "True" : f === "false" ? "False" : "Half"}
              </button>
            ))}
          </div>
        </div>

        {/* Word List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filtered.map((word) => (
            <div key={word.id} className="glass rounded-xl p-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-[Noto_Serif_JP] text-xl font-bold text-paper-ink">{word.form}</span>
                  <span className="text-xs text-gold/60">{word.relation}</span>
                </div>
                <p className="text-xs text-paper-ink/60 mt-1">
                  JP: {word.reading} | ZH: {word.meaning_zh}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleVote(word.id, 1)} className="text-emerald hover:text-emerald/70 text-sm">👍 {word.votes}</button>
                <button onClick={() => handleVote(word.id, -1)} className="text-rose hover:text-rose/70 text-sm">👎</button>
                <button onClick={() => handleDelete(word.id)} className="text-rose hover:text-rose/70 text-xs">🗑</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Word Form */}
        <div className="mt-6 p-4 glass rounded-xl space-y-2">
          <h3 className="font-display text-lg font-bold gold-text mb-3">Add New Word</h3>
          <div className="grid gap-2 md:grid-cols-2">
            <input
              placeholder="Form (Kanji/Hanzi)"
              value={newWord.form}
              onChange={(e) => setNewWord({ ...newWord, form: e.target.value })}
              className="glass rounded-lg px-3 py-2 text-paper-ink placeholder:text-paper-ink/40"
              maxLength={8}
            />
            <input
              placeholder="Reading (Romaji)"
              value={newWord.reading}
              onChange={(e) => setNewWord({ ...newWord, reading: e.target.value })}
              className="glass rounded-lg px-3 py-2 text-paper-ink placeholder:text-paper-ink/40"
            />
            <input
              placeholder="Meaning (Japanese)"
              value={newWord.meaning_ja}
              onChange={(e) => setNewWord({ ...newWord, meaning_ja: e.target.value })}
              className="glass rounded-lg px-3 py-2 text-paper-ink placeholder:text-paper-ink/40"
            />
            <input
              placeholder="Meaning (Chinese)"
              value={newWord.meaning_zh}
              onChange={(e) => setNewWord({ ...newWord, meaning_zh: e.target.value })}
              className="glass rounded-lg px-3 py-2 text-paper-ink placeholder:text-paper-ink/40"
            />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <select
              value={newWord.relation}
              onChange={(e) => setNewWord({ ...newWord, relation: e.target.value })}
              className="glass rounded-lg px-3 py-2 text-paper-ink"
            >
              <option value="true">True Friend</option>
              <option value="false">False Friend</option>
              <option value="partial">Half Friend</option>
            </select>
            <input
              placeholder="Fun Fact / Note"
              value={newWord.note}
              onChange={(e) => setNewWord({ ...newWord, note: e.target.value })}
              className="glass rounded-lg px-3 py-2 text-paper-ink placeholder:text-paper-ink/40"
            />
          </div>
          <button
            onClick={handleAddWord}
            className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg"
          >
            Add Word
          </button>
        </div>
      </div>
    </div>
  );
}
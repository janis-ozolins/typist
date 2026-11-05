import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const FONT = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

interface PracticeText {
  readonly id: string;
  readonly kind: "prose" | "code";
  readonly title: string;
  readonly source: string;
  readonly text: string;
}

const TEXTS = [
  {
    id: "two-cities",
    kind: "prose",
    title: "A Tale of Two Cities",
    source: "Charles Dickens, 1859",
    text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
  },
  {
    id: "pride",
    kind: "prose",
    title: "Pride and Prejudice",
    source: "Jane Austen, 1813",
    text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
  },
  {
    id: "nineteen-eighty-four",
    kind: "prose",
    title: "Nineteen Eighty-Four",
    source: "George Orwell, 1949",
    text: "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.",
  },
  {
    id: "moby-dick",
    kind: "prose",
    title: "Moby-Dick",
    source: "Herman Melville, 1851",
    text: "Call me Ishmael. Some years ago (never mind how long precisely), having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
  },
  {
    id: "jabberwocky",
    kind: "prose",
    title: "Jabberwocky",
    source: "Lewis Carroll, 1871",
    text: "'Twas brillig, and the slithy toves did gyre and gimble in the wabe: all mimsy were the borogoves, and the mome raths outgrabe.",
  },
  {
    id: "fizzbuzz",
    kind: "code",
    title: "FizzBuzz",
    source: "Python · classic interview",
    text: `def fizzbuzz(n):
    for i in range(1, n + 1):
        if i % 15 == 0:
            print("FizzBuzz")
        elif i % 3 == 0:
            print("Fizz")
        elif i % 5 == 0:
            print("Buzz")
        else:
            print(i)`,
  },
  {
    id: "quicksort",
    kind: "code",
    title: "Quicksort",
    source: "Python · classic algorithm",
    text: `def quicksort(a):
    if len(a) <= 1:
        return a
    pivot = a[len(a) // 2]
    left = [x for x in a if x < pivot]
    mid = [x for x in a if x == pivot]
    right = [x for x in a if x > pivot]
    return quicksort(left) + mid + quicksort(right)`,
  },
  {
    id: "binary-search",
    kind: "code",
    title: "Binary Search",
    source: "Python · classic algorithm",
    text: `def search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
  },
  {
    id: "debounce",
    kind: "code",
    title: "Debounce",
    source: "JavaScript · utility",
    text: `function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}`,
  },
] as const satisfies readonly PracticeText[];

const KINDS = [
  { id: "prose", label: "Prose" },
  { id: "code", label: "Code" },
] as const;

const C = {
  bg: "#0d0f12",
  card: "#13161b",
  border: "#23272f",
  untyped: "#c9ced6",
  ok: "#5f6672",
  err: "#ff5f56",
  accent: "#ff7000",
  muted: "#6b7280",
};

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center min-w-[64px]">
      <div
        style={{
          fontFamily: FONT,
          fontSize: 22,
          fontWeight: 600,
          lineHeight: 1.1,
          color: accent ? C.accent : "#e8eaed",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 9,
          letterSpacing: 1.6,
          color: C.muted,
          textTransform: "uppercase",
          marginTop: 5,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function TypingPractice() {
  const [kind, setKind] = useState<string>("prose");
  const [textId, setTextId] = useState<string>(TEXTS[0].id);
  const current = TEXTS.find((t) => t.id === textId) ?? TEXTS[0];
  const target = current.text;
  const kindTexts = TEXTS.filter((t) => t.kind === kind);

  const [typed, setTypedState] = useState("");
  const typedRef = useRef("");
  const historyRef = useRef<{ t: number; ok: boolean }[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const endedAtRef = useRef<number | null>(null);
  const [now, setNow] = useState(Date.now());
  // Whether the window itself has focus. Element focus is not enough: inside
  // the preview iframe the textarea can be the active element while the parent
  // window still owns the keyboard, so keydown never reaches this document.
  const [winFocused, setWinFocused] = useState(
    () => typeof document !== "undefined" && document.hasFocus()
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const setTyped = useCallback((v: string) => {
    typedRef.current = v;
    setTypedState(v);
  }, []);

  const focusInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    // Inside the preview iframe the document needs focus before the element
    // can receive keydown events.
    window.focus();
    el.focus({ preventScroll: true });
  }, []);

  // autoFocus is ignored on hydrated SSR content, so focus on mount.
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Track window focus, which can change without touching the textarea
  // (e.g. clicking outside the card in a preview iframe).
  useEffect(() => {
    const onWindowFocus = () => {
      setWinFocused(true);
      focusInput();
    };
    const onWindowBlur = () => setWinFocused(false);
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [focusInput]);

  // The font is self-hosted (imported in routes/__root.tsx) and preloaded
  // from the document head, so it is fetched in parallel with the JS bundle;
  // see PR perf/font-selfhost for the measured numbers.
  useEffect(() => {
    if (startedAt && !endedAt) {
      const iv = setInterval(() => setNow(Date.now()), 250);
      return () => clearInterval(iv);
    }
  }, [startedAt, endedAt]);

  const resetAll = useCallback(() => {
    typedRef.current = "";
    setTypedState("");
    historyRef.current = [];
    startedAtRef.current = null;
    setStartedAt(null);
    endedAtRef.current = null;
    setEndedAt(null);
    setNow(Date.now());
    requestAnimationFrame(focusInput);
  }, [focusInput]);

  const selectText = (id: string) => {
    setTextId(id);
    resetAll();
  };

  const selectKind = (k: string) => {
    setKind(k);
    const first = TEXTS.find((t) => t.kind === k);
    if (first) selectText(first.id);
  };

  const nextText = () => {
    const idx = kindTexts.findIndex((t) => t.id === textId);
    const next = kindTexts[(idx + 1) % kindTexts.length];
    if (next) selectText(next.id);
  };

  const addChar = useCallback(
    (ch: string) => {
      if (endedAtRef.current) return;
      const cur = typedRef.current;
      if (cur.length >= target.length) return;
      const t = Date.now();
      if (!startedAtRef.current) {
        startedAtRef.current = t;
        setStartedAt(t);
        setNow(t);
      }
      const ok = target[cur.length] === ch;
      historyRef.current.push({ t, ok });
      const next = cur + ch;
      setTyped(next);
      if (next.length >= target.length) {
        endedAtRef.current = Date.now();
        setEndedAt(endedAtRef.current);
      }
    },
    [target, setTyped]
  );

  // Handle typing at the window level: inside the preview iframe the hidden
  // textarea may not hold element focus even when this window owns the keyboard.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        resetAll();
        return;
      }
      if (endedAtRef.current) return;
      // Let a focused button handle Enter/Space itself.
      const targetEl = e.target as HTMLElement | null;
      if (
        targetEl?.tagName === "BUTTON" &&
        (e.key === "Enter" || e.key === " ")
      ) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        setTyped(typedRef.current.slice(0, -1));
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        addChar("\t");
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        addChar("\n");
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        addChar(e.key);
      }
    },
    [resetAll, addChar, setTyped]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ---- derived stats ----
  const elapsed = startedAt ? (endedAt ?? now) - startedAt : 0;
  let correctChars = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) correctChars++;
  }
  const keystrokes = historyRef.current.length;
  const oks = historyRef.current.reduce((a, h) => a + (h.ok ? 1 : 0), 0);
  const errors = keystrokes - oks;
  const accuracy = keystrokes > 0 ? Math.round((oks / keystrokes) * 100) : null;
  const overallCpm =
    elapsed > 800 ? Math.round(correctChars / (elapsed / 60000)) : null;
  let currentCpm: number | null = null;
  if (elapsed > 1500) {
    const win = Math.min(10000, Math.max(3000, elapsed));
    const since = (endedAt ?? now) - win;
    const recent = historyRef.current.filter((h) => h.t >= since && h.ok).length;
    currentCpm = Math.round(recent * (60000 / win));
  }
  const progress = Math.round((typed.length / target.length) * 100);
  const seconds = (elapsed / 1000).toFixed(1);
  const isCode = current.kind === "code";

  // ---- char spans ----
  const spans: ReactNode[] = [];
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    let style: CSSProperties;
    let cls = "";
    if (i < typed.length) {
      if (typed[i] === ch) {
        style = { color: C.ok };
      } else {
        style = {
          color: C.err,
          background: "rgba(255,95,86,0.14)",
          borderRadius: 2,
        };
      }
    } else if (i === typed.length && !endedAt) {
      cls = "tt-cur";
      style = { color: "#f2f4f7" };
    } else {
      style = { color: C.untyped };
    }
    spans.push(
      <span key={i} className={cls} style={style}>
        {ch === "\n" ? "↵\n" : ch}
      </span>
    );
  }

  return (
    <div
      className="tt-app select-none flex flex-col items-center justify-center"
      style={{
        fontFamily: FONT,
        background: C.bg,
        minHeight: "100vh",
        width: "100%",
        color: "#e8eaed",
        padding: "24px 16px",
      }}
    >
      <style>{`
        @keyframes tt-pulse {
          0%, 100% { background: rgba(255,112,0,0.24); }
          50% { background: rgba(255,112,0,0.08); }
        }
        .tt-cur {
          background: rgba(255,112,0,0.24);
          border-bottom: 2px solid #ff7000;
          animation: tt-pulse 1.2s ease-in-out infinite;
          border-radius: 2px;
        }
        .tt-app ::selection { background: transparent; }
        .tt-app button { cursor: pointer; }
      `}</style>

      <div className="w-full" style={{ maxWidth: 780 }}>
        {/* header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: C.muted,
            }}
          >
            typist
          </div>
          <div className="flex" style={{ gap: 18 }}>
            {KINDS.map((k) => (
              <button
                key={k.id}
                onClick={() => selectKind(k.id)}
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: kind === k.id ? C.accent : C.muted,
                  background: "none",
                  border: "none",
                  paddingBottom: 2,
                  borderBottom: kind === k.id ? "1px solid " + C.accent : "1px solid transparent",
                }}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* text chips */}
        <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 22 }}>
          {kindTexts.map((t) => {
            const active = t.id === textId;
            return (
              <button
                key={t.id}
                onClick={() => selectText(t.id)}
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  padding: "5px 12px",
                  borderRadius: 999,
                  color: active ? C.accent : "#9aa1ab",
                  border: "1px solid " + (active ? C.accent : C.border),
                  background: active ? "rgba(255,112,0,0.08)" : "transparent",
                  transition: "all .15s ease",
                }}
              >
                {t.title}
              </button>
            );
          })}
        </div>

        {/* card */}
        <div
          className="relative"
          style={{
            background: C.card,
            border: "1px solid " + C.border,
            borderRadius: 12,
            overflow: "hidden",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            focusInput();
          }}
        >
          {/* progress bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: 2,
              width: progress + "%",
              background: C.accent,
              transition: "width .12s ease",
              zIndex: 2,
            }}
          />

          {/* meta row */}
          <div
            className="flex items-center justify-between"
            style={{ padding: "14px 28px 0" }}
          >
            <div style={{ fontSize: 11, color: C.muted }}>
              {current.source} · {target.length} chars
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{progress}%</div>
          </div>

          {/* text */}
          <div style={{ padding: "20px 28px 8px" }}>
            <div
              style={{
                fontSize: isCode ? 16 : 20,
                lineHeight: isCode ? 1.9 : 2,
                whiteSpace: "pre-wrap",
                wordBreak: isCode ? "break-word" : "normal",
                minHeight: isCode ? 240 : 140,
              }}
            >
              {spans}
            </div>
          </div>

          {/* stats row */}
          <div
            className="flex items-center justify-center flex-wrap"
            style={{
              gap: 36,
              padding: "18px 28px 22px",
              borderTop: "1px solid " + C.border,
              marginTop: 12,
            }}
          >
            <Stat label="cpm now" value={currentCpm ?? "—"} accent />
            <Stat label="cpm avg" value={overallCpm ?? "—"} />
            <Stat label="accuracy" value={accuracy === null ? "—" : accuracy + "%"} />
            <Stat label="errors" value={keystrokes === 0 ? "—" : errors} />
            <Stat label="time" value={elapsed ? seconds + "s" : "—"} />
          </div>

          {/* hidden input */}
          <textarea
            ref={inputRef}
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            value=""
            onChange={() => {}}
            style={{
              position: "absolute",
              opacity: 0,
              width: 1,
              height: 1,
              top: 0,
              left: 0,
              border: "none",
              resize: "none",
              outline: "none",
            }}
          />

          {/* click-to-focus overlay */}
          {!winFocused && !endedAt && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: "rgba(13,15,18,0.72)",
                borderRadius: 12,
                zIndex: 3,
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>
                click to focus · start typing
              </div>
            </div>
          )}

          {/* results overlay */}
          {endedAt && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{
                background: "rgba(13,15,18,0.93)",
                borderRadius: 12,
                zIndex: 4,
                gap: 14,
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: C.muted,
                }}
              >
                complete · {current.title}
              </div>
              <div style={{ fontSize: 52, fontWeight: 700, color: C.accent, lineHeight: 1 }}>
                {overallCpm}
                <span style={{ fontSize: 14, fontWeight: 400, color: C.muted }}> cpm</span>
              </div>
              <div className="flex" style={{ gap: 28, marginTop: 2 }}>
                <Stat label="accuracy" value={accuracy + "%"} />
                <Stat label="errors" value={errors} />
                <Stat label="time" value={seconds + "s"} />
              </div>
              <div className="flex" style={{ gap: 10, marginTop: 12 }}>
                <button
                  onClick={resetAll}
                  style={{
                    fontFamily: FONT,
                    fontSize: 12,
                    padding: "8px 16px",
                    borderRadius: 8,
                    color: "#e8eaed",
                    border: "1px solid " + C.border,
                    background: "transparent",
                  }}
                >
                  Retry (Esc)
                </button>
                <button
                  onClick={nextText}
                  style={{
                    fontFamily: FONT,
                    fontSize: 12,
                    padding: "8px 16px",
                    borderRadius: 8,
                    color: "#0d0f12",
                    border: "1px solid " + C.accent,
                    background: C.accent,
                  }}
                >
                  Next text →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* footer hint */}
        <div
          className="flex items-center justify-center"
          style={{ marginTop: 14, gap: 16, fontSize: 10, color: C.muted, letterSpacing: 1 }}
        >
          <span>esc — restart</span>
          <span>·</span>
          <span>enter types ↵ in code</span>
        </div>
      </div>
    </div>
  );
}

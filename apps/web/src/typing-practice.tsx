import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

import "./typing-practice.css";

interface PracticeText {
  readonly id: string;
  readonly kind: "prose" | "code";
  readonly title: string;
  readonly source: string;
  readonly text: string;
}

const TEXTS = [
  {
    id: "pride",
    kind: "prose",
    title: "Pride & Prejudice",
    source: "Jane Austen — Pride and Prejudice (1813)",
    text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families.",
  },
  {
    id: "twocities",
    kind: "prose",
    title: "A Tale of Two Cities",
    source: "Charles Dickens — A Tale of Two Cities (1859)",
    text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
  },
  {
    id: "1984",
    kind: "prose",
    title: "Nineteen Eighty-Four",
    source: "George Orwell — Nineteen Eighty-Four (1949)",
    text: "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.",
  },
  {
    id: "moby",
    kind: "prose",
    title: "Moby Dick",
    source: "Herman Melville — Moby Dick (1851)",
    text: "Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
  },
  {
    id: "gatsby",
    kind: "prose",
    title: "The Great Gatsby",
    source: "F. Scott Fitzgerald — The Great Gatsby (1925)",
    text: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. \"Whenever you feel like criticizing any one,\" he told me, \"just remember that all the people in this world haven't had the advantages that you've had.\"",
  },
  {
    id: "hamlet",
    kind: "prose",
    title: "Hamlet",
    source: "William Shakespeare — Hamlet, Act 3 Scene 1",
    text: "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take arms against a sea of troubles, And by opposing end them.",
  },
  {
    id: "hobbit",
    kind: "prose",
    title: "The Hobbit",
    source: "J.R.R. Tolkien — The Hobbit (1937)",
    text: "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.",
  },
  {
    id: "quicksort",
    kind: "code",
    title: "Quicksort (Python)",
    source: "Classic divide-and-conquer sorting",
    text: `def quicksort(items):
    if len(items) <= 1:
        return items
    pivot = items[len(items) // 2]
    left = [x for x in items if x < pivot]
    middle = [x for x in items if x == pivot]
    right = [x for x in items if x > pivot]
    return quicksort(left) + middle + quicksort(right)`,
  },
  {
    id: "binarysearch",
    kind: "code",
    title: "Binary search (JS)",
    source: "O(log n) lookup in a sorted array",
    text: `function binarySearch(sorted, target) {
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
  },
  {
    id: "debounce",
    kind: "code",
    title: "Debounce (JS)",
    source: "Delay a function until calls stop coming",
    text: `function debounce(fn, wait) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}`,
  },
  {
    id: "fizzbuzz",
    kind: "code",
    title: "FizzBuzz (JS)",
    source: "The classic interview loop, punctuation-heavy",
    text: `for (let i = 1; i <= 100; i++) {
  const out = i % 3 === 0 && i % 5 === 0 ? "FizzBuzz"
    : i % 3 === 0 ? "Fizz"
    : i % 5 === 0 ? "Buzz"
    : String(i);
  console.log(out);
}`,
  },
] as const satisfies readonly PracticeText[];

/** The rolling window the "cpm · now" figure is measured over. */
const WINDOW_MS = 10_000;

/** One keystroke, timed, so the rolling and overall rates can be recomputed without re-reading input. */
interface KeyStroke {
  readonly t: number;
  readonly ok: boolean;
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function TypingPractice() {
  const [sel, setSel] = useState<string>(TEXTS[0].id);
  const current = TEXTS.find((t) => t.id === sel) ?? TEXTS[0];
  const text = current.text;

  const [typed, setTyped] = useState("");
  const [events, setEvents] = useState<KeyStroke[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const done = doneAt !== null;
  const pos = typed.length;

  useEffect(() => {
    if (startedAt === null || done) return undefined;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [startedAt, done]);

  // Keep the caret line inside the scrollable text box, centring it when it leaves the visible band.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const el = box.querySelector<HTMLElement>(`[data-i="${pos}"]`);
    if (!el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < box.scrollTop + 8 || bottom > box.scrollTop + box.clientHeight - 8) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 2);
    }
  }, [pos]);

  const errChars = useMemo(() => {
    let n = 0;
    for (let i = 0; i < pos; i += 1) {
      if (typed[i] !== text[i]) n += 1;
    }
    return n;
  }, [typed, text, pos]);

  const endAt = doneAt ?? now;
  const elapsedMs = startedAt === null ? 0 : endAt - startedAt;
  const correctNet = pos - errChars;
  const overallCPM = elapsedMs > 0 ? (correctNet / elapsedMs) * 60000 : 0;
  const progress = text.length > 0 ? pos / text.length : 0;

  const currentCPM = useMemo(() => {
    if (startedAt === null) return 0;
    const winStart = Math.max(startedAt, endAt - WINDOW_MS);
    let ok = 0;
    for (const e of events) {
      if (e.t >= winStart && e.t <= endAt && e.ok) ok += 1;
    }
    const spanMs = Math.max(endAt - winStart, 500);
    return (ok / spanMs) * 60000;
  }, [events, startedAt, endAt]);

  const accuracy =
    events.length > 0 ? ((events.length - mistakes) / events.length) * 100 : 100;

  const reset = (id?: string) => {
    if (id !== undefined) setSel(id);
    setTyped("");
    setEvents([]);
    setMistakes(0);
    setStartedAt(null);
    setDoneAt(null);
    setNow(Date.now());
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (done) {
      e.target.value = typed;
      return;
    }
    let v = e.target.value;
    if (v.length < typed.length) {
      setTyped(v);
      return;
    }
    v = v.slice(0, text.length);
    const added = v.slice(typed.length);
    if (added.length === 0) return;
    const t = Date.now();
    if (startedAt === null) setStartedAt(t);
    setNow(t);
    const strokes: KeyStroke[] = [];
    let m = 0;
    for (let i = 0; i < added.length; i += 1) {
      const ok = added[i] === text[typed.length + i];
      if (!ok) m += 1;
      strokes.push({ t, ok });
    }
    setEvents((prev) => [...prev, ...strokes]);
    setMistakes((prev) => prev + m);
    setTyped(v);
    if (v.length === text.length) setDoneAt(t);
  };

  const chars: ReactNode[] = [];
  for (let i = 0; i < text.length; i += 1) {
    let cls = "ch";
    if (i < pos) cls = typed[i] === text[i] ? "ch ok" : "ch err";
    if (i === pos && !done) cls += " cur";
    chars.push(
      <span key={i} data-i={i} className={cls}>
        {text[i]}
      </span>
    );
  }
  if (pos === text.length) {
    chars.push(<span key="end" data-i={pos} className={done ? "ch" : "ch cur"} />);
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="dot" />
          mistral · typing
        </div>
        <button type="button" className="ghost" onClick={() => reset()}>
          ↻ restart
        </button>
      </header>

      <nav className="picker">
        {TEXTS.map((t) => (
          <button
            type="button"
            key={t.id}
            className={t.id === sel ? "chip active" : "chip"}
            onClick={() => reset(t.id)}
          >
            <span className={"kind " + t.kind}>{t.kind}</span>
            {t.title}
            <span className="meta">{t.text.length} ch</span>
          </button>
        ))}
      </nav>

      <div className="stats">
        <div className="stat">
          <div className="v accent">{startedAt === null ? "–" : Math.round(currentCPM)}</div>
          <div className="l">cpm · now</div>
        </div>
        <div className="stat">
          <div className="v">{startedAt === null ? "–" : Math.round(overallCPM)}</div>
          <div className="l">cpm · avg</div>
        </div>
        <div className="stat">
          <div className="v">{events.length > 0 ? `${accuracy.toFixed(1)}%` : "–"}</div>
          <div className="l">accuracy</div>
        </div>
        <div className="stat">
          <div className="v">{mistakes}</div>
          <div className="l">errors</div>
        </div>
        <div className="stat">
          <div className="v">{startedAt === null ? "–" : formatTime(elapsedMs)}</div>
          <div className="l">time</div>
        </div>
        <div className="stat">
          <div className="v">{Math.round(progress * 100)}%</div>
          <div className="l">progress</div>
        </div>
      </div>

      <div className="bar">
        <div className="fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <section className="card" onClick={() => inputRef.current?.focus()}>
        <div className="textwrap" ref={boxRef}>
          <div className="text">{chars}</div>
        </div>
        <textarea
          ref={inputRef}
          className="input"
          value={typed}
          onChange={onChange}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-label="Type the text"
        />
      </section>

      <div className="source">{current.source}</div>

      {done && (
        <div className="done">
          <div>
            <div className="done-title">Finished</div>
            <div className="done-sub">
              {formatTime(elapsedMs)} · {Math.round(overallCPM)} cpm avg ·{" "}
              {accuracy.toFixed(1)}% accuracy · {mistakes}{" "}
              {mistakes === 1 ? "error" : "errors"}
            </div>
          </div>
          <button type="button" className="primary" onClick={() => reset()}>
            ↻ type again
          </button>
        </div>
      )}

      <footer className="hint">
        click the text and start typing — backspace fixes mistakes
      </footer>
    </div>
  );
}

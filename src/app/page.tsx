"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryLabels, elementRows, elements, fElementRows, type ElementCategory, type ElementData } from "@/content/elements";
import { quizQuestions, type QuizQuestion } from "@/content/quiz";

const lecturer = "Dyan Prawita Sari";
const chapters = ["Pendahuluan", "Materi inti", "Mini project", "Quiz", "Kesimpulan"];
const sections = ["Sejarah sistem periodik", "Periode, golongan, dan blok", "Posisi unsur dan konfigurasi elektron", "Sifat periodik unsur"];
const storageKey = "tabel-periodik:v1";

type Profile = { studentName: string; goal: string; lecturerName: string };
type SavedState = {
  version: 1;
  profile: Profile | null;
  completedChapters: number[];
  lastChapter: number;
  miniProject: { bestScore: number; attempts: number } | null;
  quiz: { score: number; total: number; finishedAt: string; wrongAnswers?: { questionId: string; selectedOptionId: string }[] } | null;
  reflection: string;
};

const defaults: SavedState = { version: 1, profile: null, completedChapters: [], lastChapter: 1, miniProject: null, quiz: null, reflection: "" };
const gameItems: (ElementData & { target: string })[] = [
  { ...elements[2], target: "Golongan 1" }, { ...elements[10], target: "Golongan 1" },
  { ...elements[3], target: "Golongan 2" }, { ...elements[19], target: "Golongan 2" },
  { ...elements[8], target: "Golongan 17" }, { ...elements[16], target: "Golongan 17" },
  { ...elements[1], target: "Golongan 18" }, { ...elements[9], target: "Golongan 18" },
];
const targets = ["Golongan 1", "Golongan 2", "Golongan 17", "Golongan 18"];
const categoryColors: Record<ElementCategory, string> = {
  alkali: "bg-rose-100 text-rose-800", "alkaline-earth": "bg-orange-100 text-orange-800", transition: "bg-amber-100 text-amber-900",
  "post-transition": "bg-slate-100 text-slate-800", metalloid: "bg-emerald-100 text-emerald-800", nonmetal: "bg-sky-100 text-sky-800",
  halogen: "bg-violet-100 text-violet-800", "noble-gas": "bg-indigo-100 text-indigo-800", lanthanide: "bg-pink-100 text-pink-800", actinide: "bg-fuchsia-100 text-fuchsia-800",
};

function shuffle<T>(list: T[]): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function loadState(): SavedState {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Partial<SavedState>;
    if (saved.version !== 1) return defaults;
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_40px_rgba(18,31,53,0.07)] sm:p-7 ${className}`}>{children}</section>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{children}</p>;
}

function Button({ children, onClick, secondary = false, disabled = false, type = "button" }: { children: React.ReactNode; onClick?: () => void; secondary?: boolean; disabled?: boolean; type?: "button" | "submit" }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`min-h-12 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-45 ${secondary ? "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50" : "bg-teal-700 text-white shadow-sm hover:bg-teal-800"}`}>{children}</button>;
}

function Landing({ onStart, existing, onResume, onReset }: { onStart: (profile: Profile) => void; existing: Profile | null; onResume: () => void; onReset: () => void }) {
  const [studentName, setStudentName] = useState(existing?.studentName ?? "");
  const [goal, setGoal] = useState(existing?.goal ?? "");
  const [error, setError] = useState("");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentName.trim() || !goal.trim()) return setError("Isi nama dan target belajar terlebih dahulu.");
    onStart({ studentName: studentName.trim(), goal: goal.trim(), lecturerName: lecturer });
  }
  return <main className="mx-auto flex min-h-[100dvh] w-full max-w-6xl items-center px-4 py-10 sm:px-8">
    <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Panel className="flex flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_rgba(20,184,166,0.12),_transparent_52%),white] p-7 sm:p-10">
        <div><Eyebrow>Ruang belajar kimia · 5 bab interaktif</Eyebrow><h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">Kenali pola di balik setiap unsur.</h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-600">Pelajari bagaimana tabel periodik membantu kita membaca posisi dan kecenderungan sifat unsur, satu langkah demi satu langkah.</p></div>
        <div className="mt-10 flex items-center gap-3 text-sm text-slate-600"><span className="grid size-10 place-items-center rounded-full bg-teal-100 font-mono font-bold text-teal-800">01</span><span>Disusun untuk belajar bersama<br/><strong className="font-semibold text-slate-900">{lecturer}</strong></span></div>
      </Panel>
      <Panel className="self-center p-6 sm:p-9">
        <Eyebrow>Mulai belajar</Eyebrow>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">{existing ? `Selamat datang kembali, ${existing.studentName}` : "Siapkan ruang belajarmu"}</h2>
        {existing ? <><p className="mt-3 leading-7 text-slate-600">Targetmu: “{existing.goal}”</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button onClick={onResume}>Lanjutkan belajar</Button><Button secondary onClick={onReset}>Ulangi dari Bab 1</Button></div></> : <form className="mt-7 space-y-5" onSubmit={submit}>
          <label className="block text-sm font-medium text-slate-800">Nama mahasiswa<input autoComplete="name" value={studentName} onChange={(event) => setStudentName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100" placeholder="Nama kamu" /></label>
          <label className="block text-sm font-medium text-slate-800">Target belajar<textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100" placeholder="Contoh: memahami tren jari-jari atom" /></label>
          <p className="text-sm text-slate-600">Dosen pengampu <strong className="font-semibold text-slate-900">{lecturer}</strong></p>
          {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}<Button type="submit">Mulai Bab 1 <span aria-hidden="true">→</span></Button>
        </form>}
        <p className="mt-7 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">Progres tersimpan di browser ini. Tidak perlu akun.</p>
      </Panel>
    </div>
  </main>;
}

function PeriodicTable() {
  const [category, setCategory] = useState<ElementCategory | "all">("all");
  const [selected, setSelected] = useState<ElementData | null>(null);
  const filters: (ElementCategory | "all")[] = ["all", "alkali", "alkaline-earth", "transition", "metalloid", "nonmetal", "halogen", "noble-gas", "lanthanide", "actinide"];
  const visible = (element?: ElementData) => !element || category === "all" || element.category === category;
  const tile = (element?: ElementData) => element ? <button key={element.symbol} onClick={() => setSelected(element)} aria-label={`${element.name}, ${element.symbol}, nomor atom ${element.number}`} className={`min-h-[58px] rounded-lg border p-1 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${visible(element) ? `${categoryColors[element.category]} border-white` : "border-slate-100 bg-slate-50 text-slate-300 opacity-35"}`}>
    <span className="block text-[9px] leading-3 opacity-75">{element.number}</span><span className="block font-mono text-sm font-bold leading-4 sm:text-base">{element.symbol}</span><span className="hidden truncate text-[9px] leading-3 xl:block">{element.name}</span>
  </button> : <span aria-hidden="true" className="min-h-[58px]" />;
  return <div>
    <div className="mb-4 flex flex-wrap gap-2" aria-label="Filter kategori unsur">{filters.map((filter) => <button key={filter} onClick={() => setCategory(filter)} className={`min-h-10 rounded-full px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${category === filter ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{filter === "all" ? "Semua unsur" : categoryLabels[filter]}</button>)}</div>
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-2 sm:p-3"><p className="mb-2 text-xs text-slate-500 sm:hidden">Geser tabel untuk melihat semua golongan →</p><div className="min-w-[760px]">
      <div className="mb-2 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">{Array.from({ length: 18 }, (_, index) => <span key={index} className="text-center text-[9px] font-medium text-slate-400">{index + 1}</span>)}</div>
      {elementRows.map((row, index) => <div key={index} className="mb-1 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">{row.map((element, cell) => <span key={`${index}-${cell}`}>{tile(element)}</span>)}</div>)}
      <div className="mt-3 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">{fElementRows.map((row, rowIndex) => row.map((element, index) => <span key={`${rowIndex}-${index}`} className={index === 0 ? "col-start-4" : ""}>{tile(element)}</span>))}</div>
      <p className="mt-2 text-right text-[10px] text-slate-500">* Lantanida di baris atas, aktinida di baris bawah</p>
    </div></div>
    <p className="mt-3 text-xs text-slate-500">Posisi dan nama unsur melengkapi peta periodik; pembahasan sifat pada pelajaran mengikuti materi sumber.</p>
    {selected && <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center" role="presentation" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-label={`Detail unsur ${selected.name}`} onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between"><div><p className="font-mono text-5xl font-bold text-teal-800">{selected.symbol}</p><h3 className="mt-2 text-2xl font-semibold text-slate-950">{selected.name}</h3></div><button className="grid size-11 place-items-center rounded-full bg-slate-100 text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700" aria-label="Tutup detail" onClick={() => setSelected(null)}>×</button></div>
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm"><Info label="Nomor atom" value={String(selected.number)} /><Info label="Periode" value={String(selected.period)} /><Info label="Golongan" value={selected.group === null ? "—" : String(selected.group)} /><Info label="Kategori" value={categoryLabels[selected.category]} /></dl><p className="mt-4 text-xs leading-5 text-slate-500">Konfigurasi elektron dan massa atom tidak ditampilkan karena tidak tercantum untuk setiap unsur dalam materi sumber.</p>
    </section></div>}
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value}</dd></div>; }

export default function Home() {
  const [saved, setSaved] = useState<SavedState>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [chapter, setChapter] = useState(1);
  const [readSections, setReadSections] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<Record<string, number>>({});
  const [hints, setHints] = useState(3);
  const [hintText, setHintText] = useState("");
  const [gameFeedback, setGameFeedback] = useState("");
  const [quizMode, setQuizMode] = useState<"quiz" | "flashcard">("quiz");
  const [quizRun, setQuizRun] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizMissed, setQuizMissed] = useState<{ questionId: string; selectedOptionId: string }[]>([]);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flashBack, setFlashBack] = useState(false);
  const [reflection, setReflection] = useState("");
  const [flashSaved, setFlashSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadState();
      setSaved(loaded);
      setChapter(loaded.lastChapter);
      setReflection(loaded.reflection);
      setShowLanding(Boolean(loaded.profile));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ ...saved, lastChapter: chapter })); } catch { /* Storage may be disabled or full. */ }
  }, [saved, chapter, hydrated]);
  useEffect(() => {
    if (!hydrated || !saved.profile || chapter !== 5) return;
    const timer = window.setTimeout(() => {
      setSaved((current) => ({ ...current, reflection }));
      setFlashSaved(true);
      window.setTimeout(() => setFlashSaved(false), 1500);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [reflection, chapter, hydrated, saved.profile]);

  const completed = useMemo(() => new Set(saved.completedChapters), [saved.completedChapters]);
  function updateSaved(update: Partial<SavedState>) { setSaved((current) => ({ ...current, ...update })); }
  function completeChapter(id: number) {
    updateSaved({ completedChapters: [...new Set([...saved.completedChapters, id])] });
    setChapter(Math.min(5, id + 1));
  }
  function start(profile: Profile) { updateSaved({ profile, completedChapters: [], lastChapter: 1, miniProject: null, quiz: null, reflection: "" }); setChapter(1); setShowLanding(false); }
  function resetLearning(keepProfile: boolean) {
    if (!window.confirm(keepProfile ? "Ulangi pembelajaran? Progres, skor, dan refleksi akan dihapus." : "Mulai dari nol? Profil dan seluruh progres akan dihapus.")) return;
    setSaved({ ...defaults, profile: keepProfile ? saved.profile : null }); setChapter(1); setReadSections([]); setPlaced([]); setMistakes({});
  }
  function placeItem(target: string, symbol: string) {
    const item = gameItems.find((entry) => entry.symbol === symbol);
    if (!item || placed.includes(symbol)) return;
    if (item.target !== target) {
      setMistakes((current) => ({ ...current, [symbol]: (current[symbol] ?? 0) + 1 }));
      setGameFeedback(`${item.name} tidak berada di ${target}. Coba periksa kembali elektron valensinya.`);
      return;
    }
    const nextPlaced = [...placed, symbol]; setPlaced(nextPlaced); setSelectedItem(null);
    setGameFeedback(`Tepat! ${item.name} berada di ${target}.`);
    if (nextPlaced.length === gameItems.length) {
      const score = gameItems.reduce((sum, current) => sum + ((mistakes[current.symbol] ?? 0) === 0 ? 10 : 5), 0) - (3 - hints) * 2;
      const bestScore = Math.max(score, saved.miniProject?.bestScore ?? 0);
      updateSaved({ miniProject: { bestScore, attempts: (saved.miniProject?.attempts ?? 0) + 1 } });
    }
  }
  function useHint() {
    if (!hints) return;
    setHints(hints - 1);
    const remaining = gameItems.find((item) => !placed.includes(item.symbol));
    if (remaining) { setSelectedItem(remaining.symbol); setHintText(`${remaining.name} cocok ke ${remaining.target}. Hint mengurangi 2 poin.`); }
  }
  function startQuiz() {
    setQuizRun(shuffle(quizQuestions).map((question) => ({ ...question, options: shuffle(question.options) })));
    setQuizIndex(0); setQuizAnswer(null); setQuizChecked(false); setQuizScore(0); setQuizFinished(false);
    setQuizMissed([]);
  }
  function answerQuiz() {
    if (!quizAnswer || quizChecked) return;
    const question = quizRun[quizIndex]; const right = quizAnswer === question.correctOptionId;
    if (right) setQuizScore((score) => score + 1);
    else setQuizMissed((current) => [...current, { questionId: question.id, selectedOptionId: quizAnswer }]);
    setQuizChecked(true);
  }
  function nextQuestion() {
    if (quizIndex === quizRun.length - 1) {
      const score = quizScore;
      updateSaved({ quiz: { score, total: quizRun.length, finishedAt: new Date().toISOString(), wrongAnswers: quizMissed } }); setQuizFinished(true); return;
    }
    setQuizIndex((index) => index + 1); setQuizAnswer(null); setQuizChecked(false);
  }

  if (!hydrated) return <main className="grid min-h-[100dvh] place-items-center px-4"><p className="text-sm text-slate-500">Menyiapkan ruang belajar…</p></main>;
  if (!saved.profile || showLanding) return <Landing existing={saved.profile} onStart={start} onResume={() => { setShowLanding(false); setChapter(saved.lastChapter); }} onReset={() => { if (window.confirm("Ulangi dari Bab 1? Progres, skor, dan refleksi akan dihapus, tetapi profilmu tetap tersimpan.")) { setSaved({ ...defaults, profile: saved.profile }); setShowLanding(false); setChapter(1); } }} />;

  const progress = Math.round((saved.completedChapters.length / 5) * 100);
  const currentQuiz = quizRun[quizIndex];
  const isPlaced = (symbol: string) => placed.includes(symbol);
  const onDropTarget = (event: React.DragEvent<HTMLDivElement>, target: string) => { event.preventDefault(); const symbol = event.dataTransfer.getData("text/plain"); if (symbol) placeItem(target, symbol); };

  return <div className="min-h-[100dvh] pb-32">
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-8"><a href="#top" className="font-mono text-lg font-bold tracking-tight text-slate-950">PERIODIK<span className="text-teal-700">/01</span></a><div className="text-right text-xs text-slate-500 sm:text-sm"><span className="font-semibold text-slate-800">{saved.profile.studentName}</span><span className="hidden sm:inline"> · bersama {lecturer}</span></div></header>
    <main id="top" className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
      <section className="mb-7 grid gap-5 lg:grid-cols-[1fr_280px]">
        <Panel className="flex items-end justify-between gap-5 bg-[radial-gradient(ellipse_at_top_right,_rgba(20,184,166,0.12),_transparent_52%),white]"><div><Eyebrow>Ruang belajar · Sistem tabel periodik</Eyebrow><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Satu tabel, banyak pola.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Targetmu: {saved.profile.goal}</p></div><div className="hidden font-mono text-5xl font-bold text-teal-100 md:block">118</div></Panel>
        <Panel className="flex flex-col justify-center"><div className="flex items-center justify-between text-xs font-semibold text-slate-600"><span>Progres pembelajaran</span><span>{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600 transition-[width] duration-500" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{saved.completedChapters.length} dari 5 bab selesai</p></Panel>
      </section>
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Bab pembelajaran" className="h-fit rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-sm lg:sticky lg:top-5"><p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Materi</p>{chapters.map((name, index) => { const id = index + 1; const accessible = id <= Math.max(1, ...saved.completedChapters.map((n) => n + 1)); return <button key={id} disabled={!accessible} onClick={() => setChapter(id)} className={`mb-1 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 disabled:cursor-not-allowed disabled:opacity-40 ${chapter === id ? "bg-teal-50 font-semibold text-teal-900" : "text-slate-600 hover:bg-slate-50"}`}><span className={`grid size-7 place-items-center rounded-full font-mono text-[10px] ${completed.has(id) ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"}`}>{completed.has(id) ? "✓" : `0${id}`}</span>{name}</button>; })}</nav>
        <div className="min-w-0 space-y-5">
          {chapter === 1 && <>
            <Panel><Eyebrow>Bab 01 · Pendahuluan</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Cara membaca peta unsur</h2><p className="mt-4 max-w-3xl leading-7 text-slate-600">Bayangkan tabel periodik seperti denah perpustakaan. Rak yang sama mengelompokkan buku dengan ciri yang mirip; pada tabel, unsur dalam satu golongan memiliki elektron valensi serupa dan sifat kimia yang cenderung mirip.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[{ title: "Temukan pola", text: "Nomor atom bertambah secara berurutan." }, { title: "Baca posisi", text: "Baris disebut periode, kolom disebut golongan." }, { title: "Tebak sifat", text: "Posisi memberi petunjuk tentang sifat unsur." }].map((item, i) => <article key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><span className="font-mono text-xs text-teal-700">0{i + 1}</span><h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p></article>)}</div></Panel>
            <Panel><div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center"><div><Eyebrow>Ilustrasi kontekstual</Eyebrow><h3 className="mt-2 text-xl font-semibold">Pola unsur hadir di sekitar kita</h3><p className="mt-2 text-sm leading-6 text-slate-600">Contoh berikut memperluas konteks dari materi sumber; fokus bab ini tetap pada cara mengelompokkan unsur dan membaca sifatnya.</p></div><div className="grid grid-cols-2 gap-2">{[["01", "Baterai", "Unsur dan kecenderungan melepas elektron"], ["02", "Elektronik", "Pemilihan bahan dengan sifat tertentu"], ["03", "Kesehatan", "Unsur dalam konteks bahan dan senyawa"], ["04", "Material", "Sifat unsur terkait penggunaan bahan"]].map(([number, title, text]) => <div key={title} className="rounded-xl bg-slate-50 p-3"><span className="font-mono text-[10px] text-teal-700">{number}</span><h4 className="mt-1 text-sm font-semibold">{title}</h4><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div>)}</div></div></Panel>
            <Panel><Eyebrow>Tujuan belajar</Eyebrow><p className="mt-2 text-sm text-slate-600">Targetmu: <strong className="text-slate-900">{saved.profile.goal}</strong></p><div className="mt-4 grid gap-3 sm:grid-cols-2">{["Menjelaskan pengertian dan sejarah sistem periodik.", "Mengidentifikasi unsur berdasarkan periode, golongan, dan blok.", "Menentukan posisi unsur melalui konfigurasi elektron.", "Menjelaskan tren sifat periodik dan mengaitkannya dengan sifat unsur."].map((goal, index) => <p key={goal} className="flex gap-3 rounded-xl border border-slate-100 p-3 text-sm leading-6 text-slate-700"><span className="font-mono text-teal-700">0{index + 1}</span>{goal}</p>)}</div><div className="mt-6 flex justify-end"><Button onClick={() => completeChapter(1)}>Lanjut ke Bab 2 →</Button></div></Panel>
          </>}

          {chapter === 2 && <>
            <Panel><Eyebrow>Bab 02 · Materi inti</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-tight">Susunan unsur menyimpan petunjuk</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">Buka setiap bagian untuk menandai materi yang sudah dibaca. Bab selesai setelah semua empat bagian dibuka.</p><div className="mt-6 space-y-3">{sections.map((section, index) => <details key={section} onToggle={(event) => { if (event.currentTarget.open) setReadSections((current) => current.includes(section) ? current : [...current, section]); }} className="group rounded-2xl border border-slate-200 bg-white open:border-teal-200 open:bg-teal-50/30"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold text-slate-900 focus-visible:outline-none"><span><span className="mr-3 font-mono text-xs text-teal-700">0{index + 1}</span>{section}</span><span className="text-teal-700 transition group-open:rotate-180" aria-hidden="true">⌄</span></summary><div className="border-t border-slate-100 px-4 py-5 text-sm leading-7 text-slate-700">
              {index === 0 && <><p>Sistem periodik modern berkembang dari upaya mengelompokkan unsur berdasarkan sifatnya. Döbereiner mengusulkan triade, Newlands hukum oktaf, Mendeleev menyusun tabel berdasarkan massa atom dan sifat kimia, lalu Moseley menyusunnya berdasarkan nomor atom.</p><p className="mt-3 rounded-xl bg-white p-3"><strong>Intinya:</strong> susunan modern memakai kenaikan nomor atom, bukan massa atom.</p></>}
              {index === 1 && <><p>Tabel periodik memiliki <strong>7 periode</strong> (baris), <strong>18 golongan</strong> (kolom), serta blok <strong>s, p, d, dan f</strong> berdasarkan orbital terakhir yang terisi.</p><div className="mt-4 grid gap-2 sm:grid-cols-4">{[["s", "Golongan IA–IIA"], ["p", "Golongan IIIA–VIIIA"], ["d", "Unsur transisi"], ["f", "Lantanida & aktinida"]].map(([block, text]) => <div key={block} className="rounded-xl bg-white p-3"><span className="font-mono text-2xl font-bold text-teal-800">{block}</span><p className="mt-1 text-xs">{text}</p></div>)}</div><p className="mt-4">Pilih unsur pada tabel untuk melihat nomor atom, periode, golongan, dan kategori.</p><div className="mt-4"><PeriodicTable /></div></>}
              {index === 2 && <><p>Gunakan konfigurasi elektron untuk menentukan posisi unsur: kulit tertinggi menunjukkan periode, elektron valensi membantu menentukan golongan, dan orbital terakhir menunjukkan blok.</p><div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-sm text-white"><p>Fe: [Ar] 3d⁶ 4s²</p><p className="mt-2 text-teal-200">Kulit tertinggi n = 4 → periode 4</p><p className="text-teal-200">Elektron d terlibat → golongan transisi</p><p className="text-teal-200">s + d = 2 + 6 = 8 → golongan VIIIB</p></div></>}
              {index === 3 && <><p className="mb-4">Arah panah menunjukkan kecenderungan umum; beberapa unsur dapat memiliki pengecualian.</p><div className="overflow-x-auto"><table className="w-full min-w-[520px] border-collapse text-left"><thead><tr className="border-b border-slate-200 text-xs text-slate-500"><th className="p-3">Sifat</th><th className="p-3">Ke kanan dalam periode</th><th className="p-3">Ke bawah dalam golongan</th></tr></thead><tbody>{[["Jari-jari atom", "Mengecil", "Bertambah"], ["Energi ionisasi", "Naik", "Menurun"], ["Keelektronegatifan", "Bertambah", "Menurun"], ["Sifat logam", "Menurun", "Bertambah"]].map((row) => <tr key={row[0]} className="border-b border-slate-100"><th className="p-3 font-semibold">{row[0]}</th><td className="p-3">{row[1]}</td><td className="p-3">{row[2]}</td></tr>)}</tbody></table></div><p className="mt-4">Logam cenderung melepas elektron; nonlogam cenderung menangkap elektron. Karena itu, kecenderungan reaktivitas logam dan nonlogam berbeda.</p></>}
            </div></details>)}</div><div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="text-xs text-slate-500">{readSections.length} / {sections.length} bagian telah dibuka</p><Button disabled={readSections.length < sections.length} onClick={() => completeChapter(2)}>Lanjut ke Bab 3 →</Button></div></Panel>
          </>}

          {chapter === 3 && <Panel><Eyebrow>Bab 03 · Mini project</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-tight">Kelompokkan unsur</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">Pilih unsur lalu pilih golongan tujuan, atau seret unsur ke zona yang tepat. Pada layar sentuh, cukup ketuk unsur dan zonanya.</p>
            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]"><div><h3 className="mb-3 text-sm font-semibold">Unsur yang perlu dikelompokkan <span className="font-normal text-slate-500">({placed.length}/{gameItems.length})</span></h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{gameItems.filter((item) => !isPlaced(item.symbol)).map((item) => <button key={item.symbol} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", item.symbol); setSelectedItem(item.symbol); }} onClick={() => setSelectedItem(item.symbol)} aria-pressed={selectedItem === item.symbol} className={`min-h-20 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${selectedItem === item.symbol ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100" : "border-slate-200 bg-white hover:border-slate-300"}`}><span className="font-mono text-2xl font-bold text-slate-900">{item.symbol}</span><span className="mt-1 block text-xs text-slate-600">{item.name}</span></button>)}</div></div>
              <div><h3 className="mb-3 text-sm font-semibold">Zona golongan</h3><div className="grid grid-cols-2 gap-2">{targets.map((target) => <div key={target} role="button" tabIndex={0} onClick={() => selectedItem && placeItem(target, selectedItem)} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && selectedItem) { event.preventDefault(); placeItem(target, selectedItem); } }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDropTarget(event, target)} aria-label={`${target}, zona penempatan`} className="min-h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 outline-none transition hover:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-700"><span className="text-xs font-semibold text-slate-600">{target}</span><div className="mt-3 flex flex-wrap gap-1">{gameItems.filter((item) => item.target === target && isPlaced(item.symbol)).map((item) => <span key={item.symbol} className="rounded-lg bg-emerald-100 px-2 py-1 font-mono text-sm font-bold text-emerald-800">{item.symbol}</span>)}</div></div>)}</div></div>
            </div><div aria-live="polite" className="mt-4 min-h-6 text-sm text-slate-700">{placed.length === gameItems.length ? <strong className="text-emerald-800">Selesai! Skor percobaan: {gameItems.reduce((sum, item) => sum + ((mistakes[item.symbol] ?? 0) === 0 ? 10 : 5), 0) - (3 - hints) * 2}. Rekor terbaik: {saved.miniProject?.bestScore ?? 0}.</strong> : gameFeedback}</div>
            {hintText && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{hintText}</p>}<div className="mt-4 flex flex-wrap gap-3"><Button secondary disabled={hints === 0 || placed.length === gameItems.length} onClick={useHint}>Petunjuk ({hints})</Button><Button secondary onClick={() => { setPlaced([]); setMistakes({}); setHints(3); setHintText(""); setGameFeedback(""); setSelectedItem(null); }}>Acak ulang</Button></div>
            {placed.length === gameItems.length && <div className="mt-6 flex justify-end"><Button onClick={() => completeChapter(3)}>Lanjut ke Bab 4 →</Button></div>}
          </Panel>}

          {chapter === 4 && <Panel><Eyebrow>Bab 04 · Quiz & flashcard</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-tight">Uji pemahamanmu</h2><p className="mt-3 leading-7 text-slate-600">12 soal dari materi sumber, dengan pembahasan setelah setiap jawaban.</p><div className="mt-6 flex gap-2"><button onClick={() => setQuizMode("quiz")} className={`min-h-11 rounded-xl px-4 text-sm font-semibold ${quizMode === "quiz" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>Mode quiz</button><button onClick={() => setQuizMode("flashcard")} className={`min-h-11 rounded-xl px-4 text-sm font-semibold ${quizMode === "flashcard" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>Mode flashcard</button></div>
            {quizMode === "flashcard" ? <div className="mt-5"><button onClick={() => setFlashBack(!flashBack)} aria-pressed={flashBack} className="min-h-64 w-full rounded-3xl border border-teal-100 bg-[radial-gradient(ellipse_at_top_right,_rgba(20,184,166,0.12),_transparent_55%),#f8fafc] p-7 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 sm:p-10"><Eyebrow>Flashcard {flashIndex + 1} / {quizQuestions.length}</Eyebrow>{!flashBack ? <p className="mt-6 text-2xl font-semibold text-slate-900">{quizQuestions[flashIndex].question}</p> : <><p className="mt-6 text-xl font-semibold text-teal-900">{quizQuestions[flashIndex].options.find((option) => option.id === quizQuestions[flashIndex].correctOptionId)?.text}</p><p className="mt-3 leading-7 text-slate-600">{quizQuestions[flashIndex].explanation}</p></>}<p className="mt-8 text-xs text-slate-500">Ketuk kartu untuk membalik</p></button><div className="mt-3 flex justify-between"><Button secondary onClick={() => { setFlashIndex((flashIndex + quizQuestions.length - 1) % quizQuestions.length); setFlashBack(false); }}>← Sebelumnya</Button><Button onClick={() => { setFlashIndex((flashIndex + 1) % quizQuestions.length); setFlashBack(false); }}>Berikutnya →</Button></div></div> : quizFinished ? <div className="mt-5 rounded-3xl bg-emerald-50 p-6"><Eyebrow>Hasil quiz</Eyebrow><h3 className="mt-2 text-3xl font-semibold">{saved.quiz?.score ?? quizScore} / {saved.quiz?.total ?? quizRun.length}</h3><p className="mt-2 text-slate-700">{Math.round(((saved.quiz?.score ?? quizScore) / (saved.quiz?.total ?? quizRun.length)) * 100)}% jawaban benar. Hasil tersimpan di browser ini.</p>{saved.quiz?.wrongAnswers?.length ? <div className="mt-5 space-y-3"><h4 className="font-semibold text-slate-900">Tinjau jawaban yang perlu dipelajari</h4>{saved.quiz.wrongAnswers.map((missed) => { const question = quizQuestions.find((item) => item.id === missed.questionId); if (!question) return null; const chosen = question.options.find((option) => option.id === missed.selectedOptionId); const correct = question.options.find((option) => option.id === question.correctOptionId); return <article key={missed.questionId} className="rounded-xl bg-white p-4 text-sm leading-6"><p className="font-semibold">{question.question}</p><p className="mt-2 text-rose-800">Jawabanmu: {chosen?.text}</p><p className="text-emerald-800">Jawaban tepat: {correct?.text}</p><p className="mt-1 text-slate-600">{question.wrongAnalysis[missed.selectedOptionId]}</p></article>; })}</div> : <p className="mt-4 text-sm font-medium text-emerald-800">Semua jawabanmu tepat. Kerja bagus!</p>}<div className="mt-5 flex flex-wrap gap-3"><Button onClick={startQuiz}>Ulangi quiz</Button><Button secondary onClick={() => completeChapter(4)}>Lanjut ke Bab 5 →</Button></div></div> : !quizRun.length ? <div className="mt-5 rounded-2xl bg-slate-50 p-6"><h3 className="text-lg font-semibold">Siap mencoba?</h3><p className="mt-2 text-sm leading-6 text-slate-600">Urutan soal dan opsi diacak untuk setiap percobaan.</p><div className="mt-4"><Button onClick={startQuiz}>Mulai quiz</Button></div>{saved.quiz && <p className="mt-4 text-sm text-slate-500">Percobaan terakhir: {saved.quiz.score}/{saved.quiz.total}</p>}</div> : currentQuiz ? <div className="mt-5 rounded-3xl border border-slate-200 p-5 sm:p-7"><div className="flex justify-between text-xs font-semibold text-slate-500"><span>Soal {quizIndex + 1} dari {quizRun.length}</span><span>{currentQuiz.difficulty} · {currentQuiz.topic}</span></div><div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600 transition-[width]" style={{ width: `${((quizIndex + 1) / quizRun.length) * 100}%` }} /></div><h3 className="mt-6 text-xl font-semibold leading-8 text-slate-950">{currentQuiz.question}</h3><div className="mt-5 space-y-2">{currentQuiz.options.map((option) => { const correct = option.id === currentQuiz.correctOptionId; const selected = option.id === quizAnswer; const color = quizChecked && correct ? "border-emerald-400 bg-emerald-50" : quizChecked && selected ? "border-rose-400 bg-rose-50" : selected ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white hover:bg-slate-50"; return <button key={option.id} disabled={quizChecked} onClick={() => setQuizAnswer(option.id)} aria-pressed={selected} className={`flex min-h-12 w-full items-center gap-3 rounded-xl border p-3 text-left text-sm ${color}`}><span className="grid size-7 shrink-0 place-items-center rounded-full border border-current font-mono text-xs">{option.id.toUpperCase()}</span>{option.text}{quizChecked && correct && <span className="ml-auto text-emerald-800">✓ Benar</span>}{quizChecked && selected && !correct && <span className="ml-auto text-rose-800">Kurang tepat</span>}</button>; })}</div>
              {quizChecked && <div aria-live="polite" className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6"><p><strong>{quizAnswer === currentQuiz.correctOptionId ? "Tepat!" : "Belum tepat."}</strong> {currentQuiz.explanation}</p>{quizAnswer !== currentQuiz.correctOptionId && <p className="mt-2 text-slate-600">{currentQuiz.wrongAnalysis[quizAnswer ?? ""]}</p>}<p className="mt-2 text-xs text-slate-500">Sumber: {currentQuiz.sourceRef}</p></div>}
              <div className="mt-5 flex justify-between"><Button secondary onClick={() => setHintText(currentQuiz.hint)}>Petunjuk</Button>{!quizChecked ? <Button disabled={!quizAnswer} onClick={answerQuiz}>Periksa jawaban</Button> : <Button onClick={nextQuestion}>{quizIndex === quizRun.length - 1 ? "Lihat hasil" : "Berikutnya →"}</Button>}</div>{hintText && <p className="mt-3 text-sm text-amber-800">Petunjuk: {hintText}</p>}
            </div> : null}</Panel>}

          {chapter === 5 && <><Panel><Eyebrow>Bab 05 · Kesimpulan & evaluasi</Eyebrow><h2 className="mt-3 text-3xl font-semibold tracking-tight">Bawa pulang polanya</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Sistem modern mengurutkan unsur berdasarkan nomor atom.", "Posisi periode, golongan, dan blok berkaitan dengan konfigurasi elektron.", "Jari-jari atom membesar ke bawah dan mengecil ke kanan.", "Energi ionisasi dan keelektronegatifan umumnya naik ke kanan periode.", "Sifat logam meningkat ke kiri dan ke bawah tabel."].map((item, index) => <p key={item} className="rounded-xl bg-slate-50 p-4 text-sm leading-6"><span className="mr-2 font-mono text-teal-700">0{index + 1}</span>{item}</p>)}</div></Panel>
            <Panel><Eyebrow>Rekap perjalanan</Eyebrow><div className="mt-4 grid gap-3 sm:grid-cols-2"><Info label="Mahasiswa" value={saved.profile.studentName} /><Info label="Dosen pengampu" value={lecturer} /><Info label="Target awal" value={saved.profile.goal} /><Info label="Bab selesai" value={`${saved.completedChapters.length} dari 5`} /><Info label="Mini project · rekor terbaik" value={saved.miniProject ? `${saved.miniProject.bestScore} poin` : "Belum dikerjakan"} /><Info label="Quiz terakhir" value={saved.quiz ? `${saved.quiz.score}/${saved.quiz.total}` : "Belum dikerjakan"} /></div></Panel>
            <Panel><div className="flex items-start justify-between gap-3"><div><Eyebrow>Refleksi</Eyebrow><h3 className="mt-2 text-xl font-semibold">Apakah targetmu tercapai?</h3><p className="mt-2 text-sm text-slate-600">Target awal: “{saved.profile.goal}”</p></div><span aria-live="polite" className="pt-1 text-xs text-slate-500">{flashSaved ? "Tersimpan" : "Tersimpan otomatis"}</span></div><label className="sr-only" htmlFor="reflection">Refleksi belajar</label><textarea id="reflection" value={reflection} onChange={(event) => setReflection(event.target.value)} rows={5} className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 leading-6 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100" placeholder="Apa yang sudah kamu pahami? Apa yang masih ingin kamu pelajari?" /></Panel>
            <Panel><Eyebrow>Mulai lagi</Eyebrow><p className="mt-2 text-sm leading-6 text-slate-600">Pilih untuk mengulang pembelajaran atau menghapus profil dan progres yang tersimpan di browser ini.</p><div className="mt-4 flex flex-wrap gap-3"><Button secondary onClick={() => resetLearning(true)}>Ulangi pembelajaran</Button><Button secondary onClick={() => resetLearning(false)}>Mulai dari nol</Button></div></Panel>
          </>}
        </div>
      </div>
    </main>
    <nav aria-label="Navigasi cepat bab" className="fixed inset-x-0 bottom-3 z-30 mx-auto flex w-[calc(100%-1.5rem)] max-w-lg items-center justify-between gap-1 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_10px_40px_rgba(15,23,42,0.16)] backdrop-blur sm:bottom-5">{chapters.map((name, index) => { const id = index + 1; const available = id <= Math.max(1, ...saved.completedChapters.map((n) => n + 1)); return <button key={id} disabled={!available} onClick={() => setChapter(id)} aria-label={`Bab ${id}: ${name}`} aria-current={chapter === id ? "step" : undefined} className={`grid size-11 shrink-0 place-items-center rounded-xl font-mono text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 disabled:opacity-30 ${chapter === id ? "bg-teal-700 text-white" : completed.has(id) ? "bg-teal-50 text-teal-800" : "bg-slate-50 text-slate-500"}`}>{completed.has(id) ? "✓" : `0${id}`}</button>; })}<div className="hidden pl-2 text-[10px] font-medium text-slate-500 sm:block">{chapters[chapter - 1]}</div></nav>
  </div>;
}

# GUIDELINE: Website Pembelajaran Interaktif — Sistem Tabel Periodik

Dokumen ini adalah acuan lengkap untuk membangun website pembelajaran interaktif bertema **Sistem Tabel Periodik**. Semua keputusan di sini sudah disesuaikan dengan preferensi proyek: Next.js + Tailwind + shadcn/ui + motion, storage lokal di browser (tanpa layanan pihak ketiga), tema putih dengan latar grid, dan mini project tebak & kelompokkan unsur.

---

## 1. Ringkasan Proyek

| Item | Keputusan |
|---|---|
| Jenis | Website pembelajaran interaktif (single user, tanpa login) |
| Topik | Sistem Tabel Periodik |
| Sumber materi | `docs/source.md` |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Komponen UI | shadcn/ui |
| Animasi | `motion` (import dari `motion/react`) |
| Storage | `localStorage` di browser (tanpa backend / DB / third party) |
| Quiz | JSON di folder `quiz/`, dibuat dari `docs/source.md` |
| Tema | Putih, latar grid, konten berupa floating card putih |
| Responsif | Wajib: mobile-first (360px sampai desktop lebar) |

### Alur pengguna

```
Landing (isi profil) → Bab 1 → Bab 2 → Bab 3 → Bab 4 → Bab 5 → (Kembali ke awal)
```

---

## 2. Setup Project

```bash
npx create-next-app@latest tabel-periodik --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd tabel-periodik

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label textarea progress tabs badge dialog tooltip radio-group separator sheet sonner

# animasi
npm i motion
```

Catatan:
- Pakai **App Router**. Semua komponen interaktif memakai `"use client"`.
- Jangan tambah library state, DB, atau auth. Cukup React Context + `localStorage`.
- Pastikan `resolveJsonModule: true` aktif di `tsconfig.json` supaya JSON quiz bisa di-import langsung.
- Tambahkan alias untuk folder quiz di `tsconfig.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"],
      "@quiz/*": ["./quiz/*"]
    }
  }
}
```

---

## 3. Struktur Folder

```
tabel-periodik/
├─ docs/
│  └─ source.md                  # sumber materi (sudah ada)
├─ quiz/
│  ├─ quiz.json                  # bank soal hasil generate
│  └─ README.md                  # cara generate + validasi
├─ scripts/
│  └─ validate-quiz.ts           # validasi skema quiz.json
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ globals.css             # grid background + token tema
│  │  ├─ page.tsx                # landing + form profil
│  │  └─ bab/
│  │     ├─ [id]/page.tsx        # atau 5 folder terpisah: 1..5
│  ├─ components/
│  │  ├─ ui/                     # hasil shadcn (jangan diedit sembarangan)
│  │  ├─ shell/                  # AppShell, FloatingNav, ChapterStepper
│  │  ├─ bab1/  bab2/  bab3/  bab4/  bab5/
│  │  └─ periodic/               # PeriodicGrid, ElementTile, dll (dipakai lintas bab)
│  ├─ content/                   # konten bab hasil olahan source.md (TS/JSON)
│  │  ├─ bab1.ts
│  │  ├─ bab2.ts
│  │  └─ elements.ts             # data unsur untuk tabel & mini project
│  ├─ lib/
│  │  ├─ storage.ts              # wrapper localStorage bertipe
│  │  ├─ progress.ts             # logika progres bab
│  │  └─ utils.ts                # cn() dari shadcn
│  ├─ providers/
│  │  └─ learner-provider.tsx    # Context: profil, progres, skor, refleksi
│  └─ types/
│     └─ index.ts
└─ GUIDELINE.md
```

---

## 4. Design System (Tema Putih + Grid + Floating)

### 4.1 Prinsip visual

1. **Latar belakang** putih dengan pola **grid tipis** (garis abu sangat halus).
2. **Semua konten utama** berada di dalam **floating item putih**: card dengan sudut membulat, border tipis, dan shadow lembut sehingga terlihat melayang di atas grid.
3. Navigasi juga floating: pill/bar putih yang menempel di atas atau bawah layar, bukan header penuh.
4. Warna aksen dipakai hemat. Untuk kategori unsur (logam alkali, halogen, gas mulia, dll) pakai **warna pastel sebagai penanda kecil** (dot, border-left, badge), jangan mengisi seluruh card agar tema putih tetap terjaga.
5. Tipografi bersih: satu font sans (mis. Geist/Inter via `next/font`) + satu font mono untuk simbol unsur dan rumus.

### 4.2 Token & grid background (`globals.css`)

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --muted: #737373;
  --grid-line: rgb(0 0 0 / 0.06);
  --grid-size: 32px;
  --card-shadow: 0 8px 30px rgb(0 0 0 / 0.08);
  --card-shadow-hover: 0 14px 40px rgb(0 0 0 / 0.12);
}

body {
  background-color: var(--background);
  background-image:
    linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size);
  background-attachment: fixed; /* grid diam saat scroll, kesan card melayang */
}

@media (max-width: 640px) {
  :root { --grid-size: 24px; }
}
```

Opsional: tambahkan fade di tepi grid dengan `mask-image: radial-gradient(...)` pada pseudo-element supaya grid tidak terlalu ramai.

### 4.3 Komponen dasar: FloatingCard

```tsx
// src/components/shell/floating-card.tsx
import { cn } from "@/lib/utils";

export function FloatingCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/5 bg-white p-5 sm:p-8",
        "shadow-[0_8px_30px_rgb(0_0_0/0.08)]",
        className
      )}
      {...props}
    />
  );
}
```

Gunakan `motion.div` untuk versi animasinya (lihat bagian 9).

### 4.4 Layout halaman

- Container: `mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-10`.
- Antar card: `gap-4 sm:gap-6`.
- **FloatingNav** (stepper bab 1–5 + progres): `fixed inset-x-0 bottom-4 mx-auto w-[calc(100%-2rem)] max-w-md` di mobile, boleh pindah ke atas di desktop. Beri `pb-28` pada konten agar tidak tertutup.
- Radius konsisten: card `rounded-2xl`, tombol/input `rounded-xl`, tile unsur `rounded-lg`.

---

## 5. Responsif (Wajib)

Pendekatan **mobile-first**. Uji di lebar: 360, 390, 768, 1024, 1440.

| Area | Mobile (<640) | Tablet (640–1023) | Desktop (≥1024) |
|---|---|---|---|
| Layout bab | 1 kolom, card bertumpuk | 1–2 kolom | 2 kolom jika ada panel samping |
| Nav | floating bar bawah | floating bar bawah/atas | floating bar atas atau samping |
| Tabel periodik | scroll horizontal di dalam card + tombol zoom, atau mode "per golongan" | grid penuh skala kecil | grid penuh 18 kolom |
| Mini project | tap-to-select + tap-to-place | drag & drop | drag & drop |
| Quiz | 1 soal per layar, opsi full-width | sama | card tengah, max-w-2xl |

Aturan penting:
- Tabel periodik 18 kolom **tidak muat** di 360px. Solusi: bungkus `overflow-x-auto` di dalam FloatingCard, set `min-w-[720px]` pada grid, beri indikator "geser →", dan sediakan tombol zoom (`scale` 0.75 / 1 / 1.25). Jangan biarkan body ikut scroll ke samping.
- Target sentuh minimal **44×44px** untuk tombol dan opsi quiz.
- Gunakan `dvh` bukan `vh` untuk tinggi layar penuh di mobile.
- Font minimum 14px untuk teks isi; simbol unsur di tile boleh lebih kecil tetapi tetap terbaca.
- Hindari hover-only interaction. Semua yang muncul saat hover harus ada padanan tap/focus.

---

## 6. Storage (Cache Browser, Tanpa Third Party)

Pakai `localStorage` (bukan Cache API/service worker). Datanya persisten di browser yang sama, tetapi **tidak berpindah antar perangkat/browser** dan hilang jika pengguna menghapus data situs.

### 6.1 Skema data

```ts
// src/types/index.ts
export type LearnerProfile = {
  studentName: string;
  lecturerName: string;
  course?: string;        // mata kuliah / kelas
  studentId?: string;     // NIM/NPM (opsional)
  goal: string;           // target belajar
  createdAt: string;      // ISO date
};

export type QuizAttempt = {
  answers: Record<string, string>;   // questionId -> optionId
  score: number;
  total: number;
  finishedAt: string;
};

export type LearnerState = {
  version: 1;
  profile: LearnerProfile | null;
  completedChapters: number[];       // [1,2,...]
  lastChapter: number;
  miniProject: { bestScore: number; attempts: number } | null;
  quiz: QuizAttempt | null;
  reflection: string;
};
```

### 6.2 Wrapper storage

```ts
// src/lib/storage.ts
const KEY = "tabel-periodik:v1";

export const defaultState: LearnerState = {
  version: 1,
  profile: null,
  completedChapters: [],
  lastChapter: 1,
  miniProject: null,
  quiz: null,
  reflection: "",
};

export function loadState(): LearnerState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return parsed?.version === 1 ? { ...defaultState, ...parsed } : defaultState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: LearnerState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota penuh / mode private: abaikan, app tetap jalan */
  }
}

export function clearState() {
  try { window.localStorage.removeItem(KEY); } catch {}
}
```

### 6.3 Provider (hindari hydration mismatch)

- Baca `localStorage` **hanya di `useEffect`** setelah mount, lalu set flag `hydrated`.
- Selama `!hydrated`, tampilkan skeleton ringan, jangan render konten yang bergantung pada profil.
- Simpan state setiap berubah (`useEffect` pada state, setelah `hydrated`).
- Route guard: jika `profile === null` dan user membuka `/bab/*`, redirect ke `/` (lakukan di client setelah hydrated).

---

## 7. Spesifikasi Per Halaman / Bab

### 7.0 Landing + Input Profil (`/`)

Floating card di tengah dengan form:
- Nama siswa (wajib)
- Nama dosen (wajib)
- Mata kuliah/kelas (opsional)
- NIM/NPM (opsional)
- Target belajar (wajib, textarea singkat atau pilihan cepat + isian bebas)

Perilaku:
- Validasi sederhana (tidak boleh kosong, trim spasi), tampilkan pesan error di bawah field.
- Setelah submit: simpan profil, animasi transisi, masuk Bab 1.
- Jika profil sudah ada: tampilkan sapaan "Lanjutkan belajar" + tombol **Lanjut dari Bab X** dan **Mulai ulang**.

### 7.1 Bab 1 — Pendahuluan

Isi (ambil dari `docs/source.md`):
1. **Analogi materi**: ilustrasi yang mudah dipahami (mis. tabel periodik seperti rak/denah perpustakaan atau kalender yang mengelompokkan unsur berdasar sifat). Tampilkan sebagai floating card dengan ilustrasi/animasi sederhana.
2. **Aplikasi dalam kehidupan nyata**: 3–5 kartu (mis. baterai, perangkat elektronik, medis, makanan, material bangunan). Bisa carousel/kartu yang bisa di-tap untuk detail.
3. **Tujuan pembelajaran**: daftar tujuan yang muncul bertahap (stagger). Sertakan target pengguna dari profil, mis. "Targetmu: …" di atas daftar.

Selesai bab: tombol **Lanjut ke Bab 2** (menandai bab 1 selesai).

### 7.2 Bab 2 — Materi Inti

Isi (dari `docs/source.md`): konsep dasar, rumus/aturan dasar, sejarah singkat jika ada di sumber.

Komponen interaktif:
- **PeriodicGrid** interaktif: tap/klik unsur → panel detail (floating) menampilkan nomor atom, simbol, nama, massa atom, golongan, periode, kategori, konfigurasi elektron (jika ada di sumber).
- **Filter/legend** kategori (alkali, alkali tanah, transisi, halogen, gas mulia, dst) dengan highlight animasi.
- **Rumus dasar** ditampilkan dalam card mono/terformat; beri penjelasan langkah per langkah dan contoh hitung. Gunakan teks/Unicode atau komponen sederhana; tidak perlu library rumus kecuali materi banyak formula kompleks (kalau perlu, KaTeX adalah satu-satunya tambahan yang bisa dipertimbangkan).
- Bagi materi menjadi sub-bagian (Tabs atau accordion/stepper) agar tidak panjang di mobile.
- Penanda "sudah dibaca" per sub-bagian; bab dianggap selesai bila semua sub-bagian dibuka.

### 7.3 Bab 3 — Mini Project (Project Based Learning): Tebak & Kelompokkan Unsur

**Konsep:** pengguna diberi sejumlah unsur dan harus mengelompokkannya ke **golongan** atau **periode** yang tepat.

**Mode:**
1. **Kelompokkan ke Golongan** (mis. target: Golongan 1, 2, 17, 18 atau sesuai cakupan source.md)
2. **Kelompokkan ke Periode** (mis. Periode 1–4)
3. **Tebak Unsur** (opsional/level lanjut): diberi petunjuk (nomor atom/sifat/konfigurasi), tebak golongan & periodenya

**Mekanik:**
- Area atas/kiri: tumpukan **tile unsur** (simbol + nama).
- Area bawah/kanan: **zona drop** berlabel (Golongan X / Periode Y), berupa floating card.
- **Desktop/tablet:** drag & drop dengan `motion` (`drag`, `dragSnapToOrigin`, deteksi tumpang tindih lewat `getBoundingClientRect` saat `onDragEnd`).
- **Mobile (fallback wajib):** tap unsur untuk memilih (highlight), lalu tap zona tujuan untuk menaruh. Tidak bergantung pada drag.
- Umpan balik instan: benar → tile "mengunci" dengan animasi hijau lembut; salah → goyang (shake) singkat dan tile kembali, plus petunjuk singkat ("Cek jumlah elektron valensi").
- **Hint** terbatas (mis. 3x), mengurangi skor.
- Tombol **Cek jawaban** / **Reset** / **Acak ulang**.

**Skor:** benar pertama kali = 10 poin, benar setelah salah = 5, pakai hint = -2. Simpan `bestScore` dan `attempts` ke storage.

**Data:** semua unsur yang dipakai diambil dari `src/content/elements.ts` (diturunkan dari `docs/source.md`). Jangan hardcode di komponen.

**Refleksi mini:** setelah selesai, tampilkan ringkasan: unsur mana yang sering salah + penjelasan singkat polanya.

### 7.4 Bab 4 — Quiz (10–15 soal)

Sumber soal: `quiz/quiz.json` (lihat bagian 8).

**Dua mode tampilan dari data yang sama:**
1. **Mode Quiz:** satu soal per layar, pilih jawaban → tombol **Periksa**.
2. **Mode Flashcard:** depan = pertanyaan, belakang = jawaban benar + penjelasan (flip animation). Untuk belajar santai sebelum quiz.

**Perilaku mode Quiz:**
- Setelah memilih dan menekan Periksa:
  - Jawaban benar: tandai hijau + tampilkan `explanation`.
  - Jawaban salah: tandai merah, tampilkan jawaban benar, dan tampilkan **analisis kenapa pilihan yang dipilih kurang tepat** (`wrongAnalysis[optionId]`) + `explanation` konsep yang benar.
- Progress bar di atas, nomor soal, tombol **Berikutnya**.
- Acak urutan soal dan opsi setiap percobaan (simpan seed/urutan agar konsisten saat reload di tengah quiz, atau cukup reset saat reload; tentukan salah satu dan konsisten).
- Ringkasan akhir: skor, persentase, daftar soal yang salah + analisisnya, tombol **Ulangi quiz** dan **Lanjut ke Bab 5**.
- Simpan hasil terakhir ke storage.

### 7.5 Bab 5 — Kesimpulan & Evaluasi

1. **Kesimpulan materi:** poin-poin inti (dari source.md), ditampilkan sebagai kartu ringkas.
2. **Rekap capaian:** nama siswa, dosen, target (dari profil), skor mini project, skor quiz, bab selesai.
3. **Input refleksi:** textarea (mis. "Apa yang sudah kamu pahami? Apa yang masih sulit?"), tersimpan otomatis (debounce) ke storage. Beri pembanding dengan target awal: "Apakah targetmu tercapai?".
4. **Kembali ke awal:** dua opsi di dialog konfirmasi:
   - **Ulangi pembelajaran** (reset progres, skor, refleksi; **profil dipertahankan**)
   - **Mulai dari nol** (hapus semua termasuk profil, kembali ke landing)
5. (Opsional) tombol **Cetak/Simpan ringkasan** memakai `window.print()` dengan stylesheet print sederhana.

---

## 8. Pipeline Konten & Quiz dari `docs/source.md`

### 8.1 Prinsip

- `docs/source.md` adalah **satu-satunya sumber kebenaran** materi. Konten bab dan soal quiz harus bisa ditelusuri ke bagian di source.md.
- Jangan menambahkan fakta di luar source.md kecuali ditandai jelas.

### 8.2 Konten bab

Olah source.md menjadi file di `src/content/` (`bab1.ts`, `bab2.ts`, `elements.ts`) yang bertipe. Contoh `elements.ts`:

```ts
export type ElementData = {
  number: number;
  symbol: string;
  name: string;
  mass?: number;
  group: number | null;     // 1–18
  period: number;           // 1–7
  category: "alkali" | "alkaline-earth" | "transition" | "post-transition" |
            "metalloid" | "nonmetal" | "halogen" | "noble-gas" | "lanthanide" | "actinide";
  config?: string;          // konfigurasi elektron jika ada di source.md
};
```

### 8.3 Skema `quiz/quiz.json`

```json
{
  "id": "quiz-tabel-periodik",
  "title": "Quiz Sistem Tabel Periodik",
  "source": "docs/source.md",
  "generatedAt": "2026-11-25",
  "questions": [
    {
      "id": "q01",
      "type": "multiple-choice",
      "topic": "golongan",
      "difficulty": "easy",
      "question": "Unsur dengan 1 elektron valensi berada pada golongan …",
      "options": [
        { "id": "a", "text": "Golongan 1" },
        { "id": "b", "text": "Golongan 2" },
        { "id": "c", "text": "Golongan 17" },
        { "id": "d", "text": "Golongan 18" }
      ],
      "correctOptionId": "a",
      "explanation": "Elektron valensi menentukan golongan unsur golongan utama.",
      "wrongAnalysis": {
        "b": "Golongan 2 memiliki 2 elektron valensi, bukan 1.",
        "c": "Golongan 17 memiliki 7 elektron valensi.",
        "d": "Golongan 18 memiliki orbit terluar penuh (gas mulia)."
      },
      "hint": "Hitung elektron di kulit terluar.",
      "sourceRef": "Bagian: Golongan dan Elektron Valensi"
    }
  ]
}
```

Aturan skema:
- Jumlah soal **10–15**.
- `type`: `multiple-choice` atau `true-false` (untuk true/false, `options` berisi "Benar"/"Salah").
- Setiap soal **wajib** punya `explanation` dan `wrongAnalysis` untuk **setiap opsi salah** (analisis kenapa pilihan itu kurang tepat, bukan sekadar "salah").
- `sourceRef` wajib menunjuk heading/bagian di source.md.
- Distribusi: ±40% mudah, ±40% sedang, ±20% sulit; cakup semua topik utama source.md secara merata.
- Distraktor harus masuk akal (kesalahan konsep umum), bukan asal.

### 8.4 Cara generate

Karena tanpa third party, generate dilakukan **di luar runtime web** (sekali jalan, hasilnya di-commit):

1. Buka source.md di asisten AI pilihanmu (mis. Claude).
2. Gunakan prompt berikut, lalu simpan hasilnya ke `quiz/quiz.json`:

```
Baca file docs/source.md terlampir. Buat 12 soal quiz dalam JSON sesuai skema
quiz/README.md. Aturan:
- Semua soal hanya berdasarkan isi source.md, isi sourceRef dengan bagian terkait.
- Campur multiple-choice (4 opsi) dan true-false.
- Setiap soal punya explanation dan wrongAnalysis untuk SETIAP opsi salah
  yang menjelaskan kenapa pilihan itu kurang tepat.
- Distribusi kesulitan 40% easy, 40% medium, 20% hard.
- Output HANYA JSON valid, tanpa teks lain.
```

3. Validasi dengan script (bagian 8.5). Perbaiki sampai lolos.
4. Jika materi source.md berubah, ulangi langkah 1–3.

### 8.5 Validasi (`scripts/validate-quiz.ts`)

Cek minimal:
- 10 ≤ jumlah soal ≤ 15
- `id` unik, `correctOptionId` ada di `options`
- `wrongAnalysis` memiliki key untuk semua opsi selain yang benar
- Field wajib tidak kosong

Jalankan lewat `npx tsx scripts/validate-quiz.ts` dan tambahkan ke `package.json`:

```json
"scripts": { "validate:quiz": "tsx scripts/validate-quiz.ts" }
```

(`tsx` hanya devDependency untuk tooling, bukan bagian runtime web.)

---

## 9. Animasi (`motion`)

```tsx
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
```

Pola yang dipakai:
- **Masuk halaman/card:** `initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}` durasi 0.35–0.5s, ease halus.
- **Stagger list:** variants dengan `staggerChildren: 0.06` (daftar tujuan, kartu aplikasi).
- **Transisi antar bab:** `AnimatePresence mode="wait"` dengan fade + geser horizontal tipis.
- **Hover/tap card:** `whileHover={{ y: -4 }}` (desktop saja), `whileTap={{ scale: 0.98 }}`.
- **Flip flashcard:** `rotateY` 0→180 dengan `transformStyle: "preserve-3d"` dan `backfaceVisibility: "hidden"`.
- **Feedback quiz/mini project:** benar = pulse lembut; salah = shake kecil (`x: [0,-6,6,-4,4,0]`).
- **Progress:** animasi lebar progress bar dan stepper bab.

Aturan:
- Hormati preferensi pengguna: jika `useReducedMotion()` true, matikan gerakan besar (pakai fade saja).
- Animasikan `transform` dan `opacity` saja agar performa mulus di HP.
- Durasi maksimal ±0.6s untuk transisi UI; jangan menghalangi pengguna membaca.
- Di mobile, kurangi jumlah elemen yang beranimasi bersamaan.

---

## 10. Aksesibilitas & Kualitas

- Kontras teks memenuhi WCAG AA (jangan terlalu pucat di atas putih).
- Semua kontrol bisa dioperasikan dengan **keyboard** (Tab/Enter/Space), fokus terlihat jelas.
- Warna bukan satu-satunya penanda benar/salah: tambahkan ikon dan teks.
- `aria-label` untuk tombol ikon, `aria-live="polite"` untuk feedback quiz.
- Untuk mini project, sediakan alternatif non-drag (tap/keyboard) sehingga tidak bergantung gestur.
- Gunakan elemen semantik (`main`, `nav`, `section`, heading berurutan).
- Metadata: `title` dan `description` per halaman.

---

## 11. Rencana Pengerjaan (Milestone)

**M1 — Fondasi**
- [ ] Setup project, shadcn, motion
- [ ] Tema putih + grid, `FloatingCard`, `AppShell`, `FloatingNav`
- [ ] `storage.ts`, `LearnerProvider`, route guard

**M2 — Landing & Konten**
- [ ] Form profil + validasi + sapaan "lanjutkan"
- [ ] Olah `source.md` → `content/bab1.ts`, `bab2.ts`, `elements.ts`
- [ ] Bab 1 (analogi, aplikasi, tujuan)

**M3 — Materi Inti**
- [ ] `PeriodicGrid` responsif (scroll + zoom di mobile)
- [ ] Panel detail unsur, filter kategori
- [ ] Bab 2 lengkap + penanda progres

**M4 — Mini Project**
- [ ] Mode golongan & periode
- [ ] Drag & drop (desktop) + tap-to-place (mobile)
- [ ] Skor, hint, ringkasan, simpan best score

**M5 — Quiz**
- [ ] Generate `quiz/quiz.json` + `validate:quiz`
- [ ] Mode quiz + analisis jawaban salah
- [ ] Mode flashcard (flip)
- [ ] Ringkasan hasil + simpan ke storage

**M6 — Penutup & Polish**
- [ ] Bab 5: kesimpulan, rekap, refleksi (autosave)
- [ ] Dialog "Kembali ke awal" (ulang vs mulai dari nol)
- [ ] Uji responsif di semua breakpoint, reduced motion, keyboard
- [ ] `next build` bersih tanpa error, cek Lighthouse (performa & aksesibilitas)

---

## 12. Definisi Selesai (Definition of Done)

- Semua 5 bab dapat dilalui berurutan dan hasilnya tersimpan setelah refresh.
- Tampilan konsisten: latar putih bergrid, semua konten dalam floating card putih.
- Tidak ada scroll horizontal pada body di lebar 360px.
- Quiz berisi 10–15 soal dan setiap jawaban salah menampilkan analisis kenapa kurang tepat.
- Mini project bisa diselesaikan di mobile (tanpa drag) maupun desktop.
- Tidak ada dependensi backend/third party selain Next.js, Tailwind, shadcn/ui, dan motion.
- Build produksi (`next build`) sukses.

---

## 13. Catatan & Risiko

- **Storage lokal:** data hanya ada di browser yang dipakai. Jika perlu hasil belajar dikumpulkan dosen, tambahkan fitur **Ekspor** (unduh JSON/cetak ringkasan) tanpa backend, atau pertimbangkan backend di fase berikutnya.
- **Mode private/penuh quota:** `localStorage` bisa gagal; kode sudah dibungkus try/catch supaya app tetap jalan walau tidak tersimpan.
- **Hydration:** jangan membaca `localStorage` saat render server; gunakan flag `hydrated`.
- **Konsistensi materi:** setiap kali `docs/source.md` berubah, perbarui `content/` dan generate ulang `quiz/quiz.json`.

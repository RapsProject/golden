spekpagetryout.md - Try Out / Simulation Page Specification
1. Context & Objectives

Fase ini berfokus pada pembuatan antarmuka Try Out (Computer Based Test) untuk persiapan IUP ITB.

    Kondisi Saat Ini: Backend belum terhubung. Kita akan murni menggunakan Mock Data dan React State (useState, useEffect) untuk logika ujian.

    Target: Membangun alur ujian yang terdiri dari 4 tahap:

        List Try Out: Daftar ujian yang tersedia.

        Pre-Exam (Preparation): Detail ujian, aturan, dan tombol "Start".

        Exam Workspace (Play): Halaman pengerjaan soal (Full screen, tanpa sidebar dashboard).

        Result Summary: Halaman skor dan review pembahasan setelah selesai.

2. Directory Structure (App Router)

Karena Exam Workspace butuh layout yang bersih (tanpa Sidebar), kita akan memanfaatkan struktur bersarang (nested routing) di Next.js.
Plaintext

src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Layout Dashboard (Sidebar ada di sini)
│   │   └── tryout/
│   │       ├── page.tsx              # Halaman List Try Out (Di dalam Dashboard)
│   │       └── [id]/
│   │           ├── page.tsx          # Halaman Pre-Exam (Aturan & Start)
│   │           ├── result/page.tsx   # Halaman Skor Akhir & Pembahasan
│   │           └── play/
│   │               ├── layout.tsx    # OVERRIDE LAYOUT: Hapus Sidebar, cuma Header Ujian!
│   │               └── page.tsx      # WORKSPACE PENGERJAAN SOAL
│   │
├── components/
│   └── tryout/                       # Komponen khusus try out
│       ├── QuestionCard.tsx          # Menampilkan Soal & Opsi (A, B, C, D)
│       ├── ExamTimer.tsx             # Countdown Timer
│       └── NavigationPalette.tsx     # Kotak-kotak nomor soal (Bisa pindah soal)
│
└── lib/
    └── mockData.ts                   # Simpan dummy data ujian di sini

3. UI/UX & Layout Specification
3.1. List Try Out (tryout/page.tsx)

    Header: "AqTest Simulations".

    Layout: Grid kartu.

    Card Item:

        Judul: "Mock Test 1: Mathematics & Physics".

        Info: 40 Soal | 90 Menit.

        Status: "Not Started" (Warna Abu-abu) atau "Completed - Score: 85" (Warna brand-secondary).

        Action: Button "View Details" (Warna brand-primary).

3.2. Pre-Exam (tryout/[id]/page.tsx)

    Tampilan: Mirip halaman detail biasa.

    Konten:

        Deskripsi tes (Bahasa Inggris).

        Rules: Peringatan "Do not refresh the page" dan "Time will auto-submit when finishes".

    Action: Tombol besar "START SIMULATION" (Warna brand-primary). Klik tombol ini akan nge-route ke /play.

3.3. Exam Workspace / Play Mode (tryout/[id]/play/page.tsx)

PENTING: Halaman ini harus menggunakan layout sendiri yang full-width, bebas dari navigasi utama.

    Top Bar (Header Khusus Ujian):

        Kiri: Judul Ujian ("Mock Test 1").

        Tengah: ExamTimer (Countdown merah jika sisa < 5 menit).

        Kanan: Tombol "Finish Attempt" (Warna brand-dark atau merah hati-hati).

    Main Content (Split Screen / Grid):

        Kiri (70%): QuestionCard

            Nomor soal saat ini ("Question 1 of 40").

            Teks Soal (Support simulasi teks panjang/gambar).

            Opsi Jawaban (Radio buttons bergaya modern). Jika dipilih, border berubah jadi brand-primary.

            Tombol Bawah: "Previous", "Mark for Review" (Bendera kuning), dan "Next".

        Kanan (30%): NavigationPalette

            Grid nomor 1 - 40.

            Color Coding:

                Putih/Abu: Belum dijawab.

                Hijau (brand-secondary): Sudah dijawab.

                Kuning: Marked for review (Ragu-ragu).

                Biru (brand-primary): Posisi soal saat ini (Active).

3.4. Result Page (tryout/[id]/result/page.tsx)

    Header: "Simulation Complete!".

    Score Card: Tampilkan Nilai Akhir besar di tengah (Misal: 850/1000).

    Statistik: Jumlah Benar, Salah, Kosong.

    Review Section: List soal yang tadi dikerjakan. Tampilkan mana yang benar (Centang Hijau), salah (Silang Merah), beserta teks Explanation (Pembahasan) di bawahnya.

4. State Management (Mock Logic)

Karena tidak ada backend, buat instruksi agar Cursor membuat Mock State yang rapi di play/page.tsx:

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

    const [answers, setAnswers] = useState<Record<string, string>>({}) (Menyimpan format { questionId: selectedOptionId }).

    const [markedQuestions, setMarkedQuestions] = useState<string[]>([]) (Menyimpan ID soal yang ditandai ragu-ragu).

    Auto Submit: Jika timer habis, panggil fungsi handleSubmit secara otomatis.

    ## 4.5. Interactive Behavior & Handlers (Crucial UI/UX)
Halaman pengerjaan soal (`play/page.tsx`) WAJIB interaktif. Gunakan `useState` untuk mengatur reaktivitas komponen:

* **Option Selection (Pilih Jawaban):**
    * Setiap opsi jawaban (A, B, C, D) harus berupa komponen yang *clickable* (bisa diklik seluruh kotaknya, bukan cuma bulatan radionya).
    * **Logic:** Saat opsi diklik, panggil `handleSelectOption(questionId, optionId)`.
    * **Visual Feedback:** Opsi yang terpilih harus berubah warna (misal: background menjadi `brand-light` dan border menjadi tebal dengan warna `brand-primary`). Opsi lain kembali ke warna *default* putih.
* **Navigation Buttons (Next / Prev):**
    * **Next Button:** Saat diklik, panggil `setCurrentQuestionIndex(prev => prev + 1)`. 
    * **Prev Button:** Saat diklik, panggil `setCurrentQuestionIndex(prev => prev - 1)`. Tombol ini harus `disabled` jika user berada di soal nomor 1.
    * **Last Question:** Jika user berada di soal terakhir, ubah teks tombol "Next" menjadi "Finish Review" (mengarah ke rangkuman sebelum submit).
* **Navigation Palette (Grid Nomor Soal):**
    * Nomor di kotak navigasi sebelah kanan harus *clickable*. Jika user mengklik angka "15", halaman langsung melompat ke soal nomor 15 (`setCurrentQuestionIndex(14)`).
    * Warnanya harus reaktif: Jika di state `answers` sudah ada id jawaban untuk soal nomor 5, maka kotak nomor 5 otomatis berubah warna menjadi hijau (`brand-secondary`).

5. Mock Data Structure (lib/mockData.ts)

Instruksikan Cursor untuk membuat mock data bahasa Inggris berstandar IUP:
TypeScript

export const mockTryout = {
  id: "test-01",
  title: "IUP ITB Mock Test - Batch 1",
  durationMinutes: 90,
  questions: [
    {
      id: "q1",
      subject: "MATHEMATICS",
      text: "If the roots of the equation x^2 - px + q = 0 are consecutive integers, then the value of p^2 - 4q is...",
      options: [
        { id: "opt1", text: "1" },
        { id: "opt2", text: "2" },
        { id: "opt3", text: "3" },
        { id: "opt4", text: "4" }
      ],
      correctOptionId: "opt1",
      explanation: "Let the roots be n and n+1. Sum = 2n+1 = p. Product = n(n+1) = q. Thus, p^2 - 4q = (2n+1)^2 - 4n(n+1) = 4n^2 + 4n + 1 - 4n^2 - 4n = 1."
    },
    // Tambahkan 2-3 soal lagi untuk testing
  ]
}

6. Implementation Steps for AI

    Buat struktur folder tryout sesuai diagram di atas. Pastikan menggunakan Route Groups atau konfigurasi Layout yang tepat agar halaman play/ tidak mewarisi Sidebar Dashboard.

    Buat file lib/mockData.ts dan masukkan data soal dummy di atas.

    Implementasikan komponen UI: ExamTimer, NavigationPalette, dan QuestionCard. Gunakan warna dari Tailwind config yang sudah disetup (brand-primary, dll).

    Rangkai logika state di halaman pengerjaan (play/page.tsx) agar user bisa memilih jawaban, navigasi nomor, dan submit.

    Buat halaman result yang mengkalkulasi skor dari state jawaban yang di-pass (bisa menggunakan searchParams atau React Context sederhana untuk sementara).
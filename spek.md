spek.md - Landing Page Specification

1. Project Context & Design System
   1.1. Overview

Platform persiapan ujian masuk IUP ITB (International Undergraduate Program). Target audiens adalah siswa SMA yang ingin masuk kelas internasional ITB.

    Vibe: Akademis, Profesional, Terpercaya, Modern, & Clean.

    Language: English (Primary for content/copy) & Indonesia (Optional mixed).

1.2. Tech Stack Requirements

    Framework: Next.js 14+ (App Router).

    Styling: Tailwind CSS.

    Icons: Lucide React.

    Font:

        Headings: 'Merriweather' atau 'Playfair Display' (Kesan akademis/prestisius).

        Body: 'Inter' atau 'Plus Jakarta Sans' (Keterbacaan tinggi di mobile).

1.3. Color Palette (Strict Adherence)

Berdasarkan referensi gambar yang diberikan, implementasikan warna ini ke dalam tailwind.config.ts:
Role Hex Code Tailwind Name Suggestion Usage
Primary/Dark #09637E brand-dark Headings, Active States, Footer Background
Primary/Main #088395 brand-primary Primary Buttons, Links, Brand Elements
Secondary/Accent #7AB2B2 brand-secondary Borders, Secondary Buttons, Icons, Subtitles
Background/Light #EBF4F6 brand-light Page Background, Section Backgrounds
White #FFFFFF white Card Backgrounds, Text on Dark
1.4. UI/UX Constraints

    Mobile First: Desain harus dimuat dengan flex-col pada mobile dan berubah menjadi flex-row atau grid pada md atau lg breakpoint.

    Spacing: Gunakan whitespace yang lega (padding py-20 atau py-24 antar section) agar tidak terasa sesak.

    Button Styles: Rounded corners (misal: rounded-full atau rounded-lg).

2. File Structure & Scalability

Agar kode mudah dibaca dan di-maintain, ikuti struktur folder berikut. Jangan menumpuk semua kode di page.tsx.
Plaintext

src/
├── app/
│ ├── layout.tsx # Global layout (Fonts setup here)
│ ├── page.tsx # Main Landing Page (Composed of sections)
│ └── globals.css # Tailwind directives
├── components/
│ ├── ui/ # Reusable atomic components (Button, Card, Badge)
│ ├── layout/ # Navbar, Footer
│ └── sections/ # Specific Landing Page Sections
│ ├── Hero.tsx
│ ├── ProblemStatement.tsx
│ ├── InteractiveDemo.tsx
│ ├── Features.tsx
│ ├── Pricing.tsx
│ └── FAQ.tsx
└── lib/
└── utils.ts # CN helper for tailwind merge

3.  Section Specifications (Detailed)
    3.1. Navbar (components/layout/Navbar.tsx)

        Sticky/Fixed: Tetap terlihat saat scroll, dengan efek blur backdrop.

        Logo: Teks/Icon di kiri.

        Menu (Desktop): "Features", "Pricing", "Testimonials".

        Menu (Mobile): Hamburger menu icon.

        CTA: Tombol "Login" (Outline brand-primary) dan "Get Started" (Solid brand-primary).

3.2. Hero Section (components/sections/Hero.tsx)

    Goal: Kesan pertama "Gateway to Ganesha".

    Background: Gunakan warna brand-light (#EBF4F6) atau gradasi halus putih ke brand-light.

    Layout:

        Kiri (Text):

            Badge: "The #1 IUP ITB Preparation Platform" (Bg brand-secondary opacity 20%, text brand-dark).

            Headline: "Secure Your Seat at ITB International Class." (Font Serif, color brand-dark, size text-4xl md:text-6xl).

            Subhead: "Materi terkurasi, simulasi real-time, dan strategi khusus AqTest dari mahasiswa ITB." (Color slate-600).

            CTA Group:

                Button 1 (Primary): "Start Free Simulation" (Color brand-primary, arrow icon).

                Button 2 (Secondary): "View Syllabus" (Ghost/Outline style).

        Kanan (Visual): Ilustrasi abstrak atau Mockup laptop/tablet yang menampilkan dashboard aplikasi (gunakan placeholder div dulu jika belum ada aset).

3.3. Problem Statement (components/sections/ProblemStatement.tsx)

    Layout: Split 2 kolom.

    Visual (Kiri): Ilustrasi tumpukan buku tua/kusam (representasi materi UTBK biasa).

    Konten (Kanan):

        Heading: "ITB IUP Entrance Exam is NOT UTBK."

        Body: Jelaskan bahwa materi regular tidak cukup. AqTest butuh English Proficiency dan Mathematical Logic yang spesifik.

        List: Gunakan checkmark icon (brand-primary) untuk poin-poin masalah yang diselesaikan.

3.4. Interactive Demo Mockup (components/sections/InteractiveDemo.tsx)

    Style: Card besar dengan shadow-xl, background white.

    Konten: Tampilan statis satu soal Matematika dalam Bahasa Inggris.

        Question: "If f(x) = 2x + 1..." (Math font).

        Options: 4 tombol pilihan ganda.

        Interaction (CSS only): Salah satu pilihan dibuat seolah-olah "Terpilih" (warna brand-secondary) dan muncul Feedback Box di bawahnya.

        Feedback Box: "Correct! The logic is..." (Menunjukkan fitur pembahasan).

3.5. Features Grid (components/sections/Features.tsx)

    Layout: Grid 3 kolom (1 kolom di mobile).

    Cards: Background white, border tipis brand-light, hover effect shadow-lg.

    Items:

        AqTest Standard: English-based Math & Physics.

        Real-time Timer: Simulasi tekanan waktu asli.

        Performance Analytics: Grafik radar chart (gunakan icon chart).

3.6. Social Proof (components/sections/Testimonials.tsx)

    Konsep: "Insider Access".

    Konten: Quote dari pembuat soal (Mahasiswa ITB).

    Design: Simple card dengan foto avatar kecil, Nama, dan Jurusan (misal: "Systems & Tech, ITB '24").

3.7. Pricing (components/sections/Pricing.tsx)

    Background: brand-dark (#09637E) untuk membedakan section ini.

    Text Color: Heading putih, subtext brand-secondary.

    Cards: 2 atau 3 kartu. Kartu tengah ("Best Value") harus lebih menonjol (skala lebih besar atau border brand-primary).

    CTA di dalam kartu: "Choose Plan" full width.

3.8. Footer (components/layout/Footer.tsx)

    Background: Sangat gelap (bisa gunakan brand-dark atau slate-900).

    Layout: Grid 4 kolom (Logo/Bio, Product Links, Company Links, Socials).

    Links:

        Product: Features, Pricing, Syllabus.

        Company: About Us, Contact.

        Legal: Privacy Policy, Terms of Service.

    Copyright: "© 2025 [Nama Brand]. Made with ❤️ by ITB Students."

    Colors: Text brand-light (muted), Hover text brand-secondary.

4. Implementation Steps for AI

   Setup: Initialize Next.js app with Tailwind.

   Config: Update tailwind.config.ts with the color palette provided above.

   Components: Create UI atoms (Button.tsx, Container.tsx).

   Sections: Build each section file in components/sections/.

   Assembly: Import all sections into app/page.tsx.

   Refinement: Check mobile responsiveness and padding.

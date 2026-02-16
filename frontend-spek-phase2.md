frontend-spek-phase2.md - Auth UI & Dashboard Shell
1. Phase Context

Kita melanjutkan pengembangan Frontend Next.js. Landing page (Marketing) sudah selesai. Fokus fase ini adalah membangun halaman Login/Register dan Layout Dashboard (area setelah user login).

    Status Backend: Backend API belum siap/paused.

    Strategy: Fokus pada UI/UX implementation. Gunakan Mock Data statis di dalam komponen untuk mengisi konten dashboard sementara waktu.

    Styling: Lanjutkan penggunaan Tailwind CSS dengan color palette yang sudah ada di globals.css / tailwind.config.ts.

2. Directory Structure Refactoring (Route Groups)

Agar rapi, kita perlu memisahkan layout Landing Page dengan layout Dashboard. Instruksikan refactor folder app/ menjadi seperti ini:
Plaintext

src/app/
├── (marketing)/      # Pindahkan page.tsx (Landing Page) & layout.tsx yang sudah ada ke sini
│   ├── layout.tsx    # Navbar & Footer Marketing
│   └── page.tsx      # Landing Page
│
├── (auth)/           # Route Group baru untuk Login/Register
│   ├── layout.tsx    # Layout khusus Auth (Clean, Center aligned, No Navbar)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
└── (dashboard)/      # Route Group baru untuk area Member
    ├── layout.tsx    # Sidebar & Topbar Layout
    └── dashboard/    # Main Dashboard Page
        └── page.tsx

3. UI Specifications
3.1. Auth Layout ((auth)/layout.tsx)

Desain Split Screen yang modern.

    Desktop (md:flex-row):

        Kiri (50%): Area Form (Login/Register). Background white. Padding besar.

        Kanan (50%): Area Visual. Background brand-dark (#09637E).

        Konten Kanan: Tampilkan Quote inspiratif atau Testimonial simulasi ("Lolos IUP ITB berkat latihan rutin...").

    Mobile: Hanya tampilkan area Form.

3.2. Login Page ((auth)/login/page.tsx)

    Header: Logo (Kecil) + "Welcome Back".

    Social Button: "Sign in with Google" (Full width, Outline style).

    Divider: Garis tipis dengan teks "or email".

    Form Fields:

        Email (Input type email).

        Password (Input type password + Toggle Eye Icon).

    Action: Tombol "Log In" (Solid brand-primary).

    Footer: "Don't have an account? Sign up".

3.3. Dashboard Layout ((dashboard)/layout.tsx)

Layout admin standar dengan Sidebar permanen di desktop.

    Sidebar (Kiri, Fixed width 250px):

        Logo: Di bagian atas, background brand-dark.

        Menu Items:

            Dashboard (Home Icon)

            Practice / Latihan (BookOpen Icon)

            Simulation / Try Out (Clock Icon)

            Analytics (BarChart Icon)

        User Profile (Bawah): Avatar kecil + Nama User + Tombol Logout.

    Topbar (Atas, Mobile Only):

        Hamburger Menu untuk membuka Sidebar (Sheet/Drawer).

    Main Content (Kanan):

        Background brand-light (#EBF4F6).

        Padding p-4 atau p-6.

3.4. Dashboard Home ((dashboard)/dashboard/page.tsx)

Tampilan awal setelah login. Gunakan Mock Data untuk mengisi angka-angkanya.

    Section 1: Welcome Banner

        Text: "Hi, [Nama Mock]! Ready to conquer AqTest today?"

        Button: "Continue Practice".

    Section 2: Quick Stats (Grid 3 Kolom)

        Card 1: "Soal Dikerjakan" (Value: 120).

        Card 2: "Rata-rata Skor" (Value: 680).

        Card 3: "Target Harian" (Progress Bar 70%).

    Section 3: Recent Activity (List)

        Tampilkan list dummy: "Latihan Matematika - 10 menit lalu - Skor 80".

4. Implementation Instructions for AI

    Refactor: Pindahkan Landing Page ke group (marketing) terlebih dahulu. Pastikan globals.css tetap ter-load.

    Auth UI: Buat layout (auth) dan halaman Login/Register. Gunakan komponen ui/input, ui/button (jika menggunakan Shadcn UI) atau buat komponen atomik sendiri dengan Tailwind.

    Dashboard UI: Buat layout (dashboard) dengan Sidebar responsif. Gunakan lucide-react untuk ikon.

    Mock Data: Jangan panggil API atau Database. Hardcode saja data user dan statistik di dalam komponen Dashboard untuk keperluan tampilan.
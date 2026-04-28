# Socrate AI — Next.js

AI-powered study platform. Converted from Vite + React Router to **Next.js 14 App Router**.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
  layout.tsx          # Root layout
  page.tsx            # Home (/)
  features/page.tsx   # /features
  pricing/page.tsx    # /pricing
  login/page.tsx      # /login  (client component)
  not-found.tsx       # 404 page
  globals.css         # Global styles + CSS variables

components/
  landing/            # Page sections (Navbar, Hero, Features, etc.)
  ui/                 # shadcn/ui components

hooks/
  use-reveal.tsx      # Scroll-triggered reveal animations ("use client")
  use-mobile.tsx      # Mobile breakpoint hook ("use client")
  use-toast.ts        # Toast state ("use client")

lib/
  utils.ts            # cn() utility
```

## Migration Notes

| Vite / React Router         | Next.js                        |
|-----------------------------|--------------------------------|
| `react-router-dom` Link     | `next/link` Link               |
| `useNavigate()`             | `useRouter()` from next/navigation |
| `BrowserRouter` + `Routes`  | App Router (file-based)        |
| `src/pages/*.tsx`           | `app/**/page.tsx`              |
| No directives needed        | `"use client"` on interactive  |
| `index.html` entry          | `app/layout.tsx` root layout   |

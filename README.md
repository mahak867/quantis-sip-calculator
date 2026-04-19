# Quantis SIP Calculator

A clean, fast **Systematic Investment Plan (SIP) calculator** built with Next.js 15, React 19, TypeScript, and Tailwind CSS. Helps investors estimate returns on monthly SIP contributions over time.

[![CI](https://github.com/mahak867/quantis-sip-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/mahak867/quantis-sip-calculator/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-35%20passed-brightgreen)](#running-tests)
[![License](https://img.shields.io/badge/license-open%20source-blue)](#license)

**[🚀 Live Demo](https://quantis-sip-calculator.vercel.app)**

![Quantis SIP Calculator screenshot](https://raw.githubusercontent.com/mahak867/quantis-sip-calculator/main/public/screenshot.png)

---

## Features

- Calculate estimated returns for a given monthly investment, expected annual return, and duration
- Annual step-up SIP, inflation adjustment, LTCG tax estimate, and goal-progress tracking
- Input validation with clear per-field error messages
- Instant, client-side computation — no server calls needed
- Responsive UI styled with Tailwind CSS
- Built on the latest Next.js App Router (v15)

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | [Next.js 15](https://nextjs.org/) |
| Language   | TypeScript 5                      |
| UI Library | React 19                          |
| Styling    | Tailwind CSS 3                    |
| Charts     | Recharts 2                        |
| Testing    | Jest 29 + ts-jest                 |
| Linting    | ESLint 9 + eslint-config-next     |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mahak867/quantis-sip-calculator.git
cd quantis-sip-calculator

# 2. Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm run start
```

---

## Environment Variables

This project does not require any environment variables to run locally.

If you add API keys or secrets in the future, create a `.env.local` file (never commit it) and use `.env.example` as a template:

```bash
cp .env.example .env.local
```

> `.env*` files are already excluded in `.gitignore`.

---

## Project Structure

```
quantis-sip-calculator/
├── app/                  # Next.js App Router pages & components
├── lib/                  # Calculation logic & validation (sipCalculations.ts)
├── public/               # Static assets (screenshot, icons)
├── .gitignore
├── eslint.config.mjs
├── jest.config.js
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.js
└── tsconfig.json
```

---

## Deployment

The easiest way to deploy is via [Vercel](https://vercel.com/):

1. Push your code to GitHub
2. Import the repository on [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js — no extra configuration needed

---

## License

This project is open source. Feel free to fork and adapt it.

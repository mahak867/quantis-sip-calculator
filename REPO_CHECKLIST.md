# Repo Professionalisation Checklist
> Apply this process to every new repo before making it public.

---

## Step 1 — Security Audit
- [ ] Check `.gitignore` includes: `.env*`, `*.pem`, `node_modules/`, `.next/`, `build/`, `dist/`
- [ ] Search the entire codebase for hardcoded secrets:
  ```bash
  grep -r "password\|secret\|api_key\|token\|private_key" . --include="*.ts" --include="*.js" --include="*.env"
  ```
- [ ] Confirm no real API keys, passwords, or personal data exist in any committed file
- [ ] Add `.env.example` listing every env var needed (with placeholder values only)

## Step 2 — README
Replace the default `create-next-app` README with one that includes:
- [ ] Project title + one-line description
- [ ] Feature list
- [ ] Tech stack table
- [ ] Prerequisites (Node version, package manager)
- [ ] Installation steps (`git clone` → `npm install`)
- [ ] How to run locally
- [ ] How to build for production
- [ ] Environment variables section (reference `.env.example`)
- [ ] Project folder structure
- [ ] Deployment instructions
- [ ] License

## Step 3 — Repo Metadata (on GitHub)
- [ ] Add a **Description** in the repo settings (About section)
- [ ] Add relevant **Topics/tags** (e.g. `nextjs`, `typescript`, `finance`, `calculator`)
- [ ] Set a **Website** URL if deployed

## Step 4 — Clean Up
- [ ] Delete any test/debug files not meant for production
- [ ] Remove commented-out code blocks
- [ ] Ensure `package.json` `"name"` and `"version"` are correct

## Step 5 — Final Check Before Going Public
- [ ] Run `npm run build` — confirm zero errors
- [ ] Run `npm run lint` — confirm zero warnings
- [ ] Do one final `git log --oneline` review — no accidental secret commits in history

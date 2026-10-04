# Faafu Atoll School Coordination Workspace

A Vite and React app for collecting and reviewing weekly subject outlines.

## GitHub Pages hosting

1. Create a new GitHub repository.
2. Upload all project files, including the `.github/workflows/deploy.yml` file.
3. Open the repository's **Settings → Pages** and set the source to **GitHub Actions**.
4. Open **Settings → Secrets and variables → Actions** and add these repository secrets if Supabase-backed saving is needed:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Push the project to the `main` branch. GitHub will build and publish it automatically.

The app also works without those secrets using browser-only storage. Never upload `.env` or private service keys.

## Local checks

```bash
npm ci
npm run build
```

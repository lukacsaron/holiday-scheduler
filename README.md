# Holiday Scheduler

Picks a holiday week that works for a group. Share one link, everybody clicks the chunks they can make, and the counts tell you the answer.

## Why

Settling summer dates across a group of friends usually dies in a group chat. Doodle wants accounts, calendar invites want email addresses, and neither maps well to "which four-day block are you free for".

This asks for nothing. Create a poll, send the URL, done. No sign-up, no email, no password.

## How it works

The calendar spans mid-July to November and is divided into four-day chunks. You click the chunks that work for you and type a name. Results appear right away with per-chunk vote counts and a hover tooltip naming who picked what. Poll owners can go back and edit the date range or the chunk set afterwards.

Event markers sit on the calendar so you can see which weeks already have something in them.

## Run it

Two processes.

```bash
npm install
npm run dev           # frontend, http://localhost:5173
```

```bash
cd server
npm install
npm run dev           # API, http://localhost:3001
```

Copy `.env.example` to `.env` first.

## Deploy

```bash
docker compose up -d --build
```

The container holds both halves. SQLite lives at `server/data/polls.db` inside it, so mount a volume or you lose every poll on redeploy:

```bash
docker cp <container>:/app/server/data/polls.db ./backup.db
```

Full notes in [DEPLOYMENT.md](DEPLOYMENT.md). Set up for Coolify.

## Stack

React 18, TypeScript, Vite, Tailwind, React Router, date-fns. Express and better-sqlite3 on the server. Mobile-first, with a bottom drawer on small screens.

## Status

Used it to book an actual holiday. The January 2026 commits fix real problems that showed up in production, including votes for date chunks the owner had since deleted.

## License

MIT.

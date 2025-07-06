# workpal-agent

## System Architecture

![System Architecture](assets/system-arch.png)

## Folder Descriptions
- `activity-buffer`: Smart filtering service for ActivityWatch data (TypeScript/Node microservice).
- `activitywatch`: Upstream ActivityWatch time-tracking suite included as a git submodule for collecting raw activity data.
- `assets`: Static assets such as diagrams and images used in documentation.
- `screen-overlay`: (WIP) Front-end overlay components for displaying real-time status and controls on screen.
- `smart-response`: Microservice that analyses ActivityWatch data and generates context-aware responses via the agents doodle API.
- `webhook-example-main`: Example Express server that validates signed webhooks and returns demo responses.

## Sample response 

If the user's tabs are tracked as follows within the 30-second window:

> Internship – Summer 2026 at Geneva Trading ‑ Google Chrome – Hrishabh (Work)
> 2025-07-05 14:52:37 [aw-watcher-window-macos] [ERROR] tab title diff: **Job Application for Quantitative Trading Internship – Summer 2026 at Geneva Trading**, window title: *Job Application for Quantitative Trading Internship – Summer 2026 at Geneva Trading ‑ Google Chrome – Hrishabh (Work)*
> 2025-07-05 14:52:38 [aw-watcher-window-macos] [ERROR] tab title diff: **New Tab**, window title:
> 2025-07-05 14:53:00 [aw-watcher-window-macos] [ERROR] tab title diff: **New Tab**, window title: *hackathon.dreamnet.io ‑ Google Chrome – Hrishabh (Work)*
> 2025-07-05 14:53:00 [aw-watcher-window-macos] [ERROR] tab title diff: **New Tab**, window title: *New Tab ‑ Google Chrome – Hrishabh (Work)*
> 2025-07-05 14:53:06 [aw-watcher-window-macos] [ERROR] tab title diff: **Backpack**, window title:  – Hrishabh (Work)
> 2025-07-05 14:53:06 [aw-watcher-window-macos] [ERROR] tab title diff: **Backpack**, window title: *Backpack – Hrishabh (Work)*

Then the agent's response (DEYSI THE VERDANT VIBE) would something like this 

Oh, looking for an internship, are we? Well, let me tell you, sweetstem, the corporate world is a lot like a garden. You've got to plant your seeds, nurture them with a little magic and moxie, and then watch them bloom into something fabulous. *She twirls her leafboard, sending a shower of glowing pollen into the air.* But be careful not to get too tangled in the weeds, or you might just lose your sparkle. So, tell me, what kind of chromatic chaos are you hoping to cultivate with this internship?

## 💻 Demo Scenarios

### Scenario 1 – Deep-Focus Coding

[Watch the demo here.](https://screen.studio/share/kJCnwZwR)

### Scenario 2 – Distracted Browsing

[Watch the demo here.](https://screen.studio/share/8jUmV984)

## 🚀 Local Setup & Running

> Below is a minimal path to see the smart-response loop working on your own machine.  
> It assumes **macOS / Linux** with Node ≥ 18 and **ActivityWatch** already installed.

### 1. Clone and install deps

```bash
# clone
git clone https://github.com/<your-username>/<repo>.git
cd <repo>

# install Node deps for each micro-service
pnpm i -r     # if you use pnpm workspaces
# ── or ──
(cd activity-buffer   && npm install)
(cd smart-response    && npm install)
(cd screen-overlay    && npm install)
```

### 2. Configure environment variables

Create `activity-buffer/.env`:

```env
# activity-buffer
BUFFER_PORT=3000
ACTIVITYWATCH_API_URL=http://localhost:5600/api

# Doodles Agents credentials
aGENT_ID=XXXXXXXX              # your agent id
MINI_APP_ID=XXXXXXXX           # mini-app id
MINI_APP_SECRET=XXXXXXXX       # mini-app secret
AGENTS_API_URL=https://agents-api.doodles.app
```

> ⚠️  `AGENT_ID`, `MINI_APP_ID`, and `MINI_APP_SECRET` come from the Doodles console.

### 3. Start ActivityWatch

You should have already installed activitywatch - look at the README under activitywatch module to follow the installation and setup

```bash
aw-qt &   # starts the tray + watchers (window, web, afk …)
```

The local API is exposed at `http://localhost:5600/api` by default—exactly what the buffer expects.

### 4. Run the buffer service

```bash
cd activity-buffer
npm run dev     # uses ts-node
# → "🚀 Buffer service started on port 3000"
```

The service now polls ActivityWatch every 2 seconds, batches events, and forwards them to the agent API.  
A small `/latest` endpoint exposes the most recent agent reply.

### 5. OPTIONAL – See live replies via the overlay

```bash
cd screen-overlay
npm start        # launches Electron overlay
```

The overlay polls `http://localhost:3000/latest` for fresh replies and floats on top of your screen.

### 6. Trigger some activity

Open a few browser tabs, code editor windows, or go AFK—the buffer will send a chunk every ~45 seconds.  
Within moments you should see the agent's contextual message appear in the overlay **and** in the buffer console (`🗨️  Agent response: …`).

That's it!  Tweak watcher configs, buffer timing, or overlay styling to fit your workflow.


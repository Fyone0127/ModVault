# ModVault

ModVault is a full-stack game mod discovery platform built for COS30043 Interface Design and Development. It combines a dark gaming interface, curated game worlds, approved mod listings, favourites, reviews, creator submissions, admin moderation, and recommendation logic into one responsive web app.

The current build includes a slower cinematic splash screen, a full-screen centered menu, a polished chatbot assistant, a scroll-to-reveal homepage sequence, animated game cards, and role-based dashboards for players, creators, and admins.

## Highlights

- Vue 3 frontend powered by Vite and Vue Router.
- Express and Supabase PostgreSQL backend with REST API routes.
- Role-based access for guests, users, creators, and admins.
- Browse games, filter mods, open mod detail pages, save favourites, and write reviews.
- Creator application flow, mod upload form, My Mods management, and admin approval queues.
- Full-screen navigation overlay inspired by editorial portfolio menus.
- Animated splash screen and homepage reveal with responsive visual cards.
- Chatbot helper for browsing, account actions, creator access, uploads, favourites, reviews, and recommendations.
- Public seed data for 12 game worlds and approved mod examples.
- Responsive layouts for desktop, tablet, and mobile screens.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | Vue 3, Vite, Vue Router, Axios, Lucide Vue |
| Backend | Node.js, Express, PostgreSQL, pg |
| Auth and uploads | JWT, bcryptjs, Multer |
| Styling | CSS Grid, Flexbox, custom responsive CSS |
| Data | Supabase/PostgreSQL schema with seeded users, games, mods, reviews, favourites, downloads |

## Main Routes

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Home | Splash/reveal experience, hero content, featured worlds, and discovery sections. |
| `/games` | Games | Browse supported game worlds and jump into matching mods. |
| `/mods` | Mods | Search, filter, sort, and browse approved mods. |
| `/mods/:id` | Mod Detail | View mod details, creator info, download action, reviews, favourites, and related mods. |
| `/login` | Login | Sign in to access saved content and role-based tools. |
| `/register` | Register | Create a player account. |
| `/forgot-password` | Forgot Password | Request password reset support. |
| `/reset-password` | Reset Password | Set a new password from a reset token. |
| `/dashboard` | Dashboard | Role-aware hub for users, creators, and admins. |
| `/favourites` | Favourites | View saved mods. |
| `/reviews` | Review History | View previous review activity. |
| `/apply-creator` | Apply Creator | Request creator access. |
| `/upload` | Upload Mod | Submit a mod as a creator or admin. |
| `/my-mods` | My Mods | Track creator submissions and statuses. |
| `/admin/approvals` | Admin Approvals | Approve or reject pending mods. |
| `/admin/creator-requests` | Creator Requests | Approve or reject creator applications. |
| `/admin/games/new` | Add Game | Add a new game collection. |

## User Roles

| Role | Access |
| --- | --- |
| Guest | Browse the public catalogue, games, mod details, login, and register pages. |
| User | Save favourites, write reviews, view dashboard activity, and apply for creator access. |
| Creator | Upload mods, manage submitted mods, and use creator dashboard tools. |
| Admin | Approve mods, review creator requests, add games, and access moderation workflows. |

## Project Structure

```text
ModVault_Fresh/
|-- backend/
|   |-- config/
|   |   `-- db.js
|   |-- database/
|   |   `-- schema.sql
|   |-- middleware/
|   |   `-- auth.js
|   |-- routes/
|   |   |-- adminRoutes.js
|   |   |-- authRoutes.js
|   |   |-- creatorRoutes.js
|   |   |-- dashboardRoutes.js
|   |   |-- downloadRoutes.js
|   |   |-- externalRoutes.js
|   |   |-- favouriteRoutes.js
|   |   |-- gameRoutes.js
|   |   |-- modRoutes.js
|   |   |-- recommendationRoutes.js
|   |   `-- reviewRoutes.js
|   |-- uploads/
|   |   `-- .gitkeep
|   `-- server.js
|-- frontend/
|   |-- public/
|   |   |-- images/
|   |   |   |-- footer-scuba-cat.webp
|   |   |   `-- games/
|   |   |-- pochacco-pochacco-dance-transparent.gif
|   |   `-- sanrio-sanrio-characters-transparent.gif
|   `-- src/
|       |-- assets/
|       |-- components/
|       |-- router/
|       |-- services/
|       |-- utils/
|       |-- views/
|       |-- App.vue
|       `-- main.js
|-- .gitignore
`-- README.md
```

## Database Setup

Run the SQL script in the Supabase SQL Editor:

```text
backend/database/schema.sql
```

It creates the ModVault tables and seeds:

- demo admin user
- supported game worlds
- approved mods
- starter relational tables for reviews, favourites, downloads, and creator applications

Demo admin account:

```text
Email: demo@modvault.dev
Password: password
```

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

For macOS/Linux:

```bash
cp .env.example .env
```

Example backend `.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-SUPABASE-HOST]:5432/postgres
JWT_SECRET=change_this_to_a_long_secret_key
FRONTEND_URL=http://localhost:5174
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

## Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

For macOS/Linux:

```bash
cp .env.example .env
```

Example frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_UPLOAD_BASE_URL=http://localhost:5000/uploads
```

Frontend URL:

```text
http://localhost:5173
```

If port `5173` is already busy, Vite may open another port such as `5174`.

## API Route Groups

| Prefix | Purpose |
| --- | --- |
| `/api/health` | API availability check. |
| `/api/auth` | Register, login, forgot password, reset password, and session support. |
| `/api/games` | List and create game collections. |
| `/api/mods` | List, detail, upload, update, delete, approve, and reject mods. |
| `/api/favourites` | Save, list, and remove favourite mods. |
| `/api/reviews` | Create reviews, list mod reviews, and retrieve review history. |
| `/api/dashboard` | Role-specific dashboard summaries. |
| `/api/downloads` | Track download-link activity. |
| `/api/recommendations` | Related and personalised mod recommendations. |
| `/api/external` | External game inspiration data with local fallback data. |
| `/api/admin` | Admin moderation and game management. |
| `/api/creator` | Creator applications and creator workflow support. |

## Design Notes

- The app opens with a cinematic ModVault splash card that stays visible long enough to read.
- The site menu covers the full viewport and centers the navigation links.
- The homepage reveal section lingers after scroll so users can see the card artwork clearly.
- The game-world fan uses controlled hover motion so cards stay clickable.
- Mod detail pages use larger visual cards, readable titles, metadata chips, and review panels.
- The chatbot can be closed by clicking outside it and no longer needs an extra close button.
- Reduced-motion styles are included for users who prefer calmer animation.

## Asset Cleanup Notes

- Generated build output, dependencies, local environment files, and logs are ignored by Git.
- The backend `uploads` directory keeps only `.gitkeep` in the repository.
- Public image assets are kept only when referenced by the app, seed data, or active UI.
- The current site mark uses `pochacco-pochacco-dance-transparent.gif`.
- The splash/preview card uses `sanrio-sanrio-characters-transparent.gif`.

## Verification

Production build:

```bash
cd frontend
npm run build
```

Expected result:

```text
vite build completes successfully
```

Backend health check after starting the API:

```text
GET http://localhost:5000/api/health
```

Expected response:

```json
{"status":"ok","app":"ModVault API"}
```

## Repository

```text
https://github.com/Fyone0127/ModVault
```

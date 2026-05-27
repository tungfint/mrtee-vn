# mrtee.vn

mrtee.vn is a digital memory book and education archive for Mr. Tee. It stores
class pages, team pages, albums, videos, student profiles, yearbook-style memory
posts, background music, and public blog posts in one Next.js application.

Vietnamese documentation is available in [README.vi.md](./README.vi.md).

## Table Of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Database Workflow](#database-workflow)
- [Useful Scripts](#useful-scripts)
- [Public Routes](#public-routes)
- [Admin And Content Workflow](#admin-and-content-workflow)
- [Roles And Permissions](#roles-and-permissions)
- [Media, Albums, And Music](#media-albums-and-music)
- [UI Architecture](#ui-architecture)
- [Quality Checks](#quality-checks)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

## Features

- Home page with hero carousel, quick navigation, featured posts, albums, and videos.
- Class pages such as `/tin2023` and `/tin2326`.
- Team category pages such as `/hsg-tin`, `/ftc`, and `/ai`.
- Team year pages such as `/hsg-tin/2026`.
- Shared class/team detail layout for introduction, memory posts, albums, videos, and members.
- Public blog and memory-post detail pages.
- Student profile pages with yearbook-style information.
- Admin dashboard for managing classes, teams, students, posts, memory posts, albums, playlists, and display order.
- Rich Markdown/HTML content rendering with defensive HTML cleanup.
- Media gallery with slide/grid modes, image lightbox, video modal, keyboard navigation, and Google Drive helpers.
- Background music player with default playlist support and album playlist support.
- Role-based permissions for admin, class monitor, team monitor, and students.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React icons
- MySQL/MariaDB
- Prisma 7
- NextAuth.js 4
- bcryptjs for credential passwords
- react-markdown and remark-gfm for Markdown content
- Cloudinary-ready dependencies for future cloud image uploads

## Project Structure

```text
.
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.mjs                   # Initial seed data
│   ├── demo-content.mjs           # Demo/sample content
│   └── migrations/                # Prisma migrations
├── public/
│   ├── templates/                 # CSV import templates
│   └── uploads/                   # Local uploaded assets
├── src/
│   ├── app/
│   │   ├── (public)/              # Public website routes
│   │   ├── (auth)/                # Login route
│   │   ├── (dashboard)/           # Admin/user dashboard routes
│   │   └── api/                   # API routes
│   ├── components/
│   │   ├── admin/                 # Dashboard/admin components
│   │   ├── audio/                 # Site music player
│   │   ├── auth/                  # Login form
│   │   ├── content/               # Shared public content/media UI
│   │   ├── home/                  # Home page sections
│   │   └── ui/                    # Small reusable UI primitives
│   ├── lib/
│   │   ├── auth.ts                # NextAuth options
│   │   ├── permissions.ts         # RBAC helpers
│   │   ├── media-urls.ts          # Google Drive/media URL helpers
│   │   ├── public-media.ts        # Shared public media helpers
│   │   ├── prisma.ts              # Prisma client
│   │   └── uploads.ts             # Upload helpers
│   └── types/
│       └── next-auth.d.ts         # NextAuth type augmentation
├── .env.example
├── package.json
└── README.md
```

## Requirements

- Node.js compatible with Next.js 16 and React 19.
- npm.
- MySQL/MariaDB database. On Tenten SSD Hosting Linux, create a MySQL database and user in the hosting control panel.
- Optional Google OAuth app if Google login is enabled.
- Optional Cloudinary account if Cloudinary upload integration is used.

The project currently uses `package-lock.json`, so use npm rather than mixing
package managers.

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Variables:

```env
DATABASE_URL="mysql://mrtee_user:mrtee_password@localhost:3306/mrtee_vn"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
LOCAL_UPLOADS_ENABLED="true"
NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED="true"
```

### Required

- `DATABASE_URL`: MySQL/MariaDB connection string. For Tenten, replace `mrtee_user`, `mrtee_password`, host, port, and database name with the values from the hosting panel.
- `NEXTAUTH_URL`: Local value is usually `http://localhost:3000`.
- `NEXTAUTH_SECRET`: Long random secret for NextAuth session signing.

### Optional

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Required only for Google OAuth.
- `CLOUDINARY_*`: Required only if Cloudinary upload flow is enabled.
- `LOCAL_UPLOADS_ENABLED`: Controls whether uploads are written to
  `public/uploads` on the server. The default project setting is `true`.
- `NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED`: Client-side switch for showing local
  upload controls. Keep it aligned with `LOCAL_UPLOADS_ENABLED`.

Generate a local secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Local Setup

Install dependencies:

```bash
npm install
```

Prepare environment:

```bash
cp .env.example .env
```

Update `.env`, then generate Prisma Client:

```bash
npm run prisma:generate
```

Apply migrations:

```bash
npm run prisma:migrate
```

Seed initial data:

```bash
npm run db:seed
```

Optional demo content:

```bash
npm run db:demo
```

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Database Workflow

Validate Prisma schema:

```bash
npm run prisma:validate
```

Create/apply a development migration after changing `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

Regenerate Prisma Client:

```bash
npm run prisma:generate
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

Seed content:

```bash
npm run db:seed
npm run db:demo
```

Important data models:

- `User`: authentication identity and role.
- `Class`: class page data, class cover image, display order, monitor, students.
- `StudentProfile`: profile/yearbook data for a student.
- `Team`: team category/year data, cover images, achievements, members.
- `TeamMember`: join table between team year and student profile.
- `Post`: public blog posts.
- `MemoryPost`: class introductions, class stories, team stories, student yearbook posts.
- `MediaAsset`: media attached to memory posts.
- `Album`: reusable album under a class/team, with view mode and home display option.
- `AlbumItem`: album media items.
- `MusicPlaylist` and `MusicTrack`: background music and album playlists.

## Useful Scripts

```bash
npm run dev
```

Start local development server.

```bash
npm run build
```

Run production build. This also validates TypeScript during Next.js build.

```bash
npm run start
```

Start production server after `npm run build`.

```bash
npm run lint
```

Run ESLint.

```bash
npx tsc --noEmit
```

Run TypeScript typecheck without emitting files.

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

Prisma schema/database commands.

```bash
npm run db:seed
npm run db:demo
```

Load seed/demo data.

## Public Routes

Home:

- `/`

Class routes:

- `/tin2023`
- `/tin2326`
- `/class/[slug]`

Team routes:

- `/hsg-tin`
- `/hsg-tin/2026`
- `/ftc`
- `/ftc/[year]`
- `/ai`
- `/ai/[year]`
- `/team/[category]`
- `/team/[category]/[year]`

Blog and memory routes:

- `/blog`
- `/blog/[slug]`
- `/memory/[slug]`
- `/student/[id]`

Compatibility route handlers:

- `src/app/(public)/[slug]/page.tsx` delegates known class/team slugs.
- `src/app/(public)/[slug]/[year]/page.tsx` delegates known team year slugs.

## Admin And Content Workflow

Dashboard routes live under `/dashboard`.

Main admin areas:

- `/dashboard/admin`
- `/dashboard/admin/classes`
- `/dashboard/admin/classes/new`
- `/dashboard/admin/classes/[id]`
- `/dashboard/admin/teams`
- `/dashboard/admin/teams/new`
- `/dashboard/admin/teams/[id]`
- `/dashboard/admin/posts`
- `/dashboard/admin/memories`
- `/dashboard/admin/albums`
- `/dashboard/admin/music`
- `/dashboard/admin/students`

Typical workflow for a class:

1. Create or edit a class.
2. Set class slug, display order, cover image, card background image, slogan, and achievements.
3. Assign a monitor if needed.
4. Add/import students.
5. Add memory posts:
   - `CLASS_INTRO` for the main introduction.
   - `CLASS_STORY` for class memories.
   - `STUDENT_YEARBOOK` for student-related posts.
6. Attach media to posts.
7. Create albums and album items.
8. Choose whether albums/posts should show on the home page.

Typical workflow for a team:

1. Create a team by category and year.
2. Set cover/background/card images.
3. Add description, intro content, and achievements.
4. Assign a monitor if needed.
5. Add members from student profiles.
6. Add team memory posts.
7. Create albums and videos.
8. Control display order and home visibility.

## Roles And Permissions

Roles are defined in `prisma/schema.prisma`:

- `ADMIN`: full content management access.
- `MONITOR`: can manage assigned class/team content.
- `STUDENT`: can manage their own student profile/content where allowed.

Permission helpers live in:

```text
src/lib/permissions.ts
src/lib/admin-auth.ts
```

NextAuth configuration lives in:

```text
src/lib/auth.ts
src/app/api/auth/[...nextauth]/route.ts
```

## Media, Albums, And Music

### Media Types

Supported media types:

- `IMAGE`
- `VIDEO`
- `AUDIO`
- `LINK`
- `FILE`

### Google Drive

The app includes helpers for Google Drive URLs:

```text
src/lib/media-urls.ts
```

Helpers convert supported Drive file/folder URLs into:

- thumbnail URLs for images/videos
- preview embeds for files/videos
- embedded folder views
- proxied audio URLs for Google Drive audio playback

For best results, Drive files/folders should be publicly accessible or shared
with a visibility mode that the browser can access.

### Storage Policy

The project allows local uploads by default because this site is intended for a
small trusted group. Local upload is convenient, but external storage is still
recommended for large albums and videos.

- For small images and occasional media, local upload writes files to
  `public/uploads`.
- For large albums, videos, and audio, store files in Google Drive, Cloudinary,
  or another CDN and paste public URLs into admin forms.
- The database stores only URLs or local paths, titles, captions, type, and sort
  order.
- The app does not download Google Drive media into the database.

Current default:

```env
LOCAL_UPLOADS_ENABLED="true"
NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED="true"
```

For very small hosting plans, you can turn local uploads off and force URL-only
media entry:

```env
LOCAL_UPLOADS_ENABLED="false"
NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED="false"
```

With local uploads enabled, remind editors to keep files small and use Google
Drive/Cloudinary for bulk media.

### Album View Modes

Albums support:

- `SLIDE`: large slideshow-style gallery.
- `GRID`: scrollable grid.

Users can switch between slide and grid mode in the public album UI.

### Image UX

- Images open in a lightbox.
- Arrow keys navigate between images.
- `Escape` closes the image lightbox.

### Video UX

- Video thumbnails use Drive/YouTube preview images where possible.
- Clicking a video opens a modal player.
- `Escape` closes the video modal.

### Music

Music data lives in:

- `MusicPlaylist`
- `MusicTrack`

The site can load a default playlist and album-specific playlists.

## UI Architecture

Important shared components:

- `src/components/content/collection-page.tsx`
  - Shared class/team detail layout.
  - Used by class pages and team year pages.
- `src/components/content/media-gallery.tsx`
  - Slide/grid gallery, image lightbox, video modal, audio, links.
- `src/components/content/album-showcase.tsx`
  - Album wrapper with slide/grid controls and playlist button.
- `src/components/content/memory-post-card.tsx`
  - Reusable card for memory/story previews.
- `src/components/ui/background-card.tsx`
  - Shared background-image card primitive.
- `src/components/home/home-navigation.tsx`
  - Home quick-navigation cards.
- `src/components/home/home-posts-carousel.tsx`
  - Home horizontal posts carousel.
- `src/components/home/home-hero-carousel.tsx`
  - Home hero carousel.

Design conventions:

- Prefer shared components over duplicate page-specific markup.
- Keep class and team pages structurally aligned through `CollectionPage`.
- Use image backgrounds for public content cards.
- Keep card descriptions clamped to two lines where cards are repeated.
- Keep album-heavy sections scrollable instead of allowing media volume to stretch the entire page.
- Use `lucide-react` icons for buttons and labels.
- Use existing utility helpers from `src/lib` before adding new logic.

## Quality Checks

Before handing off a UI/content change, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Recommended browser checks:

- `/`
- `/tin2023`
- `/tin2326`
- `/hsg-tin`
- `/hsg-tin/2026`
- `/blog`

Check desktop and mobile:

- no horizontal scroll
- no text overflow
- card descriptions clamp correctly
- album grid scrolls internally when content is large
- image lightbox opens/closes
- video modal opens/closes
- `Escape` closes media modals
- arrow keys navigate lightbox images

## Deployment Notes

1. Provision MySQL/MariaDB.
2. Set production environment variables.
3. Run Prisma migrations.
4. Build the app.
5. Start the production server.

Typical sequence:

```bash
npm install
npm run prisma:deploy
npm run prisma:generate
npm run build
npm run start
```

For platforms like Vercel, configure:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- optional Google OAuth variables
- optional Cloudinary variables

Run migrations as part of your deployment workflow or manually before serving
traffic.

## Troubleshooting

### Prisma cannot connect

Check:

- MySQL/MariaDB is running.
- `DATABASE_URL` points to the correct database.
- The database exists.
- Network/firewall allows the connection.

Then run:

```bash
npm run prisma:validate
npm run prisma:generate
```

### Login does not work

Check:

- `NEXTAUTH_URL` matches the current site URL.
- `NEXTAUTH_SECRET` is set.
- Google OAuth callback URL is configured if Google login is used.
- User exists and has the correct role/password when using credentials login.

### Google Drive images or videos do not show thumbnails

Check:

- The Drive file is shared publicly or accessible to the browser.
- The URL is a supported Drive file/folder URL.
- For video thumbnails, prefer Drive file URLs or YouTube URLs supported by `mediaPreviewImageUrl`.

### HTML content breaks page layout

Rich HTML content is rendered through `RichContent`, which strips dangerous or
global page-level tags such as `script`, `style`, `head`, `html`, and `body`.
If a post still looks wrong, check whether the HTML contains layout styles that
should be converted to Markdown or scoped markup.

### Hydration warning with `bis_skin_checked`

Some browser extensions inject attributes such as `bis_skin_checked`. This can
produce hydration warnings in development. The app includes a small cleanup
script, but the warning can still appear in dev logs if an extension modifies
the DOM before React hydrates.

### Port 3000 already in use

Stop the process using port 3000 or run Next.js on another port:

```bash
npx next dev -p 3001
```

On Windows PowerShell, inspect the process:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

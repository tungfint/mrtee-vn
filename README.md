# mrtee.vn

Digital memory book, education portfolio, class archive, team archive, and blog
for Mr. Tee.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS v4 and Shadcn-style UI primitives
- Framer Motion for small interaction animations
- PostgreSQL with Prisma ORM
- NextAuth.js with Credentials and Google providers
- Cloudinary-ready dependencies for image uploads

## Local Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

Update `.env` with your PostgreSQL database URL, `NEXTAUTH_SECRET`, Google OAuth
credentials, and Cloudinary credentials before connecting real auth/uploads.

## Useful Scripts

```bash
npm run dev
npm run build
npm run lint
npm run prisma:validate
npm run prisma:migrate
npm run prisma:studio
```

## RBAC Summary

- `ADMIN`: full CRUD over classes, profiles, teams, and posts.
- `MONITOR`: edit assigned class page information.
- `STUDENT`: edit only their own student profile.

Core permission helpers live in `src/lib/permissions.ts`.

## Content Model Notes

- `Class`, `StudentProfile`, `Team`, `Post`, and reusable UI blocks support
  background images.
- `MemoryPost` stores rich Markdown or HTML content for class introductions,
  student yearbook entries, and team stories.
- `MediaAsset` attaches images, videos, audio, files, and links to those memory
  posts.

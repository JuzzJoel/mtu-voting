# MTU Voting

Premium, secure, passwordless voting experience for Mountain Top University students.

## Quick start

```zsh
pnpm install
pnpm prisma:generate
pnpm dev
```

## Core routes

- `/` — Landing page
- `/auth` — Email + OTP authentication
- `/vote` — Step-based voting flow
- `/success` — Submission confirmation
- `/admin` — Admin nominee management
- `/studio` — Sanity Studio (content management)

## Notes

- Only `@mtu.edu.ng` emails can request OTP codes.
- Votes are selected locally and submitted once at the end of the flow.
- Admin access is controlled by `ADMIN_EMAIL` or `ADMIN_EMAILS`.
- Image uploads use S3-compatible storage (see `S3_*` env vars).
- Content is managed in Sanity and synced on category fetch.

## Sanity setup

1. Create a Sanity project and dataset.
2. Add Sanity env vars in `.env.local`:

```zsh
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-05-01"
SANITY_READ_TOKEN=""
```

3. Run Studio at `http://localhost:3000/studio`.

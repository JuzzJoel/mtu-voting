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

## Notes
- Only `@mtu.edu.ng` emails can request OTP codes.
- Votes are selected locally and submitted once at the end of the flow.

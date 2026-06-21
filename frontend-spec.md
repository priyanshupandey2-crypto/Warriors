# AuraLearn Frontend Spec

## Project
AI-powered Learning Experience Platform (LXP)

## Roles
- LEARNER
- ADMIN

## Course lifecycle
- DRAFT
- SUBMITTED
- PUBLISHED
- REJECTED

## Course visibility
- PRIVATE
- GLOBAL

## Main learner flows
1. Login
2. View learner dashboard
3. Create a course by entering:
   - topic
   - difficulty
   - target audience
   - duration
   - tags
4. Generate draft course
5. Review generated course
6. Save draft
7. Submit course for global approval
8. Browse published courses
9. Enroll and consume course

## Main admin flows
1. View submitted courses
2. Review generated course
3. Approve or reject course for global publication

## Pages to implement for MVP
- /login
- /dashboard
- /create-course
- /my-courses
- /published-courses
- /course/[id]
- /admin/approvals

## Frontend stack
- Next.js 14+ App Router
- TypeScript
- Tailwind CSS
- Zustand
- Axios

## Global state stores
- authStore
- courseStore
- generationStore
- uiStore

## UI direction from Stitch export
Use the Stitch AuraLearn screens as visual inspiration only.
Do not copy raw HTML directly into pages.
Extract:
- shared layout shell
- reusable cards
- consistent buttons, forms, badges
- dashboard cards
- course cards
- clean modern learning-platform look

## Design direction
Use a soft modern LXP look based on the Luminous Learning / Vibrant Tech design tokens:
- primary blue
- purple secondary accent
- teal tertiary accent
- soft light surfaces
- rounded cards
- polished dashboard layout

## Important constraints
- Keep the implementation production-lean and maintainable.
- Prefer reusable components over page-specific one-off markup.
- Keep state stores separated by concern.
- Use mock data initially where backend endpoints are not yet ready.

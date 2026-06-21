# AuraLearn Frontend

AI-powered Learning Experience Platform (LXP) frontend built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Custom reusable primitives + domain components

## Project Structure

```
src/
├── app/              # Next.js pages and layouts
├── components/       # React components
│   ├── layout/      # Layout shell (Header, Sidebar, AppShell)
│   ├── ui/          # Reusable UI primitives
│   └── domain/      # Domain-specific components (CourseCard, StatsCard)
├── store/           # Zustand stores (auth, courses, generation, ui)
├── types/           # TypeScript type definitions
├── hooks/           # Custom React hooks
├── lib/             # Utilities, API client, constants
└── styles/          # Global styles & design tokens
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view in browser.

### Build

```bash
npm run build
npm start
```

## Design System

### Colors (CSS Custom Properties)

All colors are defined as CSS custom properties in `src/styles/variables.css` and used throughout Tailwind config:

- **Primary**: #0061a7 (electric blue)
- **Secondary**: #772cd8 (purple)
- **Tertiary**: #006a66 (teal)
- **Surfaces**: Surface hierarchy (lowest → highest)
- **Text**: On-surface and on-surface-variant

### Typography

Using Inter font family with semantic sizes:

- `display-lg`: 48px / 700 (hero titles)
- `headline-lg`: 32px / 600 (section headers)
- `headline-md`: 24px / 600 (card titles)
- `body-lg`: 18px / 400 (body text)
- `body-md`: 16px / 400 (standard text)
- `label-md`: 14px / 500 (buttons, labels)
- `label-sm`: 12px / 600 (small labels)

### Spacing

8px base unit system:

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

### Rounding

- `sm`: 4px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px
- `2xl`: 24px
- `full`: 9999px (pills)

## Components

### UI Primitives

- `Button` - Primary, secondary, outline, ghost variants
- `Input` - Text input with label & error states
- `Textarea` - Multi-line input
- `Select` - Dropdown select
- `Card` - Container with elevation
- `Badge` - Small labeled tags
- `Loader` - Spinning loader

### Domain Components

- `CourseCard` - Course listing card with progress, rating
- `StatsCard` - Metric display card with icon

### Layout Components

- `Header` - Top navigation bar
- `Sidebar` - Left navigation sidebar
- `AppShell` - Combined layout shell

## State Management (Zustand)

### Stores

- **authStore** - User authentication & session
- **courseStore** - Course listings, enrollment, drafts
- **generationStore** - AI course generation progress
- **uiStore** - Global UI state (sidebar, theme, notifications)

### Usage

```tsx
import { useAuthStore, useCourseStore } from '@/store';

function MyComponent() {
  const { user, login } = useAuthStore();
  const { courses, enrollCourse } = useCourseStore();
  
  return <div>{user?.name}</div>;
}
```

## Hooks

- `useAuth()` - Auth operations (login, signup, logout)
- `useCourses()` - Course operations (fetch, create, enroll)
- `useUI()` - UI state & notifications

## API Integration

Axios client configured in `src/lib/api.ts` with:

- Base URL from `NEXT_PUBLIC_API_URL`
- Automatic token injection in headers
- 401 response handling (redirect to login)

```tsx
import { apiClient } from '@/lib/api';

const response = await apiClient.get('/courses');
```

## Environment Variables

Create `.env.local` (copy from `.env.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Pages to Implement

- ✅ `/` - Landing page (basic)
- ⏳ `/login` - Login form
- ⏳ `/dashboard` - Learner dashboard
- ⏳ `/create-course` - Course creation wizard
- ⏳ `/my-courses` - User's courses
- ⏳ `/published-courses` - Course catalog
- ⏳ `/course/[id]` - Course detail & enrollment
- ⏳ `/admin/approvals` - Admin review dashboard

## Notes

- No pages are fully scaffolded yet—foundation only
- All components are reusable and typed
- Design tokens follow AuraLearn design system from Stitch export
- Use mock data while backend is in development
- Prefer composition over page-specific variants

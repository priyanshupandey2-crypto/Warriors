# AuraLearn Frontend Audit Report

## 1. AUDIT FINDINGS

### 1.1 Inconsistent AppShell Usage
**Status**: ⚠️ ISSUE
- Home page (`/page.tsx`) does NOT use AppShell - has custom header/layout
- Auth pages (login/signup) do NOT use AppShell - have custom AuthLayout
- All authenticated pages DO use AppShell correctly
- **Impact**: Inconsistent navigation/header experience across app

### 1.2 Page Layout Inconsistencies
**Status**: ⚠️ ISSUE
- `/my-courses`: `max-w-6xl`
- `/published-courses`: `max-w-7xl`
- `/course/[id]`: `max-w-4xl`
- `/admin/approval`: `max-w-7xl`
- **Impact**: Content width varies, breaks design consistency
- **Fix**: Standardize on one container width (recommend `max-w-6xl`)

### 1.3 Duplicate Component Patterns

#### A. Instructor/Creator Name Mapping
**Files**: 2 duplicates
- `SubmittedCourseCard.tsx`: lines 14-20
- `PublishedCourseCard.tsx`: embedded in publishe-courses/page.tsx
- **Fix**: Extract to `src/lib/utils/instructors.ts`

#### B. Difficulty Level Mapping (UPPERCASE ↔ Title Case)
**Files**: 3+ duplicates
- `SubmittedCourseCard.tsx`: lines 21-25
- `published-courses/page.tsx`: inline mapping (lines 172-176)
- `CourseForm.tsx`: hardcoded in select options
- `Course Detail pages`: various conversions
- **Fix**: Extract to `src/lib/utils/courseEnums.ts`

#### C. Status Color Mapping
**Files**: 1 (but should be extracted)
- `my-courses/page.tsx`: lines 11-16
- Also used in: CourseHeader.tsx, SubmittedCourseCard.tsx
- **Fix**: Extract to `src/lib/utils/courseEnums.ts`

#### D. Course List Grid Layout
**Files**: 3 similar implementations
- `my-courses/page.tsx`: grid layout + filtering + status badges (95 lines)
- `admin-approval/page.tsx`: grid layout + card selection (simpler version)
- `published-courses/page.tsx`: grid with search/filter
- **Pattern**: Grid of cards with meta → clickable card → detail view
- **Fix**: Extract base pattern, reuse across pages

### 1.4 Modal/Overlay Pattern Duplication
**Status**: ⚠️ ISSUE
- `CourseReviewPanel.tsx`: Custom fixed overlay (lines 32-36)
- `DraftActions.tsx`: Custom confirmation modal (lines 63-114)
- Both reinvent the same "overlay + card + actions" pattern
- **Fix**: Extract generic `ConfirmationDialog` or `Modal` component

### 1.5 Form Layout Duplication
**Status**: ⚠️ ISSUE
- `LoginForm.tsx`: Form with email/password inputs
- `SignupForm.tsx`: Form with name/email/password inputs
- `CourseForm.tsx`: Form with topic/difficulty/audience inputs
- **Pattern**: Each implements label + input + error display
- **Fix**: Already have Input component, just ensure consistency

### 1.6 Empty States Not Standardized
**Status**: ⚠️ ISSUE
- `my-courses/page.tsx`: Custom empty state (lines 148-158)
- `published-courses/page.tsx`: Custom empty state (lines 153-163)
- `admin-approval/page.tsx`: Custom empty state (lines 68-77)
- **Pattern**: Icon + heading + message + CTA
- **Fix**: Extract `EmptyState` component

### 1.7 Page Headers Not Standardized
**Status**: ⚠️ ISSUE
- Each page implements heading + subtitle + optional controls differently
- Examples:
  - `/dashboard`: Flex layout with title/subtitle
  - `/my-courses`: Flex layout with button CTA
  - `/published-courses`: Title + subtitle + badge
  - `/admin/approval`: Title + subtitle + pending badge
- **Pattern**: All follow similar structure
- **Fix**: Extract `PageHeader` component

### 1.8 Card Listing Patterns - 3 Variants
**Status**: ⚠️ ISSUE

1. **DraftCourseCard (Dashboard)**
   - Purpose: Quick view of user's drafts
   - Actions: Continue Editing + Delete
   - No detail view linking

2. **PublishedCourseCard (Browse)**
   - Purpose: Discover courses
   - Actions: Enroll button
   - No creator info prominent

3. **SubmittedCourseCard (Admin)**
   - Purpose: Review for approval
   - Actions: Review button → detail panel
   - Metadata: creator, submission date

4. **CourseCard (Domain)**
   - Purpose: Base card with flex display
   - May be over-engineered for draft courses

**Fix**: Simplify - most should use a single `CourseListCard` with props for variant

### 1.9 Missing Type Definitions
**Status**: ⚠️ ISSUE
- `published-courses/page.tsx`: Inline instructor map and difficulty map (should be typed)
- `my-courses/page.tsx`: Custom `MyCourse` interface (could use union type)
- `admin-approval/page.tsx`: Inline course filtering logic
- **Fix**: Create `src/lib/utils/courseHelpers.ts` with typed utilities

### 1.10 Responsive Design Gaps
**Status**: ⚠️ MINOR
- `/admin/approval`: Desktop + mobile shown simultaneously (showRejectForm not mobile-aware)
- `/published-courses`: Filters might need better mobile collapsing
- Overall: Most pages are good, minor tweaks needed

---

## 2. ROUTE STATUS

| Route | Uses AppShell | Status | Notes |
|-------|---------------|--------|-------|
| `/` | ❌ | ✅ | Custom Header OK for home, but should consider consistency |
| `/auth/login` | ❌ | ✅ | Uses AuthLayout, intentionally different (correct) |
| `/auth/signup` | ❌ | ✅ | Uses AuthLayout, intentionally different (correct) |
| `/dashboard` | ✅ | ✅ | Clean, all sections working |
| `/create-course` | ✅ | ✅ | Clean, two-column layout good |
| `/my-courses` | ✅ | ⚠️ | Works but has type and pattern issues |
| `/published-courses` | ✅ | ⚠️ | Works but has duplicate enums |
| `/course/[id]` | ✅ | ✅ | Clean detail page |
| `/admin/approval` | ✅ | ⚠️ | Works but could reuse card patterns |

---

## 3. RECOMMENDED IMPROVEMENTS (MVP-Ready Changes)

### Priority 1: Quick Wins (High Impact, Low Effort)

1. **Create `src/lib/utils/courseEnums.ts`**
   - Export: `difficultyMap`, `statusColorMap`, `instructorMap`, `visibilityMap`
   - Replace all inline duplicates
   - **Impact**: -20 lines duplicated code, improved maintainability

2. **Create `src/lib/utils/courseHelpers.ts`**
   - Export: `getInstructorName(id)`, `getDifficultyLabel(diff)`, `getStatusColor(status)`
   - Type-safe utilities
   - **Impact**: Cleaner page code, consistent conversions

3. **Standardize Page Container Width**
   - Change all pages to use `max-w-6xl` consistently
   - **Impact**: Visual consistency across app

4. **Create `PageHeader` Component**
   - Reuse in: `/dashboard`, `/my-courses`, `/published-courses`, `/admin/approval`
   - Props: title, subtitle, actions?, badge?
   - **Impact**: -40 lines duplicated code

5. **Create `EmptyState` Component**
   - Reuse in: `/my-courses`, `/published-courses`, `/admin/approval`
   - Props: icon, title, message, ctaButton?
   - **Impact**: -30 lines duplicated code

### Priority 2: Structural Improvements (Medium Effort)

6. **Create Base `CourseListCard` Component**
   - Props for: variant ('draft' | 'published' | 'admin' | 'browse')
   - Reduce: 3 near-identical card components to 1
   - **Impact**: Easier maintenance, consistent styling

7. **Create `ConfirmationDialog` Component**
   - Reuse in: `DraftActions.tsx`, `CourseReviewPanel.tsx`
   - Props: title, message, confirmLabel, onConfirm, isLoading
   - **Impact**: -50 lines duplicated code, better accessibility

8. **Standardize Form Error Display**
   - Extract common error box pattern
   - Ensure consistent styling across login/signup/course-creation

### Priority 3: Type Safety (Lower Effort, High Value)

9. **Create Type-Safe Enums**
   - Convert course status/difficulty/visibility to const objects with both keys
   - Example: `const COURSE_STATUS = { DRAFT: 'DRAFT', SUBMITTED: 'SUBMITTED', ... } as const`
   - **Impact**: Better type inference, less casting

10. **Fix Union Type for Mixed Course Lists**
    - Instead of custom `MyCourse` interface in `my-courses/page.tsx`
    - Use: `type MyCourseItem = Course | (DraftCourse & { status: CourseStatus })`
    - **Impact**: Cleaner, more maintainable

---

## 4. SPECIFIC FILES TO MODIFY

### Create (New Files)
- `src/lib/utils/courseEnums.ts` - Enum mappings
- `src/lib/utils/courseHelpers.ts` - Helper functions
- `src/components/ui/PageHeader.tsx` - Page title + subtitle + actions
- `src/components/ui/EmptyState.tsx` - Empty state template
- `src/components/course/CourseListCard.tsx` - Unified course card
- `src/components/ui/ConfirmationDialog.tsx` - Confirmation modal

### Refactor (Existing Files)
- `src/app/my-courses/page.tsx` - Use PageHeader, EmptyState, new helpers
- `src/app/published-courses/page.tsx` - Use PageHeader, EmptyState, new helpers
- `src/app/admin/approval/page.tsx` - Use PageHeader, EmptyState, new helpers, CourseListCard
- `src/components/course-detail/DraftActions.tsx` - Use ConfirmationDialog
- `src/components/admin-approval/CourseReviewPanel.tsx` - Use ConfirmationDialog, CourseListCard
- `src/components/admin-approval/SubmittedCourseCard.tsx` - Use new helpers
- `src/app/page.tsx` - Consider: should home also use AppShell? (low priority)

### No Changes Needed
- Dashboard - already clean
- Create course - already clean
- Course detail - already clean
- Auth pages - intentionally different layout

---

## 5. WHY THESE CHANGES MATTER FOR MVP

1. **Maintainability**: Fewer duplicated patterns = easier to update later
2. **Consistency**: Standardized spacing, colors, layouts improve UX
3. **Type Safety**: Reducing `as const` casts prevents bugs
4. **Future Pages**: New pages can reuse PageHeader, EmptyState, etc.
5. **Code Size**: ~100+ lines of duplicated code can be eliminated

---

## 6. ROLLOUT PLAN

Phase 1 (Enums & Helpers - 30 min):
- Create courseEnums.ts
- Create courseHelpers.ts
- Update pages to use new utilities

Phase 2 (UI Components - 45 min):
- Create PageHeader
- Create EmptyState
- Update pages to use them

Phase 3 (Card Consolidation - 45 min):
- Create CourseListCard
- Create ConfirmationDialog
- Update pages to use them

Total: ~2 hours for full refactor, ~0 new features

---

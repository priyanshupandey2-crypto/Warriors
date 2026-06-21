# AuraLearn Frontend Refactor Plan
## From Prototype to Production-Grade Learning Platform

**Date:** June 21, 2026  
**Status:** Planning Phase - Awaiting Approval  
**Estimated Timeline:** 5-7 days  
**Scope:** Visual consistency + production-readiness without breaking functionality

---

## EXECUTIVE SUMMARY

### Current State (B- / Prototype)
- ❌ Excessive emoji usage (25+ instances) - looks like Streamlit/demo
- ❌ Inconsistent form elements (custom HTML vs components)
- ❌ Unstyled range inputs (accessibility failure)
- ❌ Missing unified icon system
- ❌ Inconsistent modal/overlay implementations
- ⚠️ Weak visual hierarchy and spacing rhythm
- ⚠️ Pages feel disconnected despite shared design system

### Target State (A / Production)
- ✅ Professional icon system (Lucide React or Heroicons)
- ✅ All form elements use components with consistent styling
- ✅ Professional empty states
- ✅ Clean, semantic visual hierarchy
- ✅ Unified spacing and layout rhythm
- ✅ Looks like a real SaaS/LXP product, not a prototype

### Key Metrics
- **Lines to change:** ~500-800 (mostly in components/pages)
- **Files to refactor:** ~20 core files
- **New components:** 3-4 (SectionHeader, FormGroup, Icon wrapper)
- **Breaking changes:** None (internal refactor only)

---

## PART 1: CRITICAL FIXES (Must fix before launch)

### Phase 1A: Icon System Implementation (1 day)

#### 1. **Install Icon Library**
**Task:** Add Lucide React icons  
**Why:** Replace 25+ emoji instances with professional icons  
**File:** `package.json`

```bash
npm install lucide-react
```

**Action:** Update dependencies

---

#### 2. **Create Icon Wrapper Component**
**Task:** Create `src/components/ui/Icon.tsx`  
**Why:** Consistent icon sizing, color, accessibility  

**File to create:** `src/components/ui/Icon.tsx`
```typescript
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'on-surface' | 'on-surface-variant';
  className?: string;
}

export function Icon({
  icon: IconComponent,
  size = 'md',
  color = 'on-surface',
  className,
}: IconProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    'on-surface': 'text-on-surface',
    'on-surface-variant': 'text-on-surface-variant',
  };

  return (
    <IconComponent
      className={cn(sizeMap[size], colorMap[color], className)}
      aria-hidden="true"
    />
  );
}
```

**Export:** Add to `src/components/ui/index.ts`

---

#### 3. **Create Navigation Icon Mapping**
**Task:** Create `src/lib/utils/navigationIcons.ts`  
**Why:** Map navigation items to icon components instead of emojis  

**File to create:** `src/lib/utils/navigationIcons.ts`
```typescript
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Globe,
  CheckCircle,
} from 'lucide-react';

export const navigationIcons = {
  dashboard: LayoutDashboard,
  courses: BookOpen,
  createCourse: PlusCircle,
  browseCourses: Globe,
  approvals: CheckCircle,
};
```

---

#### 4. **Replace Sidebar Emoji Icons**
**Files to refactor:**
- `src/components/layout/Sidebar.tsx` - Lines 50-82
- `src/lib/utils/navigation.ts` - Update navigation function

**Changes:**
```typescript
// Before:
icon: '📊',  // emoji string

// After:
icon: navigationIcons.dashboard,  // lucide icon component
```

**Impact:** Affects dashboard, create-course, admin pages

---

#### 5. **Replace Dashboard Emoji Icons**
**Files to refactor:**
- `src/components/dashboard/sections/WelcomeSection.tsx` - Lines 58-80 (stats emojis)
- `src/components/dashboard/sections/QuickActionsCard.tsx` - Lines 14, 33 (text-4xl emojis)

**Changes:**
- Remove `<div className="text-4xl">✨</div>` 
- Replace with `<Icon icon={PlusCircle} size="xl" />`
- Remove emojis from button labels ("✨ Create" → "Create")

---

#### 6. **Replace Button Emoji Decorations**
**Files to refactor:**
- `src/app/my-courses/page.tsx` - Line 87: "✨ Create New Course"
- `src/app/page.tsx` - Button labels with →
- `src/components/dashboard/sections/QuickActionsCard.tsx` - "Start Creating →"
- `src/components/admin-approval/SubmittedCourseCard.tsx` - "Review Course →"
- `src/components/published-courses/PublishedCourseCard.tsx` - "Enroll Now"

**Decision Required:** Keep text as-is or remove arrows? (Recommend: Remove decorative arrows, keep primary action clarity)

---

#### 7. **Replace Empty State Icons**
**Files to refactor:**
- `src/components/ui/EmptyState.tsx` - Replace text-5xl emoji with icon
- `src/app/my-courses/page.tsx` - Empty state calls with icon param

**New structure:**
```tsx
<EmptyState
  icon={<Icon icon={BookOpen} size="xl" />}
  title="No courses yet"
  message="..."
/>
```

---

#### 8. **Replace Auth Page Icons**
**Files to refactor:**
- `src/app/auth/login/page.tsx` - Hero section emoji
- `src/app/auth/signup/page.tsx` - Hero section emoji

**Changes:** Use Icon wrapper or single hero asset instead of emoji

---

### Phase 1B: Form Element Consolidation (1 day)

#### 9. **Create Input Component Variants**
**File:** `src/components/ui/Input.tsx` - Enhance existing

**Add support for:**
- Error state styling
- Success state styling  
- Loading state (for async validation)
- Prefix/suffix icons
- Character counter

---

#### 10. **Create Select Component**
**File to create:** `src/components/ui/Select.tsx`

**Why:** Consolidate custom select usage, ensure consistency

**Locations using custom selects:**
- `src/components/published-courses/CourseFilters.tsx` - Lines 126-139
- `src/components/course-creation/CourseForm.tsx` - Likely

**Implementation:**
- Styled dropdown using Headless UI or Radix UI primitives
- Support for groups, disabled state, icons
- Consistent with Input styling

---

#### 11. **Create RangeSlider Component**
**File to create:** `src/components/ui/RangeSlider.tsx`

**Why:** Style the unstyled HTML range inputs in CourseFilters

**Current usage:** `src/components/published-courses/CourseFilters.tsx` - Lines 88-120

**Features:**
- Custom thumb and track styling
- Dual-range support (min/max)
- Labels showing current values
- Touch-friendly sizing

---

#### 12. **Create FormGroup Wrapper**
**File to create:** `src/components/ui/FormGroup.tsx`

**Why:** Consistent spacing between form fields

**Usage pattern:**
```tsx
<FormGroup>
  <Label>Email</Label>
  <Input />
  <HelperText>We'll never share your email</HelperText>
</FormGroup>
```

---

#### 13. **Replace Custom Textareas**
**File:** `src/components/admin-approval/CourseReviewPanel.tsx` - Lines 182-188

**Change:** Use Textarea component instead of custom HTML

---

#### 14. **Update Auth Form Fields**
**Files:**
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`

**Changes:**
- Use FormGroup wrapper
- Standardize label styling
- Add helper text support
- Update error state display

---

### Phase 1C: Empty State Standardization (4 hours)

#### 15. **Update EmptyState Component**
**File:** `src/components/ui/EmptyState.tsx`

**Changes:**
- Accept icon prop (component or lucide icon)
- Improve typography hierarchy
- Better spacing and sizing
- Optional action button support

---

#### 16. **Standardize All Empty States**
**Files using custom empty states:**
- `src/app/published-courses/page.tsx` - Lines 150-160 (replace with EmptyState)
- `src/app/admin/approval/page.tsx` - Lines 76-81 (already uses EmptyState, verify styling)

**Task:** Replace all custom empty state markup with EmptyState component

---

## PART 2: HIGH-PRIORITY FIXES (Timeline: 1-2 days)

### Phase 2A: Section Header Standardization (4 hours)

#### 17. **Create SectionHeader Component**
**File to create:** `src/components/ui/SectionHeader.tsx`

**Why:** Unified styling for all section headers across app

**Props:**
```typescript
interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  badge?: ReactNode;
}
```

**Used in:**
- All dashboard sections
- Course detail sections
- List page headers
- Settings pages

**Examples:**
- "Draft Courses" header in dashboard
- "Learning Objectives" in course detail
- "Recent Activity" in dashboard

---

#### 18. **Replace Custom Section Headers**
**Files to refactor:**
- `src/components/dashboard/sections/DraftCoursesSection.tsx` - Lines 32-37
- `src/components/dashboard/sections/PublishedCoursesSection.tsx` - Lines 40-53
- `src/components/course-detail/LearningObjectives.tsx` - Line 10
- `src/components/course-detail/ModulesSection.tsx` - Line 21
- Similar patterns throughout

**Change pattern:**
```tsx
// Before:
<h2 className="text-headline-lg">Title</h2>

// After:
<SectionHeader title="Title" />
```

---

### Phase 2B: Spacing Consistency (4 hours)

#### 19. **Standardize Max-Width Containers**
**File:** `src/components/layout/AppShell.tsx`

**Current:**
```tsx
<div className="px-gutter py-lg max-w-container-max mx-auto">
```

**Task:** 
- Define `max-w-container-max` correctly in tailwind config
- Use consistently across all pages
- Remove hardcoded `max-w-6xl` from individual pages

**Files to update:**
- `src/app/my-courses/page.tsx` - Remove local max-w-6xl
- `src/app/published-courses/page.tsx` - Remove local max-w-6xl
- `src/app/course/[id]/page.tsx` - Remove local max-w-6xl
- `src/app/admin/approval/page.tsx` - Remove local max-w-6xl
- `src/app/create-course/page.tsx` - Verify uses AppShell properly

---

#### 20. **Standardize Section Spacing**
**Task:** Ensure `space-y-lg` is used consistently for top-level section spacing

**Files to audit:**
- Dashboard page
- Course detail page
- List pages

**Rationale:** Creates visual rhythm and predictability

---

#### 21. **Standardize Card Padding**
**Task:** Ensure all cards use `p-lg` consistently

**Files to check:**
- All Card wrapper usages
- Verify no `p-md` or `p-2xl` inconsistencies

---

#### 22. **Fix Sticky Positioning Inconsistency**
**File:** `src/components/published-courses/CourseFilters.tsx` - Sidebar sticky position

**Current:** Uses `top-lg` (24px) - should be consistent with header height

**Decision needed:** What is the actual header height? Standardize all sticky tops.

---

### Phase 2C: Modal/Overlay Standardization (4 hours)

#### 23. **Unify Modal Implementation**
**Files:**
- `src/components/ui/ConfirmationDialog.tsx`
- `src/components/admin-approval/CourseReviewPanel.tsx` - Lines 59-61
- `src/app/create-course/page.tsx` - Generation modal

**Standard pattern:**
```tsx
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
  <Card className="max-w-md w-full">
    {/* Modal content */}
  </Card>
</div>
```

**Standardize:**
- z-index values (use consistent scale: modal=50, overlay=40, etc.)
- Padding around modal
- Backdrop color and opacity
- Animation on enter/exit (optional: add fade-in)

---

#### 24. **Add Modal Component Wrapper**
**File to create:** `src/components/ui/Modal.tsx`

**Why:** Encapsulate modal pattern for consistency

```typescript
interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  footer?: ReactNode;
}
```

**Migrate to:**
- ConfirmationDialog (already exists, verify uses Modal internally)
- CourseReviewPanel
- Generation modal in create course

---

### Phase 2D: Button & Badge Consistency (4 hours)

#### 25. **Standardize Button Text Decoration**
**Decision point:** Should buttons have decorative elements?

**Current state:**
- Some: "✨ Create" 
- Some: "→" arrow
- Some: no decoration

**Recommendation:** Remove all emoji/arrow decorations. Keep text clean. Use size/variant for prominence instead.

**Files to update:**
- Replace "✨ Create New Course" → "Create New Course"
- Replace "→" from button text
- Keep size=lg for prominent actions

---

#### 26. **Create Badge Type System**
**File:** `src/components/ui/Badge.tsx` - Enhanced

**Current issue:** Badge used for status, tags, counts inconsistently

**Solution:** Create explicit variants:

```typescript
interface BadgeProps {
  type: 'status' | 'tag' | 'count' | 'feature';
  variant: 'primary' | 'secondary' | 'tertiary' | 'success' | 'error';
  children: ReactNode;
  icon?: LucideIcon;
  onRemove?: () => void; // For tag chips
}
```

**Usage:**
```tsx
<Badge type="status" variant="primary">Published</Badge>
<Badge type="tag">AI</Badge>
<Badge type="count">12</Badge>
```

---

#### 27. **Replace Hardcoded Status Badges**
**Files:**
- `src/components/admin-approval/SubmittedCourseCard.tsx` - Line 34: hardcoded "SUBMITTED"
- Review all status badge implementations

**Standardize:** Use Badge component with type="status" variant

---

## PART 3: MEDIUM-PRIORITY FIXES (Timeline: 1 day)

### Phase 3A: Page Layout Improvements (4 hours)

#### 28. **Improve Dashboard Layout**
**File:** `src/app/dashboard/page.tsx`

**Issues:**
- Large gaps from `space-y-xxl`
- Sections feel disconnected

**Changes:**
- Change top-level `space-y-xxl` → `space-y-lg`
- Add subtle dividers between sections (optional: card-wrapped sections)
- Improve WelcomeSection emoji removal
- Remove decorative clutter

---

#### 29. **Improve Create Course Workspace Feel**
**File:** `src/app/create-course/page.tsx`

**Issues:**
- Feels like form, not workspace
- Generation modal is jarring
- Info panel is decorative

**Changes:**
- Move generation progress to card (not modal) if possible
- Add section dividers between form sections
- Improve right panel with interactive preview
- Use card wrapper for form sections

---

#### 30. **Improve Course Detail Layout**
**File:** `src/app/course/[id]/page.tsx`

**Issues:**
- DraftActions section appears disconnected
- Large gaps between sections
- No visual grouping

**Changes:**
- Change `space-y-xl` → `space-y-lg`
- Wrap DraftActions in card or separator section
- Add visual grouping for related sections

---

#### 31. **Simplify Admin Approval Layout**
**File:** `src/app/admin/approval/page.tsx`

**Issues:**
- Dual responsive logic (parent + child)
- Sticky positioning may be fragile

**Changes:**
- Simplify responsive: use single breakpoint strategy
- CourseReviewPanel should not have its own `lg:static`

---

### Phase 3B: Typography Refinement (2 hours)

#### 32. **Standardize Section Header Sizes**
**Rule:** All section headers should use `text-headline-md`

**Files to audit and standardize:**
- Dashboard sections
- Course detail sections
- List pages

---

#### 33. **Fix Timestamp Styling**
**Rule:** All timestamps should use `text-label-sm` and `text-on-surface-variant`

**Files to fix:**
- `src/app/my-courses/page.tsx` - Line 162: use label-sm
- `src/components/dashboard/sections/DraftCoursesSection.tsx` - Fix color token

---

## PART 4: STRUCTURAL ADDITIONS (Timeline: 1-2 days)

### Phase 4A: New Components

#### 34. **Create/Update Missing Components**
| Component | Status | Impact |
|-----------|--------|--------|
| Icon.tsx | Create | Icons everywhere |
| SectionHeader.tsx | Create | All section headers |
| Modal.tsx | Create | Modal unification |
| FormGroup.tsx | Create | Form consistency |
| RangeSlider.tsx | Create | Filter styling |
| Select.tsx | Create | Dropdown styling |
| Input.tsx | Enhance | Better states |
| Badge.tsx | Enhance | Badge variants |
| EmptyState.tsx | Enhance | Icon support |

---

#### 35. **Update UI Index Exports**
**File:** `src/components/ui/index.ts`

**Add exports for new components:**
```typescript
export { Icon } from './Icon';
export { SectionHeader } from './SectionHeader';
export { Modal } from './Modal';
export { FormGroup } from './FormGroup';
export { RangeSlider } from './RangeSlider';
export { Select } from './Select';
```

---

## IMPLEMENTATION ORDER (Recommended)

### Day 1: Icons & Forms (Highest ROI)
1. Install lucide-react
2. Create Icon wrapper component
3. Create navigation icon mapping
4. Replace all emoji icons (dashboard, sidebar, buttons)
5. Replace empty state icons
6. Enhance Input component
7. Create Select & RangeSlider components
8. Replace custom form HTML

**Commits:**
- `feat: add lucide icon system and replace emojis`
- `feat: enhance form components with consistent styling`

---

### Day 2: Components & Standardization
1. Create SectionHeader component
2. Create FormGroup wrapper
3. Create/enhance Modal
4. Replace all custom section headers
5. Standardize button decorations (remove emojis/arrows)
6. Fix spacing consistency (max-width, section gaps)
7. Standardize empty state usage

**Commits:**
- `feat: add SectionHeader and FormGroup components`
- `refactor: standardize spacing and section headers`

---

### Day 3: Page Improvements
1. Refactor dashboard layout
2. Improve create-course workspace feel
3. Improve course-detail layout
4. Simplify admin-approval responsive logic
5. QA and refinement

**Commits:**
- `refactor: improve dashboard layout and consistency`
- `refactor: enhance page layouts for production feel`

---

## TESTING CHECKLIST (Per Day)

### After Day 1
- [ ] All emojis replaced with icons
- [ ] Form elements styled consistently
- [ ] Range sliders work and look polished
- [ ] No visual regressions in sidebar/buttons

### After Day 2
- [ ] Section headers consistent across all pages
- [ ] Spacing feels rhythmic (not random)
- [ ] Empty states use component correctly
- [ ] No broken layout on mobile/desktop

### After Day 3
- [ ] Dashboard looks like real dashboard
- [ ] Create-course feels like workspace
- [ ] Course detail feels cohesive
- [ ] Admin approval layout is clean
- [ ] All pages follow same design language

---

## FILES TO CHANGE SUMMARY

### New Files to Create (8 files)
1. `src/components/ui/Icon.tsx`
2. `src/components/ui/SectionHeader.tsx`
3. `src/components/ui/Modal.tsx`
4. `src/components/ui/FormGroup.tsx`
5. `src/components/ui/RangeSlider.tsx`
6. `src/components/ui/Select.tsx`
7. `src/lib/utils/navigationIcons.ts`
8. Possibly enhanced Textarea, Checkbox components

### Files to Modify (22+ files)

**Pages (7):**
- `src/app/page.tsx` - Auth hero emojis
- `src/app/dashboard/page.tsx` - Spacing, layout
- `src/app/my-courses/page.tsx` - Remove max-w-6xl, emoji buttons
- `src/app/published-courses/page.tsx` - Remove max-w-6xl, use SectionHeader
- `src/app/course/[id]/page.tsx` - Remove max-w-6xl, improve layout
- `src/app/create-course/page.tsx` - Workspace feel, remove emojis
- `src/app/admin/approval/page.tsx` - Simplify responsive

**Components (15+):**
- `src/components/layout/Sidebar.tsx` - Use icon components
- `src/components/ui/EmptyState.tsx` - Icon support
- `src/components/ui/Badge.tsx` - Type system
- `src/components/ui/Input.tsx` - Enhance variants
- `src/components/ui/index.ts` - Add exports
- `src/components/dashboard/sections/WelcomeSection.tsx` - Remove emojis
- `src/components/dashboard/sections/QuickActionsCard.tsx` - Remove emoji cards
- `src/components/dashboard/sections/DraftCoursesSection.tsx` - Use SectionHeader
- `src/components/dashboard/sections/PublishedCoursesSection.tsx` - Use SectionHeader
- `src/components/dashboard/sections/RecentActivitySection.tsx` - Use SectionHeader
- `src/components/course-detail/LearningObjectives.tsx` - Use SectionHeader
- `src/components/course-detail/ModulesSection.tsx` - Use SectionHeader
- `src/components/published-courses/CourseFilters.tsx` - Style range input
- `src/components/admin-approval/CourseReviewPanel.tsx` - Unify modal
- Plus 3-5 more minor updates

**Utilities:**
- `src/lib/utils/navigation.ts` - Use icon components

---

## ROLLBACK STRATEGY

Each day's changes are separate commits, allowing rollback:
- Day 1: Icon system can be rolled back cleanly (only component adds/emoji replacements)
- Day 2: Component refactors, section header standardization (localized changes)
- Day 3: Page layout improvements (isolated to each page)

No schema changes, no API changes, no breaking changes.

---

## SUCCESS CRITERIA

### Visual
- ✅ No emojis in UI (professional icons only)
- ✅ Consistent spacing throughout app
- ✅ Cards/badges/buttons uniform across pages
- ✅ Pages feel cohesive, not disconnected

### Functional
- ✅ All existing routes work
- ✅ All form submissions work
- ✅ Mobile responsive maintained
- ✅ No performance regressions

### Production-Ready
- ✅ Looks like real SaaS product
- ✅ Removed all prototype-like elements
- ✅ Professional, clean design system
- ✅ Ready for user testing

---

## QUESTIONS FOR APPROVAL

Before starting, please confirm:

1. **Icon Library Choice:** Lucide React vs Heroicons vs Material Design Icons?
   - **Recommendation:** Lucide React (lightweight, clean, 3k+ icons)

2. **Button Text Decoration:** Remove all emoji/arrow decorations?
   - **Recommendation:** Yes, use size/variant for prominence instead

3. **Spacing Strategy:** Use `space-y-lg` for all top-level sections?
   - **Recommendation:** Yes, creates consistent rhythm

4. **Modal Component:** Create unified Modal wrapper or use ConfirmationDialog pattern?
   - **Recommendation:** Create Modal wrapper, ConfirmationDialog is special case

5. **Timeline Acceptable:** 5-7 days for this full refactor?
   - **Recommendation:** Yes, high-impact changes that unlock production-ready state

---

## NEXT STEPS

1. **Review this plan** and answer the 5 questions above
2. **Approve or request changes** to this plan
3. **Upon approval:** I will implement Day 1 in focused chunks
4. **Daily checkpoints:** Show progress, get feedback, adjust if needed
5. **Upon completion:** All pages will feel production-ready

**Ready to proceed?**


# Design System Enhancements - Visual Reference Guide

## 🎨 COLOR & SHADOW SYSTEM

### Current Shadows
```css
box-shadow: 0 4px 12px rgba(0,0,0,0.06);
```

### Recommended 4-Level Shadow System
```css
/* Elevation 1 - Subtle, for hovered elements */
.shadow-elevation-1 {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05),
              0 1px 2px rgba(0,0,0,0.03);
}

/* Elevation 2 - Default, for cards */
.shadow-elevation-2 {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08),
              0 2px 4px rgba(0,0,0,0.05);
}

/* Elevation 3 - Hover, for interacted cards */
.shadow-elevation-3 {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12),
              0 4px 12px rgba(0,0,0,0.08);
}

/* Elevation 4 - Modal, for floating elements */
.shadow-elevation-4 {
  box-shadow: 0 16px 32px rgba(0,0,0,0.15),
              0 8px 24px rgba(0,0,0,0.12);
}
```

### Recommended Border Radius System
```css
.rounded-xs { border-radius: 4px; }   /* Small badges, tiny buttons */
.rounded-sm { border-radius: 8px; }   /* Default: cards, inputs, buttons */
.rounded-md { border-radius: 12px; }  /* Large components, modals */
.rounded-lg { border-radius: 16px; }  /* Hero sections, containers */
.rounded-xl { border-radius: 24px; }  /* Pill-shaped elements */
```

---

## 🔘 BUTTON ENHANCEMENTS

### Current Button States
```tsx
/* Primary button */
bg-primary text-on-primary
hover:bg-primary-container hover:text-on-primary-container
active:scale-95
disabled:opacity-50
```

### Enhanced Button States
```tsx
/* Interactive states */
hover:shadow-elevation-2        /* Lift on hover */
hover:-translate-y-1             /* Visual lift */
active:scale-95 active:shadow-none  /* Press effect */

/* Focus state */
focus-visible:ring-2 ring-primary ring-offset-2

/* Disabled state */
disabled:cursor-not-allowed disabled:opacity-40

/* Smooth transitions */
transition-all duration-200 ease-out

/* Example: Primary Button Hover */
.button-primary:hover {
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 97, 167, 0.15);
}
```

---

## 📝 FORM INPUT ENHANCEMENTS

### Current Input Styling
```tsx
border-outline rounded-lg
focus:ring-2 focus:ring-primary
```

### Enhanced Input States
```tsx
/* Default state */
border-outline-variant bg-surface

/* Focus state */
border-primary ring-2 ring-primary ring-offset-0
shadow-elevation-1

/* Error state */
border-error ring-2 ring-error/20 bg-error-container/5

/* Success state */
border-success ring-2 ring-success/20 bg-success-container/5

/* Disabled state */
opacity-50 cursor-not-allowed bg-surface-container

/* Floating label example */
label.floating {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
}

input:focus ~ label.floating,
input:not(:placeholder-shown) ~ label.floating {
  top: -8px;
  font-size: 11px;
  background: white;
  padding: 0 4px;
}
```

### Form Field Component Structure
```tsx
<FormField>
  <Label htmlFor="email">Email Address *</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    error={errors.email}
    success={isValidated}
  />
  {errors.email && (
    <ErrorMessage>{errors.email}</ErrorMessage>
  )}
  {!errors.email && (
    <HelperText>We'll never share your email</HelperText>
  )}
</FormField>
```

---

## 🎭 COMPONENT HOVER EFFECTS

### Cards
```css
.card {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
}
```

### Buttons
```css
.button {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.button:active {
  transform: scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### Links
```css
.link {
  transition: color 200ms ease-out;
}

.link:hover {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## ⏱️ ANIMATION & TIMING

### Standard Timing Functions
```css
/* Quick feedback (buttons, switches) */
transition-duration: 150ms;
timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Standard transitions (hovers, state changes) */
transition-duration: 200ms;
timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Slower animations (page transitions, modals) */
transition-duration: 300ms;
timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Subtle infinite animations */
animation-duration: 2s;
timing-function: cubic-bezier(0.4, 0, 0.6, 1);
```

### Recommended Keyframes
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(16px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-16px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 🎯 SPACING CONSISTENCY

### Current Spacing System
```
xs = 4px
sm = 8px
md = 16px
lg = 24px
xl = 32px
xxl = 48px
```

### Recommended Usage
```css
/* Component padding */
.card { padding: var(--spacing-lg); }  /* 24px */
.button { padding: var(--spacing-sm) var(--spacing-md); }  /* 8px 16px */

/* Container gaps */
.grid { gap: var(--spacing-lg); }  /* 24px between items */
.flex { gap: var(--spacing-md); }  /* 16px between items */

/* Section spacing */
.section { margin-bottom: var(--spacing-xl); }  /* 32px */

/* Typography spacing */
.headline { margin-bottom: var(--spacing-sm); }  /* 8px */
.body { margin-bottom: var(--spacing-md); }  /* 16px */
```

---

## 🔍 FOCUS VISIBILITY (Accessibility)

### Current Focus Styling
```css
focus-ring: outline-none ring-2 ring-primary ring-offset-2;
```

### Enhanced Focus Styling
```css
/* For light backgrounds */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* For dark backgrounds (buttons, cards) */
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
  box-shadow: 0 0 0 4px var(--color-primary-container);
}

/* For form inputs */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 0;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-container);
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

### Current Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Recommended Mobile-First Approach
```css
/* Mobile first */
.card { padding: var(--spacing-md); }

/* Tablet and up */
@media (min-width: 768px) {
  .card { padding: var(--spacing-lg); }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .card { padding: var(--spacing-xl); }
}
```

---

## 🎨 EMPTY STATE PATTERNS

### Delightful Empty State
```tsx
<Card className="p-3xl text-center space-y-lg">
  {/* Animated icon */}
  <div className="flex justify-center">
    <div className="animate-float text-6xl">📚</div>
  </div>

  {/* Content */}
  <div className="space-y-md">
    <h2 className="text-headline-lg text-on-surface font-bold">
      No courses yet
    </h2>
    <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
      Create your first course to get started
    </p>
  </div>

  {/* CTA */}
  <div className="pt-md">
    <Button variant="primary" size="lg">
      Create Course
    </Button>
  </div>

  {/* Optional: Secondary CTA */}
  <div className="pt-sm">
    <button className="text-primary text-body-md hover:underline">
      Learn more →
    </button>
  </div>
</Card>
```

---

## 🔄 STATE FEEDBACK PATTERNS

### Loading State
```tsx
<Button disabled className="pointer-events-none">
  <Spinner className="w-4 h-4 mr-2 animate-spin" />
  Loading...
</Button>
```

### Success State
```tsx
<div className="flex items-center gap-md p-md bg-success-container/20 border border-success rounded-lg">
  <CheckIcon className="text-success w-5 h-5" />
  <span className="text-success font-medium">Course created successfully!</span>
</div>
```

### Error State
```tsx
<div className="flex items-center gap-md p-md bg-error-container/20 border border-error rounded-lg">
  <ErrorIcon className="text-error w-5 h-5" />
  <span className="text-error font-medium">Something went wrong. Please try again.</span>
</div>
```

---

## 📊 EXAMPLE: Before & After

### Button Before
```html
<button class="bg-primary text-on-primary hover:bg-primary-container active:scale-95">
  Click me
</button>
```

### Button After
```html
<button class="
  bg-primary text-on-primary
  hover:bg-primary-container hover:-translate-y-1 hover:shadow-elevation-3
  active:scale-95 active:shadow-elevation-1
  focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
  disabled:opacity-40 disabled:cursor-not-allowed
  transition-all duration-200 ease-out
">
  Click me
</button>
```

### Card Before
```html
<div class="bg-surface-container rounded-lg p-lg border border-surface-container shadow-sm">
  Content
</div>
```

### Card After
```html
<div class="
  bg-surface-container rounded-lg p-lg border border-surface-container
  shadow-elevation-2 hover:shadow-elevation-3
  hover:-translate-y-1 hover:cursor-pointer
  transition-all duration-200 ease-out
">
  Content
</div>
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Update Button component with all state styles
- [ ] Create FormField component with label, error, helper text
- [ ] Add 4-level shadow system to tailwind config
- [ ] Add new border radius scale to tailwind config
- [ ] Add animation keyframes to globals.css
- [ ] Update all cards to use new shadow system
- [ ] Add focus ring styling globally
- [ ] Create Skeleton loading component
- [ ] Enhance EmptyState with animations
- [ ] Test all states on light & dark backgrounds
- [ ] Verify keyboard navigation on all components
- [ ] Test responsive behavior on mobile/tablet/desktop


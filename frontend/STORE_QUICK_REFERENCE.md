# 🏪 Zustand Stores - Quick Reference

## Import All Stores

```typescript
import { 
  useAuthStore, 
  useCourseStore, 
  useGenerationStore, 
  useUIStore 
} from '@/store'
```

---

## Auth Store

**State:**
- `user: User | null`
- `token: string | null`
- `isAuthenticated: boolean`

**Actions:**
```typescript
const { user, isAuthenticated, setUser, setToken, logout } = useAuthStore()

setUser(userData)                    // Set user object
setToken('jwt_token')                // Set token (saves to localStorage)
logout()                             // Clear user & token
```

**Example:**
```typescript
'use client'
import { useAuthStore } from '@/store'

export function LoginPage() {
  const { setUser, setToken } = useAuthStore()

  const handleLogin = async (email: string, password: string) => {
    const response = await loginAPI(email, password)
    setUser(response.user)
    setToken(response.token)
    // Redirect to dashboard
  }

  return <form onSubmit={handleLogin}>{/* ... */}</form>
}
```

---

## Course Store

**State:**
- `selectedCourse: Course | null` - Currently viewed course
- `draftCourse: DraftCourse | null` - In-progress course being created
- `myCourses: Course[]` - User's courses (drafts, submitted, published)
- `publishedCourses: Course[]` - Published courses from all users
- `filters: CourseFilter` - Current filter settings

**Actions:**
```typescript
const {
  selectedCourse,
  draftCourse,
  myCourses,
  publishedCourses,
  filters,
  setSelectedCourse,
  setDraftCourse,
  setMyCourses,
  setPublishedCourses,
  updateFilters,
  clearCourseState
} = useCourseStore()

// Set individual course
setSelectedCourse(courseObject)

// Set draft being edited
setDraftCourse(draftObject)

// Set entire lists
setMyCourses([...courses])
setPublishedCourses([...courses])

// Update filters (merges with existing)
updateFilters({ difficulty: 'ADVANCED', tags: ['AI'] })

// Reset everything
clearCourseState()
```

**Filter Fields:**
```typescript
{
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  status?: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED' | 'REJECTED'
  visibility?: 'PRIVATE' | 'GLOBAL'
  searchQuery?: string
  tags?: string[]
  sortBy?: 'recent' | 'popular' | 'rating'
}
```

**Example:**
```typescript
'use client'
import { useCourseStore } from '@/store'

export function CourseCatalog() {
  const {
    publishedCourses,
    filters,
    updateFilters,
    setSelectedCourse
  } = useCourseStore()

  const handleDifficultyFilter = (difficulty) => {
    updateFilters({ difficulty })
  }

  const handleCourseClick = (course) => {
    setSelectedCourse(course)
    // Navigate to detail page
  }

  return (
    <div>
      <button onClick={() => handleDifficultyFilter('ADVANCED')}>
        Advanced Only
      </button>

      <div className="grid">
        {publishedCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => handleCourseClick(course)}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## Generation Store

**State:**
- `generationJobId: string | null` - ID of the generation job
- `generationStatus: 'idle' | 'running' | 'completed' | 'failed'`
- `currentStep: string` - What the AI is doing (e.g., "Generating outline")
- `error: string | null` - Error message if generation failed

**Actions:**
```typescript
const {
  generationJobId,
  generationStatus,
  currentStep,
  error,
  setJobId,
  setGenerationStatus,
  setCurrentStep,
  setError,
  resetGeneration
} = useGenerationStore()

setJobId('job-123')                  // Set generation job ID
setGenerationStatus('running')       // Set status
setCurrentStep('Creating modules...')// Set progress message
setError('API failed')               // Set error
resetGeneration()                    // Clear all
```

**Example:**
```typescript
'use client'
import { useGenerationStore } from '@/store'

export function CreateCoursePage() {
  const {
    generationStatus,
    currentStep,
    error,
    setJobId,
    setGenerationStatus,
    setCurrentStep,
    setError,
    resetGeneration
  } = useGenerationStore()

  const handleGenerateCourse = async (draftData) => {
    try {
      setGenerationStatus('running')
      setCurrentStep('Starting AI generation...')

      const response = await generateCourseAPI(draftData)
      setJobId(response.jobId)

      // Poll for progress
      const progressInterval = setInterval(async () => {
        const status = await checkGenerationStatusAPI(response.jobId)

        if (status.step) {
          setCurrentStep(status.step)
        }

        if (status.status === 'completed') {
          clearInterval(progressInterval)
          setGenerationStatus('completed')
        }

        if (status.status === 'failed') {
          clearInterval(progressInterval)
          setGenerationStatus('failed')
          setError(status.error)
        }
      }, 2000)
    } catch (err) {
      setGenerationStatus('failed')
      setError(err.message)
    }
  }

  return (
    <div>
      {generationStatus === 'idle' && (
        <button onClick={() => handleGenerateCourse(draftData)}>
          Generate Course
        </button>
      )}

      {generationStatus === 'running' && (
        <div>
          <p>Generating... {currentStep}</p>
          <Loader />
        </div>
      )}

      {generationStatus === 'completed' && (
        <p className="text-success">Course generated successfully!</p>
      )}

      {generationStatus === 'failed' && (
        <p className="text-error">{error}</p>
      )}
    </div>
  )
}
```

---

## UI Store

**State:**
- `sidebarOpen: boolean` - Is sidebar visible?
- `activeModal: string | null` - Which modal is open? (null if none)

**Actions:**
```typescript
const {
  sidebarOpen,
  activeModal,
  toggleSidebar,
  openModal,
  closeModal
} = useUIStore()

toggleSidebar()              // Toggle sidebar open/closed
openModal('course-preview')  // Open modal with ID
closeModal()                 // Close active modal
```

**Example:**
```typescript
'use client'
import { useUIStore } from '@/store'

export function AppShell({ children }) {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div className="flex">
      <Sidebar open={sidebarOpen} />
      <main className="flex-1">
        <Header onMenuClick={toggleSidebar} />
        {children}
      </main>
    </div>
  )
}

export function CourseCard({ course }) {
  const { activeModal, openModal, closeModal } = useUIStore()

  return (
    <>
      <div className="card" onClick={() => openModal('course-preview')}>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
      </div>

      {activeModal === 'course-preview' && (
        <Modal onClose={closeModal}>
          <CoursePreview course={course} />
        </Modal>
      )}
    </>
  )
}
```

---

## Common Patterns

### Multi-step Form with Draft

```typescript
'use client'
import { useCourseStore } from '@/store'

export function CreateCourseWizard() {
  const { draftCourse, setDraftCourse } = useCourseStore()

  const handleStep1Submit = (formData) => {
    setDraftCourse({
      ...draftCourse,
      ...formData
    })
    // Go to step 2
  }

  return (
    <form onSubmit={handleStep1Submit}>
      <input
        defaultValue={draftCourse?.topic}
        onChange={(e) => {
          setDraftCourse({
            ...draftCourse,
            topic: e.target.value
          })
        }}
      />
      <button type="submit">Next</button>
    </form>
  )
}
```

### Protected Route

```typescript
'use client'
import { useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'

export function ProtectedPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return <div>Protected content</div>
}
```

### Filter & Display

```typescript
'use client'
import { useCourseStore } from '@/store'

export function FilteredCourseCatalog() {
  const {
    publishedCourses,
    filters,
    updateFilters
  } = useCourseStore()

  const filteredCourses = publishedCourses.filter(course => {
    if (filters.difficulty && course.difficulty !== filters.difficulty) {
      return false
    }
    if (filters.searchQuery && !course.title.includes(filters.searchQuery)) {
      return false
    }
    return true
  })

  return (
    <div>
      <input
        placeholder="Search courses..."
        onChange={(e) => updateFilters({ searchQuery: e.target.value })}
      />

      {filteredCourses.map(course => (
        <CourseCard key={course.id} {...course} />
      ))}
    </div>
  )
}
```

---

## localStorage Behavior

**Auth Store:**
- `token` is saved to localStorage on `setToken()`
- `token` is loaded from localStorage on app init
- `token` is cleared on `logout()`

**Other Stores:**
- No localStorage persistence (in-memory only)
- Data is fetched from API on page load

---

## DevTools

Install Zustand DevTools extension for browser to inspect store state in real-time.

---

**Last Updated**: 2026-06-20  
**Status**: ✅ Ready to use in components

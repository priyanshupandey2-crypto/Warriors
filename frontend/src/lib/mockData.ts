import { User } from '@/types/user';
import { Course, DraftCourse } from '@/types/course';

export const mockUser: User = {
  id: 'user-1',
  email: 'alex.chen@example.com',
  name: 'Alex Chen',
  role: 'LEARNER',
  avatarUrl:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  createdAt: new Date('2024-01-15'),
};

export const mockDraftCourses: DraftCourse[] = [
  {
    id: 'draft-1',
    title: 'Advanced AI Concepts',
    topic: 'Artificial Intelligence',
    difficulty: 'ADVANCED',
    targetAudience: 'Tech professionals and AI enthusiasts',
    duration: 12,
    tags: ['AI', 'ML', 'Deep Learning'],
    description: 'Master advanced topics in artificial intelligence and machine learning',
    savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'draft-2',
    title: 'Web Design Fundamentals',
    topic: 'Web Design',
    difficulty: 'BEGINNER',
    targetAudience: 'Aspiring web designers',
    duration: 8,
    tags: ['Design', 'Web', 'UI/UX'],
    description: 'Learn the fundamentals of modern web design',
    savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
];

export const mockPublishedCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Mastering UX Psychology',
    description: 'Understand cognitive patterns that drive user behavior',
    topic: 'UX Design',
    difficulty: 'INTERMEDIATE',
    targetAudience: 'Product designers and developers',
    duration: 18,
    tags: ['UX', 'Psychology', 'Design'],
    status: 'PUBLISHED',
    visibility: 'GLOBAL',
    imageUrl:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    progress: 65,
    rating: 4.8,
    enrolledCount: 2341,
    modules: [
      {
        id: 'mod-1',
        title: 'Cognitive Biases',
        description: 'Understanding human biases in decision making',
        lessons: [
          { id: 'les-1', title: 'Intro to Biases', content: '...', order: 1 },
          {
            id: 'les-2',
            title: 'Confirmation Bias',
            content: '...',
            order: 2,
          },
        ],
        order: 1,
      },
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-06-01'),
    createdBy: 'instructor-1',
  },
  {
    id: 'course-2',
    title: 'Python for Data Science',
    description: 'Learn Python programming for data analysis and visualization',
    topic: 'Data Science',
    difficulty: 'INTERMEDIATE',
    targetAudience: 'Data enthusiasts and analysts',
    duration: 24,
    tags: ['Python', 'Data Science', 'Analytics'],
    status: 'PUBLISHED',
    visibility: 'GLOBAL',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    progress: 32,
    rating: 4.7,
    enrolledCount: 3421,
    modules: [
      {
        id: 'mod-2',
        title: 'Python Basics',
        description: 'Python fundamentals and syntax',
        lessons: [
          {
            id: 'les-3',
            title: 'Variables and Types',
            content: '...',
            order: 1,
          },
          { id: 'les-4', title: 'Functions', content: '...', order: 2 },
        ],
        order: 1,
      },
    ],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-06-01'),
    createdBy: 'instructor-2',
  },
  {
    id: 'course-3',
    title: 'Digital Brand Identity',
    description: 'Build a compelling brand identity in the digital age',
    topic: 'Branding',
    difficulty: 'BEGINNER',
    targetAudience: 'Entrepreneurs and brand professionals',
    duration: 10,
    tags: ['Branding', 'Design', 'Marketing'],
    status: 'PUBLISHED',
    visibility: 'GLOBAL',
    imageUrl:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    progress: 88,
    rating: 4.9,
    enrolledCount: 1876,
    modules: [
      {
        id: 'mod-3',
        title: 'Brand Foundations',
        description: 'Core branding concepts',
        lessons: [
          {
            id: 'les-5',
            title: 'Brand Identity',
            content: '...',
            order: 1,
          },
        ],
        order: 1,
      },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-06-01'),
    createdBy: 'instructor-3',
  },
  {
    id: 'course-4',
    title: 'Quantum Computing Basics',
    description: 'Introduction to quantum computing concepts and applications',
    topic: 'Quantum Computing',
    difficulty: 'ADVANCED',
    targetAudience: 'Physics and CS students',
    duration: 20,
    tags: ['Quantum', 'Physics', 'Computing'],
    status: 'PUBLISHED',
    visibility: 'GLOBAL',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    progress: 0,
    rating: 4.6,
    enrolledCount: 892,
    modules: [
      {
        id: 'mod-4',
        title: 'Quantum Mechanics',
        description: 'Core quantum mechanics',
        lessons: [
          { id: 'les-6', title: 'Qubits', content: '...', order: 1 },
        ],
        order: 1,
      },
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-06-01'),
    createdBy: 'instructor-4',
  },
  {
    id: 'course-5',
    title: 'Modern Architecture Principles',
    description: 'Sustainable design and innovation in architecture',
    topic: 'Architecture',
    difficulty: 'INTERMEDIATE',
    targetAudience: 'Architecture students and professionals',
    duration: 32,
    tags: ['Architecture', 'Design', 'Sustainability'],
    status: 'PUBLISHED',
    visibility: 'GLOBAL',
    imageUrl:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    progress: 15,
    rating: 4.5,
    enrolledCount: 1543,
    modules: [
      {
        id: 'mod-5',
        title: 'Design Principles',
        description: 'Architectural design fundamentals',
        lessons: [
          {
            id: 'les-7',
            title: 'Sustainable Design',
            content: '...',
            order: 1,
          },
        ],
        order: 1,
      },
    ],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-06-01'),
    createdBy: 'instructor-5',
  },
  {
    id: 'course-6',
    title: 'Content Marketing Strategy',
    description: 'Create and execute a winning content marketing strategy',
    topic: 'Marketing',
    difficulty: 'BEGINNER',
    targetAudience: 'Marketers and content creators',
    duration: 12,
    tags: ['Marketing', 'Content', 'Strategy'],
    status: 'PUBLISHED',
    visibility: 'GLOBAL',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    progress: 45,
    rating: 4.8,
    enrolledCount: 2156,
    modules: [
      {
        id: 'mod-6',
        title: 'Strategy Basics',
        description: 'Content marketing fundamentals',
        lessons: [
          {
            id: 'les-8',
            title: 'Content Planning',
            content: '...',
            order: 1,
          },
        ],
        order: 1,
      },
    ],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-06-01'),
    createdBy: 'instructor-1',
  },
];

export const mockSubmittedCourses: Course[] = [
  {
    id: 'submitted-1',
    title: 'Advanced React Patterns',
    description: 'Master advanced patterns and best practices in modern React development',
    topic: 'Web Development',
    difficulty: 'ADVANCED',
    targetAudience: 'Experienced JavaScript developers',
    duration: 16,
    tags: ['React', 'JavaScript', 'Web Development', 'Patterns'],
    status: 'SUBMITTED',
    visibility: 'GLOBAL',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    modules: [
      {
        id: 'mod-submitted-1',
        title: 'Hooks Deep Dive',
        description: 'Understanding React Hooks internals',
        lessons: [
          { id: 'les-1', title: 'useState Under the Hood', content: '...', order: 1 },
          { id: 'les-2', title: 'Custom Hooks Patterns', content: '...', order: 2 },
        ],
        order: 1,
      },
      {
        id: 'mod-submitted-2',
        title: 'Performance Optimization',
        description: 'Optimizing React applications',
        lessons: [
          { id: 'les-3', title: 'Memoization', content: '...', order: 1 },
          { id: 'les-4', title: 'Code Splitting', content: '...', order: 2 },
        ],
        order: 2,
      },
    ],
    quizzes: [
      {
        id: 'quiz-1',
        title: 'Hooks Mastery Quiz',
        questionCount: 10,
        passingScore: 75,
        moduleId: 'mod-submitted-1',
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdBy: 'instructor-2',
  },
  {
    id: 'submitted-2',
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to machine learning concepts and practical applications',
    topic: 'Data Science',
    difficulty: 'INTERMEDIATE',
    targetAudience: 'Data enthusiasts and aspiring ML engineers',
    duration: 24,
    tags: ['Machine Learning', 'Python', 'Data Science', 'AI'],
    status: 'SUBMITTED',
    visibility: 'GLOBAL',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    modules: [
      {
        id: 'mod-submitted-3',
        title: 'ML Basics',
        description: 'Fundamental ML concepts',
        lessons: [
          { id: 'les-5', title: 'Supervised Learning', content: '...', order: 1 },
          { id: 'les-6', title: 'Unsupervised Learning', content: '...', order: 2 },
        ],
        order: 1,
      },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdBy: 'instructor-3',
  },
  {
    id: 'submitted-3',
    title: 'Cloud Architecture with AWS',
    description: 'Design and build scalable cloud applications using AWS services',
    topic: 'Cloud Computing',
    difficulty: 'INTERMEDIATE',
    targetAudience: 'Backend engineers and DevOps professionals',
    duration: 20,
    tags: ['AWS', 'Cloud', 'DevOps', 'Architecture'],
    status: 'SUBMITTED',
    visibility: 'GLOBAL',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    modules: [
      {
        id: 'mod-submitted-4',
        title: 'AWS Core Services',
        description: 'Understanding AWS fundamentals',
        lessons: [
          { id: 'les-7', title: 'EC2 Basics', content: '...', order: 1 },
          { id: 'les-8', title: 'S3 Storage', content: '...', order: 2 },
          { id: 'les-9', title: 'RDS Database', content: '...', order: 3 },
        ],
        order: 1,
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdBy: 'instructor-1',
  },
];

export const mockStats = {
  enrolled: 12,
  completed: 4,
  learningHours: 84.5,
  streak: 7,
};

export const mockRecentActivities = [
  {
    id: 'activity-1',
    type: 'course_completion',
    title: 'Completed: AI Foundations',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: '🎓',
  },
  {
    id: 'activity-2',
    type: 'milestone',
    title: 'Achieved 7-day learning streak',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    icon: '🔥',
  },
  {
    id: 'activity-3',
    type: 'course_start',
    title: 'Started: Mastering UX Psychology',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    icon: '▶️',
  },
];

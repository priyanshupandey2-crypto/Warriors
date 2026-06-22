// Unified demo data for AuraLearn app - Stitch compliant
export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  students: string;
  image: string;
  modules: string[];
  lessons?: Lesson[];
  outline?: string;
  createdDate?: string;
  instructor?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  topics: string[];
}

export const DEMO_COURSES: Array<CourseDetail> = [
  {
    id: '1',
    title: 'AI-Generated: Sustainable Investing Fundamentals',
    description: 'Master the principles of sustainable and ethical investing, learn ESG criteria, and build a diversified portfolio aligned with your values.',
    category: 'Finance',
    level: 'Beginner',
    duration: '6 weeks',
    rating: 4.9,
    students: '2.4k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVIpcZ7P4nEx5jRPrQZ5XCyMKUV_wYAziZrPdU1HetJUI_ySo9SDfy-T7ZWKfottLBdKHGxTKjFm9Qtv5_X4-W-0vwuowBUpdFRaNsX6xpBNSlDmfuJF6y4fppKx5MHHthJVkAOgpYDgmg83lc8PTqNqclb-VkNBig7FGzA7PPUtUhPIUdXsKm2dwImDIFEIQspvqgH-R73j81ouuNcw3yqauzr78bH-BPW0M2hObOnTt8U6brOMJ2-WNAw_dYL52Md-VTNEHuVcrE',
    modules: ['Investment Basics', 'ESG Criteria', 'Portfolio Construction', 'Risk Management', 'Ethical Investing', 'Real-World Applications'],
    createdDate: '2024-06-22',
    instructor: 'AI Course Builder',
    outline: `# Sustainable Investing Fundamentals

## Course Overview
Learn how to invest responsibly while building wealth. This 6-week course covers ESG criteria, portfolio diversification, and ethical investment strategies.

## What You'll Learn
- Fundamentals of investing and market mechanics
- Understanding ESG (Environmental, Social, Governance) factors
- How to evaluate companies for sustainability
- Building a diversified sustainable portfolio
- Risk management and long-term wealth building
- Real-world case studies of successful sustainable investments

## Course Structure
- 6 weeks of structured learning
- 24 video lessons (2-4 minutes each)
- 6 interactive quizzes
- 3 comprehensive projects
- Access to investment tools and resources`,
    lessons: [
      {
        id: 'l1',
        title: 'Introduction to Sustainable Investing',
        duration: '15 mins',
        content: 'Learn the fundamentals of sustainable investing and why it matters in today\'s world.',
        topics: ['Investment Basics', 'Sustainability', 'ESG Overview']
      },
      {
        id: 'l2',
        title: 'Understanding ESG Criteria',
        duration: '20 mins',
        content: 'Deep dive into Environmental, Social, and Governance factors that impact investments.',
        topics: ['ESG Factors', 'Impact Analysis']
      },
      {
        id: 'l3',
        title: 'Building Your First Sustainable Portfolio',
        duration: '25 mins',
        content: 'Step-by-step guide to constructing a diversified sustainable investment portfolio.',
        topics: ['Portfolio Construction', 'Diversification']
      },
      {
        id: 'l4',
        title: 'Risk Management Strategies',
        duration: '18 mins',
        content: 'Learn how to manage investment risk while maintaining ethical standards.',
        topics: ['Risk Management', 'Asset Allocation']
      },
      {
        id: 'l5',
        title: 'Real-World Case Studies',
        duration: '22 mins',
        content: 'Explore real examples of successful sustainable investments and their outcomes.',
        topics: ['Case Studies', 'Practical Applications']
      },
      {
        id: 'l6',
        title: 'Building Long-Term Wealth',
        duration: '19 mins',
        content: 'Strategies for sustainable long-term wealth accumulation and financial security.',
        topics: ['Long-term Planning', 'Wealth Building']
      }
    ]
  },
  {
    id: '2',
    title: 'Mastering UX Psychology',
    description: 'Understand the cognitive patterns that drive user behavior and build more intuitive digital products.',
    category: 'Design',
    level: 'Beginner',
    duration: '18 Hours',
    rating: 5.0,
    students: '3.1k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBom5oENSak0ClDXERNQ1jPy8yOCcJQdfhyOVm_Ld8Zwu6HWQp5bPfMx2YfEF213SSZCA57GrjgoDeZsBOuZlx-gKeildd8UtpVViUBIJfRucF6Ol22nqMhm2B9-QbeqrcrG-YsRd5pBlU14rFV-7zN9oTYttlvLa1D5ogTTDSynwq3lp5nCQcvE037WY7yowRBa1U3miVLpb547Sl3O8EzH2FjKsqCZISar03LtM-H-PDbJrj0gfNLWyHzt2iv6rlcBB4JZlo9xZz2',
    modules: ['Cognitive Biases', 'User Research', 'Interaction Patterns', 'Design Systems', 'Testing'],
  },
  {
    id: '3',
    title: 'Modern Architecture Principles',
    description: 'Analyze sustainable design, material innovation, and the future of urban environments in the 21st century.',
    category: 'Architecture',
    level: 'Intermediate',
    duration: '32 Hours',
    rating: 4.8,
    students: '1.9k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPmQ71wm-AbcrMhCzxpntwD4cdM3QU4Ga5fmgFiPTmQe8FnhKswnXeEEQPZ3b8OQwb9pUbQYqDy-bUf3iaUH5L1gmUqKJUUP_tH8YJOqd0BPVaIx-jI09JTNLuQBj5Prosr_19oiAQYIqabto-6YAcwoAV5ctjHmdgwc4O_I-1-B3BKALBi96M9lAiXB08UpLkwIiDs48QblDlwU5fx1IAz75dc_AljuhV_7ntbh-Der3oxqLT2ohWOENkK_QzJ6sxntDv5fs9ElMV',
    modules: ['Sustainable Design', 'Materials', 'Urban Planning', 'Aesthetics', 'Technology'],
  },
  {
    id: '4',
    title: 'Web Design Fundamentals',
    description: 'Learn responsive web design, CSS, and modern UI/UX principles for building beautiful websites.',
    category: 'Design',
    level: 'Beginner',
    duration: '20 Hours',
    rating: 4.7,
    students: '5.2k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBom5oENSak0ClDXERNQ1jPy8yOCcJQdfhyOVm_Ld8Zwu6HWQp5bPfMx2YfEF213SSZCA57GrjgoDeZsBOuZlx-gKeildd8UtpVViUBIJfRucF6Ol22nqMhm2B9-QbeqrcrG-YsRd5pBlU14rFV-7zN9oTYttlvLa1D5ogTTDSynwq3lp5nCQcvE037WY7yowRBa1U3miVLpb547Sl3O8EzH2FjKsqCZISar03LtM-H-PDbJrj0gfNLWyHzt2iv6rlcBB4JZlo9xZz2',
    modules: ['HTML Basics', 'CSS Layouts', 'Responsive Design', 'JavaScript Interaction', 'Best Practices'],
  },
  {
    id: '5',
    title: 'Advanced Python Programming',
    description: 'Master advanced Python concepts including decorators, generators, async programming, and design patterns.',
    category: 'Science',
    level: 'Advanced',
    duration: '28 Hours',
    rating: 4.6,
    students: '2.8k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVIpcZ7P4nEx5jRPrQZ5XCyMKUV_wYAziZrPdU1HetJUI_ySo9SDfy-T7ZWKfottLBdKHGxTKjFm9Qtv5_X4-W-0vwuowBUpdFRaNsX6xpBNSlDmfuJF6y4fppKx5MHHthJVkAOgpYDgmg83lc8PTqNqclb-VkNBig7FGzA7PPUtUhPIUdXsKm2dwImDIFEIQspvqgH-R73j81ouuNcw3yqauzr78bH-BPW0M2hObOnTt8U6brOMJ2-WNAw_dYL52Md-VTNEHuVcrE',
    modules: ['Decorators', 'Generators', 'Async/Await', 'Design Patterns', 'Performance Optimization'],
  },
  {
    id: '6',
    title: 'Building Mobile Apps with React Native',
    description: 'Create cross-platform mobile applications using React Native and modern development practices.',
    category: 'Science',
    level: 'Intermediate',
    duration: '26 Hours',
    rating: 4.5,
    students: '3.7k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPmQ71wm-AbcrMhCzxpntwD4cdM3QU4Ga5fmgFiPTmQe8FnhKswnXeEEQPZ3b8OQwb9pUbQYqDy-bUf3iaUH5L1gmUqKJUUP_tH8YJOqd0BPVaIx-jI09JTNLuQBj5Prosr_19oiAQYIqabto-6YAcwoAV5ctjHmdgwc4O_I-1-B3BKALBi96M9lAiXB08UpLkwIiDs48QblDlwU5fx1IAz75dc_AljuhV_7ntbh-Der3oxqLT2ohWOENkK_QzJ6sxntDv5fs9ElMV',
    modules: ['React Native Basics', 'Navigation', 'State Management', 'Native Modules', 'Publishing Apps'],
  },
  {
    id: '7',
    title: 'UI/UX Design Principles',
    description: 'Master the principles of user-centered design, wireframing, prototyping, and user research methods.',
    category: 'Design',
    level: 'Intermediate',
    duration: '22 Hours',
    rating: 4.9,
    students: '4.3k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBom5oENSak0ClDXERNQ1jPy8yOCcJQdfhyOVm_Ld8Zwu6HWQp5bPfMx2YfEF213SSZCA57GrjgoDeZsBOuZlx-gKeildd8UtpVViUBIJfRucF6Ol22nqMhm2B9-QbeqrcrG-YsRd5pBlU14rFV-7zN9oTYttlvLa1D5ogTTDSynwq3lp5nCQcvE037WY7yowRBa1U3miVLpb547Sl3O8EzH2FjKsqCZISar03LtM-H-PDbJrj0gfNLWyHzt2iv6rlcBB4JZlo9xZz2',
    modules: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Design Systems'],
  },
  {
    id: '8',
    title: 'Sustainable Building Design',
    description: 'Learn about green building techniques, LEED certification, renewable energy integration, and sustainable materials.',
    category: 'Architecture',
    level: 'Beginner',
    duration: '16 Hours',
    rating: 4.4,
    students: '1.2k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPmQ71wm-AbcrMhCzxpntwD4cdM3QU4Ga5fmgFiPTmQe8FnhKswnXeEEQPZ3b8OQwb9pUbQYqDy-bUf3iaUH5L1gmUqKJUUP_tH8YJOqd0BPVaIx-jI09JTNLuQBj5Prosr_19oiAQYIqabto-6YAcwoAV5ctjHmdgwc4O_I-1-B3BKALBi96M9lAiXB08UpLkwIiDs48QblDlwU5fx1IAz75dc_AljuhV_7ntbh-Der3oxqLT2ohWOENkK_QzJ6sxntDv5fs9ElMV',
    modules: ['Green Building', 'LEED Certification', 'Renewable Energy', 'Materials', 'Case Studies'],
  },
  {
    id: '9',
    title: 'Quantum Mechanics for Engineers',
    description: 'Explore quantum mechanics applications in modern engineering and technology development.',
    category: 'Science',
    level: 'Advanced',
    duration: '30 Hours',
    rating: 4.8,
    students: '1.5k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVIpcZ7P4nEx5jRPrQZ5XCyMKUV_wYAziZrPdU1HetJUI_ySo9SDfy-T7ZWKfottLBdKHGxTKjFm9Qtv5_X4-W-0vwuowBUpdFRaNsX6xpBNSlDmfuJF6y4fppKx5MHHthJVkAOgpYDgmg83lc8PTqNqclb-VkNBig7FGzA7PPUtUhPIUdXsKm2dwImDIFEIQspvqgH-R73j81ouuNcw3yqauzr78bH-BPW0M2hObOnTt8U6brOMJ2-WNAw_dYL52Md-VTNEHuVcrE',
    modules: ['Quantum Basics', 'Wave Functions', 'Schrödinger Equation', 'Applications', 'Advanced Topics'],
  },
];

export const DASHBOARD_STATS = [
  { label: 'Enrolled', value: '12 Courses', icon: 'school', color: 'bg-primary-container/10 text-primary' },
  { label: 'Completed', value: '4 Courses', icon: 'check_circle', color: 'bg-tertiary-container/10 text-tertiary' },
  { label: 'Learning Hours', value: '84.5 hrs', icon: 'schedule', color: 'bg-secondary-container/10 text-secondary' },
  { label: 'Streak', value: '7 Days', icon: 'local_fire_department', color: 'bg-error-container/20 text-error' },
];

export const DASHBOARD_COURSES = [
  {
    id: '1',
    title: 'Mastering UX Psychology',
    module: 'Module 4: Cognitive Biases',
    level: 'Advanced',
    progress: 65,
    lessons: '12/18',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBom5oENSak0ClDXERNQ1jPy8yOCcJQdfhyOVm_Ld8Zwu6HWQp5bPfMx2YfEF213SSZCA57GrjgoDeZsBOuZlx-gKeildd8UtpVViUBIJfRucF6Ol22nqMhm2B9-QbeqrcrG-YsRd5pBlU14rFV-7zN9oTYttlvLa1D5ogTTDSynwq3lp5nCQcvE037WY7yowRBa1U3miVLpb547Sl3O8EzH2FjKsqCZISar03LtM-H-PDbJrj0gfNLWyHzt2iv6rlcBB4JZlo9xZz2',
  },
  {
    id: '2',
    title: 'Python for Data Science',
    module: 'Module 2: Pandas & NumPy',
    level: 'Intermediate',
    progress: 32,
    lessons: '4/12',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWt8pqLg2BPwdQTWwjmwfvoP6pl8GgheIcFs1XrlZ2eeLiEzID0gp4PYgYsc-JNJaVifOCLczlDBqzD-NeLw5Soggxdm15GHkScRpaY-7QFfnp-0YrK7qRLYzuVrBz8SfeRghGEHQ3taf51O03FaSI73Suj8hQF3_TF2fv0oIIjnukZ9-hXVMom0WK2XhZEfZRvTM1w5p8JPvwvOzYpVD6MYLXZsvjFf3pi2Nu-74jZD2sAamMpNXktPFY66oZiR6udorModdh0VCf',
  },
  {
    id: '3',
    title: 'Digital Brand Identity',
    module: 'Module 6: Color Theory',
    level: 'Beginner',
    progress: 88,
    lessons: '15/17',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmEH0pmSlaXgIZ_67QQJBn4OCaEpUiktap3BR2nD5sb8K5vmGrxvN9nFZfsHDwa6QHO6vocUGiV66ZTqHHmTvqx8OKwcKP-Ik6kbhU38I90Om_zLEC0twb3QCF13HJRyiP3vN5k7TUDCGbnDtJRXmTXhhTstSkd_Q8nuvwSVf8yOQlh3NUaVk0rXhTWkFRz3tonevm6sqOC0zytz07CRFLaitEq9BYHiD5sUWEU4fT6FzBCQOapEmZQgOv-A4-dnXgGV--LKO72wBC',
  },
];

export const HOME_PAGE_STATS = [
  { value: '98%', label: 'Completion Rate' },
  { value: '450+', label: 'Expert Instructors' },
  { value: '120', label: 'Countries Reached' },
  { value: '24/7', label: 'Support Access' },
];

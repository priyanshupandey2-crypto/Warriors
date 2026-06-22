// Unified demo data for AuraLearn app - Stitch compliant
export const DEMO_COURSES: Array<{
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
}> = [
  {
    id: '1',
    title: 'Fundamentals of Quantum Computing',
    description: 'Dive deep into qubits, superposition, and entanglement with industry-leading quantum researchers.',
    category: 'Science',
    level: 'Advanced',
    duration: '24 Hours',
    rating: 4.9,
    students: '2.4k',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVIpcZ7P4nEx5jRPrQZ5XCyMKUV_wYAziZrPdU1HetJUI_ySo9SDfy-T7ZWKfottLBdKHGxTKjFm9Qtv5_X4-W-0vwuowBUpdFRaNsX6xpBNSlDmfuJF6y4fppKx5MHHthJVkAOgpYDgmg83lc8PTqNqclb-VkNBig7FGzA7PPUtUhPIUdXsKm2dwImDIFEIQspvqgH-R73j81ouuNcw3yqauzr78bH-BPW0M2hObOnTt8U6brOMJ2-WNAw_dYL52Md-VTNEHuVcrE',
    modules: ['Quantum Basics', 'Superposition', 'Entanglement', 'Quantum Gates', 'Algorithms'],
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

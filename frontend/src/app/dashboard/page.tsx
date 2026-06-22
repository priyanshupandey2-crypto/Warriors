'use client';

import Link from 'next/link';
import { Book, CheckCircle, Clock, Flame, Search, Bell, LogOut } from 'lucide-react';
import { DASHBOARD_STATS, DASHBOARD_COURSES } from '@/lib/demo-data';

export default function Dashboard() {
  const weeklyActivity = [
    { day: 'Mon', height: 40, minutes: '45m' },
    { day: 'Tue', height: 65, minutes: '72m' },
    { day: 'Wed', height: 90, minutes: '110m' },
    { day: 'Thu', height: 30, minutes: '32m' },
    { day: 'Fri', height: 50, minutes: '55m' },
    { day: 'Sat', height: 20, minutes: '18m' },
    { day: 'Sun', height: 10, minutes: '5m' },
  ];

  const StatIcon = ({ icon }: { icon: string }) => {
    switch (icon) {
      case 'school':
        return <Book className="w-[32px] h-[32px]" />;
      case 'check_circle':
        return <CheckCircle className="w-[32px] h-[32px]" />;
      case 'schedule':
        return <Clock className="w-[32px] h-[32px]" />;
      case 'local_fire_department':
        return <Flame className="w-[32px] h-[32px]" />;
      default:
        return null;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Advanced':
        return 'bg-primary-container/10 text-primary';
      case 'Intermediate':
        return 'bg-secondary-container/10 text-secondary';
      case 'Beginner':
        return 'bg-tertiary-container/10 text-tertiary';
      default:
        return '';
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'Advanced':
        return 'bg-primary';
      case 'Intermediate':
        return 'bg-secondary';
      case 'Beginner':
        return 'bg-tertiary';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-container-lowest shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
        <div className="flex justify-between items-center w-full px-lg max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-xl">
            <span className="font-headline-md font-headline-md text-primary tracking-tight">AuraLearn</span>
            <nav className="hidden md:flex gap-md font-body-md text-body-md">
              <a className="text-primary border-b-2 border-primary pb-1" href="#">
                My Learning
              </a>
              <Link href="/courses" className="text-on-surface-variant hover:text-primary transition-colors">
                Courses
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden lg:flex items-center bg-surface-container-low rounded-full px-md py-xs gap-xs">
              <Search className="w-4 h-4 text-outline" />
              <input className="bg-transparent border-none focus:ring-0 font-label-md outline-none w-32" placeholder="Search courses..." />
            </div>
            <div className="flex items-center gap-sm">
              <button className="p-sm hover:bg-surface-container-low rounded-full transition-all active:scale-95">
                <Bell className="w-5 h-5 text-on-surface-variant" />
              </button>
              <button className="p-sm hover:bg-surface-container-low rounded-full transition-all active:scale-95">
                <LogOut className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant bg-primary-container flex-shrink-0">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv4JWSRZ_AtODoXA-QcsKaVVGpSYJcxAnmo8I8TZfzf1kt0q2yio15rITqU9j-1seO_IS676UT-u9nPaUY3DTPCr7badcxl6MhvfulwFUzKY8Qm5c_0XeLXeCiKYHQbXBsbddfXARLGFW9MkQ_f1pWwtAUkwSRv7Mn1kBf5EYZlEiLNcnIQgtbzyCiBPFusXb8Ot-nlm-6kV-3KcqhPOAps1I9lg_3XvgDdVrIjoXRJhlr9R8c4_DoV1WCGW1gucuFfrB0r0ILvnvM" alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-xxl px-lg max-w-container-max mx-auto">
        {/* Greeting Section */}
        <section className="mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-on-background">Hello, Alex</h1>
          <p className="font-body-md text-on-surface-variant mt-xs">You are making great progress! Your next lesson is ready.</p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
          {DASHBOARD_STATS.map((stat, i) => (
            <div key={i} className="bg-surface-container-lowest p-lg rounded-xl shadow-sm flex items-center gap-md border border-surface-container">
              <div className={`${stat.color} p-md rounded-lg`}>
                <StatIcon icon={stat.icon} />
              </div>
              <div>
                <p className="font-label-sm text-outline uppercase tracking-wider">{stat.label}</p>
                <p className="font-headline-md font-bold text-on-surface">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-xl">
            {/* Weekly Activity */}
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-container">
              <div className="flex justify-between items-center mb-xl">
                <h2 className="font-headline-md text-headline-md text-on-surface">Weekly Activity</h2>
                <select className="font-label-md border border-outline-variant rounded-lg bg-surface focus:ring-primary focus:border-primary px-md py-sm">
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="h-64 flex items-end justify-between gap-sm px-md">
                {weeklyActivity.map(({ day, height, minutes }, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-sm group">
                    <div
                      className={`w-full rounded-t-lg transition-all relative ${height === 90 ? 'bg-primary' : 'bg-primary-container/20 group-hover:bg-primary-container'}`}
                      style={{ height: `${height}%` }}
                    >
                      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-on-background text-white text-xs py-1 px-2 rounded transition-opacity ${height === 90 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {minutes}
                      </div>
                    </div>
                    <span className={`font-label-sm ${height === 90 ? 'font-bold text-primary' : 'text-outline'}`}>{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Consistency */}
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-container">
              <div className="flex justify-between items-center mb-md">
                <h2 className="font-headline-md text-headline-md text-on-surface">Monthly Consistency</h2>
                <div className="flex items-center gap-xs">
                  <span className="font-label-sm text-outline">Less</span>
                  <div className="flex gap-[2px]">
                    <div className="w-3 h-3 bg-surface-container rounded-sm"></div>
                    <div className="w-3 h-3 bg-primary-container/30 rounded-sm"></div>
                    <div className="w-3 h-3 bg-primary-container/60 rounded-sm"></div>
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                  </div>
                  <span className="font-label-sm text-outline">More</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-xs">
                {Array.from({ length: 28 }).map((_, i) => {
                  const colors = ['bg-surface-container', 'bg-primary-container/30', 'bg-primary-container/60', 'bg-primary'];
                  return (
                    <div key={i} className={`${colors[i % 4]} w-4 h-4 rounded-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer`}></div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-xl">
            {/* Weekly Goal */}
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-container text-center">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-xl">Weekly Goal</h2>
              <div className="relative w-48 h-48 mx-auto mb-md">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="transparent" r="45" stroke="#e5eeff" strokeWidth="8"></circle>
                  <circle cx="50" cy="50" fill="transparent" r="45" stroke="#0061a7" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset="56.5"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display-lg font-display-lg text-primary leading-none">12</span>
                  <span className="font-label-md text-outline">/ 15 hours</span>
                </div>
              </div>
              <p className="font-body-md text-on-surface-variant">80% of your target reached! Just 3 more hours to go.</p>
              <button className="mt-xl w-full bg-primary text-on-primary py-md rounded-lg font-label-md hover:shadow-lg transition-all active:scale-95">
                Boost Your Momentum
              </button>
            </div>

            {/* Upcoming Milestones */}
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-container">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Upcoming Milestones</h2>
              <div className="space-y-md">
                <div className="flex gap-md p-md hover:bg-surface-container-low rounded-lg transition-colors border-l-4 border-secondary">
                  <div className="flex-shrink-0 p-sm rounded bg-secondary/10 text-secondary">
                    <span className="material-symbols-outlined text-[18px]"></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-label-md font-bold text-on-surface truncate">UX Design Sprint</p>
                    <p className="font-label-sm text-outline">Due in 2 days</p>
                  </div>
                </div>
                <div className="flex gap-md p-md hover:bg-surface-container-low rounded-lg transition-colors border-l-4 border-tertiary">
                  <div className="flex-shrink-0 p-sm rounded bg-tertiary/10 text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">quiz</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-label-md font-bold text-on-surface truncate">Python Basics Final</p>
                    <p className="font-label-sm text-outline">Due tomorrow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <section className="mt-xxl">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-background">Enrolled Courses</h2>
              <p className="font-body-md text-on-surface-variant">Continue where you left off</p>
            </div>
            <Link href="/courses" className="font-label-md text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {DASHBOARD_COURSES.map((course) => (
              <div key={course.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform" src={course.image} alt={course.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-md">
                    <button className="bg-white text-on-background px-md py-sm rounded-full font-label-md font-bold flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span> Resume
                    </button>
                  </div>
                </div>
                <div className="p-lg">
                  <div className="flex justify-between items-start mb-sm">
                    <h3 className="font-body-lg font-bold text-on-surface">{course.title}</h3>
                    <span className={`${getLevelColor(course.level)} px-sm py-xs rounded text-[10px] font-bold uppercase`}>
                      {course.level}
                    </span>
                  </div>
                  <p className="font-label-md text-on-surface-variant mb-md">{course.module}</p>
                  <div className="w-full bg-surface-container h-2 rounded-full mb-xs overflow-hidden">
                    <div className={`${getProgressColor(course.level)} h-full rounded-full`} style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <div className="flex justify-between font-label-sm text-outline">
                    <span>{course.progress}% Complete</span>
                    <span>{course.lessons} Lessons</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Completed */}
        <section className="mt-xxl">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-lg">Recently Completed</h2>
          <div className="flex gap-md overflow-x-auto pb-md">
            {[{ title: 'AI Foundations' }, { title: 'Modern Typography' }, { title: 'Public Speaking 101' }].map((course, i) => (
              <div key={i} className="flex-shrink-0 w-80 bg-surface-container-low p-md rounded-xl border border-surface-container flex items-center gap-md">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary border border-outline-variant flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-label-md font-bold text-on-surface truncate">{course.title}</p>
                  <span className="text-[10px] text-primary font-bold bg-primary-container/10 px-sm py-[2px] rounded inline-block mt-1">
                    CERTIFIED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low py-xl mt-xxl border-t border-surface-container">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-lg max-w-container-max mx-auto gap-md">
          <div className="flex flex-col gap-xs">
            <span className="font-body-lg font-headline-md text-on-surface">AuraLearn AI</span>
            <p className="font-label-md text-on-surface-variant">© 2024 AuraLearn AI. All rights reserved.</p>
          </div>
          <div className="flex gap-lg font-label-md text-label-md">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              Help Center
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

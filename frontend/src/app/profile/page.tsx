'use client';

export default function ProfilePage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface-container-lowest shadow-sm sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-lg md:px-xl py-md max-w-container-max mx-auto">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary font-headline-md" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            <span className="text-headline-md font-headline-md font-bold text-primary">AuraLearn</span>
          </div>
          <div className="hidden md:flex items-center gap-xl">
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="/dashboard">My Learning</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="/courses">Courses</a>
          </div>
          <div className="flex items-center gap-md">
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors px-md py-sm" href="/settings">Settings</a>
            <button className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors px-md py-sm">Sign Out</button>
          </div>
        </nav>
      </header>

      <main className="flex-grow py-xxl px-md">
        <div className="max-w-container-max mx-auto">
          {/* Profile Header */}
          <div className="mb-xxl">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-xl mb-xl">
              <div className="w-24 h-24 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-6xl">person</span>
              </div>
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-background">Alex Chen</h1>
                <p className="font-body-md text-on-surface-variant">UX Designer & Tech Enthusiast</p>
              </div>
              <button className="bg-primary text-on-primary px-lg py-md rounded-lg font-label-md hover:opacity-90 transition-all ml-auto">Edit Profile</button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xxl">
            {[
              { label: 'Enrolled Courses', value: '12', icon: 'school' },
              { label: 'Completed', value: '4', icon: 'check_circle' },
              { label: 'Learning Hours', value: '84.5', icon: 'schedule' },
              { label: 'Streak', value: '7 Days', icon: 'local_fire_department' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-surface-container">
                <div className="flex items-center gap-md mb-sm">
                  <span className="material-symbols-outlined text-primary">{stat.icon}</span>
                  <span className="font-label-sm text-outline uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="font-headline-md text-on-surface">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Bio & About */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl mb-xxl">
            <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-xl shadow-sm border border-surface-container">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-md">About</h2>
              <p className="font-body-md text-on-surface-variant mb-lg">
                Passionate learner and UX designer with a keen interest in creating intuitive digital experiences. Currently exploring AI-powered learning and its applications in education.
              </p>
              <div className="space-y-md">
                <div>
                  <p className="font-label-md text-on-surface font-bold mb-sm">Interests</p>
                  <div className="flex flex-wrap gap-sm">
                    {['UX Design', 'AI & ML', 'Product Management', 'Web Development'].map((interest, idx) => (
                      <span key={idx} className="bg-primary-container/20 text-primary px-md py-sm rounded-full text-label-sm font-bold">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-xl shadow-sm border border-surface-container">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Recent Achievements</h3>
              <div className="space-y-md">
                {[
                  { title: 'UX Mastery', desc: 'Completed UX Psychology course' },
                  { title: 'Quick Learner', desc: 'Completed 4 courses in 3 months' },
                  { title: 'Consistent', desc: '7-day learning streak' },
                ].map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-sm p-sm border border-outline-variant rounded-lg">
                    <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span>
                    <div>
                      <p className="font-label-md text-on-surface font-bold">{achievement.title}</p>
                      <p className="font-label-sm text-on-surface-variant">{achievement.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Learning Path */}
          <div className="bg-surface-container-lowest rounded-xl p-xl shadow-sm border border-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-xl">Current Learning Path</h2>
            <div className="space-y-md">
              {[
                { title: 'Mastering UX Psychology', progress: 65 },
                { title: 'Python for Data Science', progress: 32 },
                { title: 'Digital Brand Identity', progress: 88 },
              ].map((course, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-sm">
                    <p className="font-label-md text-on-surface font-bold">{course.title}</p>
                    <p className="font-label-md text-on-surface-variant">{course.progress}%</p>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all" style={{width: `${course.progress}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low py-xl border-t border-surface-container mt-xxl">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-lg md:px-xl max-w-container-max mx-auto gap-md">
          <p className="font-label-md text-label-md text-on-surface-variant">© 2024 AuraLearn. All rights reserved.</p>
          <div className="flex gap-lg font-label-md text-label-md">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

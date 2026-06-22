'use client';

import Link from 'next/link';
import { ArrowLeft, Play, Clock, Users, Star, Sparkles, CheckCircle } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import { DEMO_COURSES } from '@/lib/demo-data';

interface PageProps {
  params: { id: string };
}

export default function CourseDetailPage({ params }: PageProps) {
  const course = DEMO_COURSES.find((c) => c.id === params.id) || DEMO_COURSES[0];

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Back Button */}
        <div className="pt-lg px-md md:px-lg max-w-container-max mx-auto w-full">
          <Link href="/courses" className="inline-flex items-center gap-sm font-body-md text-primary hover:text-primary-container transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-xxl px-md md:px-lg">
          <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center gap-xl relative z-10">
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left">
              <span className="bg-primary-container/20 text-primary font-label-sm px-md py-sm rounded-full mb-md inline-block">
                AI-Tailored Learning
              </span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-md">
                {course.title}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-2xl">{course.description}</p>

              {/* Meta Info */}
              <div className="flex flex-col sm:flex-row gap-md sm:gap-lg mb-xl">
                <div className="flex items-center gap-sm">
                  <Clock className="w-5 h-5 text-on-surface-variant" />
                  <span className="font-body-md text-on-surface-variant">{course.duration}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <Users className="w-5 h-5 text-on-surface-variant" />
                  <span className="font-body-md text-on-surface-variant">{course.students} students</span>
                </div>
                <div className="flex items-center gap-sm">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-body-md font-bold text-on-surface">{course.rating}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-md justify-center md:justify-start">
                <Link href="/dashboard" className="bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg shadow-lg hover:shadow-lg hover:opacity-95 active:scale-95 transition-all text-center">
                  Enroll in Course
                </Link>
                <Link href="/create" className="flex items-center justify-center gap-sm border-2 border-outline text-on-surface font-label-md text-label-md px-xl py-md rounded-lg hover:bg-surface-container transition-all">
                  <Play className="w-4 h-4" />
                  Tailor Course
                </Link>
              </div>
            </div>

            {/* Right: Image */}
            <div className="flex-1 w-full max-w-md">
              <div className="aspect-video rounded-xl shadow-2xl overflow-hidden">
                <img className="w-full h-full object-cover" src={course.image} alt={course.title} />
              </div>
            </div>
          </div>
        </section>

        {/* Course Success Banner */}
        <section className="bg-surface-container-low py-xl px-md md:px-lg">
          <div className="max-w-container-max mx-auto">
            <div className="bg-surface-container-lowest rounded-xl p-lg md:p-xl shadow-sm border border-primary/10 text-center flex flex-col items-center gap-md">
              <div className="w-16 h-16 bg-tertiary-container/20 rounded-full flex items-center justify-center text-tertiary">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-primary mb-sm">Course Tailored Successfully</h2>
                <p className="font-body-md text-on-surface-variant max-w-2xl">
                  Our AI engine has analyzed learning goals to build a roadmap perfectly aligned with your career trajectory.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum Section */}
        <section className="py-xxl px-md md:px-lg bg-surface">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Course Curriculum</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              {/* Modules List */}
              <div className="lg:col-span-2 space-y-md">
                {course.modules?.map((module, idx) => (
                  <div key={idx} className="bg-surface-container-lowest border border-surface-container-high rounded-lg p-lg hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-md">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-label-md">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">{module}</h3>
                        <p className="font-body-md text-on-surface-variant">Learn key concepts and hands-on applications</p>
                      </div>
                      <Play className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Course Info Sidebar */}
              <div className="space-y-lg">
                <div className="bg-surface-container-lowest border border-surface-container-high rounded-lg p-lg">
                  <h3 className="font-headline-sm text-on-surface mb-md">Course Details</h3>
                  <div className="space-y-md text-body-md">
                    <div>
                      <p className="text-on-surface-variant font-label-sm mb-xs">Level</p>
                      <p className="font-bold text-on-surface">{course.level}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-label-sm mb-xs">Duration</p>
                      <p className="font-bold text-on-surface">{course.duration}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-label-sm mb-xs">Category</p>
                      <p className="font-bold text-on-surface">{course.category}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-label-sm mb-xs">Students</p>
                      <p className="font-bold text-on-surface">{course.students}</p>
                    </div>
                    {course.instructor && (
                      <div>
                        <p className="text-on-surface-variant font-label-sm mb-xs">Instructor</p>
                        <p className="font-bold text-on-surface">{course.instructor}</p>
                      </div>
                    )}
                    {course.createdDate && (
                      <div>
                        <p className="text-on-surface-variant font-label-sm mb-xs">Created</p>
                        <p className="font-bold text-on-surface">{new Date(course.createdDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructor Card */}
                <div className="bg-surface-container-lowest border border-surface-container-high rounded-lg p-lg">
                  <h3 className="font-headline-sm text-on-surface mb-md">Your Instructor</h3>
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-[24px]">person</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md font-bold text-on-surface">Industry Expert</p>
                      <p className="font-label-sm text-on-surface-variant">Verified instructor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Outline Section */}
        {course.outline && (
          <section className="py-xxl px-md md:px-lg bg-surface-container-low">
            <div className="max-w-container-max mx-auto">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Course Overview</h2>
              <div className="bg-surface-container-lowest rounded-xl p-lg md:p-xl border border-outline-variant/20">
                <div className="prose prose-invert max-w-none text-on-surface">
                  {course.outline.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-2xl font-bold mb-md">{line.replace('# ', '')}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-xl font-bold mb-md mt-lg">{line.replace('## ', '')}</h2>;
                    } else if (line.startsWith('- ')) {
                      return <li key={idx} className="ml-md mb-sm text-on-surface-variant">{line.replace('- ', '')}</li>;
                    } else if (line.trim()) {
                      return <p key={idx} className="text-body-md text-on-surface-variant mb-md">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Lessons Section */}
        {course.lessons && course.lessons.length > 0 && (
          <section className="py-xxl px-md md:px-lg bg-surface">
            <div className="max-w-container-max mx-auto">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Course Lessons</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                <div className="lg:col-span-2 space-y-md">
                  {course.lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="bg-surface-container-lowest border border-surface-container-high rounded-lg p-lg hover:border-primary/30 transition-colors cursor-pointer group">
                      <div className="flex items-start gap-md">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 font-bold text-label-md">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">{lesson.title}</h3>
                          <p className="font-body-md text-on-surface-variant mb-md">{lesson.content}</p>
                          <div className="flex flex-wrap gap-xs">
                            {lesson.topics.map((topic, i) => (
                              <span key={i} className="text-label-sm bg-tertiary-container/20 text-tertiary px-sm py-xs rounded">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-sm flex-shrink-0">
                          <Clock className="w-4 h-4 text-on-surface-variant" />
                          <span className="font-label-sm text-on-surface-variant">{lesson.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lessons Sidebar */}
                <div className="bg-surface-container-lowest border border-surface-container-high rounded-lg p-lg">
                  <h3 className="font-headline-sm text-on-surface mb-md">Lessons Summary</h3>
                  <div className="space-y-md">
                    <div>
                      <p className="text-on-surface-variant font-label-sm mb-xs">Total Lessons</p>
                      <p className="font-bold text-2xl text-on-surface">{course.lessons.length}</p>
                    </div>
                    <div className="border-t border-outline-variant/20 pt-md">
                      <p className="text-on-surface-variant font-label-sm mb-xs">Total Duration</p>
                      <p className="font-bold text-on-surface">
                        {Math.round(course.lessons.reduce((sum, l) => sum + parseInt(l.duration.split(' ')[0]), 0) / 60)} hours
                      </p>
                    </div>
                    <div className="border-t border-outline-variant/20 pt-md">
                      <p className="text-on-surface-variant font-label-sm mb-xs">Topics Covered</p>
                      <p className="font-bold text-on-surface">
                        {new Set(course.lessons.flatMap(l => l.topics)).size} topics
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant py-lg px-md md:px-lg mt-auto">
        <div className="max-w-container-max mx-auto text-center font-label-md text-on-surface-variant">
          © 2024 AuraLearn
        </div>
      </footer>
    </div>
  );
}

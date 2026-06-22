'use client';

import { useState } from 'react';

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');

  const faqs = [
    {
      id: 'faq-1',
      question: 'How does AuraLearn create personalized courses?',
      answer: 'AuraLearn uses advanced AI technology to analyze your learning goals, current expertise level, and preferences. Based on this analysis, our AI architect generates customized course content, structure, and resources tailored specifically to your needs.'
    },
    {
      id: 'faq-2',
      question: 'Can I modify a generated course after creation?',
      answer: 'Yes! Once your course is created, you can edit the syllabus, add or remove lessons, adjust the difficulty level, and customize the pacing to better suit your learning style.'
    },
    {
      id: 'faq-3',
      question: 'How long does it take to complete a course?',
      answer: 'Course duration varies based on your pace and the course complexity. Most courses range from 2-12 weeks, but you can learn at your own speed with no strict deadlines.'
    },
    {
      id: 'faq-4',
      question: 'Do I get certificates upon course completion?',
      answer: 'Yes! Upon completing a course, you receive an official AuraLearn certificate that you can share with your network and add to your professional profile.'
    },
    {
      id: 'faq-5',
      question: 'Is there a free tier or trial available?',
      answer: 'AuraLearn offers a 14-day free trial with full access to all features. After the trial, you can choose from our flexible pricing plans based on your needs.'
    },
    {
      id: 'faq-6',
      question: 'How do I track my learning progress?',
      answer: 'Your personalized dashboard displays comprehensive metrics including completion percentage, learning hours, achievement badges, and your learning streak.'
    },
  ];

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
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="/">Home</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="/courses">Courses</a>
          </div>
          <div className="flex items-center gap-md">
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors px-md py-sm" href="/auth/login">Sign In</a>
            <a className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all" href="/auth/signup">Get Started</a>
          </div>
        </nav>
      </header>

      <main className="flex-grow py-xxl px-md">
        <div className="max-w-container-max mx-auto">
          {/* Page Header */}
          <div className="text-center mb-xxl">
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-sm">Help & Support</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              Find answers to common questions and learn how to get the most out of AuraLearn
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xxl">
            {[
              { icon: 'lightbulb', title: 'Getting Started', desc: 'Learn the basics' },
              { icon: 'school', title: 'Courses', desc: 'Course management' },
              { icon: 'person', title: 'Account', desc: 'Account settings' },
              { icon: 'bug_report', title: 'Report Issue', desc: 'Report a problem' },
            ].map((link, idx) => (
              <div key={idx} className="bg-surface-container-lowest rounded-xl p-lg shadow-sm border border-surface-container hover:border-primary transition-all cursor-pointer">
                <span className="material-symbols-outlined text-primary text-2xl block mb-md">{link.icon}</span>
                <h3 className="font-label-md text-on-surface font-bold">{link.title}</h3>
                <p className="font-label-sm text-on-surface-variant">{link.desc}</p>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="bg-primary rounded-xxl p-xl md:p-xxl mb-xxl flex flex-col md:flex-row items-center justify-between gap-xl relative overflow-hidden">
            <div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-primary mb-md">Need Direct Support?</h2>
              <p className="font-body-lg text-body-lg text-primary-fixed max-w-lg">Our support team is available 24/7 to help you with any questions or issues</p>
            </div>
            <button className="bg-on-primary text-primary px-xl py-md rounded-xl font-headline-md hover:bg-primary-fixed transition-colors shadow-lg active:scale-95 flex-shrink-0">
              Contact Support
            </button>
          </div>

          {/* FAQ Section */}
          <div className="bg-surface-container-lowest rounded-xl p-xl shadow-sm border border-surface-container">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Frequently Asked Questions</h2>
            <div className="space-y-md">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-outline-variant rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-lg bg-surface-container-low hover:bg-surface-container transition-all"
                  >
                    <h3 className="font-label-md text-on-surface font-bold text-left">{faq.question}</h3>
                    <span
                      className="material-symbols-outlined transition-transform duration-300 flex-shrink-0"
                      style={{transform: expandedFaq === faq.id ? 'rotate(180deg)' : 'rotate(0deg)'}}
                    >
                      expand_more
                    </span>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="p-lg border-t border-outline-variant bg-surface">
                      <p className="font-body-md text-on-surface-variant">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Still Need Help */}
          <div className="mt-xxl text-center">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Still need help?</h3>
            <p className="font-body-md text-on-surface-variant mb-lg">
              Can't find what you're looking for? <a className="text-primary font-bold hover:underline" href="#">Email us</a> or check out our <a className="text-primary font-bold hover:underline" href="#">documentation</a>
            </p>
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

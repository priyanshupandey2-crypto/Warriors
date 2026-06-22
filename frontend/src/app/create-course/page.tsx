'use client';

import { useState } from 'react';

export default function CreateCoursePage() {
  const [inputValue, setInputValue] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const prompts = [
    { icon: 'science', text: 'Build a 4-week course on Sustainable Investing' },
    { icon: 'history_edu', text: 'Create a beginner\'s guide to Greek Mythology' },
    { icon: 'terminal', text: 'Design an advanced Rust programming syllabus' },
  ];

  const handleSend = () => {
    if (inputValue.trim()) {
      setHasStarted(true);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    setHasStarted(true);
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-hidden">
      {/* TopNavBar */}
      <nav className="bg-surface-container-lowest sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center w-full px-lg md:px-xl py-md max-w-container-max mx-auto">
          <div className="flex items-center gap-md">
            <span className="font-headline-md text-headline-md font-bold text-primary">AuraLearn</span>
          </div>
          <div className="hidden md:flex items-center gap-xl">
            <a className="font-body-md text-body-md text-primary border-b-2 border-primary font-bold pb-1 hover:text-primary transition-colors duration-200" href="/courses">Browse Courses</a>
            <div className="relative group">
              <button className="flex items-center gap-xs font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200">
                Create <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-200 px-md py-sm">Sign In</button>
            <button className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Ambient Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full"></div>
      </div>

      <main className="flex-grow relative flex flex-col items-center overflow-hidden">
        {/* Chat Workspace */}
        <div className="w-full max-w-4xl px-margin-mobile md:px-lg flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)]">
          {/* Welcome Section */}
          {!hasStarted && (
            <div className="flex flex-col items-center justify-center pt-xxl pb-xl text-center flex-grow transition-opacity duration-500">
              <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-md shadow-sm">
                <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
              </div>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-sm aura-gradient-text">
                Hello! Ready to build your custom course?
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Our AI architect uses Gemini technology to structure your learning path. Describe what you want to learn, and we'll handle the syllabus, resources, and schedule.
              </p>
            </div>
          )}

          {/* Messages Area */}
          {hasStarted && (
            <div className="flex-col gap-lg overflow-y-auto chat-container-scroll py-lg flex-grow flex">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-surface-container-high text-on-surface p-md rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                  <p className="text-body-md">{inputValue}</p>
                </div>
              </div>

              {/* AI Message */}
              <div className="flex justify-start gap-md">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                </div>
                <div className="bg-surface-container-lowest text-on-surface p-md rounded-2xl rounded-tl-none max-w-[80%] shadow-sm border border-outline-variant/30">
                  <p className="text-body-md">Excellent choice! To tailor this course for you, I'd like to know more. How many weeks would you prefer, and who's your target audience?</p>
                </div>
              </div>
            </div>
          )}

          {/* Interaction Area */}
          <div className="w-full pb-xl mt-auto">
            {/* Prompt Chips - Only show when not started */}
            {!hasStarted && (
              <div className="flex flex-wrap justify-center gap-sm mb-lg">
                {prompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt.text)}
                    className="px-md py-sm bg-surface-container-lowest border border-outline-variant hover:border-primary hover:bg-surface-container-low text-label-md font-label-md rounded-full text-on-surface-variant transition-all duration-200 shadow-sm flex items-center gap-xs"
                  >
                    <span className="material-symbols-outlined text-sm">{prompt.icon}</span>
                    {prompt.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input Field with Gradient Border */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative glass-panel rounded-2xl border border-outline-variant/50 shadow-xl overflow-hidden">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="w-full bg-transparent border-none focus:ring-0 text-body-md py-lg px-xl pr-32 resize-none max-h-48 overflow-y-auto outline-none"
                  placeholder="Describe your learning goals..."
                  rows={1}
                />
                <div className="absolute bottom-md right-md flex items-center gap-sm">
                  <button className="p-sm text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
                    <span className="material-symbols-outlined">attach_file</span>
                  </button>
                  <button className="p-sm text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
                    <span className="material-symbols-outlined">mic</span>
                  </button>
                  <button
                    onClick={handleSend}
                    className="bg-primary text-on-primary p-sm rounded-xl shadow-lg hover:bg-opacity-90 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-md text-center">
              <p className="text-label-sm font-label-sm text-on-surface-variant opacity-60">AuraLearn AI can make mistakes. Verify important information.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low mt-auto">
        <div className="w-full px-lg md:px-xl py-xxl flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto gap-lg">
          <div className="flex flex-col items-center md:items-start gap-sm">
            <span className="font-headline-md text-headline-md font-bold text-primary">AuraLearn</span>
            <p className="font-label-md text-label-md text-on-surface-variant">© 2024 AuraLearn. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-lg">
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">Privacy Policy</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">Terms of Service</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">Cookie Policy</a>
            <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200" href="#">Contact Us</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

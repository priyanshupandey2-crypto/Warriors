'use client';

import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Sparkles } from 'lucide-react';

export default function CreatePage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleSendPrompt = (text?: string) => {
    const finalText = text || prompt;
    if (!finalText.trim()) return;

    setMessages([
      ...messages,
      { role: 'user', content: finalText },
      {
        role: 'ai',
        content: `Great choice! I'm analyzing your request to build a personalized course. Based on your input, I'll structure a curriculum with modules, lessons, and resources tailored to your learning style. Would you like me to focus on any specific aspects like projects, assessments, or duration?`,
      },
    ]);

    setPrompt('');
    setShowWelcome(false);
  };

  const suggestedPrompts = [
    { text: 'Build a 4-week course on Sustainable Investing', emoji: '♻️' },
    { text: 'Create a beginner guide to Machine Learning', emoji: '🤖' },
    { text: 'Web Design with React & Tailwind CSS', emoji: '💻' },
    { text: 'Advanced Python for Data Science', emoji: '📊' },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <Navbar />

      <main className="flex-grow relative flex flex-col items-center overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full"></div>
        </div>

        {/* Chat Container */}
        <div className="w-full max-w-4xl px-md md:px-lg flex flex-col flex-grow">
          {/* Welcome Section */}
          {showWelcome && (
            <div className="flex flex-col items-center justify-center pt-xxl pb-xl text-center flex-grow">
              <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-md shadow-sm">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-sm">
                Hello! Ready to build your custom course?
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Our AI architect uses advanced technology to structure your learning path. Describe what you want to learn, and we'll handle the syllabus, resources, and schedule.
              </p>
            </div>
          )}

          {/* Chat Messages */}
          {!showWelcome && messages.length > 0 && (
            <div className="flex-grow overflow-y-auto space-y-lg py-lg mb-lg">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start gap-md'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`${
                      msg.role === 'user'
                        ? 'bg-surface-container-high text-on-surface rounded-2xl rounded-tr-none'
                        : 'bg-surface-container-lowest text-on-surface rounded-2xl rounded-tl-none border border-outline-variant/30'
                    } p-md max-w-[80%] shadow-sm`}
                  >
                    <p className="font-body-md">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Interaction Area */}
          <div className="w-full pb-xl">
            {/* Suggested Prompts */}
            {showWelcome && (
              <div className="flex flex-wrap justify-center gap-sm mb-lg">
                {suggestedPrompts.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(suggestion.text)}
                    className="px-md py-sm bg-surface-container-lowest border border-outline-variant hover:border-primary hover:bg-surface-container text-label-md font-label-md rounded-full text-on-surface-variant hover:text-primary transition-all duration-200 shadow-sm flex items-center gap-xs"
                  >
                    <span>{suggestion.emoji}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-md items-center">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendPrompt()}
                placeholder="What would you like to learn?"
                className="flex-grow px-lg py-md bg-surface-container-lowest border border-outline-variant rounded-full font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <button
                onClick={() => handleSendPrompt()}
                disabled={!prompt.trim()}
                className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            {/* Help Text */}
            <p className="font-label-sm text-on-surface-variant text-center mt-md">
              Describe your learning goal and let our AI handle the rest.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

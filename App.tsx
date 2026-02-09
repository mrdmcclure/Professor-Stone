
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, SpecimenCategory } from './types';
import { CATEGORIES, PROFESSOR_AVATAR_URL } from './constants';
import { geminiService } from './services/geminiService';
import MessageBubble from './components/MessageBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: "Greetings, fellow collector. I am Professor Stone. All outputs provided here are for informal educational guidance only—not formal appraisals, investment advice, or legal counsel. How may I assist your natural history journey today? Are you looking to understand the rarity of a specific trilobite, or perhaps the market for meteorites?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map(msg => ({
        role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await geminiService.sendMessage(history, userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        groundingLinks: response.links,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setError("I've encountered a small disturbance in the data stream. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (cat: SpecimenCategory) => {
    setInputValue(`Tell me about collecting ${cat.name.toLowerCase()}. What should I look for and what are the ethical considerations?`);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="bg-stone-900 text-stone-100 p-4 border-b border-stone-800 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full border-2 border-amber-600 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(217,119,6,0.2)]">
            <img src={PROFESSOR_AVATAR_URL} alt="Professor Stone" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <h1 className="serif text-xl font-bold tracking-tight">Professor Stone</h1>
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-extrabold flex items-center gap-1">
              Your trusted collection advisor
              <span className="inline-block w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-xs text-stone-400 italic font-medium">"Curio Naturae"</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-72 bg-stone-50 border-r border-stone-200 flex-col p-6 overflow-y-auto">
          <h2 className="serif text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-stone-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.994 7.994 0 0110 4c.342 0 .676.021 1 .063V15.5l-2-.5-2 .5V4.804zM3 5c0-.552.448-1 1-1h3.196a8.04 8.04 0 011.804 1.196v10.19a8.04 8.04 0 01-1.804 1.196H4a1 1 0 01-1-1V5zm14 0v10c0 .552-.448 1-1 1h-3.196a8.04 8.04 0 01-1.804-1.196V5.196A8.04 8.04 0 0112.804 4H16a1 1 0 011 1z"/></svg>
            Expertise Areas
          </h2>
          <div className="space-y-4">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="w-full text-left p-4 rounded-xl border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-200 transition-all group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="font-semibold text-stone-800 group-hover:text-amber-900">{cat.name}</span>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2">{cat.description}</p>
              </button>
            ))}
          </div>
          
          <div className="mt-auto pt-8 border-t border-stone-200">
            <div className="bg-stone-100 p-4 rounded-lg border border-stone-200 relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-10 rotate-12">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.827a1 1 0 00-.788 0l-7 3a1 1 0 000 1.846l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.846l-7-3zM6.733 12.674A.75.75 0 017 13.5l-3.354 1.437L10 18.272l6.354-2.835L13 14.25a.75.75 0 01.59-1.374l4.5 2a.75.75 0 010 1.374l-7.25 3.25a.75.75 0 01-.59 0l-7.25-3.25a.75.75 0 010-1.374l4.5-2a.75.75 0 01.59-.126z"/></svg>
              </div>
              <h3 className="text-xs font-bold text-stone-400 uppercase mb-2 tracking-widest">Professor's Tip</h3>
              <p className="text-[11px] text-stone-600 leading-relaxed italic relative z-10">
                "Always request proof of provenance. A specimen without history is just a rock; a specimen with history is a window into time."
              </p>
            </div>
          </div>
        </aside>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col bg-stone-100 relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-3xl mx-auto">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6 gap-3">
                  <div className="w-12 h-12 flex-shrink-0" />
                  <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-stone-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Professor is thinking...</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-sm mb-6 flex items-center gap-2 shadow-sm">
                  <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-end gap-2 md:gap-4">
              <div className="flex-1 relative">
                <textarea
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Inquire about a specimen..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none max-h-32 shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-stone-800 text-white p-3.5 rounded-2xl hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex-shrink-0"
                title="Send Message"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </form>
            <p className="text-[10px] text-center text-stone-400 mt-4 font-medium uppercase tracking-[0.2em]">
              Informational Service Only • Ethical Stewardship Encouraged
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

import React, { useState, useRef, useEffect } from 'react';
import { Message, SpecimenCategory } from './types';
import { CATEGORIES, PROFESSOR_AVATAR_URL } from './constants';
import { geminiService } from './services/geminiService';
import MessageBubble from './components/MessageBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      content: "Greetings, fellow collector. I'm Professor Stone. All info provided here is for informal educational guidance only, not formal appraisals, investment advice, or legal counsel. How may I assist you today?",
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
    if (window.innerWidth < 1024) setIsSidebarOpen(false);

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
      setError("I've found an inconsistency in the archives. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (cat: SpecimenCategory) => {
    setInputValue(`Professor, help me understand the curatorial nuances of ${cat.name}. What should a serious collector focus on?`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full space-y-8">
      {/* Intro Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-amber-600/30 overflow-hidden bg-white shadow-md">
            <img src={PROFESSOR_AVATAR_URL} alt="Stone" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <h2 className="serif text-xl font-bold text-stone-800">Professor Stone</h2>
            <p className="text-[9px] uppercase tracking-[0.2em] text-amber-600 font-bold">Collection Advisor</p>
          </div>
        </div>
      </section>

      {/* Areas of Expertiese */}
      <section>
        <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Areas of Expertise</h3>
        <div className="space-y-3">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="w-full text-left p-3.5 rounded-xl border border-stone-200 bg-white hover:bg-amber-50 hover:border-amber-200 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-semibold text-stone-800 group-hover:text-amber-900 leading-none">{cat.name}</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">{cat.description}</p>
            </button>
          ))}
        </div>
      </section>



      {/* Footer Quote */}
      <div className="mt-auto pt-6 border-t border-stone-200">
        <p className="text-[10px] text-stone-400 italic leading-relaxed">
          Professor's Tip: "Look for the matrix. In fossils as in minerals, the surrounding rock tells half the story."
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="bg-stone-900 text-stone-100 p-4 border-b border-stone-800 flex items-center justify-between z-30 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-stone-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full border-2 border-amber-600 flex items-center justify-center overflow-hidden shadow-inner">
              <img src={PROFESSOR_AVATAR_URL} alt="Professor Stone" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <h1 className="serif text-lg md:text-xl font-bold tracking-tight leading-none">Professor Stone</h1>
              <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-amber-500 font-extrabold mt-1">
                Your Trusted Collection Advisor
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-xs text-stone-400 italic font-medium">"Curio Naturae"</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-stone-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-72 bg-[#fdfcfb] border-r border-stone-200 flex-col p-6 overflow-y-auto z-50
          lg:z-auto lg:flex shrink-0
        `}>
          <SidebarContent />
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-stone-100 relative min-w-0">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-3xl mx-auto">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6 gap-3">
                  <div className="w-12 h-12 flex-shrink-0" />
                  <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-stone-200">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2.5 h-2.5 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Consulting the records...</span>
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

          {/* Input Interface */}
          <div className="p-4 md:p-6 bg-white border-t border-stone-200 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] shrink-0">
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
                  placeholder="Inquire about a specimen or origin..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all resize-none max-h-32 shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-stone-800 text-white p-4 rounded-2xl hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex-shrink-0 hover:scale-105 active:scale-95"
                title="Send Message"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </form>
            <p className="text-[10px] text-center text-stone-400 mt-4 font-medium uppercase tracking-[0.25em]">
              Informational Guidance Only • Ethical Collecting Advised
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
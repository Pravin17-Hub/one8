import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import gsap from 'gsap';

export default function AIShoppingAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your One8 AI Shopping Assistant. How can I help you discover premium items today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();

    // Trigger elastic pop animation on the newly added bubble
    const container = chatContainerRef.current;
    if (container && messages.length > 0) {
      const bubbles = container.querySelectorAll('.chat-bubble-anim');
      if (bubbles.length > 0) {
        const lastBubble = bubbles[bubbles.length - 1];
        gsap.fromTo(lastBubble,
          { opacity: 0, scale: 0.8, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.3)' }
        );
      }
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: userMessage });
      const { text, suggestions } = response.data;
      
      setMessages(prev => [...prev, { sender: 'ai', text, suggestions }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting to the intelligence engine right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 lg:ml-64 p-margin-mobile md:p-margin-desktop min-h-[calc(100vh-72px)] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-[32px] text-tertiary">smart_toy</span>
        <h1 className="text-headline-lg font-headline-lg text-on-surface">AI Concierge</h1>
      </div>

      <div className="glass-card flex-1 rounded-2xl flex flex-col overflow-hidden border border-white/10 shadow-2xl relative">
        {/* Chat Messages Area */}
        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble-anim flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] md:max-w-[60%] flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubble */}
                <div className={`px-5 py-3 rounded-2xl text-body-md ${
                  msg.sender === 'user' 
                    ? 'bg-secondary-container text-on-secondary-container rounded-br-sm' 
                    : 'bg-surface-container-highest text-on-surface rounded-bl-sm border border-white/5'
                }`}>
                  {msg.text}
                </div>

                {/* Suggestions / Cards */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {msg.suggestions.map((item, idx) => (
                      <div key={idx} className="w-full sm:w-[250px]">
                        <ProductCard 
                          id={item.id}
                          title={item.title} 
                          price={item.price} 
                          imageIcon={item.imageIcon} 
                          imageUrl={item.image_url || item.imageUrl}
                          matchScore={item.matchScore || item.ai_match_score || 95} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-highest text-on-surface px-5 py-3 rounded-2xl rounded-bl-sm border border-white/5 flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface/50 backdrop-blur-xl border-t border-white/10">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recommendations, style advice, or finding deals..." 
              className="w-full bg-surface-container-low border border-white/10 rounded-full py-4 pl-6 pr-14 text-body-md text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary/50 transition-all placeholder:text-on-surface-variant/50 input-glowing"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 w-10 h-10 rounded-full bg-tertiary text-tertiary-container flex items-center justify-center hover:bg-tertiary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

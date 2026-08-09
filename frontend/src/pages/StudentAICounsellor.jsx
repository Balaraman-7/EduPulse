import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { MessageSquareHeart, Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

export default function StudentAICounsellor() {
  const { studentProfile } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${studentProfile?.name || 'there'}! I am EduPulse AI, your academic counselling assistant. How can I help you optimize your study routine or attendance today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "How can I improve my attendance percentage?",
    "What is the best strategy to clear active backlogs?",
    "Create a balanced 7-day study plan for me.",
    "How can I improve my internal exam scores?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query,
        chatHistory: messages
      });

      const botMsg = { sender: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "I'm having trouble connecting right now. Please try again shortly." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              EduPulse AI Counsellor
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                Gemini Powered
              </span>
            </h1>
            <p className="text-xs text-gray-500">Interactive academic counselling & study guidance</p>
          </div>
        </div>
      </div>

      {/* Mandatory Safety Disclaimer Notice */}
      <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Notice:</strong> AI-generated guidance is for educational support. Your faculty/counsellor can provide official personalized human guidance.
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs h-[520px] flex flex-col justify-between overflow-hidden">
        
        {/* Messages List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user' ? 'bg-gray-900 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-900 rounded-tl-none border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-xs text-gray-500 font-medium italic animate-pulse">
                EduPulse AI is formulating guidance...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 shrink-0">Prompts:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition shrink-0 shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-gray-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your academic question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </div>
  );
}

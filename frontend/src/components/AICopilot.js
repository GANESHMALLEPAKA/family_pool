import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../utils/gemini';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AICopilot.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const renderMessageContent = (msg) => {
  if (msg.role === 'user') {
    return <div className="message-bubble user-bubble">{msg.content}</div>;
  }
  
  return (
    <div className="message-bubble assistant-bubble" style={{ overflowX: 'auto', whiteSpace: 'normal', display: 'block' }}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          table: ({node, ...props}) => <table style={{borderCollapse: 'collapse', width: '100%', margin: '10px 0'}} {...props} />,
          th: ({node, ...props}) => <th style={{border: '1px solid #ddd', padding: '8px', background: '#f8fafc'}} {...props} />,
          td: ({node, ...props}) => <td style={{border: '1px solid #ddd', padding: '8px'}} {...props} />
        }}
      >
        {msg.content}
      </ReactMarkdown>
    </div>
  );
};
const AICopilot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Financial Copilot. Ask me anything about your family budget, savings, or investments." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contextData, setContextData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (!contextData) {
        fetchContext();
      }
    }
  }, [isOpen, messages]);

  const fetchContext = async () => {
    try {
      const familyRes = await api.get('/families/my-family');
      const goalsRes = await api.get('/goals/my-goals');
      
      setContextData({
        monthlyIncome: familyRes.data?.monthlyIncome || 0,
        totalWealth: familyRes.data?.totalWealth || 0,
        goals: goalsRes.data || []
      });
    } catch (err) {
      console.error("Could not fetch context for Copilot", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to UI
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Send chat history to backend
      const rawHistory = newMessages.map(m => ({ role: m.role, content: m.content }));
      
      const reply = await aiService.sendChatMessage(rawHistory, contextData || {});
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I had trouble connecting to the network. Please check your connection."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!user) return null; // Only show for logged in users

  return (
    <div className="copilot-container">
      {!isOpen && (
        <button className="copilot-fab" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {isOpen && (
        <div className="copilot-window">
          <div className="copilot-header">
            <div>
              <div className="copilot-title">🌟 Financial Copilot</div>
              <div className="copilot-subtitle">Powered by AI</div>
            </div>
            <button className="copilot-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="copilot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {renderMessageContent(msg)}
              </div>
            ))}
            {isTyping && (
              <div className="message assistant">
                <div className="message-bubble loading-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="copilot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="copilot-input"
              placeholder="Type your financial question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="copilot-send" disabled={!input.trim() || isTyping}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AICopilot;

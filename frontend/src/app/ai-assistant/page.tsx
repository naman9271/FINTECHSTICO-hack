"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Brain,
  MessageCircle,
  BarChart3,
  Zap
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    {
      icon: <TrendingUp className="h-4 w-4" />,
      text: "What products have the highest dead stock value?",
      category: "Analytics"
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      text: "Which categories are most at risk?",
      category: "Risk Assessment"
    },
    {
      icon: <Clock className="h-4 w-4" />,
      text: "Show me items that haven't sold in 6 months",
      category: "Stale Inventory"
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      text: "What's the total potential loss from dead stock?",
      category: "Financial Impact"
    },
    {
      icon: <Package className="h-4 w-4" />,
      text: "How many products are currently out of stock?",
      category: "Inventory Status"
    },
    {
      icon: <Zap className="h-4 w-4" />,
      text: "What are the fastest-moving products this month?",
      category: "Performance"
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'ai',
      content: `👋 Hi! I'm your AI Assistant for Smart Dead Stock Management. 

I can help you analyze your inventory, identify trends, and provide insights about your dead stock. Ask me anything about your products, sales, or inventory performance!

Try asking questions like:
• "What products have the highest dead stock value?"
• "Which categories need immediate attention?"
• "Show me trends in my inventory turnover"
• "What's my total potential loss from dead stock?"`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: messageText }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.data?.answer || data.answer || 'I apologize, but I couldn\'t process your request at the moment.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Convert newlines to JSX
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl flex items-center">
              <Brain className="mr-3 h-8 w-8 text-blue-600" />
              AI Assistant
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Get intelligent insights about your inventory and dead stock management
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Suggested Questions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200 bg-white shadow-sm sticky top-8">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                  Quick Questions
                </h3>
                <div className="space-y-3">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(question.text)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="text-blue-600 mt-0.5">
                          {question.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {question.text}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs border-gray-300 text-gray-600">
                            {question.category}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="border-gray-200 bg-white shadow-sm h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">AI Assistant is online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-blue-600' 
                          : 'bg-green-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">
                          {formatMessage(message.content)}
                        </p>
                        <p className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="rounded-lg p-3 bg-gray-100 border border-gray-200">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your inventory..."
                    className="flex-1 bg-white border-gray-300 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Sparkles, MessageSquare, Brain, Loader2 } from 'lucide-react';

interface QueryResponse {
  answer: string;
  query: string;
  timestamp: string;
}

interface AIQueryInterfaceProps {
  onQuery: (query: string) => Promise<any>;
}

export function AIQueryInterface({ onQuery }: AIQueryInterfaceProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const result = await onQuery(query);
      setResponse({
        answer: result.answer || 'No response received',
        query: query,
        timestamp: new Date().toLocaleTimeString()
      });
      setQuery('');
    } catch (err) {
      setError('Failed to process your query. Please try again.');
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "What products have the highest dead stock value?",
    "Which categories are most at risk?",
    "Show me items that haven't sold in 6 months",
    "What's the total potential loss from dead stock?"
  ];

  return (
    <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-sm text-slate-400">Ask natural language questions about your inventory</p>
            </div>
          </div>
          <Badge variant="outline" className="border-purple-500/20 bg-purple-500/10 text-purple-400">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Powered
          </Badge>
        </div>

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about your dead stock inventory..."
              className="min-h-[80px] resize-none border-slate-700 bg-slate-800/50 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3">
              <Button 
                type="submit" 
                size="sm" 
                disabled={!query.trim() || loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Sample Queries */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
            Try these examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(sample)}
                disabled={loading}
                className="border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                {sample}
              </Button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mt-4 border-red-500/20 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Response Display */}
        {response && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">AI Response</span>
              <Badge variant="outline" className="border-slate-600 bg-slate-700 text-slate-300 text-xs">
                {response.timestamp}
              </Badge>
            </div>
            
            <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
              <div className="mb-2 text-sm text-slate-400">
                <strong>Query:</strong> {response.query}
              </div>
              <div className="text-sm text-slate-200 leading-relaxed">
                <strong>Answer:</strong> {response.answer}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-6 flex items-center justify-center space-x-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing your query...</span>
          </div>
        )}
      </div>
    </Card>
  );
}

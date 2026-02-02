import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- ENHANCEMENT: Import Check icon ---
import { Send, Sparkles, X, User, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ChatModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// --- ENHANCEMENT: Define Action and Message types ---
interface ActionButton {
  label: string;
  type: 'CREATE_TASK';
  payload: any;
}

interface Message {
  sender: 'user' | 'agent';
  text: string;
  actions?: ActionButton[]; // <-- Can now hold actions
}
// --- END OF ENHANCEMENT ---

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onOpenChange }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: `Hi ${user?.name}! I'm your Schedulify assistant. How can I help you today?`,
    },
  ]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // --- ENHANCEMENT: Function to handle proactive button clicks ---
  const handleActionClick = async (action: ActionButton) => {
    if (!token) {
      toast.error('You must be logged in to perform this action.');
      return;
    }
    
    // Disable buttons by setting loading
    setIsLoading(true); 

    try {
      if (action.type === 'CREATE_TASK') {
        const response = await fetch('http://localhost:5002/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(action.payload)
        });

        if (!response.ok) {
          throw new Error('Failed to create task');
        }
        
        const resData = await response.json();
        if (resData.success) {
          toast.success(`Task "${action.payload.title}" created!`);
          // Add a confirmation message from the agent
          setMessages((prev) => [
            ...prev,
            { sender: 'agent', text: `OK, I've created that task for you.` }
          ]);
        } else {
          throw new Error(resData.message || 'Failed to create task');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  // --- END OF ENHANCEMENT ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      // Call the local agent backend
      const response = await fetch('http://localhost:5000/api/agent/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the agent.');
      }

      const resData = await response.json();
      
      // --- ENHANCEMENT: Get actions from response ---
      const agentMessage: Message = {
        sender: 'agent',
        text: resData.message || "I'm not sure how to respond to that.",
        actions: resData.actions || [] // <-- Get actions
      };
      setMessages((prev) => [...prev, agentMessage]);
      // --- END OF ENHANCEMENT ---

    } catch (error: any) {
      toast.error(error.message);
      const errorMessage: Message = {
        sender: 'agent',
        text: "Sorry, I'm having trouble connecting right now.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 right-4 z-[60] w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[70vh] w-full flex-col rounded-lg border bg-card shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Smart Assistant</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col items-start space-y-2 ${
                        msg.sender === 'user' ? 'items-end' : ''
                      }`}
                    >
                      <div className={`flex items-start space-x-3 ${
                          msg.sender === 'user' ? 'justify-end' : ''
                        }`}
                      >
                        {msg.sender === 'agent' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Sparkles className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-xs rounded-lg p-3 text-sm ${
                            msg.sender === 'user'
                              ? 'rounded-br-none bg-primary text-primary-foreground'
                              : 'rounded-bl-none bg-muted'
                          }`}
                        >
                          {/* Use pre-wrap to respect newlines from the agent */}
                          <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                        {msg.sender === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      
                      {/* --- ENHANCEMENT: Render Action Buttons --- */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="ml-11 flex flex-col items-start space-y-2">
                          {msg.actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant="outline"
                              size="sm"
                              onClick={() => handleActionClick(action)}
                              disabled={isLoading}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      {/* --- END OF ENHANCEMENT --- */}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-3 text-sm bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="relative">
                  <Input
                    placeholder="Ask me anything..."
                    className="pr-12"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    disabled={isLoading || !query.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
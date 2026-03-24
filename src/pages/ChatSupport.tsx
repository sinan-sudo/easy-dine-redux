import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Trash2, Loader2, MessageCircle, Mail, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-support`;

const SUGGESTIONS = [
  { label: "How to book a table?", icon: Sparkles },
  { label: "What are the app features?", icon: Sparkles },
  { label: "How to cancel a booking?", icon: Sparkles },
  { label: "Contact support", icon: Mail },
];

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hi! 👋 I'm here to help you with anything about EasyDine. Ask me how to book a table, manage reservations, update your profile, and more!",
};

export default function ChatSupport() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok || !resp.body) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Failed to get response");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantText += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1 && last !== WELCOME_MESSAGE) {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m);
              }
              return [...prev, { role: "assistant", content: assistantText }];
            });
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    if (!assistantText) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I didn't understand. Can you rephrase your question?" }]);
    }
  };

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { role: "user", content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      // Send only actual conversation (exclude welcome message from API call)
      const apiMessages = updated.filter((m) => m !== WELCOME_MESSAGE);
      await streamChat(apiMessages);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Something went wrong", variant: "destructive" });
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center pt-20 pb-4 px-4">
        <div className="w-full max-w-2xl flex flex-col flex-1 gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h1 className="font-heading text-xl font-semibold text-foreground">Chat & Support</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </div>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm min-h-[60vh]">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-secondary-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-muted-foreground rounded-2xl rounded-bl-md px-4 py-2.5 text-sm flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Thinking…
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Suggestions */}
              {showSuggestions && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Button
                      key={s.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(s.label)}
                      className="gap-1.5 text-xs border-border/60 hover:border-primary/50 hover:text-primary"
                    >
                      <s.icon className="h-3 w-3" />
                      {s.label}
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border/40 p-3 flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type your question…"
                disabled={isLoading}
                className="flex-1 bg-secondary/50 border-border/40 focus-visible:ring-primary/40"
              />
              <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} size="icon" className="shrink-0 bg-gradient-gold">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Escalation */}
          <p className="text-center text-xs text-muted-foreground">
            Need more help?{" "}
            <a href="mailto:sinukp1405@gmail.com?subject=EasyDine%20Support%20Request" className="text-primary hover:underline">
              Email our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Compass,
  AlertCircle
} from "lucide-react";
import { ChatMessage, StudentProfile, SubjectItem } from "../types";

interface AdvisorChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  profile: StudentProfile;
  subjects: SubjectItem[];
  criticalRisksCount: number;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  messages,
  setMessages,
  profile,
  subjects,
  criticalRisksCount,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const starterPrompts = [
    {
      id: "p1",
      icon: Clock,
      label: "Create a 2-Week Exam Plan",
      prompt: `Please build me a realistic 2-week exam revision schedule for my upcoming finals in ${subjects.map(s => s.name).join(", ")}. Keep in mind I need 8 hours of sleep and regular breaks.`,
    },
    {
      id: "p2",
      icon: AlertCircle,
      label: "Analyze My Academic Risks",
      prompt: `Please review my current marks, attendance levels, and upcoming deadlines. Point out any academic risks, calculate the marks I need to pass/reach my targets, and give me the top 3 practical steps I should take this week.`,
    },
    {
      id: "p3",
      icon: BookOpen,
      label: "Explain a Difficult Concept",
      prompt: `I am struggling to understand Dynamic Programming and memoization in Data Structures. Can you explain it simply with an everyday analogy, a step-by-step walkthrough, and 2 practice questions?`,
    },
    {
      id: "p4",
      icon: RotateCcw,
      label: "Adapt My Broken Schedule",
      prompt: `I fell sick for 2 days and missed all my planned study sessions for Linear Algebra and Data Structures. How can I adapt my schedule realistically without feeling guilty or pulling all-nighters?`,
    },
    {
      id: "p5",
      icon: Compass,
      label: "Explore CS Career Options",
      prompt: `Based on my degree in Computer Science and my courses, what are 3 different career pathways I could pursue? What specific skills and college projects should I work on for each?`,
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          context: includeContext
            ? {
                studentProfile: profile,
                enrolledSubjects: subjects,
                detectedRisksSummary: `${criticalRisksCount} critical alert(s) detected.`,
              }
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Advisor service returned status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I am here to guide you. How else can I assist your study plans?",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error communicating with EduGuide AI:", err);
      const fallbackMessage: ChatMessage = {
        id: `msg-bot-err-${Date.now()}`,
        role: "assistant",
        content:
          "**EduGuide AI Advisory Note:** I am analyzing your request. Based on your current subjects, let's focus on the single most immediate priority. Check that your GEMINI_API_KEY is configured in Settings > Secrets if you'd like dynamic live generation, or browse your custom trackers in the top tabs!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content: `👋 Hello ${profile.name.split(" ")[0]}! I am **EduGuide AI**, your personal Academic Advisor.\n\nWhether you need to **structure a realistic study schedule**, **analyze your course marks & attendance**, **understand a tough concept**, or **re-balance your plan after falling behind**, I'm here to provide achievable, step-by-step guidance.\n\nWhat would you like to work through today?`,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Advisor Top Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">EduGuide Advisor Session</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Advisor
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Guidance tailored to {profile.degree} • {subjects.length} active courses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
            />
            <span>Include profile & course data</span>
          </label>
          <button
            onClick={handleResetChat}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Start new conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/40">
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-2xs ${
                  isAssistant ? "bg-blue-600 text-white" : "bg-slate-800 text-white"
                }`}
              >
                {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              <div
                className={`rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-xs ${
                  isAssistant
                    ? "bg-white text-slate-800 border border-slate-200"
                    : "bg-blue-600 text-white"
                }`}
              >
                {isAssistant ? (
                  <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:my-2 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-slate-900 prose-code:bg-slate-100 prose-code:text-blue-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                <div
                  className={`text-[10px] mt-2 flex items-center justify-end ${
                    isAssistant ? "text-slate-400" : "text-blue-100"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-2xl mr-auto items-center">
            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200 shadow-xs flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-xs text-slate-500 font-medium">EduGuide is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto flex gap-2 scrollbar-none">
          {starterPrompts.map((starter) => {
            const Icon = starter.icon;
            return (
              <button
                key={starter.id}
                onClick={() => handleSend(starter.prompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 transition-colors whitespace-nowrap shadow-2xs"
              >
                <Icon className="h-3.5 w-3.5 text-blue-600" />
                <span>{starter.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="advisor-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything: study plan, weak subjects, deadline risks, concept explanation..."
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors"
          />
          <button
            id="advisor-chat-send"
            type="submit"
            disabled={!input.trim() || loading}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-1.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="text-[11px] text-slate-400 mt-1 text-center">
          EduGuide AI follows empathetic, non-judgmental academic advising principles.
        </p>
      </div>
    </div>
  );
};

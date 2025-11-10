"use client";

import React, { useState, FormEvent, useRef, useEffect } from "react";
import { getAIInsight } from "@/services/geminiService";
import { Message, Lead, Campaign } from "@/types";
import {
  saveAssistantMessages,
  loadAssistantMessages,
} from "@/services/firebaseService";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  leads?: Lead[];
  campaigns?: Campaign[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  leads,
  campaigns,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const loadedMessages = await loadAssistantMessages();
      if (loadedMessages && loadedMessages.length > 0) {
        setMessagesState(loadedMessages);
      } else {
        setMessagesState([
          {
            sender: "ai",
            text: "Hello! How can I help you optimize your campaigns today?",
          },
        ]);
      }
    };
    fetchMessages();
  }, []);

  const setMessages = (updater: React.SetStateAction<Message[]>) => {
    const valueToSave =
      updater instanceof Function ? updater(messages) : updater;
    setMessagesState(valueToSave);
    saveAssistantMessages(valueToSave);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const aiResponse = await getAIInsight(input);
    const aiMessage: Message = { sender: "ai", text: aiResponse };

    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full z-40 transition-transform duration-300 ease-in-out bg-background border-l border-white/10 flex flex-col w-full sm:w-96 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 sm:p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-poppins font-semibold">
              AI Assistant
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-text-muted hover:text-white"
              aria-label="Close AI Assistant"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-card-bg text-text-light rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl bg-card-bg text-text-light rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-text-muted rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI for insights..."
              className="w-full bg-card-bg border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm sm:text-base"
              disabled={isLoading}
            />
          </form>
        </div>
      </aside>
    </>
  );
};

export default AIAssistant;

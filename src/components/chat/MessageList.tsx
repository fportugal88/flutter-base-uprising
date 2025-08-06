import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import type { Message as ChatMessage } from "@/contexts/ChatContext";

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  endRef: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, endRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
            <Card
              className={`${
                message.type === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border-border"
              }`}
            >
              <CardContent className="p-3">
                {message.type === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-body-medium whitespace-pre-line">
                    {message.content}
                  </p>
                )}
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground mt-1 px-3">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
};

export default MessageList;

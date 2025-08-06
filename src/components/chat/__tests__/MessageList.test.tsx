import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MessageList } from "@/components/chat/MessageList";
import type { Message as ChatMessage } from "@/contexts/ChatContext";

describe("MessageList", () => {
  it("renders messages", () => {
    const messages: ChatMessage[] = [
      { id: "1", type: "user", content: "hello", timestamp: new Date() }
    ];
    const { getByText } = render(
      <MessageList messages={messages} isTyping={false} endRef={{ current: null }} />
    );
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("shows typing indicator when isTyping", () => {
    const messages: ChatMessage[] = [];
    const { container } = render(
      <MessageList messages={messages} isTyping endRef={{ current: null }} />
    );
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });
});

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChatInput } from "@/components/chat/ChatInput";

describe("ChatInput", () => {
  it("calls onSend when Enter is pressed", () => {
    const handleSend = vi.fn();
    const { getByPlaceholderText } = render(
      <ChatInput value="hello" onChange={() => {}} onSend={handleSend} />
    );

    const input = getByPlaceholderText("Digite sua mensagem...");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(handleSend).toHaveBeenCalled();
  });
});

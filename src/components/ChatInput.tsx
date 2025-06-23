import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
}

const ChatInput = ({ onSendMessage, isTyping = false, inputValue, setInputValue }: ChatInputProps) => {
  console.log("ChatInput rendered, isTyping:", isTyping);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with value:", inputValue);
    
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            console.log("Input changed:", e.target.value);
            setInputValue(e.target.value);
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="flex-1"
          disabled={isTyping}
          autoComplete="off"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!inputValue.trim() || isTyping}
          className={cn(
            "bg-healthcare-primary hover:bg-healthcare-dark",
            (!inputValue.trim() || isTyping) && "opacity-50 cursor-not-allowed"
          )}
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
      {isTyping && (
        <div className="text-xs text-muted-foreground mt-2 animate-pulse">
          Healthcare assistant is typing...
        </div>
      )}
    </div>
  );
};

export default ChatInput;

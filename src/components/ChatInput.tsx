
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
}

const ChatInput = ({ onSendMessage, isTyping = false }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isTyping}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!inputValue.trim() || isTyping}
          className={cn(
            "bg-healthcare-primary hover:bg-healthcare-dark",
            !inputValue.trim() && "opacity-50 cursor-not-allowed"
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

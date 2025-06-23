import { MessageType } from "@/utils/chatbotUtils";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  message: MessageType;
  onOptionClick?: (option: string) => void;
  onGenerateReply?: (message: string) => void;
}

const MessageBubble = ({ message, onOptionClick, onGenerateReply }: MessageBubbleProps) => {
  const isBot = message.sender === 'bot';
  
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-message-in",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="mr-2 flex-shrink-0">
          <Avatar className="h-8 w-8 bg-healthcare-primary">
            <MessageCircle className="h-4 w-4 text-white" />
          </Avatar>
        </div>
      )}
      
      <div className="flex flex-col max-w-[75%]">
        <div
          className={cn(
            "px-4 py-3 rounded-xl",
            isBot 
              ? "bg-white shadow-sm border" 
              : "bg-healthcare-primary text-white"
          )}
        >
          <p className="text-sm">{message.content}</p>
          
          {isBot && message.type === 'text' && onGenerateReply && (
            <div className="absolute -bottom-3 -right-3">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full bg-white hover:bg-gray-200 shadow-sm border"
                onClick={() => onGenerateReply(message.content)}
                title="Suggest a reply"
              >
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </Button>
            </div>
          )}

          {message.options && message.options.length > 0 && (
            <div className="mt-3 flex flex-col space-y-2">
              {message.options.map(option => (
                <button
                  key={option}
                  onClick={() => onOptionClick && onOptionClick(option)}
                  className={cn(
                    "text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-opacity-90",
                    isBot 
                      ? "bg-healthcare-light text-healthcare-primary hover:bg-healthcare-secondary hover:text-white" 
                      : "bg-white text-healthcare-primary bg-opacity-90 hover:bg-white"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1 px-2">
          {formattedTime}
        </span>
      </div>
      
      {!isBot && (
        <div className="ml-2 flex-shrink-0">
          <Avatar className="h-8 w-8 bg-healthcare-accent">
            <User className="h-4 w-4 text-white" />
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

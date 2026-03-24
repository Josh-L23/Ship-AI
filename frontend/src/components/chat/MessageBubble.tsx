"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const time = new Date(message.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%] animate-fade-in",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <div className="space-y-1">
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-foreground text-background rounded-br-md"
              : "bg-muted rounded-bl-md"
          )}
        >
          {message.type === "text" && <p>{message.content}</p>}

          {message.type === "list" && (
            <div className="space-y-2">
              <p>{message.content}</p>
              {message.metadata?.items && (
                <ul className="space-y-1.5 ml-0.5">
                  {message.metadata.items.map((item, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-start gap-2 text-xs leading-relaxed",
                        isUser ? "opacity-90" : "text-foreground/80"
                      )}
                    >
                      <span className="mt-1 w-1 h-1 rounded-full bg-current shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {message.type === "colors" && (
            <div className="space-y-2">
              <p>{message.content}</p>
              {message.metadata?.colors && (
                <div className="flex gap-2 pt-1">
                  {message.metadata.colors.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-lg border border-white/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span
                        className={cn(
                          "text-[9px] font-mono",
                          isUser ? "text-background/70" : "text-muted-foreground"
                        )}
                      >
                        {color.hex}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {message.type === "image" && (
            <div className="space-y-2">
              <p>{message.content}</p>
              {message.metadata?.imageUrl ? (
                <div className="rounded-lg border border-border/30 overflow-hidden max-w-[280px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.metadata.imageUrl}
                    alt="Shared image"
                    className="w-full h-auto object-cover"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-foreground/5 rounded-lg border border-border/30 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    [Generated Image]
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <p
          className={cn(
            "text-[10px] text-muted-foreground px-1",
            isUser ? "text-right" : ""
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 max-w-[85%]">
      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse-dot" />
          <span
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse-dot"
            style={{ animationDelay: "0.3s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse-dot"
            style={{ animationDelay: "0.6s" }}
          />
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
}

export function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const childRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = React.useCallback(() => {
    if (!childRef.current || !tooltipRef.current) return;

    const childRect = childRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    // Calculate position based on side
    switch (side) {
      case "top":
        top = childRect.top - tooltipRect.height - 8;
        break;
      case "right":
        left = childRect.right + 8;
        break;
      case "bottom":
        top = childRect.bottom + 8;
        break;
      case "left":
        left = childRect.left - tooltipRect.width - 8;
        break;
    }

    // Calculate position based on align
    switch (align) {
      case "start":
        if (side === "top" || side === "bottom") {
          left = childRect.left;
        } else {
          top = childRect.top;
        }
        break;
      case "center":
        if (side === "top" || side === "bottom") {
          left = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
        } else {
          top = childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
        }
        break;
      case "end":
        if (side === "top" || side === "bottom") {
          left = childRect.right - tooltipRect.width;
        } else {
          top = childRect.bottom - tooltipRect.height;
        }
        break;
    }

    // Adjust horizontal position if side is top or bottom
    if (side === "top" || side === "bottom") {
      if (align === "center") {
        left = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
      }
    }

    setPosition({ top, left });
  }, [side, align]);

  const handleMouseEnter = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Use a small delay to ensure the tooltip is rendered before calculating position
      setTimeout(() => calculatePosition(), 0);
    }, delayDuration);
  }, [calculatePosition, delayDuration]);

  const handleMouseLeave = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible, calculatePosition]);

  return (
    <>
      <div
        ref={childRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            "fixed z-50 max-w-xs px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md shadow-sm animate-in fade-in-0 zoom-in-95",
            side === "top" && "data-[side=top]:slide-in-from-bottom-2",
            side === "right" && "data-[side=right]:slide-in-from-left-2",
            side === "bottom" && "data-[side=bottom]:slide-in-from-top-2",
            side === "left" && "data-[side=left]:slide-in-from-right-2"
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          data-side={side}
        >
          {content}
        </div>
      )}
    </>
  );
}

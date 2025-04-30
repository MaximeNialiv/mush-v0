import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  onClose?: () => void;
}

interface SheetOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      setIsOpen(value);
      onOpenChange?.(value);
    },
    [onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetOverlay({ className, ...props }: SheetOverlayProps) {
  const { open, onOpenChange } = React.useContext(SheetContext);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

export function SheetContent({
  side = "right",
  className,
  children,
  onClose,
  ...props
}: SheetContentProps) {
  const { open, onOpenChange } = React.useContext(SheetContext);

  const handleClose = React.useCallback(() => {
    onOpenChange(false);
    onClose?.();
  }, [onOpenChange, onClose]);

  if (!open) return null;

  return (
    <>
      <SheetOverlay />
      <div
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
          side === "top" && "inset-x-0 top-0 border-b data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" && "inset-x-0 bottom-0 border-t data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
          side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
          className
        )}
        {...props}
      >
        {children}
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </div>
    </>
  );
}

export function SheetClose({ className, ...props }: SheetCloseProps) {
  const { onOpenChange } = React.useContext(SheetContext);

  return (
    <button
      className={cn(
        "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

export function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

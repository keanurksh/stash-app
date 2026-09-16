"use client"

import * as React from "react"
import { cn } from "cn"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Drawer as DrawerPrimitive } from "vaul"

import { useMediaQuery } from "@/hooks/use-media-query"

const ResponsiveDialogContext = React.createContext<boolean>(true)

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  /** className untuk DialogContent (desktop ≥ md) */
  desktopClassName?: string
  /** className tambahan untuk DrawerContent (mobile) */
  mobileClassName?: string
}

/**
 * Dialog di desktop, bottom-sheet Drawer di mobile (< md).
 * Konten yang sama dipakai ulang; judul/deskripsi pakai
 * ResponsiveDialogTitle / ResponsiveDialogDescription.
 */
function ResponsiveDialog({
  open,
  onOpenChange,
  children,
  desktopClassName,
  mobileClassName,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)") ?? true

  return (
    <ResponsiveDialogContext.Provider value={isDesktop}>
      {isDesktop ? (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <DialogPrimitive.Content
              data-slot="dialog-content"
              className={cn(
                "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                desktopClassName
              )}
            >
              {children}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      ) : (
        <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange}>
          <DrawerPrimitive.Portal>
            <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <DrawerPrimitive.Content
              data-slot="drawer-content"
              className={cn(
                "fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[85vh] flex-col overflow-y-auto rounded-t-3xl border-t border-[#1c2225] bg-[#101415] pb-[env(safe-area-inset-bottom)] outline-none",
                mobileClassName
              )}
            >
              <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-[#2a3438]" />
              {children}
            </DrawerPrimitive.Content>
          </DrawerPrimitive.Portal>
        </DrawerPrimitive.Root>
      )}
    </ResponsiveDialogContext.Provider>
  )
}

function ResponsiveDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  const isDesktop = React.useContext(ResponsiveDialogContext)
  if (isDesktop) {
    return (
      <DialogPrimitive.Title
        data-slot="dialog-title"
        className={cn(
          "font-heading text-base leading-none font-medium",
          className
        )}
        {...props}
      />
    )
  }
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-heading text-base font-medium", className)}
      {...props}
    />
  )
}

function ResponsiveDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  const isDesktop = React.useContext(ResponsiveDialogContext)
  if (isDesktop) {
    return (
      <DialogPrimitive.Description
        data-slot="dialog-description"
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  }
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export { ResponsiveDialog, ResponsiveDialogTitle, ResponsiveDialogDescription }

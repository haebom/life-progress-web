'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface InAppBrowserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InAppBrowserModal({ open, onOpenChange }: InAppBrowserModalProps) {
  const handleOpenBrowser = () => {
    window.location.href = window.location.href;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>외부 브라우저로 이동</DialogTitle>
          <DialogDescription>
            보안을 위해 Safari나 Chrome 브라우저에서 로그인해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <button
            onClick={handleOpenBrowser}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
          >
            브라우저에서 열기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
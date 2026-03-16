"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AccountSection() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleUpdatePassword = () => {
    setPwError("");
    setPwSuccess(false);

    if (!currentPw) {
      setPwError("Current password is required");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match");
      return;
    }

    // Simulate success (no real backend auth yet)
    setPwSuccess(true);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    // No real backend implementation yet — just close the dialog
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-medium">Account</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account security and linked services
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Change password</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">Current password</Label>
            <Input
              type="password"
              className="h-10 max-w-md"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">New password</Label>
            <Input
              type="password"
              className="h-10 max-w-md"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Confirm new password</Label>
            <Input
              type="password"
              className="h-10 max-w-md"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </div>
          {pwError && (
            <p className="text-xs text-destructive">{pwError}</p>
          )}
          {pwSuccess && (
            <p className="text-xs text-emerald-500">Password updated successfully</p>
          )}
          <Button size="sm" variant="outline" onClick={handleUpdatePassword}>
            Update password
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Linked accounts</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
              </svg>
              <span className="text-sm">Google</span>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-8">
              Connect
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-sm">GitHub</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Connected
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-destructive">Danger zone</h4>
        <p className="text-xs text-muted-foreground">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger className="inline-flex items-center justify-center font-medium text-sm h-9 px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
              Delete account
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete your account? This
                action cannot be undone and all your projects, messages, and
                generated assets will be lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
              >
                Yes, delete my account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

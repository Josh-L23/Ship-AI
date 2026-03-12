"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentUser } from "@/lib/dummy-data";
import { Camera } from "lucide-react";

export function ProfileSection() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal information and public profile
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-xl bg-foreground/10">
              {currentUser.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">{currentUser.name}</p>
          <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          <button className="text-xs text-foreground underline underline-offset-2 mt-1">
            Change photo
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm">Display name</Label>
          <Input defaultValue={currentUser.name} className="h-10" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Email</Label>
          <Input
            defaultValue={currentUser.email}
            disabled
            className="h-10 opacity-60"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Bio</Label>
        <Textarea
          defaultValue={currentUser.bio}
          className="min-h-[80px] resize-none"
        />
      </div>

      <Button size="sm">Save changes</Button>
    </div>
  );
}

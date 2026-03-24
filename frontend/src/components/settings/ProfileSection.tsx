"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Camera, Check } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  avatarUrl?: string;
}

const defaultProfile: ProfileData = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  bio: "Brand strategist & creative director.",
  avatar: "AM",
  avatarUrl: undefined,
};

export function ProfileSection() {
  const [profile, setProfile] = useLocalStorage<ProfileData>(
    "ship_user_profile",
    defaultProfile
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // profile is already persisted to localStorage on every setProfile call
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({
          ...prev,
          avatarUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

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
            {profile.avatarUrl && (
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            )}
            <AvatarFallback className="text-xl bg-foreground/10">
              {profile.avatar}
            </AvatarFallback>
          </Avatar>
          <div
            onClick={handleAvatarUpload}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
          >
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">{profile.name}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
          <button
            onClick={handleAvatarUpload}
            className="text-xs text-foreground underline underline-offset-2 mt-1"
          >
            Change photo
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm">Display name</Label>
          <Input
            value={profile.name}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, name: e.target.value }))
            }
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Email</Label>
          <Input
            value={profile.email}
            disabled
            className="h-10 opacity-60"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Bio</Label>
        <Textarea
          value={profile.bio}
          onChange={(e) =>
            setProfile((prev) => ({ ...prev, bio: e.target.value }))
          }
          className="min-h-[80px] resize-none"
        />
      </div>

      <Button size="sm" onClick={handleSave}>
        {saved ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Saved
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </div>
  );
}

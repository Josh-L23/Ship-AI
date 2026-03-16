"use client";

import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Preferences {
  emailNotifications: boolean;
  agentNotifications: boolean;
  language: string;
}

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useLocalStorage<Preferences>(
    "ship_preferences",
    {
      emailNotifications: true,
      agentNotifications: true,
      language: "en",
    }
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-medium">Preferences</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Customize your experience
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Dark mode</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use dark theme across the application
            </p>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) =>
              setTheme(checked ? "dark" : "light")
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Email notifications</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receive email updates on project activity
            </p>
          </div>
          <Switch
            checked={prefs.emailNotifications}
            onCheckedChange={(checked) =>
              setPrefs((prev) => ({ ...prev, emailNotifications: checked }))
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Agent notifications</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get notified when agents complete tasks
            </p>
          </div>
          <Switch
            checked={prefs.agentNotifications}
            onCheckedChange={(checked) =>
              setPrefs((prev) => ({ ...prev, agentNotifications: checked }))
            }
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Language</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select your preferred language
            </p>
          </div>
          <Select
            defaultValue={prefs.language}
            onValueChange={(val: string | null) => {
              if (val) setPrefs((p: Preferences) => ({ ...p, language: val }));
            }}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Espa&ntilde;ol</SelectItem>
              <SelectItem value="fr">Fran&ccedil;ais</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

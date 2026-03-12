"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { AccountSection } from "@/components/settings/AccountSection";
import { PreferencesSection } from "@/components/settings/PreferencesSection";
import { BillingSection } from "@/components/settings/BillingSection";

export default function SettingsPage() {
  return (
    <>
      <Topbar pageTitle="Settings" />
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-8 max-w-4xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="profile" className="text-xs">
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="text-xs">
                Account
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="billing" className="text-xs">
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSection />
            </TabsContent>

            <TabsContent value="account">
              <AccountSection />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferencesSection />
            </TabsContent>

            <TabsContent value="billing">
              <BillingSection />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, CreditCard } from "lucide-react";

const currentUserPlan = "pro";

export function BillingSection() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-medium">Billing</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your subscription and usage
        </p>
      </div>

      <div className="p-5 rounded-xl border border-border/60 bg-card/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium capitalize">
                {currentUserPlan} Plan
              </p>
              <p className="text-xs text-muted-foreground">
                Billed monthly
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="capitalize"
          >
            {currentUserPlan}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Projects used</p>
          </div>
          <div>
            <p className="text-2xl font-bold">847</p>
            <p className="text-xs text-muted-foreground">AI generations</p>
          </div>
          <div>
            <p className="text-2xl font-bold">2.4 GB</p>
            <p className="text-xs text-muted-foreground">Storage used</p>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-foreground h-2 rounded-full w-3/5" />
        </div>
        <p className="text-xs text-muted-foreground">
          60% of your plan&apos;s usage limit
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm">
          <Zap className="w-3.5 h-3.5 mr-1.5" />
          Upgrade plan
        </Button>
        <Button size="sm" variant="outline">
          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
          Payment method
        </Button>
      </div>
    </div>
  );
}

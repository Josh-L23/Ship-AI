"use client";

import { Topbar } from "@/components/layout/Topbar";
import { CanvasBoard } from "@/components/canvas/CanvasBoard";

export default function CanvasPage() {
  return (
    <>
      <Topbar pageTitle="Canvas" breadcrumb="TERRENE" />
      <div className="flex-1 overflow-hidden">
        <CanvasBoard />
      </div>
    </>
  );
}

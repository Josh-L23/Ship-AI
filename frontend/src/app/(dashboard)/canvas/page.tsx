"use client";

import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { CanvasBoard } from "@/components/canvas/CanvasBoard";

export default function CanvasPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "proj_001";

  return (
    <>
      <Topbar pageTitle="Canvas" breadcrumb={projectId} />
      <div className="flex-1 overflow-hidden">
        <CanvasBoard projectId={projectId} />
      </div>
    </>
  );
}

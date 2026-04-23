"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { CanvasBoard } from "@/components/canvas/CanvasBoard";
import { fetchProjects } from "@/lib/api";
import Link from "next/link";

export default function CanvasPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectIdParam = searchParams.get("projectId");
  const [projectId, setProjectId] = useState<string | null>(projectIdParam);
  const [loading, setLoading] = useState(!projectIdParam);

  useEffect(() => {
    if (projectIdParam) {
      setProjectId(projectIdParam);
      setLoading(false);
      return;
    }
    let active = true;
    fetchProjects()
      .then((projects) => {
        if (!active) return;
        if (projects.length > 0) {
          router.replace(`/canvas?projectId=${projects[0].id}`);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectIdParam, router]);

  if (loading) {
    return (
      <>
        <Topbar pageTitle="Canvas" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </>
    );
  }

  if (!projectId) {
    return (
      <>
        <Topbar pageTitle="Canvas" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-sm font-medium">No projects yet</p>
            <p className="text-xs text-muted-foreground">
              Create a project first to start using the canvas.
            </p>
            <Link
              href="/projects"
              className="inline-block mt-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Go to Projects
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar pageTitle="Canvas" breadcrumb={projectId} />
      <div className="flex-1 overflow-hidden">
        <CanvasBoard projectId={projectId} />
      </div>
    </>
  );
}

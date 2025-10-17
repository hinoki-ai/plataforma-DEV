// ⚡ Performance: Dynamic video section for PPR
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileIcons } from "@/components/icons/hero-icons";
import {
  DynamicAdminControls,
  AdminControlsSkeleton,
} from "./DynamicAdminControls";
import { Suspense } from "react";

type VideoCapsule = {
  id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
};

export function DynamicVideoSection() {
  const [videoCapsule, setVideoCapsule] = useState<VideoCapsule>({
    id: "default-capsule",
    title: "Cápsula de Video Educativo",
    url: "",
    description: "Video sobre nuestro enfoque educativo",
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVideoCapsule();
  }, []);

  const loadVideoCapsule = async () => {
    try {
      const response = await fetch("/api/proyecto-educativo/video-capsule");
      if (response.ok) {
        const data = await response.json();
        if (data.videoCapsule) {
          setVideoCapsule(data.videoCapsule);
        }
      }
    } catch (error) {
      console.error("Error loading video capsule:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube
    if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
      const videoId = url.includes("youtube.com/watch")
        ? url.split("v=")[1]?.split("&")[0]
        : url.split("youtu.be/")[1]?.split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Vimeo
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("/")[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  };

  const embedUrl = getVideoEmbedUrl(videoCapsule.url);

  if (isLoading) {
    return <VideoSectionSkeleton />;
  }

  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileIcons.Video className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {videoCapsule.title}
            </CardTitle>
          </div>
          <Suspense fallback={<AdminControlsSkeleton />}>
            <DynamicAdminControls
              videoCapsule={videoCapsule}
              onUpdate={setVideoCapsule}
            />
          </Suspense>
        </CardHeader>
        <CardContent className="pt-6">
          {videoCapsule.url && embedUrl ? (
            <div className="aspect-video bg-black rounded-xl border border-primary/20 relative overflow-hidden">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center rounded-xl border border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
              <div className="text-center z-10">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <FileIcons.Video className="w-8 h-8 text-primary" />
                </div>
                <span className="text-gray-300 text-lg font-medium">
                  {videoCapsule.isActive
                    ? "Video disponible"
                    : "No hay video activo"}
                </span>
                <p className="text-sm text-gray-400 mt-2">
                  {videoCapsule.description ||
                    "Estamos preparando contenido especial sobre nuestro enfoque educativo"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

// ⚡ Performance: Loading skeleton
export function VideoSectionSkeleton() {
  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 bg-gray-700/50" />
            <Skeleton className="h-8 w-64 bg-gray-700/50" />
          </div>
          <AdminControlsSkeleton />
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="aspect-video w-full bg-gray-700/50" />
        </CardContent>
      </Card>
    </section>
  );
}

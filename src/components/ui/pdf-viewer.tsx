"use client";

import { useState } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  src: string;
  title?: string;
  onClose?: () => void;
  showClose?: boolean;
}

export function PDFViewer({
  src,
  title,
  onClose,
  showClose = true,
}: PDFViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <h2 className="text-white font-semibold text-lg">
          {title || "PDF Viewer"}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-white text-sm min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => window.open(src, "_blank")}
          >
            <Download className="w-4 h-4" />
          </Button>
          {showClose && onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 ml-2"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-black">
        <div className="min-h-full flex items-center justify-center p-8">
          <iframe
            src={`${src}#toolbar=0&navpanes=0&scrollbar=0`}
            className="bg-white rounded shadow-2xl"
            style={{
              width: "100%",
              height: "100%",
              minWidth: "600px",
              minHeight: "800px",
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: "center",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            title={title || "PDF Document"}
          />
        </div>
      </div>
    </div>
  );
}

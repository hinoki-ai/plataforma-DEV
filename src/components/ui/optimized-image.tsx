import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  loading?: "lazy" | "eager";
  placeholder?: "blur" | "empty";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  loading = "lazy",
  placeholder = "empty",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  useEffect(() => {
    if (priority) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
    }
  }, [priority]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg",
          className,
          !fill && width && height && `w-[${width}px] h-[${height}px]`,
        )}
      >
        <div className="text-center p-4">
          <div className="text-muted-foreground text-sm">
            Image failed to load
          </div>
        </div>
      </div>
    );
  }

  const imageSrc = src?.startsWith("/") ? src : `/${src || ""}`;

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <Skeleton
          className={cn(
            "absolute inset-0",
            fill
              ? "w-full h-full"
              : width && height
                ? `w-[${width}px] h-[${height}px]`
                : "w-full h-full",
          )}
        />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        quality={quality}
        loading={loading}
        placeholder={placeholder}
        priority={priority}
        onLoadingComplete={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300 object-cover",
          isLoading ? "opacity-0" : "opacity-100",
          fill && "absolute inset-0 w-full h-full",
        )}
      />
    </div>
  );
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
}

export function HeroImage({
  src,
  alt,
  className,
}: Pick<OptimizedImageProps, "src" | "alt" | "className">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      fill
      className={className}
      priority
      sizes="100vw"
    />
  );
}

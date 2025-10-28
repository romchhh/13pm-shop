"use client";

import { useEffect, useRef } from "react";

interface AutoPlayVideoProps {
  src: string;
  className?: string;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

export default function AutoPlayVideo({ 
  src, 
  className = "", 
  loop = true, 
  muted = true, 
  playsInline = true 
}: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set all required attributes for autoplay
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        // If autoplay fails, try again after video loads
        const tryPlay = () => {
          video.play().catch(() => {
            // Silently fail - video will require user interaction
          });
        };
        
        if (video.readyState >= 2) {
          setTimeout(tryPlay, 100);
        } else {
          video.addEventListener('canplay', tryPlay, { once: true });
          video.addEventListener('loadeddata', tryPlay, { once: true });
        }
      }
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
      video.addEventListener('loadeddata', playVideo, { once: true });
      video.load();
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      autoPlay
      preload="metadata"
    />
  );
}


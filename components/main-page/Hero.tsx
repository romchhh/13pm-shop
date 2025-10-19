"use client";

import SidebarMenu from "@/components/layout/SidebarMenu";
import { useAppContext } from "@/lib/GeneralProvider";
import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ensure video plays on component mount with mobile optimization
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Try multiple approaches for mobile compatibility
      const playVideo = async () => {
        try {
          video.muted = true; // Ensure muted for autoplay
          video.playsInline = true; // Important for iOS
          await video.play();
        } catch (error) {
          console.log("Video autoplay failed:", error);
          // Show play button for mobile devices
          setShowPlayButton(true);
        }
      };
      
      playVideo();
    }
  }, []);

  return (
    <section>
      <div className="max-w-[1920px] mx-auto w-full h-[600px] sm:h-[720px] md:h-[900px] lg:h-[1080px] relative overflow-hidden">
        {/* Show image on mobile, video on desktop */}
        
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover object-center"
              src="/images/IMG_5831.webm"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              style={{ zIndex: 1 }}
              poster="/images/hero-bg.png"
              onLoadedData={() => {
                videoRef.current?.play().catch(() => setShowPlayButton(true));
              }}
              webkit-playsinline="true"
              x5-playsinline="true"
              x5-video-player-type="h5"
              x5-video-player-fullscreen="true"
            />
            
            {/* Play button for desktop if autoplay fails */}
            {showPlayButton && (
              <button
                onClick={async () => {
                  try {
                    await videoRef.current?.play();
                    setShowPlayButton(false);
                  } catch (error) {
                    console.log("Manual play failed:", error);
                  }
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 z-10"
                style={{ zIndex: 10 }}
              >
                <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 5v14l11-7z"
                      fill="currentColor"
                      className="text-black"
                    />
                  </svg>
                </div>
              </button>
            )}
          </>
        
        <div className="relative z-10 flex flex-col justify-evenly p-10 md:p-35 gap-55 md:gap-70 h-full" style={{ zIndex: 2 }}>
          <div className="mx-auto relative lg:w-[1046px] h-52 flex items-center justify-center">
            <div className="text-white text-3xl md:text-7xl font-medium font-['Montserrat'] uppercase text-center">
              Тиша у формі тканини <br /> CHARS
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="cursor-pointer mx-auto w-40 sm:w-52 md:w-60 lg:w-72 h-12 sm:h-14 md:h-16 lg:h-16 p-2 bg-white inline-flex justify-center items-center gap-2 hover:opacity-50 transition-opacity duration-300 font-['Inter']"
          >
            <div className="text-center justify-center text-stone-900 text-base sm:text-lg md:text-xl lg:text-2xl font-normal capitalize leading-none tracking-tight">
              Каталог
            </div>
          </button>
        </div>
      </div>

      <SidebarMenu
        isDark={isDark}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
    </section>
  );
}

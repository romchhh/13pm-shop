import { Suspense } from "react";
import ProfileClient from "./ProfileClient";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-[var(--background-color-light,#F2F2F0)]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-[#1C1C1C]/20 border-t-[#1C1C1C] rounded-full animate-spin" />
            <p className="font-['Montserrat'] text-sm tracking-wider uppercase text-[#1C1C1C]/60">
              Завантаження
            </p>
          </div>
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  );
}

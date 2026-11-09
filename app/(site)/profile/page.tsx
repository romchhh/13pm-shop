import { Suspense } from "react";
import ProfileClient from "./ProfileClient";

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center font-['Montserrat'] text-lg">
          Завантаження...
        </div>
      }
    >
      <ProfileClient />
    </Suspense>
  );
}

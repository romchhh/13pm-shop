import type { Metadata } from "next";
import AdminTraffic from "@/components/admin/AdminTraffic";

export const metadata: Metadata = {
  title: "Трафік сайту",
  description: "Відвідувачі онлайн та джерела переходів",
};

export default function AdminTrafficPage() {
  return (
    <div className="col-span-12">
      <AdminTraffic />
    </div>
  );
}

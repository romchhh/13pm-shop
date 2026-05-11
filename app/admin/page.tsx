import type { Metadata } from "next";
import React from "react";
import { EcommerceMetrics } from "@/components/admin/EcommerceMetrics";
import MonthlySalesChart from "@/components/admin/MonthlySalesChart";
import RecentOrders from "@/components/admin/RecentOrders";
import ExportDatabaseButton from "@/components/admin/ExportDatabaseButton";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="col-span-12 space-y-6 xl:col-span-7">
      <ExportDatabaseButton />
      <EcommerceMetrics />
      <MonthlySalesChart />
      <RecentOrders />
    </div>
  );

  // <div className="grid grid-cols-12 gap-4 md:gap-6">
  {
    /* Left Section */
  }

  {
    /* Right Section */
  }
  //   <div className="col-span-12 space-y-6 xl:col-span-5">
  //     <MonthlyTarget />
  //     <StatisticsChart />
  //   </div>
  // </div>
}

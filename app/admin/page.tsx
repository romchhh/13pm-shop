import type { Metadata } from "next";
import React from "react";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import MonthlySalesChart from "@/components/admin/MonthlySalesChart";
import RecentOrders from "@/components/admin/RecentOrders";
import ExportDatabaseButton from "@/components/admin/ExportDatabaseButton";

export const metadata: Metadata = {
  title: "Адмін-панель",
  description: "Замовлення, товари та аналітика",
};

export default function AdminHomePage() {
  return (
    <div className="col-span-12 space-y-6 xl:col-span-7">
      <ExportDatabaseButton />
      <AdminAnalytics />
      <MonthlySalesChart />
      <RecentOrders />
    </div>
  );
}

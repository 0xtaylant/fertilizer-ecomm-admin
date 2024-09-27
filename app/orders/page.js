"use client";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Layout from "../components/Layout";
import AdminOrderManagement from "../components/AdminOrderManagement";

export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();



  // For now, we'll assume all authenticated users are admins
  // You may want to add a proper admin check here later
  return (
    <Layout>
      <AdminOrderManagement />
    </Layout>
  );
}
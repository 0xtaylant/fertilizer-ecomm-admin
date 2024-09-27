"use client";
import { useState, useEffect } from 'react';
import Layout from "./components/Layout";
import axios from 'axios';
import { useSession } from "next-auth/react";
import { FaShoppingCart, FaBoxes, FaChartLine } from 'react-icons/fa';

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalQuantity: 0, averageOrderSize: 0 });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const [ordersResponse, topProductsResponse, statsResponse] = await Promise.all([
        axios.get('/api/orders?limit=5'),
        axios.get('/api/setoProduct/top'),
        axios.get('/api/stats')
      ]);

      setRecentOrders(ordersResponse.data);
      setTopProducts(topProductsResponse.data);
      setStats(statsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-screen">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<FaShoppingCart className="text-blue-500" />}
          />
          <StatCard
            title="Total Quantity Sold"
            value={stats.totalQuantity}
            icon={<FaBoxes className="text-green-500" />}
          />
          <StatCard
            title="Average Order Size"
            value={`${stats.averageOrderSize.toFixed(2)} items`}
            icon={<FaChartLine className="text-purple-500" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Recent Orders">
            <ul className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <li key={order._id} className="py-3">
                  <span className="font-semibold text-black">Order {order._id}</span>
                  <p className="text-sm text-gray-600">
                    {order.userId?.name || 'Unknown User'} - {order.items.length} items
                  </p>
                </li>
              ))}
            </ul>
          </DashboardCard>
          <DashboardCard title="Top Selling Products">
            <ul className="divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <li key={index} className="py-3">
                  <span className="font-semibold">{product.stokIsmi || 'Unknown Product'}</span>
                  <p className="text-sm text-gray-600">{product.soldQuantity} units sold</p>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
      {children}
    </div>
  );
}
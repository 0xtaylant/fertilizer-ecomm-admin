import { NextResponse } from 'next/server';
import { mongooseConnect } from "@/lib/mongoose";
import Order from '@/app/models/orderModel';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  await mongooseConnect();
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: { $reduce: {
            input: "$items",
            initialValue: 0,
            in: { $add: ["$$value", "$$this.quantity"] }
          } } },
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalQuantity: 1,
          averageOrderSize: { $divide: ["$totalQuantity", "$totalOrders"] }
        }
      }
    ]);

    return NextResponse.json(stats[0] || { totalOrders: 0, totalQuantity: 0, averageOrderSize: 0 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

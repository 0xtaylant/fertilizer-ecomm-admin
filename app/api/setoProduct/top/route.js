import { NextResponse } from 'next/server';
import { mongooseConnect } from "@/lib/mongoose";
import Order from '@/app/models/orderModel';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request) {
  await mongooseConnect();
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: {
          _id: "$items.stokIsmi",
          soldQuantity: { $sum: "$items.quantity" }
        }
      },
      { $sort: { soldQuantity: -1 } },
      { $limit: 5 },
      { $project: {
          _id: 0,
          stokIsmi: "$_id",
          soldQuantity: 1
        }
      }
    ]);

    return NextResponse.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json({ error: 'Failed to fetch top products' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { mongooseConnect } from "@/lib/mongoose";
import Order from '@/app/models/orderModel';
import User from '@/app/models/userModel'; // Make sure you have a User model
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import Cart from '@/app/models/cartModel';
import mongoose from 'mongoose';

export async function GET(request) {
  await mongooseConnect();
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    
    const ordersWithUserInfo = await Promise.all(orders.map(async (order) => {
      const user = await User.findById(order.userId).lean();
      return {
        ...order,
        userName: user ? `${user.name || 'N/A'}` : 'Unknown User',
        userEmail: user ? user.email : 'Unknown Email',
      };
    }));

    return NextResponse.json(ordersWithUserInfo);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
export async function PUT(request) {
  await mongooseConnect();
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId, status } = await request.json();

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function POST(request) {
  await mongooseConnect();
  const session = await getServerSession(authOptions);
  
  console.log('Session:', session); // Log the session for debugging

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items, userId, createdBy } = await request.json();

    console.log('Received order data:', { items, userId, createdBy });

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    // Validate each item
    for (const item of items) {
      if (!item.stokIsmi || typeof item.stokIsmi !== 'string' || item.stokIsmi.trim() === '') {
        return NextResponse.json({ error: 'Invalid stokIsmi in items' }, { status: 400 });
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        return NextResponse.json({ error: 'Invalid quantity in items' }, { status: 400 });
      }
    }

    const order = new Order({
      userId,
      items: items.map(item => ({
        stokIsmi: item.stokIsmi,
        quantity: item.quantity
      })),
      status: 'pending',
      createdAt: new Date(),
      createdBy: session.user.id // Use the session user's ID
    });

    console.log('Order object before saving:', order);

    await order.save();

    console.log('Order saved successfully');

    return NextResponse.json({ message: 'Order created successfully', orderId: order._id });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: `Failed to create order: ${error.message}` }, { status: 500 });
  }
}


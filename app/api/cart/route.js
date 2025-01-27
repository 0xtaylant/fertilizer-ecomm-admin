import { NextResponse } from 'next/server';
import { mongooseConnect } from "@/lib/mongoose";
import Cart from '@/app/models/cartModel';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  await mongooseConnect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const cartItems = await Cart.find({ userId });
    return NextResponse.json(cartItems);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request) {
  await mongooseConnect();
  const { userId, stokIsmi, quantity } = await request.json();

  if (!userId || !stokIsmi || !quantity) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    let cartItem = await Cart.findOne({ userId, stokIsmi });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new Cart({ userId, stokIsmi, quantity });
      await cartItem.save();
    }
    const updatedCart = await Cart.find({ userId });
    return NextResponse.json(updatedCart);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PUT(request) {
  await mongooseConnect();
  const { userId, stokIsmi, quantity } = await request.json();

  if (!userId || !stokIsmi || quantity === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await Cart.findOneAndUpdate({ userId, stokIsmi }, { quantity });
    const updatedCart = await Cart.find({ userId });
    return NextResponse.json(updatedCart);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(request) {
  await mongooseConnect();
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const result = await Cart.deleteMany({ userId: userId });
    console.log('Cart deletion result:', result);

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'No items found in cart to delete' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Cart items deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting cart items:', error);
    return NextResponse.json({ error: `Failed to delete cart items: ${error.message}` }, { status: 500 });
  }
}
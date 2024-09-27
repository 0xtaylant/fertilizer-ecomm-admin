import { NextResponse } from 'next/server';
import { mongooseConnect } from "@/lib/mongoose";
import User from '@/app/models/userModel';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
  await mongooseConnect();
  const session = await getServerSession(authOptions);
  
  try {
    const users = await User.find().select('_id name email role');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request) {
  await mongooseConnect();
  const { userId, role } = await request.json();
  try {
    await User.findByIdAndUpdate(userId, { role });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
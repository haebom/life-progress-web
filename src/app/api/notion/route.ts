import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Coming Soon' }, { status: 503 });
}

export async function POST() {
  return NextResponse.json({ message: 'Coming Soon' }, { status: 503 });
} 
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'Book submissions are not connected to Supabase yet.',
  }, { status: 501 });
}

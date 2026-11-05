import { NextResponse } from 'next/server';
import { books } from '@/lib/data';

export async function GET() {
  return NextResponse.json({
    count: books.length,
    books,
  });
}

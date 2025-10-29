import { NextResponse } from 'next/server';

export async function POST() {
  // Create response
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear session cookie
  response.cookies.delete('qms-session');

  return response;
}

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return static options for "admin" and "demo"
    const users = [
      { id: 'admin', fullName: 'Admin User' },
      { id: 'demo', fullName: 'Demo User' },
    ];

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch users' });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production'
  ? 'https://haebomcode.vercel.app/api/auth/notion/callback'
  : 'http://localhost:3000/api/auth/notion/callback';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Notion OAuth error:', error);
    return NextResponse.redirect('/dashboard?error=notion_auth_failed');
  }

  if (!code) {
    return NextResponse.redirect('/dashboard?error=no_code');
  }

  try {
    // Exchange code for access token
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    
    // Store the access token securely
    const cookieStore = cookies();
    cookieStore.set('notion_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Store workspace info if needed
    if (data.workspace_name && data.workspace_icon) {
      cookieStore.set('notion_workspace_info', JSON.stringify({
        name: data.workspace_name,
        icon: data.workspace_icon,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
    }

    // Redirect back to dashboard with success message
    return NextResponse.redirect('/dashboard?notion=connected');
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.redirect('/dashboard?error=token_exchange_failed');
  }
} 
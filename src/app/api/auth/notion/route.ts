import { NextResponse } from 'next/server';

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const REDIRECT_URI = process.env.NODE_ENV === 'production'
  ? 'https://haebomcode.vercel.app/api/auth/notion/callback'
  : 'http://localhost:3000/api/auth/notion/callback';

export async function GET() {
  const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
  authUrl.searchParams.append('client_id', NOTION_CLIENT_ID || '');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('owner', 'user');
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('scope', [
    'read_user',
    'read_databases',
    'write_databases',
    'read_pages',
    'write_pages',
  ].join(' '));
  
  return NextResponse.redirect(authUrl.toString());
} 
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const notionToken = cookieStore.get('notion_access_token');
  
  return NextResponse.json({
    connected: !!notionToken,
    workspace: cookieStore.get('notion_workspace_info')?.value
      ? JSON.parse(cookieStore.get('notion_workspace_info')?.value || '{}')
      : null
  });
} 
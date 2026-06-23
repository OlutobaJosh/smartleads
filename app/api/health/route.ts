import { NextResponse } from 'next/server';

// Lightweight endpoint — used by UptimeRobot to keep the Render
// free-tier server alive. No DB calls, no AI calls. Just a fast 200.
export async function GET() {
  return NextResponse.json({ status: 'ok', ts: Date.now() });
}

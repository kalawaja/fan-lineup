import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('team');
  
  const res = await fetch(
    `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
    { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! } }
  );
  
  const data = await res.json();
  const players = data.response?.[0]?.players || [];
  
  return NextResponse.json({ players });
}
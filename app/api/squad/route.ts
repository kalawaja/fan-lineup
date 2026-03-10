import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('team');
  const key = process.env.API_FOOTBALL_KEY;
  
  const res = await fetch(
    `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
    { headers: { 'x-apisports-key': key! } }
  );
  
  const data = await res.json();
  
  return NextResponse.json({ 
    teamId,
    keyExists: !!key,
    responseLength: data.response?.length,
    raw: data 
  });
}
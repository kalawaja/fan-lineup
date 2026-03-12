import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('team');
  const today = new Date().toISOString().split('T')[0];
  const end = new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0];
  
  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures?team=${teamId}&season=2024&from=${today}&to=${end}`,
    { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! } }
  );
  const data = await res.json();
  const fixtures = (data.response || []).map((f: any) => ({
    fixtureId: f.fixture.id,
    kickoff: f.fixture.date,
    opponent: f.teams.home.id == teamId ? f.teams.away.name : f.teams.home.name,
    venue: f.fixture.venue?.name || "",
    competition: f.league.name,
  }));
  return NextResponse.json({ fixtures });
}
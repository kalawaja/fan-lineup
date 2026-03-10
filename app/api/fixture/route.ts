import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('team');

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${teamId}&next=1`,
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! } }
    );
    const data = await res.json();
    const f = data.response?.[0];

    if (!f) return NextResponse.json({ fixture: null });

    return NextResponse.json({
      fixture: {
        kickoff: f.fixture.date,
        opponent: f.teams.home.id === Number(teamId)
          ? f.teams.away.name
          : f.teams.home.name,
        venue: f.fixture.venue?.name || '',
        fixtureId: f.fixture.id,
      }
    });
  } catch (e) {
    return NextResponse.json({ error: 'API hatası', fixture: null }, { status: 500 });
  }
}

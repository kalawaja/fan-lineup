import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('team');
  const leagueId = req.nextUrl.searchParams.get('league') || '203';

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/injuries?team=${teamId}&league=${leagueId}&season=2024`,
      { headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! } }
    );
    const data = await res.json();

    const injuries = (data.response || []).map((item: any) => ({
      playerId: item.player.id,
      playerName: item.player.name,
      type: item.player.type,    // "Injury" veya "Suspension"
      reason: item.player.reason,
    }));

    return NextResponse.json({ injuries });
  } catch (e) {
    return NextResponse.json({ error: 'API hatası', injuries: [] }, { status: 500 });
  }
}
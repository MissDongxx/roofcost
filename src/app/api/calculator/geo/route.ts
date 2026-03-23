import { NextResponse } from 'next/server';
import geoDataRaw from '@/data/geo-cost-index.json';

const GEO_DATA: Record<string, any> = geoDataRaw;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  if (!zip || zip.length !== 5) {
    return NextResponse.json({ error: 'Invalid ZIP code' }, { status: 400 });
  }

  const data = GEO_DATA[zip];
  if (!data) {
    return NextResponse.json({ error: 'ZIP code not found' }, { status: 404 });
  }

  return NextResponse.json({
    state_code: data.state_code,
    metro_area: data.metro_area,
  });
}

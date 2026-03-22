import { NextRequest, NextResponse } from "next/server";

// GET /api/songsterr-search?pattern=coldplay&size=10
// Server-side proxy for Songsterr search API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pattern = searchParams.get("pattern") || "";
  const size = searchParams.get("size") || "10";

  if (!pattern) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://www.songsterr.com/api/songs?pattern=${encodeURIComponent(pattern)}&size=${encodeURIComponent(size)}`
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Songsterr API hatası" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Songsterr API isteği başarısız" },
      { status: 500 }
    );
  }
}

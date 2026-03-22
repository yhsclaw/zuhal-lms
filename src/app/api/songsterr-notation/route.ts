import { NextRequest, NextResponse } from "next/server";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const songId = searchParams.get("songId");
  const trackIndex = searchParams.get("trackIndex");
  const artist = searchParams.get("artist");
  const title = searchParams.get("title");

  if (!songId || !trackIndex || !artist || !title) {
    return NextResponse.json(
      { error: "songId, trackIndex, artist ve title parametreleri gerekli" },
      { status: 400 }
    );
  }

  const artistSlug = toSlug(artist);
  const titleSlug = toSlug(title);
  const url = `https://www.songsterr.com/a/wsa/${artistSlug}-${titleSlug}-drum-tab-s${songId}t${trackIndex}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.songsterr.com/",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Songsterr sayfası yüklenemedi (HTTP ${response.status})` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Extract SVG elements from the HTML
    const svgRegex = /<svg[^>]*>[\s\S]*?<\/svg>/gi;
    const svgMatches = html.match(svgRegex);

    if (!svgMatches || svgMatches.length === 0) {
      // Try to find SVG data in script tags (Next.js/React hydration data)
      const svgDataRegex = /<svg[^>]*(?:viewBox|xmlns)[^>]*>[\s\S]*?<\/svg>/gi;
      const svgDataMatches = html.match(svgDataRegex);

      if (!svgDataMatches || svgDataMatches.length === 0) {
        return NextResponse.json(
          {
            error:
              "Notasyon yüklenemedi, Songsterr erişimi kısıtlı olabilir. Sayfa SVG içermiyor olabilir.",
            debug: {
              url,
              htmlLength: html.length,
              htmlSnippet: html.substring(0, 500),
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({ svgs: svgDataMatches, url });
    }

    // Filter out small icon SVGs, keep only notation SVGs
    const notationSvgs = svgMatches.filter((svg) => {
      // Keep SVGs that have viewBox with substantial dimensions or are large
      const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
      if (viewBoxMatch) {
        const parts = viewBoxMatch[1].split(/\s+/).map(Number);
        if (parts.length === 4) {
          const width = parts[2];
          const height = parts[3];
          // Only keep SVGs that are reasonably large (notation sheets)
          if (width > 100 && height > 50) return true;
        }
      }
      // Keep SVGs larger than 500 chars (likely notation, not icons)
      return svg.length > 500;
    });

    return NextResponse.json({
      svgs: notationSvgs.length > 0 ? notationSvgs : svgMatches,
      url,
    });
  } catch (error) {
    console.error("Songsterr fetch error:", error);
    return NextResponse.json(
      {
        error: "Notasyon yüklenemedi, Songsterr erişimi kısıtlı olabilir",
      },
      { status: 502 }
    );
  }
}

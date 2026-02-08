export interface SerpApiPlaceResult {
  name: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  category?: string;
}

export let lastDebug = "";

export async function fetchNaverPlaceViaSerpApi(
  placeId: string
): Promise<SerpApiPlaceResult | null> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    lastDebug = "no_api_key";
    return null;
  }

  try {
    // Use Google to find the Naver Place page — Google indexes these pages
    const searchUrl = new URL("https://serpapi.com/search.json");
    searchUrl.searchParams.set("engine", "google");
    searchUrl.searchParams.set(
      "q",
      `"${placeId}" 네이버 플레이스`
    );
    searchUrl.searchParams.set("hl", "ko");
    searchUrl.searchParams.set("gl", "kr");
    searchUrl.searchParams.set("api_key", apiKey);

    const res = await fetch(searchUrl.toString(), {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      lastDebug = `http_${res.status}`;
      return null;
    }

    const data = await res.json();

    if (data.error) {
      lastDebug = `err:${data.error}`;
      return null;
    }

    const keys = Object.keys(data).filter(
      (k) => k !== "search_metadata" && k !== "search_parameters" && k !== "search_information"
    );
    lastDebug = `keys:[${keys.join(",")}]`;

    // Check knowledge_graph (Google sometimes shows rich data)
    const kg = data.knowledge_graph as Record<string, unknown> | undefined;
    if (kg?.title) {
      lastDebug += "|src:kg";
      return {
        name: kg.title as string,
        rating: kg.rating as number | undefined,
        reviewCount: kg.reviews as number | undefined,
        address: kg.address as string | undefined,
        category: kg.type as string | undefined,
      };
    }

    // Check organic results for the Naver Place page
    const organic = data.organic_results as Record<string, unknown>[] | undefined;
    if (organic && organic.length > 0) {
      for (const item of organic) {
        const link = item.link as string | undefined;
        const title = item.title as string | undefined;
        if (link?.includes("place.naver.com") && title) {
          // Clean up title — remove " : 네이버" suffix etc.
          const cleanName = title
            .replace(/\s*[:·\-|]\s*네이버.*$/i, "")
            .replace(/\s*-\s*지도.*$/i, "")
            .trim();
          lastDebug += `|src:organic`;
          return { name: cleanName || title };
        }
      }

      // Use first result even if not place.naver.com
      const first = organic[0];
      if (first.title) {
        const title = first.title as string;
        const cleanName = title
          .replace(/\s*[:·\-|]\s*네이버.*$/i, "")
          .trim();
        lastDebug += `|src:first_organic`;
        return { name: cleanName || title };
      }
    }

    lastDebug += "|no_results";
    return null;
  } catch (e) {
    lastDebug = `error:${e instanceof Error ? e.message : String(e)}`;
    return null;
  }
}

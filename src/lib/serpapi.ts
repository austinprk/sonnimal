export interface SerpApiPlaceResult {
  name: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  category?: string;
}

// Expose debug info for troubleshooting
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
    // Search Naver with the place URL
    const searchUrl = new URL("https://serpapi.com/search.json");
    searchUrl.searchParams.set("engine", "naver");
    searchUrl.searchParams.set(
      "query",
      `m.place.naver.com/restaurant/${placeId}`
    );
    searchUrl.searchParams.set("where", "nexearch");
    searchUrl.searchParams.set("api_key", apiKey);

    const res = await fetch(searchUrl.toString(), {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      lastDebug = `http_${res.status}`;
      return null;
    }

    const data = await res.json();

    // Log top-level keys for debugging
    const keys = Object.keys(data).filter(
      (k) => k !== "search_metadata" && k !== "search_parameters"
    );
    lastDebug = `keys:[${keys.join(",")}]`;

    // If SerpApi returned an error, capture it
    if (data.error) {
      lastDebug += `|err:${data.error}`;
      return null;
    }

    // Try first result set
    const place = extractPlaceFromResults(data);
    if (place) return place;

    lastDebug += "|no_match_in_first";
    return null;
  } catch (e) {
    lastDebug = `error:${e instanceof Error ? e.message : String(e)}`;
    return null;
  }
}

function extractPlaceFromResults(
  data: Record<string, unknown>
): SerpApiPlaceResult | null {
  // Check knowledge_graph
  const kg = data.knowledge_graph as Record<string, unknown> | undefined;
  if (kg?.title) {
    return {
      name: kg.title as string,
      rating: kg.rating as number | undefined,
      reviewCount: kg.review_count as number | undefined,
      address: kg.address as string | undefined,
      category: kg.category as string | undefined,
    };
  }

  // Check places_results
  const places = data.places_results as Record<string, unknown>[] | undefined;
  if (places && places.length > 0) {
    const p = places[0];
    return {
      name: (p.title || p.name) as string,
      rating: p.rating as number | undefined,
      reviewCount: (p.review_count || p.reviews) as number | undefined,
      address: p.address as string | undefined,
      category: p.category as string | undefined,
    };
  }

  // Check local_results
  const locals = data.local_results as Record<string, unknown>[] | undefined;
  if (locals && locals.length > 0) {
    const l = locals[0];
    return {
      name: (l.title || l.name) as string,
      rating: l.rating as number | undefined,
      reviewCount: l.review_count as number | undefined,
      address: l.address as string | undefined,
      category: l.category as string | undefined,
    };
  }

  // Check organic results
  const organic = data.organic_results as
    | Record<string, unknown>[]
    | undefined;
  if (organic && organic.length > 0) {
    for (const item of organic) {
      const link = item.link as string | undefined;
      if (link?.includes("place.naver.com") && item.title) {
        return { name: item.title as string };
      }
    }
    if (organic[0].title) {
      return { name: organic[0].title as string };
    }
  }

  // Check any other array fields that might contain results
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (Array.isArray(val) && val.length > 0 && val[0]?.title) {
      return { name: val[0].title as string };
    }
    if (
      typeof val === "object" &&
      val !== null &&
      !Array.isArray(val) &&
      (val as Record<string, unknown>).title
    ) {
      return { name: (val as Record<string, unknown>).title as string };
    }
  }

  return null;
}

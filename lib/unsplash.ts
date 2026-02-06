import { z } from "zod";

export const UnsplashPhotoSchema = z.object({
  id: z.string(),
  urls: z.object({
    regular: z.string().url().optional(),
    full: z.string().url().optional(),
  }),
  links: z.object({
    html: z.string().url().optional(),
  }),
  user: z.object({
    name: z.string().optional(),
    username: z.string().optional(),
  }),
});

export const UnsplashSearchResponseSchema = z.object({
  results: z.array(UnsplashPhotoSchema),
});
export type UnsplashPhoto = z.infer<typeof UnsplashPhotoSchema>;
export type UnsplashSearchResponse = z.infer<
  typeof UnsplashSearchResponseSchema
>;
export type UnsplashAttribution = {
  photographerName: string | null;
  photographerUsername: string | null;
  photoUrl: string | null;
  attributionUrl: string | null;
};
export type UnsplashToolResult = {
  publicPath: string;
  localFile: string;
  attribution: UnsplashAttribution;
};

export async function searchUnsplashPhoto(params: {
  accessKey: string;
  query: string;
  orientation?: "landscape" | "portrait" | "squarish" | null;
}): Promise<UnsplashSearchResponse> {
  const qs = new URLSearchParams({
    query: params.query,
    per_page: "1",
    content_filter: "high",
  });

  if (params.orientation) qs.set("orientation", params.orientation);

  const url = `https://api.unsplash.com/search/photos?${qs.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${params.accessKey}`,
      "Accept-Version": "v1",
    },
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Unsplash error: ${res.status} ${t}`);
  }

  const raw: unknown = await res.json();

  return UnsplashSearchResponseSchema.parse(raw);
}

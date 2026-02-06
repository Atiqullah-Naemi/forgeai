import { zodResponseFormat } from "openai/helpers/zod";
import { DESIGN_PROMPT } from "@/inngest/prompt";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI();

const DesignSpecSchema = z.object({
  meta: z.object({
    title: z.string(),
    mode: z.enum(["match_layout", "modernize"]),
    uncertainties: z.array(z.string()),
  }),
  theme: z.object({
    primaryColorHex: z.string().nullable(),
    backgroundColorHex: z.string().nullable(),
    textColorHex: z.string().nullable(),
    radius: z.enum(["sm", "md", "lg", "xl"]),
    fontStyle: z.enum(["modern_sans", "classic_sans", "serif"]).nullable(),
  }),
  pages: z.array(
    z.object({
      route: z.string(),
      sections: z.array(
        z.object({
          type: z.string(),
          layout: z.object({
            container: z.enum(["sm", "md", "lg"]),
            columns: z.number().int().min(1).max(6),
            align: z.enum(["left", "center"]),
          }),
          content: z.object({
            heading: z.string().nullable(),
            subheading: z.string().nullable(),
            body: z.string().nullable(),
            buttons: z.array(
              z.object({
                label: z.string(),
                variant: z.enum(["default", "outline", "secondary"]),
              })
            ),
            items: z.array(
              z.object({
                title: z.string().nullable(),
                description: z.string().nullable(),
              })
            ),
          }),
          media: z.array(
            z.object({
              kind: z.literal("image_placeholder"),
              aspect: z.enum(["square", "video", "wide"]),
              alt: z.string().nullable(),
            })
          ),
        })
      ),
    })
  ),
});

export async function extractDesignSpecFromImage(params: {
  imageUrl: string;
  userHint: string | null;
}) {
  const response = await openai.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content: DESIGN_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Return JSON that matches the required schema. User hint: ${
              params.userHint ?? ""
            }`,
          },
          {
            type: "image_url",
            image_url: {
              url: params.imageUrl,
            },
          },
        ],
      },
    ],

    response_format: zodResponseFormat(DesignSpecSchema, "design_spec"),
    temperature: 0.1,
  });

  const result = response.choices[0].message.parsed;

  if (!result) {
    throw new Error("Failed to parse the design specification");
  }

  return result;
}

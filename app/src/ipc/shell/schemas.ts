import z from "zod";

export const openExternalLinkInputSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (url) => {
        try {
          return ["http:", "https:"].includes(new URL(url).protocol);
        } catch {
          return false;
        }
      },
      { message: "Only http:// and https:// URLs are allowed" }
    ),
});

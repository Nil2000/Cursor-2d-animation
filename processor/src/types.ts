import { z } from "zod";

export const videoPayloadSchema = z.object({
  id: z.string().min(1),
});

export const uploadVideoPayloadSchema = z.object({
  id: z.string().min(1),
  url: z.string().optional(),
  quality: z.string().optional(),
});

export const processMessagePayloadSchema = z.object({
  chatId: z.string().min(1),
  code: z.string().min(1),
  videos: z.array(videoPayloadSchema).min(1),
});

export type VideoPayload = z.infer<typeof uploadVideoPayloadSchema>;
export type ProcessMessagePayload = z.infer<typeof processMessagePayloadSchema>;

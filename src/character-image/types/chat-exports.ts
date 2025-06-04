import { z } from "zod";

// VERSION 1

const V1ChatItemsZod = z.object({
  input: z.string(),
  output: z.string(),
  createdAt: z.string(),
});

const V1ChatZod = z.object({
  ChatItems: z.array(V1ChatItemsZod),
});

const V1ExportVersionZodType = z.literal(1);

export type V1ChatExportVersion = z.infer<typeof V1ExportVersionZodType>;

const V1BackyardChatExportZodType = z.object({
  chat: V1ChatZod,
  version: V1ExportVersionZodType,
});

export type BackyardChatExportV1 = z.infer<typeof V1BackyardChatExportZodType>;

// function that parses as a ChatZodType
export const isBackyardChatExportV1 = (
  character: any
): character is BackyardChatExportV1 => {
  const { success } = V1BackyardChatExportZodType.safeParse(character);
  return success;
};

// VERSION 2

const V2ChatItemsZod = z.object({
  input: z.string(),
  output: z.string(),
  createdAt: z.number(),
});

const V2ChatZod = z.object({
  ChatItems: z.array(V2ChatItemsZod),
});

const V2ExportVersionZodType = z.literal(2);

export type V2ChatExportVersion = z.infer<typeof V2ExportVersionZodType>;

const V2BackyardChatExportZodType = z.object({
  chat: V2ChatZod,
  version: V2ExportVersionZodType,
});

export type BackyardChatExportV2 = z.infer<typeof V2BackyardChatExportZodType>;

// function that parses as a ChatZodType
export const isBackyardChatExportV2 = (
  character: any
): character is BackyardChatExportV1 => {
  const { success } = V2BackyardChatExportZodType.safeParse(character);
  return success;
};

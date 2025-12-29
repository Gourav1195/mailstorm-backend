// src/services/audienceService.ts
import Audience from "../models/Audience";
import { buildAudienceQuery } from "../utils/buildAudienceQuery";

export async function getAudienceByFilter(filter: any) {
  const mongoQuery = buildAudienceQuery(filter);
  console.log("[audience-query]", JSON.stringify(mongoQuery, null, 2));

  return Audience.find(mongoQuery).lean();
}

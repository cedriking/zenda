// Transitional: re-export prisma client as `db` so existing imports still work
// during migration from Drizzle to Prisma. Once all files are converted,
// this file will be replaced with a direct prisma export.

export { Prisma } from "@prisma/client";
export { prisma as db, prisma } from "./prisma-client.js";

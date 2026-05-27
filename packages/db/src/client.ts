// biome-ignore lint/performance/noBarrelFile: intentional re-export for backward-compatible imports
export { Prisma } from "@prisma/client";
export { prisma as db, prisma } from "./prisma-client.js";

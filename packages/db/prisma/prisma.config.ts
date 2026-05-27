import path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  earlyAccess: true,
  schema: path.join(__dirname, "schema.prisma"),
  migrate: {
    async url() {
      return process.env.DATABASE_URL ?? "postgres://zenda:zenda_dev@localhost:5432/zenda";
    },
  },
} satisfies PrismaConfig;

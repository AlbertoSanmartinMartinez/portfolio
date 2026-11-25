import { lt } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { ContactStore } from "@/contact/service";
import { contactMessage } from "./schema";

export function createContactStore(db: NodePgDatabase): ContactStore {
  return {
    async insert(message) {
      const [row] = await db.insert(contactMessage).values(message).returning({ id: contactMessage.id });
      return row;
    },
    async deleteOlderThan(date) {
      const rows = await db.delete(contactMessage).where(lt(contactMessage.createdAt, date)).returning({ id: contactMessage.id });
      return rows.length;
    },
  };
}

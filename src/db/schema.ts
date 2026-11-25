import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Contact messages: personal data, kept 12 months (docs/guides/privacy.md). */
export const contactMessage = pgTable(
  "contact_message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    message: text("message").notNull(),
    locale: text("locale").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("contact_message_created_at_idx").on(table.createdAt)],
);

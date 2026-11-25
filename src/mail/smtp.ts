import nodemailer from "nodemailer";
import type { Mailer } from "@/contact/service";

export type SmtpConfig = { host: string; port: number; user?: string; password?: string; from: string; to: string };

/** Sends each message to Alberto as plain text, with the sender as reply-to. */
export function createSmtpMailer(config: SmtpConfig): Mailer {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user ? { user: config.user, pass: config.password } : undefined,
  });
  return {
    async send(message) {
      await transport.sendMail({
        from: config.from,
        to: config.to,
        replyTo: { name: message.name, address: message.email },
        subject: `Portfolio: message from ${message.name}`,
        text: `${message.message}\n\n— ${message.name} <${message.email}> · ${message.locale} · ${message.id}`,
      });
    },
  };
}

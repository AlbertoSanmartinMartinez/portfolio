"use client";

import { useState } from "react";
import { validateContact, type FieldErrorCode, type FieldErrors, type Locale } from "@/contact/rules";
import type { Dictionary } from "@/i18n/dictionaries";
import { api } from "@/lib/api/client";
import styles from "./site.module.css";

type Field = "name" | "email" | "message";
type Status = "idle" | "sending" | "success" | "rate_limited" | "failure";

const empty = { name: "", email: "", message: "", website: "" };

export function ContactForm({ lang, copy, privacyHref }: { lang: Locale; copy: Dictionary["contactForm"]; privacyHref: string }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const message = (field: Field, code: FieldErrorCode) =>
    field === "name" && code === "too_long" ? copy.errors.too_long_name : copy.errors[code];

  function update(field: keyof typeof empty, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (status !== "sending") setStatus("idle");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    const first = (["name", "email", "message"] as const).find((f) => found[f]);
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const { response, error } = await api.POST("/api/v1/contact", { body: { ...values, locale: lang } });
      if (response.status === 201) {
        setValues(empty);
        setStatus("success");
      } else if (response.status === 400 && error && "fields" in error) {
        setErrors(error.fields);
        setStatus("idle");
      } else {
        setStatus(response.status === 429 ? "rate_limited" : "failure");
      }
    } catch {
      setStatus("failure");
    }
  }

  const field = (name: Field, label: string, input: React.ReactNode) => (
    <div className={styles.field}>
      <label htmlFor={`contact-${name}`}>{label}</label>
      {input}
      {errors[name] && (
        <p id={`contact-${name}-error`} className={styles.fieldError}>
          {message(name, errors[name])}
        </p>
      )}
    </div>
  );
  const describedBy = (name: Field) => (errors[name] ? `contact-${name}-error` : undefined);

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {field(
        "name",
        copy.name,
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          value={values.name}
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("name")}
          onChange={(e) => update("name", e.target.value)}
        />,
      )}
      {field(
        "email",
        copy.email,
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("email")}
          onChange={(e) => update("email", e.target.value)}
        />,
      )}
      {field(
        "message",
        copy.message,
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={values.message}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
          onChange={(e) => update("message", e.target.value)}
        />,
      )}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-website">{copy.honeypot}</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>
      <p className={styles.muted}>
        {copy.privacyNotice} <a href={privacyHref}>{copy.privacyLink}</a>.
      </p>
      <div className={styles.formFooter}>
        <button type="submit" className={styles.button} disabled={status === "sending"}>
          {status === "sending" ? copy.sending : copy.send}
        </button>
        <p role="status" aria-live="polite" className={status === "success" ? styles.success : styles.fieldError}>
          {status === "success" ? copy.success : status === "rate_limited" ? copy.rateLimited : status === "failure" ? copy.failure : ""}
        </p>
      </div>
    </form>
  );
}

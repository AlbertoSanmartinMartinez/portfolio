import type { Locale } from "./config";

type Section = { heading: string; body: string[] };

/** Privacy text for the contact form (specs/002, docs/guides/privacy.md). Not legal advice: Alberto reviews it. */
export const privacyPolicy: Record<Locale, { path: string; sections: Section[] }> = {
  es: {
    path: "/es/privacidad",
    sections: [
      { heading: "Responsable", body: ["Alberto Sanmartín Martínez. Contacto: info@albertosanmartinmartinez.es."] },
      {
        heading: "Qué datos trato",
        body: [
          "El nombre, el email y el mensaje que envías con el formulario de contacto.",
          "La web no usa analítica ni cookies de seguimiento. Solo guarda tu elección de idioma en una cookie propia, sin identificarte.",
        ],
      },
      { heading: "Para qué y con qué base", body: ["Para responder a tu mensaje. La base es tu consentimiento al enviarlo."] },
      { heading: "Cuánto tiempo", body: ["12 meses desde que lo recibo. Después se borra."] },
      {
        heading: "Quién más los trata",
        body: [
          "DigitalOcean, que aloja la web y su base de datos en Fráncfort (Unión Europea), y el servicio de correo de mi dominio, como encargados del tratamiento. No se ceden a nadie más.",
        ],
      },
      {
        heading: "Tus derechos",
        body: [
          "Puedes pedir el acceso, la rectificación, la supresión, la limitación, la portabilidad o oponerte al tratamiento escribiendo a info@albertosanmartinmartinez.es.",
          "También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).",
        ],
      },
    ],
  },
  en: {
    path: "/en/privacy",
    sections: [
      { heading: "Who is responsible", body: ["Alberto Sanmartín Martínez. Contact: info@albertosanmartinmartinez.es."] },
      {
        heading: "What data I process",
        body: [
          "The name, email and message you send with the contact form.",
          "The site uses no analytics or tracking cookies. It only keeps your language choice in a first-party cookie that doesn't identify you.",
        ],
      },
      { heading: "Why and on what basis", body: ["To reply to your message. The basis is your consent when you send it."] },
      { heading: "How long", body: ["12 months from when I receive it. Then it is deleted."] },
      {
        heading: "Who else processes it",
        body: [
          "DigitalOcean, which hosts the site and its database in Frankfurt (European Union), and the email service of my domain, as processors. It is not shared with anyone else.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask for access, rectification, erasure, restriction, portability, or object to the processing by writing to info@albertosanmartinmartinez.es.",
          "You can also complain to the Spanish Data Protection Agency (aepd.es).",
        ],
      },
    ],
  },
};

import type { Language } from "./language";

export default [
  {
    key: "en",
    nativeName: "English",
    prefix: "EN",
  },
  {
    key: "es",
    nativeName: "Español",
    prefix: "ES",
  },
] as const satisfies Language[];

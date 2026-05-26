type Messages = typeof import("./i18n/locales/en.json");

declare module "next-intl" {
  interface IntlMessages extends Messages {}
}

import localFont from "next/font/local";

/**
 * Thmanyah Serif Display (Bold) for Arabic text.
 * `unicode-range` limits it to Arabic characters, so Latin text, digits and
 * punctuation keep using the site's normal font.
 */
export const arabicFont = localFont({
  src: [
    {
      path: "../public/fonts/thmanyahserifdisplay-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-arabic",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF",
    },
  ],
});

/** Arabic font first, then the site's sans font, then system fallbacks. */
export const FONT_STACK =
  "var(--font-arabic), var(--font-sans, ui-sans-serif), system-ui, sans-serif";

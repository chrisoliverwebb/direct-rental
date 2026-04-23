export type BrandFont = {
  id: string;
  label: string;
  fontFamily: string;
  emailSafe: boolean;
};

export const BRAND_FONTS: BrandFont[] = [
  {
    id: "arial",
    label: "Arial",
    fontFamily: "Arial, Helvetica, sans-serif",
    emailSafe: true,
  },
  {
    id: "georgia",
    label: "Georgia",
    fontFamily: "Georgia, 'Times New Roman', serif",
    emailSafe: true,
  },
  {
    id: "verdana",
    label: "Verdana",
    fontFamily: "Verdana, Arial, sans-serif",
    emailSafe: true,
  },
  {
    id: "tahoma",
    label: "Tahoma",
    fontFamily: "Tahoma, Arial, sans-serif",
    emailSafe: true,
  },
  {
    id: "inter",
    label: "Inter",
    fontFamily: "'Inter', Arial, sans-serif",
    emailSafe: false,
  },
  {
    id: "roboto",
    label: "Roboto",
    fontFamily: "'Roboto', Arial, sans-serif",
    emailSafe: false,
  },
  {
    id: "open-sans",
    label: "Open Sans",
    fontFamily: "'Open Sans', Arial, sans-serif",
    emailSafe: false,
  },
  {
    id: "lato",
    label: "Lato",
    fontFamily: "'Lato', Arial, sans-serif",
    emailSafe: false,
  },
  {
    id: "poppins",
    label: "Poppins",
    fontFamily: "'Poppins', Arial, sans-serif",
    emailSafe: false,
  },
  {
    id: "nunito",
    label: "Nunito",
    fontFamily: "'Nunito', Arial, sans-serif",
    emailSafe: false,
  },
  {
    id: "playfair",
    label: "Playfair Display",
    fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
    emailSafe: false,
  },
  {
    id: "merriweather",
    label: "Merriweather",
    fontFamily: "'Merriweather', Georgia, serif",
    emailSafe: false,
  },
  {
    id: "montserrat",
    label: "Montserrat",
    fontFamily: "'Montserrat', Arial, sans-serif",
    emailSafe: false,
  },
  {
    id: "raleway",
    label: "Raleway",
    fontFamily: "'Raleway', Arial, sans-serif",
    emailSafe: false,
  },
];

export const DEFAULT_BRAND_FONT = BRAND_FONTS[0];

export function getBrandFontById(fontId: string | null | undefined) {
  if (!fontId) {
    return undefined;
  }

  return BRAND_FONTS.find((font) => font.id === fontId);
}

export function getBrandFontByFontFamily(fontFamily: string | null | undefined) {
  if (!fontFamily) {
    return undefined;
  }

  return BRAND_FONTS.find((font) => font.fontFamily === fontFamily);
}

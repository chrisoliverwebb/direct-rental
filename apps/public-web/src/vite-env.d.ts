/// <reference types="vite/client" />

declare module "*.avif" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEETS_WEB_APP_URL?: string;
  readonly VITE_GOOGLE_SHEETS_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


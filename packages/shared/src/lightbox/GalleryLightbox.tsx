"use client";

import { useEffect, useId, useMemo, useRef } from "react";

const PHOTOSWIPE_STYLESHEET_URL = "https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.css";
const PHOTOSWIPE_STYLESHEET_ID = "repo-shared-photoswipe-stylesheet";
const PHOTOSWIPE_THEME_STYLE_ID = "repo-shared-photoswipe-theme";
const PHOTOSWIPE_LIGHTBOX_MODULE_URL = "https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe-lightbox.esm.min.js";
const PHOTOSWIPE_MODULE_URL = "https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.esm.min.js";
const DEFAULT_SLIDE_WIDTH = 1600;
const DEFAULT_SLIDE_HEIGHT = 1000;

type GalleryLightboxController = {
  pswp?: {
    currIndex: number;
    ui?: {
      registerElement: (element: {
        name: string;
        order: number;
        isButton: boolean;
        title: string;
        ariaLabel: string;
        html: string;
        onInit?: (element: HTMLButtonElement) => void;
        onClick?: (
          event: MouseEvent,
          element: HTMLButtonElement,
          pswp?: { currIndex: number },
        ) => void | Promise<void>;
      }) => void;
    };
    goTo: (index: number) => void;
    close: () => void;
  };
  on: (eventName: string, callback: () => void) => void;
  init: () => void;
  destroy: () => void;
  loadAndOpen: (index: number) => void;
};

export type GalleryLightboxItem = {
  src: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  shareUrl?: string | null;
};

export function GalleryLightbox({
  items,
  open,
  index = 0,
  galleryId,
  onOpenChange,
  onIndexChange,
}: {
  items: GalleryLightboxItem[];
  open: boolean;
  index?: number;
  galleryId?: string;
  onOpenChange?: (open: boolean) => void;
  onIndexChange?: (index: number) => void;
}) {
  const generatedId = useId();
  const lightboxRef = useRef<GalleryLightboxController | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const onIndexChangeRef = useRef(onIndexChange);
  const resolvedGalleryId = useMemo(
    () => galleryId ?? `repo-gallery-lightbox-${generatedId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [galleryId, generatedId],
  );
  const clampedIndex = Math.min(Math.max(index, 0), Math.max(items.length - 1, 0));

  onOpenChangeRef.current = onOpenChange;
  onIndexChangeRef.current = onIndexChange;

  useEffect(() => {
    ensurePhotoSwipeStyles();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    let cancelled = false;

    void loadPhotoSwipeLightboxModule().then(({ default: PhotoSwipeLightboxClass }) => {
      if (cancelled) return;

      const lightbox = new PhotoSwipeLightboxClass({
        gallery: `#${resolvedGalleryId}`,
        children: "a",
        bgOpacity: 1,
        showHideAnimationType: "zoom",
        pswpModule: () => loadPhotoSwipeModule(),
      }) as GalleryLightboxController;

      lightbox.on("uiRegister", () => {
        const ui = lightbox.pswp?.ui;
        if (!ui) return;

        ui.registerElement({
          name: "like-button",
          order: 11,
          isButton: true,
          title: "Like",
          ariaLabel: "Like image",
          html: "",
          onInit: (element) => {
            element.setAttribute("type", "button");
            element.dataset.liked = "false";
          },
          onClick: (_event, element) => {
            const isLiked = element.dataset.liked === "true";
            element.dataset.liked = isLiked ? "false" : "true";
            element.classList.toggle("is-active", !isLiked);
          },
        });

        ui.registerElement({
          name: "share-button",
          order: 12,
          isButton: true,
          title: "Share",
          ariaLabel: "Share image",
          html: "",
          onInit: (element) => {
            element.setAttribute("type", "button");
          },
          onClick: async (_event, element, pswp) => {
            const shareUrl = getShareUrl(items, pswp?.currIndex ?? lightbox.pswp?.currIndex ?? 0);
            const shareTitle = document.title || "Gallery";

            if (navigator.share) {
              try {
                await navigator.share({
                  title: shareTitle,
                  url: shareUrl,
                });
                return;
              } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                  return;
                }
              }
            }

            try {
              if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                element.classList.add("is-confirmed");
                window.setTimeout(() => {
                  element.classList.remove("is-confirmed");
                }, 1600);
                return;
              }
            } catch {
              // Fall through to the prompt fallback below.
            }

            window.prompt("Copy this link:", shareUrl);
          },
        });
      });

      lightbox.on("afterInit", () => {
        onOpenChangeRef.current?.(true);
      });

      lightbox.on("change", () => {
        const currentIndex = lightbox.pswp?.currIndex ?? 0;
        onIndexChangeRef.current?.(currentIndex);
      });

      lightbox.on("close", () => {
        onOpenChangeRef.current?.(false);
      });

      lightbox.init();
      lightboxRef.current = lightbox;
    });

    return () => {
      cancelled = true;
      lightboxRef.current?.destroy();
      lightboxRef.current = null;
    };
  }, [items, resolvedGalleryId]);

  useEffect(() => {
    const lightbox = lightboxRef.current;
    if (!lightbox || items.length === 0) return;

    if (open) {
      if (!lightbox.pswp) {
        lightbox.loadAndOpen(clampedIndex);
        return;
      }

      if (lightbox.pswp.currIndex !== clampedIndex) {
        lightbox.pswp.goTo(clampedIndex);
      }

      return;
    }

    if (lightbox.pswp) {
      lightbox.pswp.close();
    }
  }, [clampedIndex, items.length, open]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div id={resolvedGalleryId} className="repo-gallery-lightbox-source" aria-hidden="true">
      {items.map((item, itemIndex) => (
        <a
          key={`${item.src}-${itemIndex}`}
          href={item.src}
          data-pswp-width={item.width ?? DEFAULT_SLIDE_WIDTH}
          data-pswp-height={item.height ?? DEFAULT_SLIDE_HEIGHT}
          aria-label={item.alt ?? `Gallery image ${itemIndex + 1}`}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={item.src}
            alt={item.alt ?? ""}
            loading="lazy"
            decoding="async"
            className="repo-gallery-lightbox-source-image"
          />
        </a>
      ))}
    </div>
  );
}

function getShareUrl(items: GalleryLightboxItem[], index: number) {
  return items[index]?.shareUrl ?? items[index]?.src ?? window.location.href;
}

function ensurePhotoSwipeStyles() {
  if (typeof document === "undefined") return;

  if (!document.getElementById(PHOTOSWIPE_STYLESHEET_ID)) {
    const link = document.createElement("link");
    link.id = PHOTOSWIPE_STYLESHEET_ID;
    link.rel = "stylesheet";
    link.href = PHOTOSWIPE_STYLESHEET_URL;
    document.head.appendChild(link);
  }

  if (!document.getElementById(PHOTOSWIPE_THEME_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = PHOTOSWIPE_THEME_STYLE_ID;
    style.textContent = PHOTOSWIPE_THEME_CSS;
    document.head.appendChild(style);
  }
}

const PHOTOSWIPE_THEME_CSS = `
.repo-gallery-lightbox-source {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.repo-gallery-lightbox-source a,
.repo-gallery-lightbox-source img {
  display: block;
}

.pswp {
  z-index: 9999999999999 !important;
  --pswp-bg: #ffffff;
  --pswp-icon-color: #000000;
  --pswp-icon-color-secondary: #ffffff;
  --pswp-preloader-color: #000000;
}

.pswp__bg {
  background: #ffffff !important;
}

.pswp__counter,
.pswp__top-bar,
.pswp__button {
  color: #000000 !important;
}

.pswp__icn-shadow {
  display: none;
}

.pswp__top-bar .pswp__button {
  width: 54px;
  height: 54px;
}

.pswp__button--like-button,
.pswp__button--share-button {
  position: relative;
  width: 54px !important;
  height: 54px !important;
  min-width: 54px;
  padding: 0 !important;
  font-size: 0 !important;
  color: transparent !important;
}

.pswp__button--like-button.is-active,
.pswp__button--share-button.is-confirmed {
  transform: scale(1.04);
}

.pswp__button--arrow--prev .pswp__icn,
.pswp__button--arrow--next .pswp__icn,
.pswp__button--zoom .pswp__icn,
.pswp__button--close .pswp__icn {
  display: none;
}

.pswp__button--like-button::before,
.pswp__button--share-button::before,
.pswp__button--arrow--prev::before,
.pswp__button--arrow--next::before,
.pswp__button--zoom::before,
.pswp__button--close::before {
  content: "";
  display: block;
  width: 24px;
  height: 24px;
  margin: auto;
  background-color: #000000;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}

.pswp__button--close::before {
  width: 28px;
  height: 28px;
}

.pswp__button--like-button::before {
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.1 20.3l-.1.1-.1-.1C7.14 15.94 4 13.09 4 9.5 4 7 5.9 5 8.4 5c1.54 0 3.04.99 3.6 2.36h0C12.56 5.99 14.06 5 15.6 5 18.1 5 20 7 20 9.5c0 3.59-3.14 6.44-7.9 10.8z' fill='none' stroke='%23000' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.pswp__button--like-button.is-active::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12.1 20.3l-.1.1-.1-.1C7.14 15.94 4 13.09 4 9.5 4 7 5.9 5 8.4 5c1.54 0 3.04.99 3.6 2.36h0C12.56 5.99 14.06 5 15.6 5 18.1 5 20 7 20 9.5c0 3.59-3.14 6.44-7.9 10.8z' fill='%23d62828' stroke='%23d62828' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.pswp__button--share-button::before {
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='18' cy='5.5' r='2.1' fill='none' stroke='%23000' stroke-width='1.7'/%3E%3Ccircle cx='6' cy='12' r='2.1' fill='none' stroke='%23000' stroke-width='1.7'/%3E%3Ccircle cx='18' cy='18.5' r='2.1' fill='none' stroke='%23000' stroke-width='1.7'/%3E%3Cpath d='M7.9 11l8-4.3M7.9 13l8 4.3' fill='none' stroke='%23000' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E");
}

.pswp__button--share-button.is-confirmed::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='18' cy='5.5' r='2.1' fill='none' stroke='%23d62828' stroke-width='1.7'/%3E%3Ccircle cx='6' cy='12' r='2.1' fill='none' stroke='%23d62828' stroke-width='1.7'/%3E%3Ccircle cx='18' cy='18.5' r='2.1' fill='none' stroke='%23d62828' stroke-width='1.7'/%3E%3Cpath d='M7.9 11l8-4.3M7.9 13l8 4.3' fill='none' stroke='%23d62828' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E");
}

.pswp__button--arrow--prev::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M14.75 5.5L8.25 12l6.5 6.5' fill='none' stroke='%23000' stroke-width='1.85' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M14.75 5.5L8.25 12l6.5 6.5' fill='none' stroke='%23000' stroke-width='1.85' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.pswp__button--arrow--next::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9.25 5.5L15.75 12l-6.5 6.5' fill='none' stroke='%23000' stroke-width='1.85' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9.25 5.5L15.75 12l-6.5 6.5' fill='none' stroke='%23000' stroke-width='1.85' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.pswp__button--zoom::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8 4.75H4.75V8M16 4.75h3.25V8M19.25 16V19.25H16M8 19.25H4.75V16' fill='none' stroke='%23000' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8 4.75H4.75V8M16 4.75h3.25V8M19.25 16V19.25H16M8 19.25H4.75V16' fill='none' stroke='%23000' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

.pswp__button--close::before {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 6l12 12M18 6L6 18' fill='none' stroke='%23000' stroke-width='1.85' stroke-linecap='round'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 6l12 12M18 6L6 18' fill='none' stroke='%23000' stroke-width='1.85' stroke-linecap='round'/%3E%3C/svg%3E");
}
`;

function loadPhotoSwipeLightboxModule() {
  return loadRemoteModule<{ default: new (options: Record<string, unknown>) => GalleryLightboxController }>(
    PHOTOSWIPE_LIGHTBOX_MODULE_URL,
  );
}

function loadPhotoSwipeModule() {
  return loadRemoteModule<object>(PHOTOSWIPE_MODULE_URL);
}

function loadRemoteModule<T>(url: string) {
  return new Function(`return import(${JSON.stringify(url)})`)() as Promise<T>;
}

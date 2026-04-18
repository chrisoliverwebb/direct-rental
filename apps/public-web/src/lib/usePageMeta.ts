import { useEffect } from "react";

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;

    const descriptionTag =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
        return tag;
      })();

    descriptionTag.setAttribute("content", description);
  }, [description, title]);
}

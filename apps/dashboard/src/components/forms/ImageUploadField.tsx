"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

type ImageUploadFieldProps = {
  label: string;
  showLabel?: boolean;
  value: string;
  alt: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  emptyLabel?: string;
  emptyDescription?: string;
  previewClassName?: string;
};

export function ImageUploadField({
  label,
  showLabel = true,
  value,
  alt,
  onChange,
  onRemove,
  emptyLabel = "No image selected",
  emptyDescription,
  previewClassName = "h-28 w-full object-contain bg-white",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    try {
      setIsUploading(true);
      const dataUrl = await readImageFileAsDataUrl(file);
      onChange(dataUrl);
      toast.success("Image uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload image";
      toast.error("Upload failed", { description: message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        {showLabel ? <span className="text-sm font-medium text-slate-900">{label}</span> : null}
        <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={alt} className={previewClassName} />
          ) : (
            <div className="grid h-28 place-items-center px-4 text-center">
              <div className="grid gap-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-slate-900">{emptyLabel}</p>
                  {emptyDescription ? <p className="text-xs text-muted-foreground">{emptyDescription}</p> : null}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => inputRef.current?.click()}>
            {isUploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
          </Button>
          {value && onRemove ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              Remove
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            await handleFile(file);
          }}
        />
      </div>
    </div>
  );
}

function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = reader.result;
      if (typeof value === "string") {
        resolve(value);
        return;
      }

      reject(new Error("Unable to read image file"));
    };
    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });
}

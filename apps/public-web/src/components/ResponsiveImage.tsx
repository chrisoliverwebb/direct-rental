type ImageSource = {
  avif: string;
  webp: string;
  jpg: string;
  alt: string;
};

type ResponsiveImageProps = {
  image: ImageSource;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  loading?: "eager" | "lazy";
  decoding?: "sync" | "async" | "auto";
};

export function ResponsiveImage({
  image,
  className,
  imgClassName,
  sizes,
  loading = "lazy",
  decoding = "async",
}: ResponsiveImageProps) {
  return (
    <picture className={className}>
      <source srcSet={image.avif} type="image/avif" sizes={sizes} />
      <source srcSet={image.webp} type="image/webp" sizes={sizes} />
      <img
        src={image.jpg}
        alt={image.alt}
        loading={loading}
        decoding={decoding}
        sizes={sizes}
        className={imgClassName}
      />
    </picture>
  );
}

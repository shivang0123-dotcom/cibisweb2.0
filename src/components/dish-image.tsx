import Image from "next/image";

type DishImageProps = {
  src: string;
  alt?: string;
  className: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
};

export function DishImage({ src, alt = "", className, width, height, sizes, priority }: DishImageProps) {
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("http")}
      className={className}
    />
  );
}

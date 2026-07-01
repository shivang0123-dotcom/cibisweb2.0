import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Circolo Del Bridge",
    short_name: "Circolo",
    description: "Circolo Del Bridge — Italian restaurant menu & table ordering.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf0e8",
    theme_color: "#c4703c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}

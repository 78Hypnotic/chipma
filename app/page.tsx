import type { Metadata } from "next";
import { ChipMaApp } from "./components/ChipMaApp";

export const metadata: Metadata = {
  title: "ChipMa – individuelle Pfandchips ab 25 Stück",
  description:
    "Individuelle Pfandchips und Wertmarken aus dem 3D-Drucker: eigene Form, Farbe, Beschriftung und Personalisierung – gefertigt in Engen.",
};

export default function Home() {
  return <ChipMaApp />;
}

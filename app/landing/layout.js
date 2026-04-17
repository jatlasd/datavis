import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export default function LandingLayout({ children }) {
  return <div className={instrumentSerif.variable}>{children}</div>;
}

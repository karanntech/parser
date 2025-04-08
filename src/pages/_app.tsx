import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="container mx-auto p-6 antialiased">
      <Component {...pageProps} />
    </div>
  );
}

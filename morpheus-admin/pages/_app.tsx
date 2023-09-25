import { Fragment } from "react";
import Head from "next/head";
import "@/styles/globals.scss";
import "react-toastify/dist/ReactToastify.css";
import "@/App.scss";

import type { AppProps } from "next/app";
import { ToastProvider } from "@/context/ToastContext";
import { Toaster } from "@/components/organisms/toaster";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <Head>
        <script type="application/ld+json">
          {`{
          "@context": "https://schema.org/",
          "@type": "Article",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://morpheus.monadical.io"
          },
          "headline": "Morpheus - AI Art Generator",
          "author": {
            "@type": "Organization",
            "name": "Monadical Inc"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Monadical Inc"
          },
          "datePublished": "2023-04-12"
        }`}
        </script>
        <title>Morpheus - AI Art Generator</title>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta
          name="description"
          content="Discover our cutting-edge web application that combines image editing tools with powerful
          stable diffusion models to create stunning artwork effortlessly. Elevate your creativity today!"
        />
        <meta
          name="keywords"
          content="stable diffusion models, digital art generation, create artwork, advanced algorithms,
          artificial intelligence, machine learning, customizable settings, collaborative workspace,
          creative process, art world, Morpheus, Dreams, Monadical"
        />
        <meta name="author" content="Monadical Inc" />

        {/* Open Graph SEO */}
        <meta property="og:title" content="Morpheus - AI Art Generator" />
        <meta
          property="og:description"
          content="Discover our cutting-edge web application that combines image editing tools with powerful
          stable diffusion models to create stunning artwork effortlessly. Elevate your creativity today!"
        />
        <meta
          property="og:image"
          content="https://morpheus-results-staging-253.s3.amazonaws.com/public/morpheus-image.png"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://morpheus.monadical.io" />

        {/* Twitter SEO */}
        <meta name="twitter:title" content="Morpheus - AI Art Generator" />
        <meta
          name="twitter:description"
          content="Discover our cutting-edge web application that combines image editing tools with powerful
          stable diffusion models to create stunning artwork effortlessly. Elevate your creativity today!"
        />
        <meta
          name="twitter:card"
          content="https://morpheus-results-staging-253.s3.amazonaws.com/public/morpheus-image.png"
        />
        <meta
          name="twitter:image"
          content="https://morpheus-results-staging-253.s3.amazonaws.com/public/morpheus-image.png"
        />

        {/* Favicon tags */}
        <link rel="icon" type="image/png" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon/android-chrome-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="google-site-verification" content="" />
      </Head>
      <ToastProvider>
        <Component {...pageProps} />
        <Toaster />
      </ToastProvider>
    </Fragment>
  );
}

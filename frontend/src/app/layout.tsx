/**
 * Root app layout with providers
 */

import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { MainLayout } from "@/components/Layout/MainLayout";

export const metadata: Metadata = {
  title: "RAG Chat - AI Document Analysis",
  description:
    "Query your documents with AI-powered retrieval augmented generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white dark:bg-secondary-900 text-secondary-900 dark:text-neutral-100">
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}

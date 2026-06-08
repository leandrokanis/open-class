import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { StyledComponentsRegistry } from "@/lib/registry";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { PlatformConfigProvider } from "@/lib/platform-config/PlatformConfigProvider";
import { fetchPlatformConfig } from "@/lib/platform-config";
import { GlobalStyles } from "@/styles/GlobalStyles";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchPlatformConfig();
  return {
    title: config.platformName,
    description: config.platformName,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await fetchPlatformConfig();

  return (
    <html lang="pt-BR" className={inter.variable} data-theme="light" style={{ colorScheme: "light" }}>
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <PlatformConfigProvider config={config}>
            <ThemeProvider>
              <GlobalStyles />
              {children}
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </PlatformConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

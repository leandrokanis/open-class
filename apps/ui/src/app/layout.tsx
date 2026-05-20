import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { StyledComponentsRegistry } from "@/lib/registry";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { GlobalStyles } from "@/styles/GlobalStyles";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Open Class",
  description: "Plataforma open source de cursos gratuitos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider>
            <GlobalStyles />
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

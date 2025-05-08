"use client";
import { useState, useEffect } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ApplicationProvider } from "@/contexts/Application";
import "./globals.css";
import ApiProvider from '@/contexts/Api';
import { ApiClient } from '@/lib/api';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [api, initializeApi] = useState<ApiClient>();

  useEffect(() => {
    const api = new ApiClient();
    initializeApi(api);
  }, []);

  if (!api) return <html><body></body></html>;

  return (
    <html>
      <body>
        <AppRouterCacheProvider>
          <ApiProvider api={api}>
            <ApplicationProvider>
              <div style={{ height: "100%" }}>{children}</div>
            </ApplicationProvider>
          </ApiProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

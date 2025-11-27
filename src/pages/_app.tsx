import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import "antd/dist/reset.css";
import MainLayout from "@/components/layout/MainLayout";
import { AdvertiserProvider } from "@/contexts/AdvertiserContext";
import { ConfigProvider, theme } from "antd";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AdvertiserProvider>
          <HydrationBoundary state={pageProps.dehydratedState}>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </HydrationBoundary>
        </AdvertiserProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

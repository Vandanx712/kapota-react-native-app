import { onlineManager, QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import * as Network from "expo-network";

onlineManager.setEventListener((setOnline) => {
  const subscription = Network.addNetworkStateListener((state) => {
    setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
  });
  return () => {
    subscription.remove();
  };
});

Network.getNetworkStateAsync()
  .then((state) => {
    onlineManager.setOnline(
      Boolean(state.isConnected && state.isInternetReachable !== false),
    );
  })
  .catch(() => {
    onlineManager.setOnline(true);
  });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes
      retry: (failureCount, error) => {
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401 || status === 403 || status === 404) {
            return false;
          }
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});


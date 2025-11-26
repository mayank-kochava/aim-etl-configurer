import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Type definitions
export interface DataSupplier {
  IdAsString: string;
  ConnectionName: string;
  Active: boolean;
  ConnectorType: string;
  AdvertiserName?: string;
  EventMapping?: Record<string, string>;
  [key: string]: any;
}

export interface EventMapping {
  standardEvent: string;
  mappedEvent: string;
}

// Fetch single data supplier
export function useDataSupplier(supplierId: string | undefined) {
  return useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: async () => {
      const res = await axios.get<DataSupplier>(
        `/api/data-supplier-configs/${supplierId}`
      );
      return res.data;
    },
    enabled: !!supplierId && supplierId !== "new",
  });
}

// Create data supplier
export function useCreateDataSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<DataSupplier>) => {
      const res = await axios.post("/api/data-supplier-configs", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-supplier-configs"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-list"] });
    },
  });
}

// Update data supplier
export function useUpdateDataSupplier(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<DataSupplier>) => {
      const res = await axios.put(
        `/api/data-supplier-configs/${supplierId}`,
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier", supplierId] });
      queryClient.invalidateQueries({ queryKey: ["data-supplier-configs"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-list"] });
    },
  });
}

// Delete data supplier
export function useDeleteDataSupplier(supplierId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await axios.delete(
        `/api/data-supplier-configs/${supplierId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-supplier-configs"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-list"] });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useDataSupplierConfigs() {
  return useQuery({
    queryKey: ["data-supplier-configs"],
    queryFn: async () => {
      const res = await axios.get("/api/data-supplier-configs");
      return res.data;
    },
  });
}

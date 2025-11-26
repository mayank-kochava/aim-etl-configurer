import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAdvertiserContext } from "@/contexts/AdvertiserContext";

export function useDataSupplierConfigs() {
  const { selectedAdvertiser } = useAdvertiserContext();

  return useQuery({
    queryKey: ["data-supplier-configs", selectedAdvertiser?.IdAsString],
    queryFn: async () => {
      if (!selectedAdvertiser) {
        console.log("No advertiser selected");
        return [];
      }
      console.log("Fetching data supplier configs for advertiser:", selectedAdvertiser);
      const res = await axios.get("/api/data-supplier-configs", {
        params: { advertiserId: selectedAdvertiser.IdAsString },
      });
      console.log("Received data supplier configs:", res.data);
      return res.data;
    },
    enabled: !!selectedAdvertiser,
  });
}

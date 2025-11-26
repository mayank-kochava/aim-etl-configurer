import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Advertiser {
  IdAsString: string;
  DisplayName: string;
  AdvertiserName: string;
}

export function useAdvertisers() {
  return useQuery<Advertiser[]>({
    queryKey: ["advertisers"],
    queryFn: async () => {
      const res = await axios.get("/api/advertisers");
      return res.data;
    },
  });
}

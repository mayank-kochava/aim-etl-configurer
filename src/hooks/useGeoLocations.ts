import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAdvertiserContext } from "@/contexts/AdvertiserContext";

interface Country {
  id: string;
  name: string;
  isoCode: string;
  isoCode3: string;
}

interface Currency {
  code: string;
  name: string;
}

interface Region {
  regionId: string;
  displayName: string;
  countries: string[];
  isRestOfWorld: boolean;
}

interface GeoLocationsResponse {
  countries: Country[];
  currencies: Currency[];
  regions: Region[];
}

export function useGeoLocations() {
  const { selectedAdvertiser } = useAdvertiserContext();

  return useQuery<GeoLocationsResponse>({
    queryKey: ["geo-locations", selectedAdvertiser?.IdAsString],
    queryFn: async () => {
      if (!selectedAdvertiser) {
        return { countries: [], currencies: [], regions: [] };
      }
      const res = await axios.get("/api/geo-locations", {
        params: { advertiserId: selectedAdvertiser.IdAsString },
      });
      return res.data;
    },
    enabled: !!selectedAdvertiser,
  });
}

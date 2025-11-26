import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ConnectorConfig {
  IdAsString: string;
  ConnectorType: string;
  SharedConfig?: Record<string, any>;
}

export function useConnectorConfigs() {
  return useQuery<ConnectorConfig[]>({
    queryKey: ["connector-configs"],
    queryFn: async () => {
      const res = await axios.get("/api/connector-configs");
      return res.data;
    },
  });
}

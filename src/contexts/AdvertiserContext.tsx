import React, { createContext, useContext, useState, useEffect } from "react";

interface Region {
  RegionId: string;
  DisplayName: string;
  Countries: string[];
  IsRestOfWorld: boolean;
  Active: boolean;
  Deleted: boolean;
}

interface Advertiser {
  IdAsString: string;
  DisplayName: string;
  AdvertiserName: string;
  Regions?: Region[];
}

interface AdvertiserContextType {
  selectedAdvertiser: Advertiser | null;
  setSelectedAdvertiser: (advertiser: Advertiser | null) => void;
  isLoading: boolean;
}

const AdvertiserContext = createContext<AdvertiserContextType | undefined>(
  undefined
);

export function AdvertiserProvider({ children }: { children: React.ReactNode }) {
  const [selectedAdvertiser, setSelectedAdvertiserState] = useState<Advertiser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("selectedAdvertiser");
    if (stored) {
      try {
        setSelectedAdvertiserState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored advertiser:", e);
      }
    }
    setIsLoading(false);
  }, []);

  const setSelectedAdvertiser = (advertiser: Advertiser | null) => {
    console.log("Setting selected advertiser:", advertiser);
    setSelectedAdvertiserState(advertiser);
    if (advertiser) {
      localStorage.setItem("selectedAdvertiser", JSON.stringify(advertiser));
    } else {
      localStorage.removeItem("selectedAdvertiser");
    }
  };

  return (
    <AdvertiserContext.Provider
      value={{ selectedAdvertiser, setSelectedAdvertiser, isLoading }}
    >
      {children}
    </AdvertiserContext.Provider>
  );
}

export function useAdvertiserContext() {
  const context = useContext(AdvertiserContext);
  if (context === undefined) {
    throw new Error(
      "useAdvertiserContext must be used within an AdvertiserProvider"
    );
  }
  return context;
}

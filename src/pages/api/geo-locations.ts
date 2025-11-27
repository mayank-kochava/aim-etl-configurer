import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { advertiserId } = req.query;

    if (!advertiserId || typeof advertiserId !== "string") {
      return res.status(400).json({ error: "advertiserId is required" });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME as string);

    // First, get the advertiser to find their regions
    const advertiserCollection = db.collection("advertisers");
    const advertiser = await advertiserCollection.findOne(
      { IdAsString: advertiserId, Deleted: { $ne: true }, Active: true },
      { projection: { Regions: 1, _id: 0 } }
    );

    if (!advertiser || !advertiser.Regions || advertiser.Regions.length === 0) {
      return res
        .status(200)
        .json({ countries: [], currencies: [], regions: [] });
    }

    // Extract all country codes from advertiser's regions
    const countryCodes: string[] = [];
    advertiser.Regions.forEach((region: any) => {
      if (region.Countries && Array.isArray(region.Countries)) {
        countryCodes.push(...region.Countries);
      }
    });

    // Get unique country codes
    const uniqueCountryCodes = Array.from(
      new Set(countryCodes.map((code) => code.toLowerCase()))
    );

    if (uniqueCountryCodes.length === 0) {
      return res
        .status(200)
        .json({ countries: [], currencies: [], regions: [] });
    }

    // Fetch geo locations for these countries
    const geoCollection = db.collection<any>("geo_locations");
    const geoLocations = await geoCollection
      .find({
        _id: { $in: uniqueCountryCodes },
      })
      .project({
        _id: 1,
        Name: 1,
        IsoCodeTwoLetter: 1,
        IsoCodeThreeLetter: 1,
        CurrencyCode: 1,
        CurrencyName: 1,
        Regions: 1,
      })
      .toArray();

    // Extract unique currencies
    const currenciesMap = new Map<string, { code: string; name: string }>();
    geoLocations.forEach((geo) => {
      if (geo.CurrencyCode && geo.CurrencyName) {
        currenciesMap.set(geo.CurrencyCode, {
          code: geo.CurrencyCode,
          name: geo.CurrencyName,
        });
      }
    });

    const currencies = Array.from(currenciesMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );

    // Format countries data
    const countries = geoLocations
      .map((geo) => ({
        id: geo._id,
        name: geo.Name,
        isoCode: geo.IsoCodeTwoLetter,
        isoCode3: geo.IsoCodeThreeLetter,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Return the advertiser's regions along with filtered geo data
    const regions = advertiser.Regions.map((region: any) => ({
      regionId: region.RegionId,
      displayName: region.DisplayName,
      countries: region.Countries,
      isRestOfWorld: region.IsRestOfWorld,
    }));

    return res.status(200).json({
      countries,
      currencies,
      regions,
    });
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}

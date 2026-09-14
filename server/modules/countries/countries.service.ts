import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { countries as countriesTable } from "../../db/schema.ts";

const countryFields = {
  id: countriesTable.id,
  name: countriesTable.name,
  flagCode: countriesTable.flagCode,
  shortCode: countriesTable.shortCode,
};

export async function listCountries() {
  return db
    .select(countryFields)
    .from(countriesTable)
    .orderBy(asc(countriesTable.name));
}

export async function getCountryById(id: number) {
  const [country] = await db
    .select(countryFields)
    .from(countriesTable)
    .where(eq(countriesTable.id, id))
    .limit(1);

  return country ?? null;
}

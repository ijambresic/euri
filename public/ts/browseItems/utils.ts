import type { CountryList, YearList } from "../../../types";

export function getTagInfo(tagText: string) {
  // Get the type of the tag (country || year) from the value of the tag
  const tagFilterType: "country" | "year" = isNaN(parseInt(tagText)) ? "country" : "year";

  // Determine what list to use based on the tagFilterType
  const targetLookupList: CountryList | YearList =
    tagFilterType === "country" ? countryList : yearList;

  // Get the id of the tag filter
  const tagItem = targetLookupList.find((item) => item[0] === tagText);

  if (tagItem === undefined) {
    console.error("Tag item not found");
    return null;
  }

  return { id: tagItem[1], name: tagItem[0], type: tagFilterType };
}

export function getCountryFromId(countryId: string) {
  return countryList.find((country) => country[1] === countryId)?.at(0);
}
export function getYearFromId(yearId: string) {
  return yearList.find((year) => year[1] === yearId)?.at(0);
}

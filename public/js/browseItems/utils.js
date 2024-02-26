export function getTagInfo(tagText) {
    // Get the type of the tag (country || year) from the value of the tag
    const tagFilterType = isNaN(parseInt(tagText)) ? "country" : "year";
    // Determine what list to use based on the tagFilterType
    const targetLookupList = tagFilterType === "country" ? countryList : yearList;
    // Get the id of the tag filter
    const tagItem = targetLookupList.find((item) => item[0] === tagText);
    if (tagItem === undefined) {
        console.error("Tag item not found");
        return { id: "", name: "", type: "" };
    }
    return { id: tagItem.at(1), name: tagItem.at(0), type: tagFilterType };
}
export function getCountryFromId(countryId) {
    const countryName = countryList
        .find((country) => country[1] === countryId)
        .at(0);
    return countryName;
}
export function getYearFromId(yearId) {
    const yearName = yearList.find((year) => year[1] === yearId).at(0);
    return yearName;
}
//# sourceMappingURL=utils.js.map
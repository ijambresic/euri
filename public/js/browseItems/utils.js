function getTagInfo(tagText) {
    // Get the type of the tag (country || year) from the value of the tag
    const tagFilterType = isNaN(parseInt(tagText)) ? "country" : "year";
    // Determine what list to use based on the tagFilterType
    const targetLookupList = tagFilterType === "country" ? countryList : yearList;
    // Get the id of the tag filter
    const tagItem = targetLookupList.find((item) => item[0] === tagText);
    return { id: tagItem.at(1), name: tagItem.at(0), type: tagFilterType };
}
function getCountryFromId(countryId) {
    return countryList.find((country) => country[1] === countryId).at(0);
}
function getYearFromId(yearId) {
    return yearList.find((year) => year[1] === yearId).at(0);
}
export {};
//# sourceMappingURL=utils.js.map
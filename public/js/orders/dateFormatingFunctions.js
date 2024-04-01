export function getRelativeDate(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime(); // difference in milliseconds
    const diffInDays = diff / (1000 * 60 * 60 * 24);
    if (diffInDays < 1) {
        // Danas
        return getRelativeHoursFromDate(diff);
    }
    else if (diffInDays < 7) {
        return getRelativeDaysFromDate(diff);
    }
    else if (diffInDays < 30) {
        return getRelativeWeeksFromDate(diff);
    }
    else if (diffInDays < 365) {
        return getRelativeMonthsFromDate(diff);
    }
    else {
        const years = Math.floor(diffInDays / 365);
        if (years <= 1)
            return "Prije 1 godinu";
        else if (years <= 4)
            return `Prije ${years} godine`;
        else
            return `Prije ${years} godina`;
    }
}
function getRelativeHoursFromDate(diffInMs) {
    const diffInHours = diffInMs / (1000 * 60 * 60);
    if (diffInHours < 1) {
        return "Ovaj sat";
    }
    else if (diffInHours < 2) {
        return "Prije 1 sat";
    }
    else if (diffInHours <= 4) {
        return `Prije ${Math.floor(diffInHours)} sata`;
    }
    else {
        return `Prije ${Math.floor(diffInHours)} sati`;
    }
}
function getRelativeDaysFromDate(diffInMs) {
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    if (diffInDays < 1) {
        return "Danas";
    }
    else if (diffInDays < 2) {
        return "Jučer";
    }
    else {
        return `Prije ${Math.floor(diffInDays)} dana`;
    }
}
function getRelativeWeeksFromDate(diffInMs) {
    const diffInWeeks = diffInMs / (1000 * 60 * 60 * 24 * 7);
    if (diffInWeeks <= 1) {
        return "Prije 1 tjedan";
    }
    else if (diffInWeeks <= 4) {
        return `Prije ${Math.floor(diffInWeeks)} tjedna`;
    }
    else {
        return `Prije ${Math.floor(diffInWeeks)} tjedana`;
    }
}
function getRelativeMonthsFromDate(diffInMs) {
    const diffInMonths = diffInMs / (1000 * 60 * 60 * 24 * 30);
    if (diffInMonths <= 1) {
        return "Prije 1 mjesec";
    }
    else if (diffInMonths <= 4) {
        return `Prije ${Math.floor(diffInMonths)} mjeseca`;
    }
    else {
        return `Prije ${Math.floor(diffInMonths)} mjeseci`;
    }
}
//# sourceMappingURL=dateFormatingFunctions.js.map
// Get all elements with the class 'prevPage' and 'nextPage'
const prevPages = document.querySelectorAll(".prevPage") as NodeListOf<HTMLButtonElement>;
const nextPages = document.querySelectorAll(".nextPage") as NodeListOf<HTMLButtonElement>;
const currentPageTexts = document.querySelectorAll(
  ".currentPage"
) as NodeListOf<HTMLParagraphElement>;

// The number of items in a page
const itemsInPage = 10;

// Set the text content for all currentPageTexts elements
currentPageTexts.forEach((currentPageText) => {
  currentPageText.textContent = `Page ${getPageAndOffsetFromUrl().currentPage}`;
});

// Add click event listeners to all prevPages elements
prevPages.forEach((prevPage) => {
  prevPage.addEventListener("click", () => {
    const currentOffset = getPageAndOffsetFromUrl().offset;
    const newOffset = parseInt(currentOffset) - itemsInPage;
    addOffsetToUrlParams(newOffset.toString());
  });
});

// Add click event listeners to all nextPages elements
nextPages.forEach((nextPage) => {
  nextPage.addEventListener("click", () => {
    const currentOffset = getPageAndOffsetFromUrl().offset;
    const newOffset = parseInt(currentOffset) + itemsInPage;
    addOffsetToUrlParams(newOffset.toString());
  });
});

function getPageAndOffsetFromUrl() {
  const offsetParam = new URLSearchParams(window.location.search).get("offset") || "0";
  const currentPage = parseInt(offsetParam) / itemsInPage + 1;
  return { currentPage, offset: offsetParam };
}

function addOffsetToUrlParams(offset: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("offset", offset);
  window.location.href = url.toString();
}

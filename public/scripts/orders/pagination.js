const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const currentPageText = document.getElementById("currentPage");

const { currentPage } = getPageAndOffsetFromUrl();
currentPageText.textContent = `Page ${currentPage}`;

prevPage.addEventListener("click", () => {
  const currentOffset = getPageAndOffsetFromUrl().offset;
  const newOffset = parseInt(currentOffset) - 10;
  addOffsetToUrlParams(newOffset);
});
nextPage.addEventListener("click", () => {
  const currentOffset = getPageAndOffsetFromUrl().offset;
  const newOffset = parseInt(currentOffset) + 10;
  addOffsetToUrlParams(newOffset);
});

function getPageAndOffsetFromUrl() {
  const offsetParam = new URLSearchParams(window.location.search).get("offset") || 0;

  const currentPage = parseInt(offsetParam) / 10 + 1;

  return { currentPage, offset: offsetParam };
}

function addOffsetToUrlParams(offset) {
  const url = new URL(window.location.href);
  url.searchParams.set("offset", offset);
  window.location.href = url;
}

const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const currentPageText = document.getElementById("currentPage");

// Ovo mozda treba nabavit sa servera tak da je sigurno sinkronizirano
const itemsInPage = 10;

currentPageText.textContent = `Page ${getPageAndOffsetFromUrl().currentPage}`;

prevPage.addEventListener("click", () => {
  const currentOffset = getPageAndOffsetFromUrl().offset;
  const newOffset = parseInt(currentOffset) - itemsInPage;
  addOffsetToUrlParams(newOffset);
});
nextPage.addEventListener("click", () => {
  const currentOffset = getPageAndOffsetFromUrl().offset;
  const newOffset = parseInt(currentOffset) + itemsInPage;
  addOffsetToUrlParams(newOffset);
});

function getPageAndOffsetFromUrl() {
  const offsetParam = new URLSearchParams(window.location.search).get("offset") || 0;

  const currentPage = parseInt(offsetParam) / itemsInPage + 1;

  return { currentPage, offset: offsetParam };
}

function addOffsetToUrlParams(offset) {
  const url = new URL(window.location.href);
  url.searchParams.set("offset", offset);
  window.location.href = url;
}

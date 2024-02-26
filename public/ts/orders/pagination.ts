const prevPage = document.getElementById("prevPage") as HTMLButtonElement;
const nextPage = document.getElementById("nextPage") as HTMLButtonElement;
const currentPageText = document.getElementById("currentPage") as HTMLParagraphElement;

// Ovo mozda treba nabavit sa servera tak da je sigurno sinkronizirano
const itemsInPage = 10;

currentPageText.textContent = `Page ${getPageAndOffsetFromUrl().currentPage}`;

prevPage.addEventListener("click", () => {
  const currentOffset = getPageAndOffsetFromUrl().offset;
  const newOffset = parseInt(currentOffset) - itemsInPage;
  addOffsetToUrlParams(newOffset.toString());
});
nextPage.addEventListener("click", () => {
  const currentOffset = getPageAndOffsetFromUrl().offset;
  const newOffset = parseInt(currentOffset) + itemsInPage;
  addOffsetToUrlParams(newOffset.toString());
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

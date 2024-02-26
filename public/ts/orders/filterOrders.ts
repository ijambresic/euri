const filterButtons = document.querySelectorAll(
  ".orderFilterContainer .filter"
) as NodeListOf<HTMLButtonElement>;

applyInitialStylingToActiveFiltersFromUrlParameters();

filterButtons.forEach((button) => {
  button.addEventListener("click", handleFilterClick);
});

function handleFilterClick(event: Event) {
  const button = event.target as HTMLButtonElement;

  //  Toggle the active class on the clicked button
  button.classList.toggle("active");

  //  Get a list of the active filter values
  const activeFiltersButtonList = Array.from(
    document.querySelectorAll(".orderFilterContainer .filter.active")
  ) as HTMLButtonElement[];

  const activeFiltersList = activeFiltersButtonList.map((btn) => btn.dataset.filterValue);

  console.log("Active filters:", activeFiltersList);

  //  Create a url parameter string from the active filters
  const urlParams = new URLSearchParams(window.location.search);

  urlParams.delete("status");

  for (const filterValue of activeFiltersList) {
    if (filterValue !== undefined) {
      urlParams.append("status", filterValue);
    }
  }

  //  Set the url to the new parameter string (automatically refreshes the page)
  window.location.search = urlParams.toString();
}

function applyInitialStylingToActiveFiltersFromUrlParameters() {
  const activeFiltersFromUrl = new URLSearchParams(window.location.search).getAll(
    "status"
  );

  filterButtons.forEach((button) => {
    const filterValue = button.dataset.filterValue;

    if (filterValue !== undefined && activeFiltersFromUrl.includes(filterValue)) {
      button.classList.add("active");
    }
  });
}

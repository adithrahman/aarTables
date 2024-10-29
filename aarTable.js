// Generic jQuery function to handle pagination for any table by its id
        
class aarTables {
    constructor(tableId, options = {}) {
        this.$table = $('#' + tableId);  // Initialize the table by its ID
        this.$tableParent = this.$table.parent();
        this.$tableBody = this.$table.find('tbody');

        this.rowsPerPage = options.rowsPerPage || 5;
        this.visiblePages = options.visiblePages || 5;
        this.sortableColumns = options.sortableColumns || [];
        this.searchable = options.searchable || false; // Optional searchable value
        this.filterable = options.filterable || false; // Optional filterable value
                
        this.currentSortOrder = {};
        this.currentPage = 1;
        this.selectedColumn = null; // Selected column for filtering

        this.fullDataSet = this.$tableBody.find('tr').toArray(); // Store the full dataset
        this.filteredDataSet = [...this.fullDataSet]; // Initially, filtered data is same as full
        this.init();
    }

    init() {
        this.addToolTableHTML();
        this.addToolLeftHTML();
        this.addToolRightHTML();

        if (this.searchable) {
            this.addSearchInput();     // Add search input only if searchable is true
        }
        if (this.filterable) {
            this.addFilterDropdown();  // Add column filter dropdown
        }

        this.addRowsPerPageComboBox();  // Add combo box for selecting rows
        this.addTheadfootClasses();

        this.addPaginationControls();  // Add pagination controls dynamically
        this.addDataColumnAttributes();
        this.setupSorting();
        this.displayRowsForPage(this.currentPage);
        this.setupPagination();

        this.addTbodyClasses();

        if (this.searchable) {
            this.setupSearch();  // Set up search if searchable is true
        }
    }

    addToolTableHTML() {
        const toolTableHTML = `<div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">`;
        this.$toolTable = $(toolTableHTML).insertBefore(this.$tableParent);
    }

    addToolRightHTML() {
        const toolRightHTML = `<div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">`;  
        // Insert it before the table
        this.$toolRight = $(toolRightHTML).appendTo(this.$toolTable);
    }

    addToolLeftHTML() {
        const toolLeftHTML = `<div class="w-full md:w-1/4">`;
        // Insert it before the table
        this.$toolLeft = $(toolLeftHTML).appendTo(this.$toolTable);
    }

    addSearchInput() {
        // Create search input 
        const searchFullInputHTML = `<div class="flex items-center">
                                <label for="simple-search" class="sr-only">Search</label>
                                
                            </div>`;
               
        const searchContainerHTML = `<div class="relative w-full">
                                </div>`;
                            
        const searchIconHTML = `<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                `;
        const searchInputHTML = `<input type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" required="">`;

        // Insert it in toolRight 
        this.$searchFullInput = $(searchFullInputHTML).appendTo(this.$toolRight);
        this.$searchContainer = $(searchContainerHTML).appendTo(this.$searchFullInput);

        this.$searchIcon = $(searchIconHTML).appendTo(this.$searchContainer);
        this.$searchInput = $(searchInputHTML).appendTo(this.$searchContainer);

    }

    addRowsPerPageComboBox() {
        // Add a combo box to allow users to select how many rows to display per page
        const rowsPerPageHTML = `
        <div class="flex items-center space-x-4">
            <label for="rowsPerPage" class="text-sm font-medium text-gray-900 dark:text-gray-300">Rows per page</label>
            <select id="rowsPerPage" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>`;
        // Append the rows per page combo box into the tool section
        const $rowsPerPageComboBox = $(rowsPerPageHTML).appendTo(this.$toolLeft);

        // Handle change event for rows per page
        const self = this;
        $rowsPerPageComboBox.find('#rowsPerPage').on('change', function() {
            self.rowsPerPage = parseInt($(this).val());
            self.currentPage = 1; // Reset to first page when rows per page is changed
            self.displayRowsForPage(self.currentPage);
            self.updatePagination();
            self.updateInfoText();
        });
    }

    addFilterDropdown() {
        // Create a dropdown button using Flowbite structure
        const filterDropdownHTML = `
        <div class="relative">

            
        </div>`;

        const filterDropdownButtonHTML = `
            <button id="filterDropdownButton" data-dropdown-toggle="filterDropdown" class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center  dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"" type="button">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"/>
                </svg>

            </button>`;

        const filterDropdownMenusHTML = `<!-- Dropdown menu -->
            <div id="filterDropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700">
                <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="filterDropdownButton">
                    <li><a href="#" class="block px-4 py-2">All Columns</a></li>
                </ul>
            </div>`;

        // Append the filter dropdown into the tool section
        this.$filterDropdown = $(filterDropdownHTML).appendTo(this.$toolRight);

        this.$filterDropdownButton = $(filterDropdownButtonHTML).appendTo(this.$filterDropdown);
        this.$filterDropdownMenus = $(filterDropdownMenusHTML).appendTo(this.$filterDropdown);


        // Dynamically add table headers as filter options
        const $dropdownMenu = this.$filterDropdownMenus.find('ul');
        this.$table.find('thead th').each((index, th) => {
            const columnName = $(th).text();
            $dropdownMenu.append(`<li><a href="#" class="block px-4 py-2" data-column="${index}">${columnName}</a></li>`);
        });

        // Handle dropdown filter selection
        const self = this;
        $dropdownMenu.find('a[data-column]').on('click', function(e) {
            e.preventDefault();
            const selectedColumn = $(this).data('column');
            self.selectedColumn = selectedColumn === "" ? null : selectedColumn;
            self.$searchInput.trigger('input');  // Trigger search to apply filter
        });
    }

    // Function to automatically add classes to thead and tfoot
    addTheadfootClasses() {
        // Add classes to <th> elements in <thead> and <tfoot>
        this.$table.find('thead th, tfoot th').each(function() {
            $(this).attr('scope', 'col').addClass('px-4 py-3');
        });
    }

    // Function to automatically add classes to tbody rows and cells after data is loaded
    addTbodyClasses() {
        // Add classes to <tr> and <td> elements in <tbody>
        this.$tableBody.find('tr').each(function() {
            $(this).addClass('border-b dark:border-gray-700');
            $(this).find('td').addClass('px-4 py-2');
        });
    }

    addPaginationControls() {
        // Create pagination controls div
        const paginationControlsContainerHTML = `
                    <div class="pagination-controls-container">
                        <div class="pagination-info"></div>
                        <div class="pagination-controls"></div>
                    </div>`;
        
        // Append it directly after the table
        this.$paginationControlsContainer = $(paginationControlsContainerHTML).insertAfter(this.$table);
        this.$infoText = this.$paginationControlsContainer.find('.pagination-info');  // Info text reference
        this.$paginationControls = this.$paginationControlsContainer.find('.pagination-controls');  // Pagination controls reference
        
    }

    addDataColumnAttributes() {
        const self = this;
        this.$table.find('thead th').each(function(index) {
            if (self.sortableColumns.includes(index)) {
                $(this).attr('data-column', index);
                $(this).addClass('sortable');
                $(this).append('<span class="sort-icon">▲▼</span>');
            }
        });
    }

    setupSorting() {
        const self = this;
        this.$table.find('thead th.sortable').each(function() {
            const columnIndex = $(this).data('column');
            const $sortIcon = $(this).find('.sort-icon');

            $(this).on('click', function() {
                const ascending = !self.currentSortOrder[columnIndex];
                self.currentSortOrder[columnIndex] = ascending;

                self.sortTableData(columnIndex, ascending);
                self.displayRowsForPage(1);

                $sortIcon.html(ascending ? '▲' : '▼');
                self.$table.find('thead th.sortable .sort-icon').not($sortIcon).html('▲▼');
            });
        });
    }

    sortTableData(columnIndex, ascending) {
        this.filteredDataSet.sort((a, b) => {
            const aText = $(a).find('td').eq(columnIndex).text();
            const bText = $(b).find('td').eq(columnIndex).text();
            const aNumber = parseFloat(aText);
            const bNumber = parseFloat(bText);

            if (!isNaN(aNumber) && !isNaN(bNumber)) {
                return ascending ? aNumber - bNumber : bNumber - aNumber;
            }

            const result = aText.localeCompare(bText, undefined, { sensitivity: 'base' });
            return ascending ? result : -result;
        });
    }

    setupSearch() {
        const self = this;
        // Use 'input' event to trigger search as user types
        this.$searchInput.on('input', function() {  
            const query = $(this).val().toLowerCase();
    
            // Filter the rows based on the search query
            //self.filteredDataSet = self.fullDataSet.filter(row => {
            //    return $(row).text().toLowerCase().includes(query);
            //});


            // Filter data based on query (ignore selectedColumn for search)
            self.filteredDataSet = self.fullDataSet.filter(row => {
                const cells = $(row).find('td');
                return cells.toArray().some(cell => $(cell).text().toLowerCase().includes(query));
            });
    
            // Reset to first page after search
            self.currentPage = 1;

            // Update rows for the first page of the filtered data
            self.displayRowsForPage(self.currentPage);

            // Update pagination controls and info based on the filtered data
            self.updatePagination();
            self.updateInfoText();
        });
    }

    setupPagination() {
        this.updatePagination();
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredDataSet.length / this.rowsPerPage);
        const self = this;

        this.$paginationControls.empty();

        // Get the start and end pages for the visible range
        const startPage = Math.max(1, self.currentPage - Math.floor(self.visiblePages / 2));
        const endPage = Math.min(totalPages, startPage + self.visiblePages - 1);

        let pagesHTML = '';

        // Always show the first page
        if (startPage > 1) {
            pagesHTML += `<li><a href="#" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700" data-page="1">1</a></li>`;
            if (startPage > 2) {
                pagesHTML += `<li><span class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300">...</span></li>`;
            }
        }

        // Generate the visible pages
        for (let i = startPage; i <= endPage; i++) {
            pagesHTML += `<li><a href="#" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${i === self.currentPage ? 'text-black font-bold' : ''}" data-page="${i}">${i}</a></li>`;
        }

        // Always show the last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pagesHTML += `<li><span class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300">...</span></li>`;
            }
            pagesHTML += `<li><a href="#" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700" data-page="${totalPages}">${totalPages}</a></li>`;
        }

        // Pagination (Previous/Next) using Flowbite
        const paginationHTML = `
        <nav aria-label="Page navigation">
            <ul class="inline-flex -space-x-px">
                <li>
                    <a href="#" class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white prevPageBtn">
                        <span class="sr-only">Previous</span>
                        <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                        </svg>
                    </a>
                </li>
                        ${pagesHTML}
                <li>
                    <a href="#" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white nextPageBtn">
                        <span class="sr-only">Next</span>
                        <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                        </svg>
                    </a>
                </li>
            </ul>
        </nav>`;

        this.$paginationControls.append(paginationHTML);


        // Previous Button Action
        this.$paginationControls.find('.prevPageBtn').on('click', function(e) {
            e.preventDefault();
            if (self.currentPage > 1) {
                self.currentPage--;
                self.displayRowsForPage(self.currentPage);
                self.updatePagination();
                self.updateInfoText();
            }
        });

        // Page Numbers Click Event
        this.$paginationControls.find('a[data-page]').on('click', function(e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            self.currentPage = page;
            self.displayRowsForPage(self.currentPage);
            self.updatePagination();
            self.updateInfoText();
        });

        // Next Button Action
        this.$paginationControls.find('.nextPageBtn').on('click', function(e) {
            e.preventDefault();
            if (self.currentPage < totalPages) {
                self.currentPage++;
                self.displayRowsForPage(self.currentPage);
                self.updatePagination();
                self.updateInfoText();
            }
        });

        // Update the info text with the range of shown items
        this.updateInfoText();
    }

    updateInfoText() {
        const totalRows = this.filteredDataSet.length;
        const startRow = (this.currentPage - 1) * this.rowsPerPage + 1;
        const endRow = Math.min(startRow + this.rowsPerPage - 1, totalRows);

        this.$infoText.text(`Showing ${startRow}-${endRow} of ${totalRows}`);
    }

    displayRowsForPage(page) {
        const startIndex = (page - 1) * this.rowsPerPage;
        const endIndex = startIndex + this.rowsPerPage;

        // Empty the table body and append filtered data
        const rowsToDisplay = this.filteredDataSet.slice(startIndex, endIndex);
        this.$tableBody.empty().append(rowsToDisplay);

        // After rows are inserted, add classes to each tr and td in tbody
        this.$tableBody.find('tr').each(function() {
            // Add class to each <tr>
            $(this).addClass('border-b dark:border-gray-700');

            // Add class to each <td> within the <tr>
            $(this).find('td').each(function() {
                $(this).addClass('px-4 py-2');
            });
        });
    }
}
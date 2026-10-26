/* =========================================================
   DAY 26 - INVENTORY REPORTS AND DATA EXPORT
   Vanilla JavaScript | LocalStorage | CSV Export
========================================================= */

"use strict";

const Reports = (() => {
    const DEFAULT_MINIMUM_STOCK = 10;

    const elements = {
        totalProducts: document.getElementById("totalProducts"),
        totalStock: document.getElementById("totalStock"),
        totalValue: document.getElementById("totalValue"),
        lowStockCount: document.getElementById("lowStockCount"),
        outStockCount: document.getElementById("outStockCount"),

        searchInput: document.getElementById("searchInput"),
        categoryFilter: document.getElementById("categoryFilter"),
        statusFilter: document.getElementById("statusFilter"),
        clearFilters: document.getElementById("clearFilters"),
        refreshButton: document.getElementById("refreshButton"),

        inventoryTableBody: document.getElementById("inventoryTableBody"),
        categoryTableBody: document.getElementById("categoryTableBody"),

        reportTitle: document.getElementById("reportTitle"),
        recordCount: document.getElementById("recordCount"),
        generatedAt: document.getElementById("generatedAt"),

        exportInventory: document.getElementById("exportInventory"),
        exportCategories: document.getElementById("exportCategories"),

        inStockSummary: document.getElementById("inStockSummary"),
        lowStockSummary: document.getElementById("lowStockSummary"),
        outStockSummary: document.getElementById("outStockSummary"),

        toast: document.getElementById("toast")
    };

    let toastTimer = null;

    // ---------- SAFE STORAGE ----------

    function readArray(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.error("Unable to read localStorage key:", key, error);
            return [];
        }
    }

    function getRawProducts() {
        // "products" is the main key used by this project.
        // The other keys support common variations.
        const possibleKeys = [
            "products",
            "inventoryProducts"
        ];

        for (const key of possibleKeys) {
            const products = readArray(key);

            if (products.length > 0) {
                return products;
            }
        }

        return [];
    }

    function firstValue(object, keys, fallback = "") {
        for (const key of keys) {
            if (
                object[key] !== undefined &&
                object[key] !== null &&
                object[key] !== ""
            ) {
                return object[key];
            }
        }

        return fallback;
    }

    function numberValue(value, fallback = 0) {
        if (value === "" || value === null || value === undefined) {
            return fallback;
        }

        const number = Number(value);

        return Number.isFinite(number) ? number : fallback;
    }

    function normalizeProduct(product, index) {
        const id = firstValue(
            product,
            ["id", "productId", "productID", "sku"],
            `P-${String(index + 1).padStart(3, "0")}`
        );

        const name = firstValue(
            product,
            ["name", "productName", "title"],
            "Unnamed Product"
        );

        const category = firstValue(
            product,
            ["category", "categoryName", "category_name"],
            "Uncategorized"
        );

        const price = Math.max(
            0,
            numberValue(
                firstValue(product, ["price", "sellingPrice", "salePrice"], 0)
            )
        );

        const stock = Math.max(
            0,
            numberValue(
                firstValue(
                    product,
                    ["stock", "quantity", "availableQuantity", "stockQuantity"],
                    0
                )
            )
        );

        const minimumStock = Math.max(
            0,
            numberValue(
                firstValue(
                    product,
                    [
                        "minimumStock",
                        "minStock",
                        "minimumStockLevel",
                        "reorderLevel"
                    ],
                    DEFAULT_MINIMUM_STOCK
                ),
                DEFAULT_MINIMUM_STOCK
            )
        );

        let status;

        if (stock === 0) {
            status = "Out of Stock";
        } else if (stock < minimumStock) {
            status = "Low Stock";
        } else {
            status = "In Stock";
        }

        return {
            id: String(id),
            name: String(name),
            category: String(category),
            price,
            stock,
            minimumStock,
            value: price * stock,
            status
        };
    }

    function getProducts() {
        return getRawProducts().map(normalizeProduct);
    }

    // ---------- FORMATTING ----------

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function formatNumber(number) {
        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 2
        }).format(number);
    }

    function formatDateTime(date = new Date()) {
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }).format(date);
    }

    // Escape product text before placing it inside HTML.
    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => {
            const replacements = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return replacements[character];
        });
    }

    function showToast(message, isError = false) {
        if (!elements.toast) return;

        elements.toast.textContent = message;
        elements.toast.classList.toggle("error", isError);
        elements.toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            elements.toast.classList.remove("show");
        }, 3000);
    }

    // ---------- FILTERS ----------

    function updateCategoryOptions(products) {
        const currentValue = elements.categoryFilter.value;

        const categories = [
            ...new Set(products.map(product => product.category))
        ].sort((a, b) => a.localeCompare(b));

        elements.categoryFilter.innerHTML =
            '<option value="">All Categories</option>';

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            elements.categoryFilter.appendChild(option);
        });

        if (categories.includes(currentValue)) {
            elements.categoryFilter.value = currentValue;
        }
    }

    function getFilteredProducts(products) {
        const search = elements.searchInput.value
            .trim()
            .toLowerCase();

        const category = elements.categoryFilter.value;
        const status = elements.statusFilter.value;

        return products.filter(product => {
            const matchesSearch =
                product.name.toLowerCase().includes(search) ||
                product.id.toLowerCase().includes(search);

            const matchesCategory =
                !category || product.category === category;

            const matchesStatus =
                !status || product.status === status;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }

    // ---------- SUMMARY CARDS ----------

    function renderSummary(products) {
        const totalStock = products.reduce(
            (sum, product) => sum + product.stock,
            0
        );

        const totalValue = products.reduce(
            (sum, product) => sum + product.value,
            0
        );

        const lowStock = products.filter(
            product => product.status === "Low Stock"
        ).length;

        const outOfStock = products.filter(
            product => product.status === "Out of Stock"
        ).length;

        elements.totalProducts.textContent = formatNumber(products.length);
        elements.totalStock.textContent = formatNumber(totalStock);
        elements.totalValue.textContent = formatCurrency(totalValue);
        elements.lowStockCount.textContent = formatNumber(lowStock);
        elements.outStockCount.textContent = formatNumber(outOfStock);

        const inStock = products.filter(
            product => product.status === "In Stock"
        ).length;

        elements.inStockSummary.textContent =
            `${formatNumber(inStock)} products`;

        elements.lowStockSummary.textContent =
            `${formatNumber(lowStock)} products`;

        elements.outStockSummary.textContent =
            `${formatNumber(outOfStock)} products`;
    }

    // ---------- INVENTORY TABLE ----------

    function renderInventoryTable(products) {
        if (products.length === 0) {
            elements.inventoryTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-cell">
                        No products found. Try changing your search or filters.
                    </td>
                </tr>
            `;
            return;
        }

        elements.inventoryTableBody.innerHTML = products.map(product => {
            let statusClass = "status-in-stock";

            if (product.status === "Low Stock") {
                statusClass = "status-low-stock";
            } else if (product.status === "Out of Stock") {
                statusClass = "status-out-of-stock";
            }

            return `
                <tr>
                    <td class="product-id">${escapeHTML(product.id)}</td>
                    <td class="product-name">${escapeHTML(product.name)}</td>
                    <td>
                        <span class="category-chip">
                            ${escapeHTML(product.category)}
                        </span>
                    </td>
                    <td>${formatCurrency(product.price)}</td>
                    <td>${formatNumber(product.stock)}</td>
                    <td><strong>${formatCurrency(product.value)}</strong></td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${escapeHTML(product.status)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ---------- CATEGORY-WISE REPORT ----------

    function getCategoryReport(products) {
        const groups = new Map();

        products.forEach(product => {
            if (!groups.has(product.category)) {
                groups.set(product.category, {
                    category: product.category,
                    productCount: 0,
                    stockQuantity: 0,
                    inventoryValue: 0
                });
            }

            const group = groups.get(product.category);

            group.productCount += 1;
            group.stockQuantity += product.stock;
            group.inventoryValue += product.value;
        });

        return [...groups.values()].sort(
            (a, b) => a.category.localeCompare(b.category)
        );
    }

    function renderCategoryTable(products) {
        const categories = getCategoryReport(products);

        if (categories.length === 0) {
            elements.categoryTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-cell">
                        No category data available.
                    </td>
                </tr>
            `;
            return;
        }

        elements.categoryTableBody.innerHTML = categories.map(category => `
            <tr>
                <td class="product-name">
                    ${escapeHTML(category.category)}
                </td>
                <td>${formatNumber(category.productCount)}</td>
                <td>${formatNumber(category.stockQuantity)}</td>
                <td><strong>${formatCurrency(category.inventoryValue)}</strong></td>
            </tr>
        `).join("");
    }

    // ---------- REPORT TITLE AND DATE ----------

    function updateReportMetadata(filteredProducts, allProducts) {
        const search = elements.searchInput.value.trim();
        const category = elements.categoryFilter.value;
        const status = elements.statusFilter.value;

        const filtersActive = Boolean(search || category || status);

        elements.reportTitle.textContent = filtersActive
            ? "Filtered Inventory Report"
            : "Complete Inventory Report";

        elements.recordCount.textContent =
            `${formatNumber(filteredProducts.length)} of ` +
            `${formatNumber(allProducts.length)} records`;

        elements.generatedAt.textContent =
            `Generated: ${formatDateTime()}`;
    }

    // ---------- CSV EXPORT ----------

    function csvCell(value) {
        let text = String(value ?? "");

        // Avoid spreadsheet formula injection from text values.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    function downloadCSV(filename, headers, rows) {
        const csvRows = [
            headers.map(csvCell).join(","),
            ...rows.map(row => row.map(csvCell).join(","))
        ];

        // BOM helps spreadsheet programs display text correctly.
        const csvContent = "\uFEFF" + csvRows.join("\r\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        showToast(`CSV export ready: ${filename}`);
    }

    function makeFilename(name) {
        const date = new Date().toISOString().slice(0, 10);

        return `${name}-${date}.csv`;
    }

    function exportInventory(products) {
        if (products.length === 0) {
            showToast("No inventory records to export.", true);
            return;
        }

        const rows = products.map(product => [
            product.id,
            product.name,
            product.category,
            product.price.toFixed(2),
            product.stock,
            product.value.toFixed(2),
            product.status
        ]);

        downloadCSV(
            makeFilename("inventory-report"),
            [
                "Product ID",
                "Product Name",
                "Category",
                "Unit Price (INR)",
                "Stock Quantity",
                "Total Product Value (INR)",
                "Stock Status"
            ],
            rows
        );
    }

    function exportCategoryReport(products) {
        const categories = getCategoryReport(products);

        if (categories.length === 0) {
            showToast("No category records to export.", true);
            return;
        }

        const rows = categories.map(category => [
            category.category,
            category.productCount,
            category.stockQuantity,
            category.inventoryValue.toFixed(2)
        ]);

        downloadCSV(
            makeFilename("category-report"),
            [
                "Category",
                "Product Count",
                "Stock Quantity",
                "Inventory Value (INR)"
            ],
            rows
        );
    }

    function exportStatusReport(products, status) {
        const matchingProducts = products.filter(
            product => product.status === status
        );

        if (matchingProducts.length === 0) {
            showToast(`No ${status.toLowerCase()} products to export.`, true);
            return;
        }

        const rows = matchingProducts.map(product => [
            product.id,
            product.name,
            product.category,
            product.price.toFixed(2),
            product.stock,
            product.value.toFixed(2),
            product.status
        ]);

        const fileStatus = status.toLowerCase().replace(/\s+/g, "-");

        downloadCSV(
            makeFilename(`${fileStatus}-report`),
            [
                "Product ID",
                "Product Name",
                "Category",
                "Unit Price (INR)",
                "Stock Quantity",
                "Total Product Value (INR)",
                "Stock Status"
            ],
            rows
        );
    }

    // ---------- RENDER ----------

    function renderAll() {
        const products = getProducts();

        updateCategoryOptions(products);
        renderSummary(products);
        renderCategoryTable(products);

        const filteredProducts = getFilteredProducts(products);

        renderInventoryTable(filteredProducts);
        updateReportMetadata(filteredProducts, products);
    }

    // ---------- EVENTS ----------

    function bindEvents() {
        elements.searchInput.addEventListener("input", renderAll);
        elements.categoryFilter.addEventListener("change", renderAll);
        elements.statusFilter.addEventListener("change", renderAll);

        elements.clearFilters.addEventListener("click", () => {
            elements.searchInput.value = "";
            elements.categoryFilter.value = "";
            elements.statusFilter.value = "";

            renderAll();
            showToast("Filters cleared.");
        });

        elements.refreshButton.addEventListener("click", () => {
            renderAll();
            showToast("Reports refreshed from saved inventory.");
        });

        elements.exportInventory.addEventListener("click", () => {
            const products = getProducts();
            const filtered = getFilteredProducts(products);

            exportInventory(filtered);
        });

        elements.exportCategories.addEventListener("click", () => {
            exportCategoryReport(getProducts());
        });

        document.querySelectorAll("[data-export-status]").forEach(button => {
            button.addEventListener("click", () => {
                const status = button.dataset.exportStatus;
                exportStatusReport(getProducts(), status);
            });
        });

        // Updates when inventory changes in another browser tab.
        window.addEventListener("storage", event => {
            if (!event.key || [
                "products",
                "inventoryProducts",
                "categories"
            ].includes(event.key)) {
                renderAll();
            }
        });

        // Refresh when returning to the report page.
        window.addEventListener("focus", renderAll);

        // Other modules can call this event after saving changes.
        window.addEventListener("inventory:updated", renderAll);
    }

    function init() {
        bindEvents();
        renderAll();
    }

    return {
        init,
        refresh: renderAll,
        getProducts,
        exportInventory,
        exportCategoryReport,
        exportStatusReport
    };
})();

document.addEventListener("DOMContentLoaded", Reports.init);
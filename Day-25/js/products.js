"use strict";

const Products = {
    all() {
        return Store.get("products", []);
    },

    status(product) {
        const stock = Number(product.stock) || 0;
        const minimum = Number(product.minimumStock ?? 10);

        if (stock <= 0) return "Out of Stock";
        if (stock < minimum) return "Low Stock";
        return "In Stock";
    },

    render() {
        const body = document.getElementById("productsTable");
        const select = document.getElementById("saleProduct");
        const movementSelect = document.getElementById("movementProduct");
        if (!body) return;

        const search = (document.getElementById("productSearch")?.value || "").toLowerCase();
        const products = this.all();

        body.innerHTML = products.filter(product =>
            product.name.toLowerCase().includes(search) ||
            String(product.id).toLowerCase().includes(search)
        ).map(product => {
            const status = this.status(product);
            const css = status === "In Stock" ? "" : status === "Low Stock" ? "low" : "out";

            return `
                <tr>
                    <td>${Store.escape(product.id)}</td>
                    <td>${Store.escape(product.name)}</td>
                    <td>${Store.escape(product.category)}</td>
                    <td>${Store.money(product.price)}</td>
                    <td>${product.stock}</td>
                    <td><span class="pill ${css}">${status}</span></td>
                    <td class="action-buttons">
                        <button data-edit-product="${Store.escape(product.id)}">Edit</button>
                        <button class="delete" data-delete-product="${Store.escape(product.id)}">Delete</button>
                    </td>
                </tr>
            `;
        }).join("") || '<tr><td colspan="7">No products found.</td></tr>';

        body.querySelectorAll("[data-edit-product]").forEach(button => {
            button.addEventListener("click", () => this.edit(button.dataset.editProduct));
        });

        body.querySelectorAll("[data-delete-product]").forEach(button => {
            button.addEventListener("click", () => this.remove(button.dataset.deleteProduct));
        });

        const options = products.map(product =>
            `<option value="${Store.escape(product.id)}">${Store.escape(product.name)} (stock: ${product.stock})</option>`
        ).join("");

        if (select) select.innerHTML = '<option value="">Select product</option>' + options;
        if (movementSelect) movementSelect.innerHTML = '<option value="">Select product</option>' + options;

        Dashboard.render();
    },

    edit(id) {
        const product = this.all().find(item => item.id === id);
        if (!product) return;

        document.getElementById("productId").value = product.id;
        document.getElementById("productName").value = product.name;
        document.getElementById("productCategory").value = product.category;
        document.getElementById("productPrice").value = product.price;
        document.getElementById("productStock").value = product.stock;
        document.getElementById("productMinimum").value = product.minimumStock ?? 10;
        document.getElementById("productSupplier").value = product.supplier || "";
        document.getElementById("productDescription").value = product.description || "";
        document.getElementById("saveProduct").textContent = "Update Product";

        location.hash = "products";
    },

    remove(id) {
        const product = this.all().find(item => item.id === id);
        if (!product || !confirm(`Delete ${product.name}?`)) return;

        Store.set("products", this.all().filter(item => item.id !== id));
        Notifications.add(`Product deleted: ${product.name}`, "warning");
        ActivityLog.add(`Deleted product ${product.name}`);

        this.render();
        Dashboard.render();
    },

    init() {
        const form = document.getElementById("productForm");
        if (!form) return;

        form.addEventListener("submit", event => {
            event.preventDefault();

            const id = document.getElementById("productId").value;
            const name = document.getElementById("productName").value.trim();
            const category = document.getElementById("productCategory").value;
            const price = Number(document.getElementById("productPrice").value);
            const stock = Number(document.getElementById("productStock").value);
            const minimumStock = Number(document.getElementById("productMinimum").value);
            const supplier = document.getElementById("productSupplier").value.trim();
            const description = document.getElementById("productDescription").value.trim();

            if (name.length < 3 || !category || price <= 0 ||
                stock < 0 || minimumStock < 0 || !Number.isFinite(price) ||
                !Number.isFinite(stock) || !Number.isFinite(minimumStock)) {
                alert("Please enter valid product details.");
                return;
            }

            const products = this.all();
            const product = {
                id: id || Store.id("PROD"),
                name,
                category,
                price,
                stock,
                minimumStock,
                supplier,
                description
            };

            if (id) {
                Store.set("products", products.map(item => item.id === id ? product : item));
                Notifications.add(`Product updated: ${name}`, "info");
                ActivityLog.add(`Updated product ${name}`);
            } else {
                Store.set("products", [...products, product]);
                Notifications.add(`New product added: ${name}`, "info");
                ActivityLog.add(`Added product ${name}`);
            }

            if (stock === 0) Notifications.add(`${name} is out of stock.`, "critical");
            else if (stock < minimumStock) Notifications.add(`${name} is below minimum stock.`, "warning");

            form.reset();
            document.getElementById("productId").value = "";
            document.getElementById("productMinimum").value = "10";
            document.getElementById("saveProduct").textContent = "Add Product";

            this.render();
            Categories.render();
            Dashboard.render();
        });

        document.getElementById("cancelProduct").addEventListener("click", () => {
            form.reset();
            document.getElementById("productId").value = "";
            document.getElementById("productMinimum").value = "10";
            document.getElementById("saveProduct").textContent = "Add Product";
        });

        document.getElementById("productSearch").addEventListener("input", () => this.render());

        this.render();
    }
};
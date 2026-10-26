"use strict";

const Categories = {
    all() {
        return Store.get("categories", []);
    },

    render() {
        const body = document.getElementById("categoriesTable");
        const select = document.getElementById("productCategory");
        if (!body || !select) return;

        const categories = this.all();
        const products = Store.get("products", []);

        body.innerHTML = categories.length ? categories.map(category => {
            const count = products.filter(p => p.category === category.name).length;
            return `
                <tr>
                    <td>${Store.escape(category.name)}</td>
                    <td>${Store.escape(category.description)}</td>
                    <td>${count}</td>
                    <td class="action-buttons">
                        <button data-edit-category="${Store.escape(category.id)}">Edit</button>
                        <button class="delete" data-delete-category="${Store.escape(category.id)}">Delete</button>
                    </td>
                </tr>
            `;
        }).join("") : '<tr><td colspan="4">No categories found.</td></tr>';

        select.innerHTML = '<option value="">Select category</option>' +
            categories.map(category =>
                `<option value="${Store.escape(category.name)}">${Store.escape(category.name)}</option>`
            ).join("");

        body.querySelectorAll("[data-edit-category]").forEach(button => {
            button.addEventListener("click", () => this.edit(button.dataset.editCategory));
        });

        body.querySelectorAll("[data-delete-category]").forEach(button => {
            button.addEventListener("click", () => this.remove(button.dataset.deleteCategory));
        });
    },

    edit(id) {
        const category = this.all().find(item => item.id === id);
        if (!category) return;

        document.getElementById("categoryId").value = category.id;
        document.getElementById("categoryName").value = category.name;
        document.getElementById("categoryDescription").value = category.description;
    },

    remove(id) {
        const category = this.all().find(item => item.id === id);
        if (!category) return;

        const used = Store.get("products", []).some(p => p.category === category.name);
        if (used) {
            alert("Cannot delete a category assigned to a product.");
            return;
        }

        if (!confirm("Delete this category?")) return;

        Store.set("categories", this.all().filter(item => item.id !== id));
        ActivityLog.add(`Deleted category ${category.name}`);
        this.render();
        Products.render();
    },

    init() {
        const form = document.getElementById("categoryForm");
        if (!form) return;

        form.addEventListener("submit", event => {
            event.preventDefault();

            const id = document.getElementById("categoryId").value;
            const name = document.getElementById("categoryName").value.trim();
            const description = document.getElementById("categoryDescription").value.trim();

            if (name.length < 2 || !description) {
                alert("Enter a category name and description.");
                return;
            }

            const categories = this.all();
            const duplicate = categories.some(item =>
                item.name.toLowerCase() === name.toLowerCase() && item.id !== id
            );

            if (duplicate) {
                alert("That category already exists.");
                return;
            }

            if (id) {
                Store.set("categories", categories.map(item =>
                    item.id === id ? { ...item, name, description } : item
                ));
                ActivityLog.add(`Updated category ${name}`);
            } else {
                Store.set("categories", [
                    ...categories,
                    { id: Store.id("CAT"), name, description, status: "Active" }
                ]);
                ActivityLog.add(`Added category ${name}`);
            }

            form.reset();
            document.getElementById("categoryId").value = "";
            this.render();
            Products.render();
        });

        document.getElementById("cancelCategory").addEventListener("click", () => {
            form.reset();
            document.getElementById("categoryId").value = "";
        });

        this.render();
    }
};
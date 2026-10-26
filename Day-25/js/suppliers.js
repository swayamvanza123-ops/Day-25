"use strict";

const Suppliers = {
    all() {
        return Store.get("suppliers", []);
    },

    render() {
        const body = document.getElementById("suppliersTable");
        if (!body) return;

        body.innerHTML = this.all().map(supplier => `
            <tr>
                <td>${Store.escape(supplier.name)}</td>
                <td>${Store.escape(supplier.company)}</td>
                <td>${Store.escape(supplier.phone)}</td>
                <td>${Store.escape(supplier.email)}</td>
                <td>${Store.escape(supplier.address)}</td>
                <td class="action-buttons">
                    <button data-edit-supplier="${Store.escape(supplier.id)}">Edit</button>
                    <button class="delete" data-delete-supplier="${Store.escape(supplier.id)}">Delete</button>
                </td>
            </tr>
        `).join("") || '<tr><td colspan="6">No suppliers found.</td></tr>';

        body.querySelectorAll("[data-edit-supplier]").forEach(button => {
            button.addEventListener("click", () => this.edit(button.dataset.editSupplier));
        });

        body.querySelectorAll("[data-delete-supplier]").forEach(button => {
            button.addEventListener("click", () => this.remove(button.dataset.deleteSupplier));
        });
    },

    edit(id) {
        const supplier = this.all().find(item => item.id === id);
        if (!supplier) return;

        for (const field of ["Id", "Name", "Company", "Phone", "Email", "Address"]) {
            const key = field.toLowerCase();
            const element = document.getElementById("supplier" + field);
            if (element) element.value = supplier[key] || "";
        }

        location.hash = "suppliers";
    },

    remove(id) {
        if (!confirm("Delete this supplier?")) return;
        Store.set("suppliers", this.all().filter(item => item.id !== id));
        ActivityLog.add("Deleted supplier");
        this.render();
    },

    init() {
        const form = document.getElementById("supplierForm");
        if (!form) return;

        form.addEventListener("submit", event => {
            event.preventDefault();

            const id = document.getElementById("supplierId").value;
            const supplier = {
                id: id || Store.id("SUP"),
                name: document.getElementById("supplierName").value.trim(),
                company: document.getElementById("supplierCompany").value.trim(),
                phone: document.getElementById("supplierPhone").value.trim(),
                email: document.getElementById("supplierEmail").value.trim(),
                address: document.getElementById("supplierAddress").value.trim()
            };

            if (Object.values(supplier).some(value => !String(value).trim())) {
                alert("Please complete all supplier fields.");
                return;
            }

            const list = this.all();
            const duplicate = list.some(item =>
                item.email.toLowerCase() === supplier.email.toLowerCase() &&
                item.id !== id
            );

            if (duplicate) {
                alert("A supplier with that email already exists.");
                return;
            }

            Store.set("suppliers", id
                ? list.map(item => item.id === id ? supplier : item)
                : [...list, supplier]);

            ActivityLog.add(`${id ? "Updated" : "Added"} supplier ${supplier.name}`);

            form.reset();
            document.getElementById("supplierId").value = "";
            this.render();
            Dashboard.render();
        });

        document.getElementById("cancelSupplier").addEventListener("click", () => {
            form.reset();
            document.getElementById("supplierId").value = "";
        });

        this.render();
    }
};
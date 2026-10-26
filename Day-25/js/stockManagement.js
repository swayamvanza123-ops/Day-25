"use strict";

const StockManagement = {
    all() {
        return Store.get("stockMovements", []);
    },

    render() {
        const body = document.getElementById("stockTable");
        if (!body) return;

        body.innerHTML = this.all().map(item => `
            <tr>
                <td>${Store.escape(item.date)}</td>
                <td>${Store.escape(item.productName)}</td>
                <td>${item.type === "IN" ? "Stock In" : "Stock Out"}</td>
                <td>${item.quantity}</td>
                <td>${item.updatedStock}</td>
                <td>${Store.escape(item.reason)}</td>
            </tr>
        `).join("") || '<tr><td colspan="6">No stock movements recorded.</td></tr>';
    },

    init() {
        const form = document.getElementById("stockForm");
        if (!form) return;

        form.addEventListener("submit", event => {
            event.preventDefault();

            const id = document.getElementById("movementProduct").value;
            const type = document.getElementById("movementType").value;
            const quantity = Number(document.getElementById("movementQuantity").value);
            const reason = document.getElementById("movementReason").value.trim();

            const products = Products.all();
            const product = products.find(item => item.id === id);

            if (!product || !Number.isInteger(quantity) || quantity <= 0 || !reason) {
                alert("Enter valid stock movement details.");
                return;
            }

            const updatedStock = type === "IN"
                ? product.stock + quantity
                : product.stock - quantity;

            if (updatedStock < 0) {
                alert("Not enough stock for this stock-out operation.");
                return;
            }

            Store.set("products", products.map(item =>
                item.id === id ? { ...item, stock: updatedStock } : item
            ));

            Store.set("stockMovements", [{
                id: Store.id("MOV"),
                date: new Date().toLocaleString(),
                productId: id,
                productName: product.name,
                type,
                quantity,
                previousStock: product.stock,
                updatedStock,
                reason
            }, ...this.all()]);

            Notifications.add(
                `${type === "IN" ? "Stock added to" : "Stock removed from"} ${product.name}`,
                "info"
            );

            if (updatedStock === 0) {
                Notifications.add(`${product.name} is out of stock.`, "critical");
            } else if (updatedStock < (product.minimumStock ?? 10)) {
                Notifications.add(`${product.name} is below minimum stock.`, "warning");
            }

            ActivityLog.add(`Stock ${type === "IN" ? "in" : "out"}: ${product.name}, ${quantity} units`);

            form.reset();
            Products.render();
            this.render();
            Dashboard.render();
        });

        this.render();
    }
};
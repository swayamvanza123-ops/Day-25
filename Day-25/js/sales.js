"use strict";

const Sales = {
    all() {
        return Store.get("sales", []);
    },

    render() {
        const body = document.getElementById("salesTable");
        if (!body) return;

        body.innerHTML = this.all().map(sale => `
            <tr>
                <td>${Store.escape(sale.invoice)}</td>
                <td>${Store.escape(sale.customer)}</td>
                <td>${Store.escape(sale.productName)}</td>
                <td>${sale.quantity}</td>
                <td>${Store.money(sale.total)}</td>
                <td>${Store.escape(sale.date)}</td>
            </tr>
        `).join("") || '<tr><td colspan="6">No sales recorded.</td></tr>';
    },

    init() {
        const form = document.getElementById("saleForm");
        if (!form) return;

        document.getElementById("saleDate").value = Store.date();

        form.addEventListener("submit", event => {
            event.preventDefault();

            const productId = document.getElementById("saleProduct").value;
            const quantity = Number(document.getElementById("saleQuantity").value);
            const discount = Number(document.getElementById("saleDiscount").value) || 0;
            const customer = document.getElementById("saleCustomer").value.trim();
            const phone = document.getElementById("salePhone").value.trim();
            const date = document.getElementById("saleDate").value;

            const products = Products.all();
            const product = products.find(item => item.id === productId);

            if (!product || !customer || !date || quantity <= 0 ||
                !Number.isInteger(quantity) || quantity > product.stock ||
                discount < 0 || discount > product.price * quantity) {
                alert("Please check the sale details and available stock.");
                return;
            }

            const subtotal = product.price * quantity;
            const total = subtotal - discount;

            Store.set("products", products.map(item =>
                item.id === productId
                    ? { ...item, stock: item.stock - quantity }
                    : item
            ));

            const sale = {
                invoice: Store.id("INV"),
                customer,
                phone,
                productId,
                productName: product.name,
                quantity,
                subtotal,
                discount,
                total,
                date
            };

            Store.set("sales", [sale, ...this.all()]);
            Notifications.add(`Sale completed: ${product.name} × ${quantity}`, "info");
            ActivityLog.add(`Completed sale ${sale.invoice}`);

            const updatedProduct = Products.all().find(item => item.id === productId);
            if (updatedProduct && updatedProduct.stock === 0) {
                Notifications.add(`${product.name} is now out of stock.`, "critical");
            } else if (updatedProduct && updatedProduct.stock < (updatedProduct.minimumStock ?? 10)) {
                Notifications.add(`${product.name} is now low on stock.`, "warning");
            }

            form.reset();
            document.getElementById("saleDate").value = Store.date();

            Products.render();
            this.render();
            Dashboard.render();
            StockManagement.render();
        });

        this.render();
    }
};
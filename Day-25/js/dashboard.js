"use strict";

const Dashboard = {
    render() {
        const products = Store.get("products", []);
        const suppliers = Store.get("suppliers", []);
        const sales = Store.get("sales", []);

        const stock = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
        const low = products.filter(product =>
            Number(product.stock) > 0 &&
            Number(product.stock) < Number(product.minimumStock ?? 10)
        ).length;

        const revenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);

        const set = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        set("dashProducts", products.length);
        set("dashStock", stock);
        set("dashLow", low);
        set("dashSuppliers", suppliers.length);
        set("dashRevenue", Store.money(revenue));

        const body = document.getElementById("dashboardTable");

        if (body) {
            body.innerHTML = products.map(product => {
                const status = Products.status(product);
                const css = status === "In Stock" ? "" : status === "Low Stock" ? "low" : "out";

                return `
                    <tr>
                        <td>${Store.escape(product.id)}</td>
                        <td>${Store.escape(product.name)}</td>
                        <td>${Store.escape(product.category)}</td>
                        <td>${Store.money(product.price)}</td>
                        <td>${product.stock}</td>
                        <td><span class="pill ${css}">${status}</span></td>
                    </tr>
                `;
            }).join("") || '<tr><td colspan="6">No products available.</td></tr>';
        }
    }
};
"use strict";

const Store = {
    get(key, fallback = []) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return data === null ? fallback : data;
        } catch {
            return fallback;
        }
    },

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new Event("inventory:updated"));
    },

    id(prefix = "ID") {
        return prefix + "-" + Date.now().toString(36).toUpperCase();
    },

    money(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(Number(value) || 0);
    },

    escape(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    },

    date() {
        return new Date().toISOString().slice(0, 10);
    }
};

if (!localStorage.getItem("products")) {
    Store.set("products", [
        { id: "P001", name: "Laptop", category: "Electronics", price: 50000, stock: 20, minimumStock: 10, supplier: "Tech World", description: "Business laptop" },
        { id: "P002", name: "Mouse", category: "Accessories", price: 800, stock: 50, minimumStock: 10, supplier: "Tech World", description: "Wireless computer mouse" },
        { id: "P003", name: "Keyboard", category: "Accessories", price: 1500, stock: 35, minimumStock: 10, supplier: "Tech World", description: "USB keyboard" },
        { id: "P004", name: "Monitor", category: "Electronics", price: 12000, stock: 8, minimumStock: 10, supplier: "Digital Store", description: "Full HD monitor" },
        { id: "P005", name: "Printer", category: "Electronics", price: 15000, stock: 0, minimumStock: 5, supplier: "Digital Store", description: "Office printer" }
    ]);
}

if (!localStorage.getItem("categories")) {
    Store.set("categories", [
        { id: "C001", name: "Electronics", description: "Electronic devices", status: "Active" },
        { id: "C002", name: "Accessories", description: "Computer accessories", status: "Active" },
        { id: "C003", name: "Furniture", description: "Office furniture", status: "Active" }
    ]);
}

if (!localStorage.getItem("suppliers")) {
    Store.set("suppliers", []);
}
if (!localStorage.getItem("sales")) Store.set("sales", []);
if (!localStorage.getItem("stockMovements")) Store.set("stockMovements", []);
if (!localStorage.getItem("notifications")) Store.set("notifications", []);
if (!localStorage.getItem("activityLogs")) Store.set("activityLogs", []);
if (!localStorage.getItem("expenses")) Store.set("expenses", []);
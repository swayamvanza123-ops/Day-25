"use strict";

const Notifications = {
    add(message, type = "info") {
        const list = Store.get("notifications", []);

        list.unshift({
            id: Store.id("NOT"),
            message,
            type,
            date: new Date().toLocaleString(),
            read: false
        });

        Store.set("notifications", list.slice(0, 300));
        this.render();
    },

    render() {
        const container = document.getElementById("notificationsList");
        if (!container) return;

        const list = Store.get("notifications", []);

        container.innerHTML = list.length
            ? list.map(item => `
                <div class="notification-item ${item.read ? "" : "unread"}">
                    <strong>${Store.escape(item.type.toUpperCase())}</strong>
                    <span>${Store.escape(item.message)}</span>
                    <small>${Store.escape(item.date)}</small>
                    ${item.read ? "" : `
                        <button class="btn btn-light" data-read="${Store.escape(item.id)}">
                            Mark read
                        </button>
                    `}
                </div>
            `).join("")
            : "<p class='muted'>No notifications yet.</p>";

        container.querySelectorAll("[data-read]").forEach(button => {
            button.addEventListener("click", () => {
                const updated = Store.get("notifications", []).map(item =>
                    item.id === button.dataset.read ? { ...item, read: true } : item
                );
                Store.set("notifications", updated);
                this.render();
            });
        });
    },

    markAllRead() {
        Store.set("notifications", Store.get("notifications", []).map(item => ({
            ...item,
            read: true
        })));
        this.render();
    }
};
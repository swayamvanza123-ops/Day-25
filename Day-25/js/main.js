"use strict";

document.addEventListener("DOMContentLoaded", () => {
    Auth.requireLogin();

    const user = Auth.current();

    if (user) {
        document.getElementById("currentUser").textContent =
            `${user.email} · ${user.role}`;

        // Staff can use products and stock only.
        if (user.role === "Staff") {
            ["categories", "suppliers", "sales"].forEach(section => {
                const link = document.querySelector(`.navigation a[href="#${section}"]`);
                if (link) link.style.display = "none";

                const element = document.getElementById(section);
                if (element) element.style.display = "none";
            });

            document.querySelectorAll('.navigation a[href="reports.html"]')
                .forEach(link => link.style.display = "none");
        }
    }

    document.getElementById("logoutButton").addEventListener("click", () => {
        ActivityLog.add("User logged out");
        Auth.logout();
    });

    document.getElementById("openReports").addEventListener("click", () => {
        window.location.href = "reports.html";
    });

    document.getElementById("dashboardRefresh").addEventListener("click", () => {
        Dashboard.render();
        alert("Dashboard refreshed.");
    });

    document.getElementById("markAllRead").addEventListener("click", () => {
        Notifications.markAllRead();
    });

    Categories.init();
    Products.init();
    Suppliers.init();
    Sales.init();
    StockManagement.init();

    ActivityLog.render();
    Notifications.render();
    Dashboard.render();

    window.addEventListener("inventory:updated", () => {
        Dashboard.render();
        ActivityLog.render();
        Notifications.render();
    });

    window.addEventListener("hashchange", () => {
        document.querySelectorAll(".navigation a").forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === location.hash);
        });

        const title = document.getElementById("pageTitle");
        if (title) {
            const activeLink = document.querySelector(`.navigation a[href="${location.hash}"]`);
            title.textContent = activeLink
                ? activeLink.textContent.trim()
                : "Dashboard";
        }
    });
});
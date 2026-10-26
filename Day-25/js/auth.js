"use strict";

const Auth = {
    current() {
        try {
            return JSON.parse(sessionStorage.getItem("inventoryUser")) || null;
        } catch {
            return null;
        }
    },

    requireLogin() {
        if (!this.current()) {
            window.location.replace("login.html");
        }
    },

    login(email, password, role) {
        const accounts = {
            "admin@example.com": { password: "admin123", role: "Admin" },
            "staff@example.com": { password: "staff123", role: "Staff" }
        };

        const account = accounts[email.toLowerCase()];

        if (!account || account.password !== password || account.role !== role) {
            return false;
        }

        const user = { email, role };
        sessionStorage.setItem("inventoryUser", JSON.stringify(user));

        if (typeof ActivityLog !== "undefined") {
            ActivityLog.add("User logged in");
        }

        return true;
    },

    logout() {
        sessionStorage.removeItem("inventoryUser");
        window.location.replace("login.html");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (!form) return;

    document.getElementById("togglePassword").addEventListener("click", () => {
        const password = document.getElementById("password");
        const button = document.getElementById("togglePassword");
        password.type = password.type === "password" ? "text" : "password";
        button.textContent = password.type === "password" ? "Show" : "Hide";
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        if (Auth.login(email, password, role)) {
            window.location.href = "index.html";
        } else {
            document.getElementById("loginMessage").textContent =
                "Incorrect email, password, or role.";
        }
    });
});
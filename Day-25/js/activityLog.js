"use strict";

const ActivityLog = {
    add(message) {
        const logs = Store.get("activityLogs", []);
        logs.unshift({
            id: Store.id("LOG"),
            message,
            date: new Date().toLocaleString()
        });
        Store.set("activityLogs", logs.slice(0, 300));
        this.render();
    },

    render() {
        const body = document.getElementById("activityTable");
        if (!body) return;

        const logs = Store.get("activityLogs", []);

        body.innerHTML = logs.length
            ? logs.map(log => `
                <tr>
                    <td>${Store.escape(log.date)}</td>
                    <td>${Store.escape(log.message)}</td>
                </tr>
            `).join("")
            : '<tr><td colspan="2">No activities yet.</td></tr>';
    }
};
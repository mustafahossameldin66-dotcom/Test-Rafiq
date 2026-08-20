const Utils = {
    $(selector, parent = document) { return parent.querySelector(selector); },
    $$(selector, parent = document) { return [...parent.querySelectorAll(selector)]; },
    delegate(eventName, parentSelector, targetSelector, callback) {
        const parent = this.$(parentSelector);
        if (!parent) return;
        parent.addEventListener(eventName, (event) => {
            const target = event.target.closest(targetSelector);
            if (target) callback(event, target);
        });
    },
    toast(message, duration = 2500) {
        const t = this.$('#toast');
        if (!t) return;
        t.textContent = message; t.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.classList.remove('show'), duration);
    }
};

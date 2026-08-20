const Router = {
    currentView: 'home',
    init() {
        Utils.delegate('click', '#sideNav', 'button[data-view]', (e, btn) => this.navigate(btn.dataset.view));
        Utils.delegate('click', '#bottomNav', 'button[data-view]', (e, btn) => this.navigate(btn.dataset.view));
        Utils.delegate('click', 'body', '[data-go]', (e, btn) => this.navigate(btn.dataset.go));
        this.navigate(StorageManager.get('lastView') || 'home');
    },
    navigate(viewId) {
        if (!viewId) return;
        const targetView = Utils.$(`#view-${viewId}`);
        if (!targetView) return;
        
        this.currentView = viewId;
        document.body.dataset.view = viewId;
        StorageManager.set('lastView', viewId);
        
        Utils.$$('.view').forEach(v => v.classList.remove('active', 'view-enter'));
        targetView.classList.add('active', 'view-enter');
        
        Utils.$$('[data-view]').forEach(btn => {
            const isActive = btn.dataset.view === viewId;
            btn.classList.toggle('active', isActive);
            if (isActive) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
        });
        
        document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view: viewId } }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};
document.addEventListener('DOMContentLoaded', () => Router.init());

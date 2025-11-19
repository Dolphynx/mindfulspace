export async function registerServiceWorker() {

    // to disable in dev mode
    if (process.env.NODE_ENV !== "production") return;

    if ('serviceWorker' in navigator) {
        // console.log ('Window detected, attempting SW registration...');
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            console.log('SW registered:', reg.scope);
        } catch (err) {
            console.error('SW registration failed:', err);
        }
    }
}

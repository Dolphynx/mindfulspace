export async function registerServiceWorker() {
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

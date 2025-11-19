'use client';
import {useEffect} from 'react';
import {registerServiceWorker} from './register-sw';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        void registerServiceWorker();
    }, []);
    return null; // nothing to render (no UI)
}
import { ShortcutsManager } from '../logic/shortcuts';

export function initializeGlobalShortcuts() {
    ShortcutsManager.init();

    console.log('Global shortcuts initialized');
}

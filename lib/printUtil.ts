/**
 * Open complete HTML in an isolated browser window and print it.
 *
 * Guarantees a single print() call regardless of browser timing.
 * Works with any printer the OS knows about — including Bluetooth
 * POS thermal printers paired as a system printer.
 *
 * @param html    Full <!DOCTYPE html>…</html> string
 * @param onDone  Called after the window closes (print finished or cancelled)
 */
export function printInWindow(html: string, onDone?: () => void): void {
    // No size/position args → browser opens as a normal tab (not a tiny popup)
    const win = window.open('', '_blank');

    if (!win) {
        // Popup blocked — nothing we can do without user intervention
        onDone?.();
        return;
    }

    let printed = false;
    let loadedOrTimedOut = false;
    let loadFallbackTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;

    const doPrint = () => {
        if (printed) return;
        printed = true;
        try {
            win.focus();
            win.print();
        } catch {
            doClose();
        }
    };

    const doClose = () => {
        clearTimeout(closeTimer);
        try { win.close(); } catch {}
        onDone?.();
    };

    const onLoaded = () => {
        if (loadedOrTimedOut) return;
        loadedOrTimedOut = true;
        clearTimeout(loadFallbackTimer);

        // Small delay so browser finishes layout before print dialog opens
        setTimeout(doPrint, 300);

        // Close window after print completes or is cancelled
        (win as Window & typeof globalThis).onafterprint = () => setTimeout(doClose, 400);

        // Safety valve: close after 15s even if afterprint never fires
        closeTimer = setTimeout(doClose, 15_000);
    };

    win.document.write(html);
    win.document.close();

    win.onload = onLoaded;

    // Fallback: some browsers don't fire onload for programmatic writes
    loadFallbackTimer = setTimeout(() => {
        onLoaded();
    }, 1500);
}

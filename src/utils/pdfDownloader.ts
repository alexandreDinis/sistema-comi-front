/**
 * PDF Downloader Utility
 * 
 * Replaces window.open() with fetch()-based PDF downloads.
 * Handles 429 (Too Many Requests) gracefully with Retry-After header support.
 * 
 * Architecture:
 *   Infra constraint (Semaphore 429) → UX state (Queue Modal)
 *   Controlled retries (maxRetries=3) prevent DDoS loops.
 */

export interface PdfDownloadResult {
    success: boolean;
    queued?: boolean;
    retryAfterSeconds?: number;
    error?: string;
    blob?: Blob;
}

const MAX_RETRIES = 3;

/**
 * Downloads a PDF from the given URL using fetch().
 * Returns a result object instead of opening a new tab.
 */
export async function downloadPdf(url: string, filename: string): Promise<PdfDownloadResult> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
            },
        });

        // Success — create blob and trigger download
        if (response.ok) {
            const blob = await response.blob();
            triggerBlobDownload(blob, filename);
            return { success: true, blob };
        }

        // 429 Too Many Requests — semaphore queue full
        if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
            console.log(`[PDF] 429 received. Retry-After: ${retryAfter}s`);
            return {
                success: false,
                queued: true,
                retryAfterSeconds: retryAfter,
            };
        }

        // Auth errors
        if (response.status === 401 || response.status === 403) {
            return {
                success: false,
                error: 'Sessão expirada. Faça login novamente.',
            };
        }

        // Other errors
        let errorMessage = 'Erro ao gerar o documento.';
        try {
            const errorBody = await response.json();
            if (errorBody.message) errorMessage = errorBody.message;
        } catch {
            // response wasn't JSON
        }

        return { success: false, error: errorMessage };
    } catch (err) {
        console.error('[PDF] Network error:', err);
        return {
            success: false,
            error: 'Erro de conexão. Verifique sua internet e tente novamente.',
        };
    }
}

/**
 * Downloads a PDF with automatic retry on 429.
 * Uses the Retry-After header from the backend.
 * Max retries: 3 to prevent infinite loops.
 * 
 * @param onQueueUpdate Called when 429 is received, with seconds remaining and attempt count
 * @returns Final result after all retries exhausted or success
 */
export async function downloadPdfWithRetry(
    url: string,
    filename: string,
    onQueueUpdate?: (secondsLeft: number, attempt: number, maxAttempts: number) => void,
    onCountdownTick?: (secondsLeft: number) => void,
): Promise<PdfDownloadResult> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const result = await downloadPdf(url, filename);

        if (result.success) return result;
        if (!result.queued) return result; // Non-retryable error

        const waitSeconds = result.retryAfterSeconds || 5;
        console.log(`[PDF] Attempt ${attempt}/${MAX_RETRIES}. Waiting ${waitSeconds}s...`);

        // Notify caller about queue status
        onQueueUpdate?.(waitSeconds, attempt, MAX_RETRIES);

        // Countdown with per-second ticks
        await countdownWait(waitSeconds, onCountdownTick);
    }

    // All retries exhausted
    return {
        success: false,
        error: 'Servidor em alta demanda. Tente novamente em alguns instantes.',
    };
}

/**
 * Builds a PDF URL with token authentication (same pattern as existing services)
 */
export function buildPdfUrl(baseURL: string, path: string): string {
    const userStr = localStorage.getItem('user');
    const token = userStr ? JSON.parse(userStr).token : null;
    const base = baseURL.replace(/\/?$/, '/');
    return `${base}${path}${path.includes('?') ? '&' : '?'}token=${token}`;
}

/**
 * Triggers a browser download from a Blob
 */
function triggerBlobDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Waits N seconds with per-second tick callbacks
 */
function countdownWait(seconds: number, onTick?: (remaining: number) => void): Promise<void> {
    return new Promise((resolve) => {
        let remaining = seconds;
        onTick?.(remaining);

        const interval = setInterval(() => {
            remaining--;
            onTick?.(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    });
}

import { useState, useCallback, useRef } from 'react';
import { downloadPdfWithRetry, buildPdfUrl } from '../utils/pdfDownloader';
import type { PdfModalState } from '../components/modals/PdfQueueModal';

/**
 * Custom hook for PDF downloads with queue modal state management.
 * Encapsulates all the download + retry + modal state logic.
 * 
 * Usage:
 *   const { pdfState, startDownload, closePdfModal } = usePdfDownload();
 *   
 *   <button onClick={() => startDownload('relatorios/1/2/pdf', 'relatorio.pdf')}>
 *   <PdfQueueModal state={pdfState} onClose={closePdfModal} onRetry={...} />
 */
export function usePdfDownload(apiBaseUrl: string) {
    const [state, setState] = useState<PdfModalState>({ status: 'idle' });
    const lastDownloadRef = useRef<{ path: string; filename: string } | null>(null);

    const startDownload = useCallback(async (path: string, filename: string) => {
        lastDownloadRef.current = { path, filename };
        setState({ status: 'downloading' });

        const url = buildPdfUrl(apiBaseUrl, path);

        const result = await downloadPdfWithRetry(
            url,
            filename,
            // onQueueUpdate: called when 429 received
            (secondsLeft, attempt, maxAttempts) => {
                setState({ status: 'queued', secondsLeft, attempt, maxAttempts });
            },
            // onCountdownTick: called every second during countdown
            (secondsLeft) => {
                setState(prev => {
                    if (prev.status === 'queued') {
                        return { ...prev, secondsLeft };
                    }
                    return prev;
                });
            },
        );

        if (result.success) {
            setState({ status: 'success' });
        } else if (result.error) {
            setState({ status: 'error', message: result.error });
        }
    }, [apiBaseUrl]);

    const retry = useCallback(() => {
        if (lastDownloadRef.current) {
            startDownload(lastDownloadRef.current.path, lastDownloadRef.current.filename);
        }
    }, [startDownload]);

    const close = useCallback(() => {
        setState({ status: 'idle' });
    }, []);

    return {
        pdfState: state,
        startPdfDownload: startDownload,
        retryPdfDownload: retry,
        closePdfModal: close,
    };
}

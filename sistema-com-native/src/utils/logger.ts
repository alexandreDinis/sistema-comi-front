/**
 * Logger Utility
 * 
 * Implementa logging condicional que só funciona em modo de desenvolvimento.
 * Em produção, todos os logs são silenciados para evitar vazamento de informações sensíveis.
 */

import Constants from 'expo-constants';

const IS_DEV = __DEV__;
const ENABLE_LOGS = Constants.expoConfig?.extra?.enableLogs ?? true;
const SHOULD_LOG = IS_DEV && ENABLE_LOGS;

/**
 * Prefixos coloridos para diferentes tipos de log (visível apenas no console)
 */
const PREFIX = {
    INFO: '📘',
    WARN: '⚠️',
    ERROR: '🚨',
    SUCCESS: '✅',
    API: '🌐',
    AUTH: '🔐',
    STORAGE: '💾',
};

class Logger {
    /**
     * Log informativo
     */
    static info(message: string, ...args: any[]) {
        if (SHOULD_LOG) {
            console.log(`${PREFIX.INFO} [INFO]`, message, ...args);
        }
    }

    /**
     * Log de aviso
     */
    static warn(message: string, ...args: any[]) {
        if (SHOULD_LOG) {
            console.warn(`${PREFIX.WARN} [WARN]`, message, ...args);
        }
    }

    /**
     * Log de erro
     * Nota: Erros críticos sempre são logados, mas sem detalhes sensíveis em produção
     */
    static error(message: string, error?: any) {
        if (IS_DEV) {
            console.error(`${PREFIX.ERROR} [ERROR]`, message, error);
        } else {
            // Em produção, log apenas a mensagem genérica
            console.error(`${PREFIX.ERROR} [ERROR]`, message);
        }
    }

    /**
     * Log de sucesso
     */
    static success(message: string, ...args: any[]) {
        if (SHOULD_LOG) {
            console.log(`${PREFIX.SUCCESS} [SUCCESS]`, message, ...args);
        }
    }

    /**
     * Log específico para requisições de API
     */
    static api(method: string, url: string, data?: any) {
        if (SHOULD_LOG) {
            console.log(`${PREFIX.API} [API] ${method.toUpperCase()} ${url}`, data || '');
        }
    }

    /**
     * Log específico para operações de autenticação
     */
    static auth(message: string, ...args: any[]) {
        if (SHOULD_LOG) {
            console.log(`${PREFIX.AUTH} [AUTH]`, message, ...args);
        }
    }

    /**
     * Log específico para operações de storage
     */
    static storage(operation: string, key: string) {
        if (SHOULD_LOG) {
            console.log(`${PREFIX.STORAGE} [STORAGE]`, operation, key);
        }
    }

    /**
     * Log de tabela (útil para arrays e objetos)
     */
    static table(data: any) {
        if (SHOULD_LOG && console.table) {
            console.table(data);
        }
    }

    /**
     * Log de grupo (para organizar logs relacionados)
     */
    static group(label: string) {
        if (SHOULD_LOG && console.group) {
            console.group(label);
        }
    }

    static groupEnd() {
        if (SHOULD_LOG && console.groupEnd) {
            console.groupEnd();
        }
    }

    /**
     * Debug: informações do ambiente
     */
    static debugEnvironment() {
        if (SHOULD_LOG) {
            Logger.group('🔧 Environment Info');
            Logger.info('Is Development:', IS_DEV);
            Logger.info('Logs Enabled:', ENABLE_LOGS);
            Logger.info('API URL:', Constants.expoConfig?.extra?.apiUrl);
            Logger.info('Environment:', Constants.expoConfig?.extra?.environment);
            Logger.groupEnd();
        }
    }
}

export default Logger;

/**
 * Helpers para desenvolvimento
 */

/**
 * Sanitiza dados sensíveis antes de logar
 */
export function sanitizeForLog(data: any): any {
    if (!data) return data;

    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];

    if (typeof data === 'object') {
        const sanitized = { ...data };
        Object.keys(sanitized).forEach(key => {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                sanitized[key] = '***REDACTED***';
            }
        });
        return sanitized;
    }

    return data;
}

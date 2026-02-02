// src/utils/uuid.ts
// UUID generation compatible with React Native (no crypto.getRandomValues dependency)

/**
 * Generates a UUID v4 compatible string without requiring crypto.getRandomValues()
 * Uses Math.random() which is sufficient for local IDs (not for security-critical purposes)
 */
export function generateLocalId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}-${randomPart2}`;
}

/**
 * Alternative UUID v4 format using Math.random()
 * Follows UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

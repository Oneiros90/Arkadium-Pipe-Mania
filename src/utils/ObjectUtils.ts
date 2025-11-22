/**
 * Recursively extract all leaf values (primitives) from an object structure.
 * This allows dynamic extraction regardless of structure depth.
 */
export function findRecursively<T>(obj: unknown): T[] {
    const results: T[] = [];

    if (Array.isArray(obj)) {
        // Recursively process array items
        for (const item of obj) {
            results.push(...findRecursively<T>(item));
        }
    } else if (obj !== null && typeof obj === 'object') {
        // Recursively process object values
        for (const value of Object.values(obj)) {
            results.push(...findRecursively<T>(value));
        }
    } else {
        // Leaf value (primitive: string, number, boolean, etc.)
        results.push(obj as T);
    }

    return results;
}

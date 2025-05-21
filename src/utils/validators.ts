export function isValidHexColor(str: string): boolean {
    return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(str);
}
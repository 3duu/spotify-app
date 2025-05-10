// Parse URL hash into key/value pairs
export default function getHashParams(hash: string): Record<string, string> {
    if (!hash || hash.length < 2) return {};
    return hash.substring(1).split('&').reduce<Record<string, string>>((acc, pair) => {
        const [key, val] = pair.split('=');
        acc[key] = decodeURIComponent(val);
        return acc;
    }, {});
}
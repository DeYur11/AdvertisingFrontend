export function highlightMatch(text, query) {
    if (!query) return text;

    const safeQuery = query.trim();
    if (safeQuery.length === 0) return text;

    const regex = new RegExp(`(${safeQuery})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, index) => (
        regex.test(part) ? <span key={index} className="highlight">{part}</span> : part
    ));
}

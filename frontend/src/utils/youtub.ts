export const isYouTubeUrl = (u: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(u);

export const toYouTubeEmbedUrl = (raw: string) => {
    try {
        const u = new URL(raw);
        // youtu.be/<id>
        if (u.hostname.includes("youtu.be")) {
            const id = u.pathname.replace("/", "");
            return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1`;
        }
        // youtube.com/watch?v=<id> or shorts/<id>
        if (u.hostname.includes("youtube.com")) {
            if (u.pathname.startsWith("/shorts/")) {
                const id = u.pathname.split("/")[2];
                return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1`;
            }
            const id = u.searchParams.get("v");
            if (id) {
                return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1`;
            }
        }
    } catch { }
    // Fallback to raw (YouTube will usually redirect fine)
    return raw;
};
const ErrorTracker = {
    init() {
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            this.logError({
                message: msg,
                url: url,
                line: lineNo,
                column: columnNo,
                error: error
            });
            return false;
        };
    },

    async logError(error) {
        try {
            await fetch('/api/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error)
            });
        } catch (e) {
            console.error('Error logging failed:', e);
        }
    }
};

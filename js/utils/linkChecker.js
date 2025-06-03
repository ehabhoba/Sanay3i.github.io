const LinkChecker = {
    async checkInternalLinks() {
        const links = document.querySelectorAll('a[href^="/"]');
        const brokenLinks = [];
        for (let link of links) {
            try {
                const response = await fetch(link.href);
                if (!response.ok) {
                    brokenLinks.push(link.href);
                }
            } catch (e) {
                brokenLinks.push(link.href);
            }
        }
        return brokenLinks;
    }
};

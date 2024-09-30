export class URLModifier {
    private cnDomain: string;
    private originalDomain: string;

    constructor(cnDomain: string, originalDomain: string) {
        this.cnDomain = cnDomain;
        this.originalDomain = originalDomain;
    }

    public modifyURLsInHTML(html: string): string {
        const urlPattern = new RegExp(`https?://(${this.originalDomain.replace('.', '\\.')})(/[^"']*)?`, 'gi');

        // Replace all URLs in href, src, and form actions
        const modifiedHTML = html.replace(urlPattern, (match) => {
            return match.replace(this.originalDomain, this.cnDomain);
        });

        return modifiedHTML;
    }

    public modifySingleURL(url: string): string {
        if (url.includes(this.originalDomain)) {
            return url.replace(this.originalDomain, this.cnDomain);
        }
        return url;
    }
}

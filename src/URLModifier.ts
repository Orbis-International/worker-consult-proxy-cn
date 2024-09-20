export class URLModifier {
    private searchUrl: string;
    private replaceUrl: string;
  
    constructor(searchUrl: string, replaceUrl: string) {
      this.searchUrl = searchUrl;
      this.replaceUrl = replaceUrl;
    }
  
    element(element: Element) {
      const attributeName = element.tagName === 'script' ? 'src' : 'href';
      const attributeValue = element.getAttribute(attributeName);
  
      if (attributeValue && attributeValue.includes(this.searchUrl)) {
        const modifiedUrl = attributeValue.replace(this.searchUrl, this.replaceUrl);
        element.setAttribute(attributeName, modifiedUrl);
      }
    }
  }
  
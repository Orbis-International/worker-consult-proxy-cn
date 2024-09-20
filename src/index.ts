import { URLModifier } from './URLModifier';

const urlModifier = new URLModifier('consult.cybersight.org.cn', 'consult.cybersight.org');

export default {
  async fetch(request: Request): Promise<Response> {
    // Clone the request to handle both forwarding and logging/monitoring
    const modifiedRequest = new Request(request);
    
    try {
      const response = await fetch(modifiedRequest);
      
      // If the content type is HTML, rewrite it using Cloudflare HTMLRewriter
      if (response.headers.get('content-type')?.includes('text/html')) {
        return new HTMLRewriter()
          .on('a[href], link[href], img[src], script[src], form[action]', new URLRewriter(urlModifier))
          .transform(response);
      }
      
      // If it's not HTML, just pass through the response
      return response;
    } catch (error) {
      return new Response('Proxy error occurred', { status: 500 });
    }
  },
};

class URLRewriter {
  private urlModifier: URLModifier;
  
  constructor(urlModifier: URLModifier) {
    this.urlModifier = urlModifier;
  }

  element(element: Element) {
    const attrList = ['href', 'src', 'action'];
    for (const attr of attrList) {
      const attributeValue = element.getAttribute(attr);
      if (attributeValue) {
        const newValue = this.urlModifier.modifySingleURL(attributeValue);
        element.setAttribute(attr, newValue);
      }
    }
  }
}

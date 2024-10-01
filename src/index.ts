import { URLModifier } from './URLModifier';

const urlModifier = new URLModifier('consult.cybersight.org.cn', 'consult.cybersight.org');

export default {
  async fetch(request: Request): Promise<Response> {
    // Clone the request to handle both forwarding and logging/monitoring

    // ensure request URL targets https
    const url = new URL(request.url);
    if (url.protocol !== 'https:') {
      url.protocol = 'https:';
    }

    // we query the non-cn domain for content to be proxied
    url.hostname = 'consult.cybersight.org';

    const modifiedRequest = new Request(url, request);

    try {
/      const response = await fetch(modifiedRequest);

      // If the response is a redirect, rewrite the location header and return the new response
      if (response.headers.get('location')?.includes('consult.cybersight.org')) {
        const newResponse = new Response(response.body, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText
        });

        let originalLocationHeader = newResponse.headers.get('location');
        console.log('Headers:', originalLocationHeader);
        newResponse.headers.delete('location');
        newResponse.headers.append('location', originalLocationHeader.replace('consult.cybersight.org', 'consult.cybersight.org.cn'));

        return newResponse
      }

      // If the content type is HTML, rewrite it using Cloudflare HTMLRewriter
      if (response.headers.get('content-type')?.includes('text/html')) {
        return new HTMLRewriter()
          .on('a[href], link[href], img[src], script[src], form[action]', new URLRewriter(urlModifier))
          .transform(response);
      }

      // If it's not HTML, just pass through the response
      return response;
    } catch (error) {
      return new Response('Proxy error occurred ' + error, { status: 500 });
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

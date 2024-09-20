import { URLModifier } from './URLModifier';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Check if the request is already targeting the .cn domain to avoid recursion
  if (url.hostname === 'consult.cybersight.org.cn') {
    return fetch(request); // Forward request without recursion
  }

  // Replace the original domain with the .cn domain
  if (url.hostname === 'consult.cybersight.org') {
    url.hostname = 'consult.cybersight.org.cn';
  }

  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect
  });

  const response = await fetch(modifiedRequest);

  // If it's HTML, rewrite the URLs in the response
  if (response.headers.get('content-type')?.includes('text/html')) {
    return new HTMLRewriter()
      .on('a[href]', new URLModifier('consult.cybersight.org', 'consult.cybersight.org.cn'))
      .on('link[href]', new URLModifier('consult.cybersight.org', 'consult.cybersight.org.cn'))
      .on('script[src]', new URLModifier('consult.cybersight.org', 'consult.cybersight.org.cn'))
      .transform(response);
  }

  return response;
}

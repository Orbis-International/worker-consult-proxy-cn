import { URLModifier } from './URLModifier';

const urlModifier = new URLModifier('consult.cybersight.org.cn', 'consult.cybersight.org');
const startAnalyticsTag = '<!-- Google Tag Manager -->';
const endAnalyticsTag = '<!-- End Google Tag Manager -->';

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
      const response = await fetch(modifiedRequest);

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

      const analyticsContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
		new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
		j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
		'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
		})(window,document,'script','dataLayer','GTM-PSVL6ZM');`

      // If the content type is HTML, rewrite it using Cloudflare HTMLRewriter
      if (response.headers.get('content-type')?.includes('text/html')) {

        const styleRewritter = new HTMLRewriter()
          .on('style', {
            text(text: Text) {
              if (text.text.includes('onsult.cybersight.org/')) {
                let modifiedText = text.text;
                modifiedText = modifiedText.replace('consult.cybersight.org/', 'consult.cybersight.org.cn/');
                text.replace(modifiedText);
              }
            }
          });

        const responseWithModifiedStyle = styleRewritter.transform(response);


        // Remove Google Analytics script based on start and end comment tags
        const analyticsRemover = new HTMLRewriter()
          .on('script',
            {
              // We remove analytics code by matching part of the code (even if chunked it should work)
              text(text: Text) {
                if (analyticsContent.includes(text.text)) {
                  text.remove();
                } else {
                  if (text.text.includes('consult.cybersight.org/')) {
                    // console.log('Found text:', text.text);
                    let modifiedText = text.text;
                    modifiedText = modifiedText.replace('consult.cybersight.org/', 'consult.cybersight.org.cn/');
                    text.replace(modifiedText);
                    // console.log('Modified text:', modifiedText);
                  }
                }
              }
            }
          );

        const responseWithoutAnalytics = analyticsRemover.transform(responseWithModifiedStyle);

        return new HTMLRewriter()
          .on('a[href], link[href], img[src], script[src], form[action], input[src], style', new URLRewriter(urlModifier))
          .transform(responseWithoutAnalytics);
      }

      // If it's not HTML, just pass through the response
      return response;
    } catch (error) {
      return new Response('Proxy error occurred ' + error, { status: 500 });
    }
  },
};

// class elementHandler {
//   element(element: Element) {
//     this.buffer = '';
//   }
//   text(text: string) {
//     this.buffer += text.text
//     if (text.lastInTextNode) {
//       // this is the last bit of text in the chunk. Search and replace text
//       text.replace(this.buffer.replace(/cat/g, 'dog'), { html: true });
//       this.buffer = '';
//     } else {
//       // This wasn't the last text chunk, and we don't know if this chunk will
//       // participate in a match. We must remove it so the client doesn't see it
//       text.remove();
//     }
//   }
// }

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

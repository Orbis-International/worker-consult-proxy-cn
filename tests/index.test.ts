import { describe, it, expect, beforeEach } from 'vitest'; // Import these functions
import { URLModifier } from '../src/URLModifier';

describe('URL Modifier Tests', () => {
  let urlModifier: URLModifier;

  beforeEach(() => {
    urlModifier = new URLModifier('consult.cybersight.org.cn', 'consult.cybersight.org');
  });

  it('should rewrite URLs in HTML content', () => {
    const htmlInput = `
      <a href="https://consult.cybersight.org/some-page">Link</a>
      <img src="https://consult.cybersight.org/images/logo.png">
      <form action="https://consult.cybersight.org/login">
        <input type="submit" value="Submit">
      </form>
      <script src="https://consult.cybersight.org/js/app.js"></script>
    `;

    const expectedOutput = `
      <a href="https://consult.cybersight.org.cn/some-page">Link</a>
      <img src="https://consult.cybersight.org.cn/images/logo.png">
      <form action="https://consult.cybersight.org.cn/login">
        <input type="submit" value="Submit">
      </form>
      <script src="https://consult.cybersight.org.cn/js/app.js"></script>
    `;

    const modifiedHTML = urlModifier.modifyURLsInHTML(htmlInput);
    expect(modifiedHTML).toBe(expectedOutput);
  });

  it('should not modify non-related URLs', () => {
    const htmlInput = '<a href="https://other-domain.com">External Link</a>';
    const modifiedHTML = urlModifier.modifyURLsInHTML(htmlInput);
    expect(modifiedHTML).toBe(htmlInput); // No change for external links
  });
});

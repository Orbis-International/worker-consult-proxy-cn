import { handleRequest } from '../src/index';

describe('Cybersight Worker', () => {
  it('should rewrite URL from consult.cybersight.org to consult.cybersight.org.cn', async () => {
    // Mock request to `consult.cybersight.org`
    const request = new Request('https://consult.cybersight.org/path/to/resource', {
      method: 'GET'
    });

    // Invoke the worker's handleRequest function
    const response = await handleRequest(request);

    // Check if the response was fetched from the correct domain
    expect(response).toBeTruthy();
    expect(response instanceof Response).toBe(true);

    // Simulate the rewritten URL
    const url = new URL(response.url);
    expect(url.hostname).toBe('consult.cybersight.org.cn');
  });

  it('should not rewrite URL if already on the .cn domain', async () => {
    // Mock request to the .cn domain
    const request = new Request('https://consult.cybersight.org.cn/path/to/resource', {
      method: 'GET'
    });

    // Invoke the worker's handleRequest function
    const response = await handleRequest(request);

    // Ensure the domain is not altered
    const url = new URL(response.url);
    expect(url.hostname).toBe('consult.cybersight.org.cn');
  });
});

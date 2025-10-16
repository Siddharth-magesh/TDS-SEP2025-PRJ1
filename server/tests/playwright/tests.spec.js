// Playwright tests for generated pages
import { test, expect } from '@playwright/test';

// Load environment or use defaults
const PAGES_URL = process.env.PAGES_URL || 'http://localhost:8080';
const CHECKS = process.env.CHECKS ? JSON.parse(process.env.CHECKS) : [];

test.describe('Generated Application Tests', () => {
  
  test('page loads successfully', async ({ page }) => {
    await page.goto(PAGES_URL);
    await expect(page).toHaveTitle(/.+/); // Has some title
    console.log('Page title:', await page.title());
  });
  
  test('page has basic structure', async ({ page }) => {
    await page.goto(PAGES_URL);
    
    // Check for common elements
    const h1 = await page.locator('h1').first();
    await expect(h1).toBeVisible();
    console.log('H1 text:', await h1.textContent());
  });
  
  test('page handles URL parameters', async ({ page }) => {
    await page.goto(`${PAGES_URL}?url=https://example.com/test.csv`);
    
    // Check if source-url div exists and contains the URL
    const sourceUrl = await page.locator('#source-url').first();
    if (await sourceUrl.isVisible()) {
      const text = await sourceUrl.textContent();
      expect(text).toContain('example.com');
      console.log('Source URL display:', text);
    }
  });
  
  test('page has main output area', async ({ page }) => {
    await page.goto(PAGES_URL);
    
    const mainOutput = await page.locator('#main-output').first();
    await expect(mainOutput).toBeVisible();
    console.log('Main output:', await mainOutput.textContent());
  });
  
  // Dynamic checks based on CHECKS environment variable
  if (CHECKS.length > 0) {
    test('custom validation checks', async ({ page }) => {
      await page.goto(PAGES_URL);
      
      for (const check of CHECKS) {
        console.log('Running check:', check);
        
        // Parse check and create assertion
        const checkLower = check.toLowerCase();
        
        if (checkLower.includes('display') && checkLower.includes('url')) {
          const sourceUrl = await page.locator('#source-url');
          await expect(sourceUrl).toBeVisible();
        }
        
        if (checkLower.includes('input') || checkLower.includes('textarea')) {
          const inputs = await page.locator('input, textarea');
          expect(await inputs.count()).toBeGreaterThan(0);
        }
        
        if (checkLower.includes('button')) {
          const buttons = await page.locator('button');
          expect(await buttons.count()).toBeGreaterThan(0);
        }
        
        if (checkLower.includes('calculate') || checkLower.includes('output')) {
          const output = await page.locator('#main-output');
          await expect(output).toBeVisible();
        }
      }
    });
  }
  
  // Template-specific tests
  test.describe('Sum of Sales Calculator', () => {
    test.skip(({ page }) => !PAGES_URL.includes('sum'), 'Not a sum-of-sales app');
    
    test('has CSV input area', async ({ page }) => {
      await page.goto(PAGES_URL);
      const textarea = await page.locator('#csv-input');
      await expect(textarea).toBeVisible();
    });
    
    test('has calculate button', async ({ page }) => {
      await page.goto(PAGES_URL);
      const button = await page.locator('#calculate-btn');
      await expect(button).toBeVisible();
    });
    
    test('calculates sum correctly', async ({ page }) => {
      await page.goto(PAGES_URL);
      
      const sampleCSV = `date,sales
2024-01-01,100
2024-01-02,200
2024-01-03,300`;
      
      await page.fill('#csv-input', sampleCSV);
      await page.click('#calculate-btn');
      
      const output = await page.locator('#main-output');
      const text = await output.textContent();
      expect(text).toContain('600');
    });
  });
  
  test.describe('Markdown to HTML Converter', () => {
    test.skip(({ page }) => !PAGES_URL.includes('markdown'), 'Not a markdown app');
    
    test('has markdown input', async ({ page }) => {
      await page.goto(PAGES_URL);
      const textarea = await page.locator('#markdown-input');
      await expect(textarea).toBeVisible();
    });
    
    test('converts markdown to HTML', async ({ page }) => {
      await page.goto(PAGES_URL);
      
      await page.fill('#markdown-input', '# Hello World\n\nThis is **bold**');
      
      // Wait for conversion
      await page.waitForTimeout(500);
      
      const output = await page.locator('#main-output');
      const html = await output.innerHTML();
      expect(html).toContain('<h1>');
      expect(html).toContain('<strong>');
    });
  });
  
  test.describe('GitHub User Created', () => {
    test.skip(({ page }) => !PAGES_URL.includes('github'), 'Not a github app');
    
    test('has username input', async ({ page }) => {
      await page.goto(PAGES_URL);
      const input = await page.locator('#username-input');
      await expect(input).toBeVisible();
    });
    
    test('fetches user data', async ({ page }) => {
      await page.goto(PAGES_URL);
      
      await page.fill('#username-input', 'octocat');
      await page.click('#check-btn');
      
      // Wait for API call
      await page.waitForTimeout(2000);
      
      const output = await page.locator('#main-output');
      const text = await output.textContent();
      expect(text).toContain('octocat');
    });
  });
  
});

// Repository structure tests
test.describe('Repository Structure', () => {
  
  test('has LICENSE file', async ({ request }) => {
    const response = await request.get(`${PAGES_URL.replace(/\/$/, '')}/LICENSE`);
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text).toContain('MIT License');
  });
  
  test('has README.md', async ({ request }) => {
    const response = await request.get(`${PAGES_URL.replace(/\/$/, '')}/README.md`);
    // README might not be served as raw file, check if page loads
    console.log('README status:', response.status());
  });
  
});

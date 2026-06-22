const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:7777/create', { waitUntil: 'networkidle' });
    
    // Fill basic form
    await page.fill('input[name="topic"]', 'Advanced Python Programming');
    await page.selectOption('select[name="difficulty"]', 'Intermediate');
    await page.selectOption('select[name="duration"]', '8 weeks');
    await page.fill('input[name="audience"]', 'Software engineers');
    
    // Take screenshot
    await page.screenshot({ path: 'create-page-prod.png', fullPage: true });
    console.log('✓ Screenshot taken: create-page-prod.png');
    
  } finally {
    await browser.close();
  }
})();

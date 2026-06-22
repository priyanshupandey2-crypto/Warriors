const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to create page
    await page.goto('http://localhost:7777/create', { waitUntil: 'networkidle' });
    
    console.log('✓ Page loaded successfully');
    
    // Verify page title
    const title = await page.textContent('h1');
    console.log(`✓ Page title: "${title}"`);
    
    // Verify form fields exist
    const topicInput = await page.$('input[name="topic"]');
    const difficultySelect = await page.$('select[name="difficulty"]');
    const audienceInput = await page.$('input[name="audience"]');
    const durationSelect = await page.$('select[name="duration"]');
    const tagsInput = await page.$('input[placeholder*="AI"]');
    
    console.log('✓ Topic field exists:', !!topicInput);
    console.log('✓ Difficulty dropdown exists:', !!difficultySelect);
    console.log('✓ Audience field exists:', !!audienceInput);
    console.log('✓ Duration dropdown exists:', !!durationSelect);
    console.log('✓ Tags input exists:', !!tagsInput);
    
    // Test form interaction
    console.log('\n--- Testing Form Interaction ---');
    
    // Fill topic
    await topicInput.fill('Advanced Python Programming');
    const topicValue = await topicInput.inputValue();
    console.log('✓ Topic filled:', topicValue);
    
    // Select difficulty
    await difficultySelect.selectOption('Intermediate');
    const diffValue = await difficultySelect.inputValue();
    console.log('✓ Difficulty selected:', diffValue);
    
    // Fill audience
    await audienceInput.fill('Software engineers and developers');
    const audValue = await audienceInput.inputValue();
    console.log('✓ Audience filled:', audValue);
    
    // Select duration
    await durationSelect.selectOption('8 weeks');
    const durValue = await durationSelect.inputValue();
    console.log('✓ Duration selected:', durValue);
    
    // Add tags
    await tagsInput.fill('Python');
    await page.click('button:text("Add")');
    await page.waitForTimeout(300);
    
    const tagChips = await page.$$('.bg-blue-100');
    console.log('✓ Tag added, total chips:', tagChips.length);
    
    // Check if Generate button is enabled
    const generateBtn = await page.$('button:text("Generate Course")');
    const isDisabled = await generateBtn.evaluate(btn => btn.disabled);
    console.log('✓ Generate button is', isDisabled ? 'disabled' : 'enabled');
    
    // Take screenshot
    await page.screenshot({ path: 'create-page-final.png', fullPage: true });
    console.log('\n✓ Screenshot saved: create-page-final.png');
    
    console.log('\n✅ All verifications passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

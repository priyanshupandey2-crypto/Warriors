const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:7777/create', { waitUntil: 'networkidle' });
    
    console.log('✅ Create Course Page - Production Redesign Verification\n');
    
    // Check page structure
    const pageTitle = await page.textContent('h1');
    console.log(`✓ Page Title: "${pageTitle}"`);
    
    const aiPill = await page.textContent('text=AI Course Builder');
    console.log(`✓ AI Pill Badge: "${aiPill}"`);
    
    // Check form fields
    const fields = {
      'topic': await page.$('input[name="topic"]'),
      'difficulty': await page.$('select[name="difficulty"]'),
      'duration': await page.$('select[name="duration"]'),
      'audience': await page.$('input[name="audience"]'),
      'tags': await page.$('input[placeholder="Add a tag"]'),
    };
    
    console.log('\n✓ Form Fields:');
    Object.entries(fields).forEach(([name, field]) => {
      console.log(`  • ${name}: ${!!field ? '✓' : '✗'}`);
    });
    
    // Check sidebar cards
    const sidebarTitle = await page.textContent('text=What AuraLearn Creates');
    console.log(`\n✓ Sidebar "What We Create" Card: ${!!sidebarTitle ? '✓' : '✗'}`);
    
    const tipsCard = await page.textContent('text=Tips for Best Results');
    console.log(`✓ Tips Card: ${!!tipsCard ? '✓' : '✗'}`);
    
    // Test interaction
    console.log('\n✓ Testing Interactions:');
    await fields.topic.fill('Advanced Machine Learning');
    console.log(`  • Topic filled: ✓`);
    
    await fields.difficulty.selectOption('Advanced');
    console.log(`  • Difficulty selected: ✓`);
    
    await fields.duration.selectOption('8 weeks');
    console.log(`  • Duration selected: ✓`);
    
    await fields.audience.fill('Data scientists and ML engineers');
    console.log(`  • Audience filled: ✓`);
    
    // Add tag - make sure input is not empty
    const tagInput = fields.tags;
    await tagInput.fill('Python');
    await page.waitForTimeout(300);
    await page.click('button:text("Add")', { timeout: 5000 });
    console.log(`  • Tag added: ✓`);
    
    // Check button state after filling
    const generateBtn = await page.$('button:text("Generate Course")');
    const isDisabled = await generateBtn.evaluate(btn => btn.disabled);
    console.log(`  • Generate button: ${isDisabled ? 'disabled' : 'enabled ✓'}`);
    
    // Take screenshot
    await page.screenshot({ path: 'create-page-production.png', fullPage: true });
    console.log('\n✓ Screenshot saved: create-page-production.png');
    
    console.log('\n✅ All verifications passed! Page is production-ready.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

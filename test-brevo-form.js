#!/usr/bin/env node

import fetch from 'node-fetch';

async function testBrevoFormSubmission() {
  console.log('🧪 Testing Brevo form submission...\n');

  // Test data
  const testData = new URLSearchParams({
    'FIRSTNAME': 'John Test',
    'SMS': '4045551234',
    'SMS__COUNTRY_CODE': '+1',
    'EMAIL': 'john.test@example.com',
    'BIRTHDAY': '15-06-1990',
    'email_address_check': '',
    'locale': 'en'
  });

  try {
    console.log('📤 Submitting test data to Brevo...');
    console.log('Data:', Object.fromEntries(testData));
    
    const response = await fetch('https://227ffc5e.sibforms.com/serve/MUIFAORX-sUxF1INXeVZ4MEHF-ZqHQq3Dp-NgpQnIa0ZVx4aM4kUizmV8L0Zjtwuc9IjCzNKbAKSdYmrp0rmAsoDex-umT2WtC8hSfft6fSybf-qhN3VmJFcOmiIunk7swUsf0Q4FpQYEsrXBMwxaEcunAcfAEZO9ymottARx6jsEnGnnCSIoVomhColDxPaIsnmFfW-U_WOSfjf', {
      method: 'POST',
      body: testData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Test Browser)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    console.log('\n📥 Response received:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    if (response.headers.get('location')) {
      console.log('🔄 REDIRECT DETECTED to:', response.headers.get('location'));
    }

    const responseText = await response.text();
    console.log('\n📄 Response body (first 500 chars):');
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    // Check if it's a redirect response
    if (response.status >= 300 && response.status < 400) {
      console.log('\n⚠️  FORM CAUSES REDIRECT - This is why users leave the site!');
    } else if (response.status === 200) {
      console.log('\n✅ Form submission successful without redirect');
    } else {
      console.log('\n❌ Unexpected response status');
    }

  } catch (error) {
    console.error('\n❌ Error submitting form:', error.message);
  }
}

// Test with no-cors mode like the frontend
async function testNoCorsMode() {
  console.log('\n\n🔒 Testing with no-cors mode (like frontend)...');
  
  const testData = new FormData();
  testData.append('FIRSTNAME', 'Jane Test');
  testData.append('SMS', '4045559876');
  testData.append('SMS__COUNTRY_CODE', '+1');
  testData.append('EMAIL', 'jane.test@example.com');
  testData.append('BIRTHDAY', '20-12-1985');
  testData.append('email_address_check', '');
  testData.append('locale', 'en');

  try {
    const response = await fetch('https://227ffc5e.sibforms.com/serve/MUIFAORX-sUxF1INXeVZ4MEHF-ZqHQq3Dp-NgpQnIa0ZVx4aM4kUizmV8L0Zjtwuc9IjCzNKbAKSdYmrp0rmAsoDex-umT2WtC8hSfft6fSybf-qhN3VmJFcOmiIunk7swUsf0Q4FpQYEsrXBMwxaEcunAcfAEZO9ymottARx6jsEnGnnCSIoVomhColDxPaIsnmFfW-U_WOSfjf', {
      method: 'POST',
      body: testData,
      mode: 'no-cors'
    });
    
    console.log('✅ No-cors submission completed');
    console.log('Response type:', response.type);
    console.log('Response status:', response.status);
    
  } catch (error) {
    console.error('❌ No-cors error:', error.message);
  }
}

// Run tests
testBrevoFormSubmission().then(() => testNoCorsMode());
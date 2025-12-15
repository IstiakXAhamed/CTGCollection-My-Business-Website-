// Comprehensive Backend Test Script
// Tests all API endpoints and database connectivity

const BASE_URL = 'http://localhost:3000'

interface TestResult {
  endpoint: string
  method: string
  status: 'PASS' | 'FAIL' | 'WARN'
  statusCode?: number
  message: string
  data?: any
}

const results: TestResult[] = []

async function testEndpoint(
  endpoint: string, 
  method: string = 'GET',
  body?: any,
  expectedData?: (data: any) => boolean
): Promise<TestResult> {
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const res = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await res.json().catch(() => ({}))
    
    if (res.ok) {
      if (expectedData && !expectedData(data)) {
        return {
          endpoint,
          method,
          status: 'WARN',
          statusCode: res.status,
          message: 'Response OK but data validation failed',
          data
        }
      }
      return {
        endpoint,
        method,
        status: 'PASS',
        statusCode: res.status,
        message: 'Success',
        data
      }
    } else {
      return {
        endpoint,
        method,
        status: 'FAIL',
        statusCode: res.status,
        message: data.message || data.error || 'Request failed',
        data
      }
    }
  } catch (error: any) {
    return {
      endpoint,
      method,
      status: 'FAIL',
      message: error.message || 'Network error'
    }
  }
}

async function runTests() {
  console.log('🧪 Starting Comprehensive Backend Tests...\n')
  console.log('=' .repeat(60))
  
  // ===========================================
  // PUBLIC API ENDPOINTS
  // ===========================================
  console.log('\n📦 PRODUCTS API')
  results.push(await testEndpoint('/api/products', 'GET', null, 
    (d) => Array.isArray(d.products)))
  results.push(await testEndpoint('/api/products/featured', 'GET', null,
    (d) => Array.isArray(d.products)))
  
  console.log('\n📁 CATEGORIES API')
  results.push(await testEndpoint('/api/categories', 'GET', null,
    (d) => Array.isArray(d.categories)))
  
  console.log('\n🎫 COUPONS API')
  results.push(await testEndpoint('/api/coupons/active', 'GET'))
  results.push(await testEndpoint('/api/coupons/validate', 'POST', 
    { code: 'WELCOME10', cartTotal: 1000 }))
  results.push(await testEndpoint('/api/coupons/best', 'GET'))
  
  console.log('\n⚙️ SETTINGS API')
  results.push(await testEndpoint('/api/settings', 'GET', null,
    (d) => d.promoEnabled !== undefined))
  
  console.log('\n🔥 FLASH SALES API')
  results.push(await testEndpoint('/api/flash-sales/active', 'GET'))
  
  console.log('\n⭐ TESTIMONIALS API')
  results.push(await testEndpoint('/api/testimonials', 'GET'))
  
  console.log('\n📧 NEWSLETTER API')
  results.push(await testEndpoint('/api/newsletter', 'POST',
    { email: 'test@test.com', name: 'Test' }))
  
  console.log('\n🎰 SPIN WHEEL API')
  results.push(await testEndpoint('/api/spin-wheel', 'GET'))
  
  console.log('\n🎁 GIFT CARDS API')
  results.push(await testEndpoint('/api/gift-cards', 'GET'))
  
  console.log('\n💎 LOYALTY API')
  results.push(await testEndpoint('/api/loyalty', 'GET'))
  
  console.log('\n📍 ORDER TRACKING API')
  results.push(await testEndpoint('/api/orders/track?orderNumber=TEST123', 'GET'))
  
  console.log('\n💳 PRICE ALERTS API')
  results.push(await testEndpoint('/api/price-alerts', 'GET'))
  
  // ===========================================
  // AUTH ENDPOINTS
  // ===========================================
  console.log('\n🔐 AUTH API')
  results.push(await testEndpoint('/api/auth/me', 'GET'))
  results.push(await testEndpoint('/api/auth/login', 'POST',
    { email: 'admin@ctgcollection.com', password: 'admin123' }))
  
  // ===========================================
  // ADMIN ENDPOINTS (may require auth)
  // ===========================================
  console.log('\n👑 ADMIN API (may require auth)')
  results.push(await testEndpoint('/api/admin/stats', 'GET'))
  results.push(await testEndpoint('/api/admin/analytics', 'GET'))
  results.push(await testEndpoint('/api/admin/orders', 'GET'))
  results.push(await testEndpoint('/api/admin/products', 'GET'))
  results.push(await testEndpoint('/api/admin/categories', 'GET'))
  results.push(await testEndpoint('/api/admin/coupons', 'GET'))
  results.push(await testEndpoint('/api/admin/users', 'GET'))
  
  // ===========================================
  // CHAT ENDPOINTS
  // ===========================================
  console.log('\n💬 CHAT API')
  results.push(await testEndpoint('/api/chat/sessions', 'GET'))
  
  // ===========================================
  // PAYMENT ENDPOINTS (just checking they exist)
  // ===========================================
  console.log('\n💰 PAYMENT API')
  results.push(await testEndpoint('/api/payment/init', 'POST', 
    { amount: 100, orderId: 'test' }))
  
  // ===========================================
  // RESULTS SUMMARY
  // ===========================================
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULTS SUMMARY\n')
  
  const passed = results.filter(r => r.status === 'PASS')
  const failed = results.filter(r => r.status === 'FAIL')
  const warnings = results.filter(r => r.status === 'WARN')
  
  console.log(`✅ PASSED: ${passed.length}`)
  console.log(`❌ FAILED: ${failed.length}`)
  console.log(`⚠️ WARNINGS: ${warnings.length}`)
  console.log(`📈 TOTAL: ${results.length}`)
  
  console.log('\n' + '-'.repeat(60))
  console.log('DETAILED RESULTS:\n')
  
  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${result.method} ${result.endpoint}`)
    console.log(`   Status: ${result.statusCode || 'N/A'} - ${result.message}`)
    if (result.status === 'FAIL') {
      console.log(`   Error: ${JSON.stringify(result.data).substring(0, 100)}`)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  
  // Return summary for easy checking
  return {
    total: results.length,
    passed: passed.length,
    failed: failed.length,
    warnings: warnings.length,
    failedEndpoints: failed.map(f => `${f.method} ${f.endpoint}: ${f.message}`)
  }
}

runTests()
  .then(summary => {
    console.log('\n🏁 Tests Complete!')
    console.log(JSON.stringify(summary, null, 2))
  })
  .catch(err => {
    console.error('Test runner error:', err)
  })

// Your types (these are perfect! ✅)
type ApiStatus = 'healthy' | 'slow' | 'down'

interface APIendpoint{
   name: string;           
    url: string;            
    expectedStatus: number;
}

interface Environment{
    APIspec: APIendpoint[];
    env: string;
    owner: string;
}

interface HealthCheck{
    endpoint: APIendpoint;
    env: Environment;
    health: ApiStatus;
    error: string;
    checkedAT: Date;
}

interface HealthCheckResult{
    totalAPIs: number;
    healthyCount: number;
    slowCount: number;
    downCount: number;
    lastUpdated: string;
    results: HealthCheck[];
}

// Your functions (these work great! ✅)
async function checkAPI(env: Environment, api: APIendpoint): Promise<HealthCheck> {
  try {
    const start = Date.now();
    const response = await fetch(api.url);
    const latency = Date.now() - start;
    
    let health: ApiStatus = 'healthy';
    if (latency > 2000) health = 'slow';
    if (response.status !== api.expectedStatus) health = 'down';

    return {
      endpoint: api,
      env,
      health,
      error: '',
      checkedAT: new Date(),
    };
  } catch (err) {
    return {
      endpoint: api,
      env,
      health: 'down',
      error: (err as Error).message,
      checkedAT: new Date(),
    };
  }
}

async function checkEnvironment(env: Environment): Promise<HealthCheckResult> {
  const checks = await Promise.all(env.APIspec.map(api => checkAPI(env, api)));

  return {
    totalAPIs: checks.length,
    healthyCount: checks.filter(c => c.health === 'healthy').length,
    slowCount: checks.filter(c => c.health === 'slow').length,
    downCount: checks.filter(c => c.health === 'down').length,
    lastUpdated: new Date().toISOString(),
    results: checks,
  };
}

function startMonitoring(env: Environment) {
  async function runCheck() {
    console.log(`\n[${new Date().toISOString()}] Starting health check...`);
    const result = await checkEnvironment(env);
    
    // 🎨 Nice formatting (Step 6: Display Results)
    displayResults(result);
    
    setTimeout(runCheck, 50 * 60 * 1000);
  }
  runCheck();
}

// Your sample data (perfect! ✅)
const testAPIs: APIendpoint[] = [
    {
        name: "JSONPlaceholder Posts",
        url: "https://jsonplaceholder.typicode.com/posts",
        expectedStatus: 200
    },
    {
        name: "GitHub API",
        url: "https://api.github.com",
        expectedStatus: 200
    },
    {
        name: "HTTPBin Status",
        url: "https://httpbin.org/status/200", 
        expectedStatus: 200
    }
];

const testEnvironment: Environment = {
    APIspec: testAPIs,
    env: "Github",
    owner: "BobGeorgeson"
};

// ✅ STEP 6: Nice Display Function (NEW)
function displayResults(result: HealthCheckResult): void {
    console.log('\n📊 API HEALTH REPORT');
    console.log('==========================================');
    console.log(`📅 Last Updated: ${new Date(result.lastUpdated).toLocaleString()}`);
    console.log(`📈 Total APIs: ${result.totalAPIs}`);
    console.log(`✅ Healthy: ${result.healthyCount}`);
    console.log(`⚠️  Slow: ${result.slowCount}`);
    console.log(`❌ Down: ${result.downCount}`);
    
    const healthScore = Math.round((result.healthyCount / result.totalAPIs) * 100);
    console.log(`🏥 Health Score: ${healthScore}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log('------------------------------------------');
    
    result.results.forEach((check, index) => {
        const statusEmoji = check.health === 'healthy' ? '✅' : 
                           check.health === 'slow' ? '⚠️' : '❌';
        
        console.log(`${index + 1}. ${statusEmoji} ${check.endpoint.name}`);
        console.log(`   URL: ${check.endpoint.url}`);
        console.log(`   Status: ${check.health}`);
        if (check.error) {
            console.log(`   Error: ${check.error}`);
        }
        console.log('');
    });
}

// ✅ STEP 7: Fixed Main Program (PROPER ASYNC HANDLING)
async function main() {
    try {
        console.log('🚀 Starting API Health Monitor...');
        console.log(`👤 Environment: ${testEnvironment.env}`);
        console.log(`👨‍💻 Owner: ${testEnvironment.owner}`);
        console.log(`📡 Monitoring ${testEnvironment.APIspec.length} APIs\n`);

        // ✅ Test single API (with proper await)
        console.log('🧪 Testing single API...');
        const singleResult = await checkAPI(testEnvironment, testAPIs[0]);
        console.log(`✅ ${singleResult.endpoint.name}: ${singleResult.health}`);
        
        console.log('\n' + '='.repeat(50));
        
        // ✅ Test all APIs (with proper await)
        console.log('\n🧪 Testing all APIs...');
        const allResults = await checkEnvironment(testEnvironment);
        displayResults(allResults);
        
        console.log('\n🎉 All tests completed successfully!');
        
        // Option 1: Run once and exit (current behavior)
        console.log('\n💡 To start continuous monitoring, uncomment the line below:');
        console.log('// startMonitoring(testEnvironment);');
        
        // Option 2: Start continuous monitoring (uncomment to enable)
        // console.log('\n🔄 Starting continuous monitoring (every 50 minutes)...');
        // startMonitoring(testEnvironment);
        
    } catch (error) {
        console.error('❌ Error running health check:', error);
    }
}

// ✅ Run the program (proper way)
main();

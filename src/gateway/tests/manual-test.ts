import axios from 'axios'

async function testGateway() {
  try {
    // 1. Register services
    await axios.post('http://localhost:3000/registry/services', {
      name: 'user-service',
      url: 'http://localhost:4001',
      healthCheck: '/health',
      version: '1.0.0',
    })

    // 2. Test routing
    const response = await axios.get('http://localhost:3000/users/profile', {
      headers: {
        Authorization: 'Bearer your-test-token',
      },
    })
    console.log('Routing test:', response.data)

    // 3. Test caching
    // First request to populate cache
    await axios.get('http://localhost:3000/users/profile')
    // Second request to check cache
    const cachedResponse = await axios.get(
      'http://localhost:3000/users/profile',
    )
    console.log('Cache hit:', cachedResponse.headers['x-cache'])

    // 4. Test load balancing
    const loadBalancingResponses = await Promise.all([
      axios.get('http://localhost:3000/users/profile'),
      axios.get('http://localhost:3000/users/profile'),
      axios.get('http://localhost:3000/users/profile'),
    ])
    console.log(
      'Load balancing test:',
      loadBalancingResponses.map((r) => r.headers['x-served-by']),
    )
  } catch (error) {
    console.error('Test failed:', error)
  }
}

void testGateway()

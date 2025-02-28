import { createClient } from 'redis';

const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    timeout: 30000,
    keepAlive: 5000,
  },
});

// Handle connection errors and reconnection
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  } catch (error : any) {
    console.error('❌ Redis connection failed:', error.message);
    setTimeout(connectRedis, 5000);
  }
};

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redisClient.on('end', () => {
  console.warn('⚠️ Redis connection ended. Attempting to reconnect...');
  connectRedis();
});

connectRedis();

export default redisClient;

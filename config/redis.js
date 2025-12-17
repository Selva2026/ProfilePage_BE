import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_REST_URL
});

redisClient.on("connect", () =>
  console.log("✅ Redis connected")
);

redisClient.on("error", (err) =>
  console.error("❌ Redis error", err)
);

await redisClient.connect();

export default redisClient;


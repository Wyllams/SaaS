import { Redis } from "ioredis";

export function createRedisConnection(redisUrl: string) {
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });
}

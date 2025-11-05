import { Redis } from '@upstash/redis';
import type { CacheStore } from '@nestjs/cache-manager';

interface ExtendedCacheStore extends CacheStore {
    reset?: () => Promise<void>;
    mget?: (...args: string[]) => Promise<any[]>;
    mset?: (...args: [string, any, number?][]) => Promise<void>;
    mdel?: (...args: string[]) => Promise<void>;
    keys?: (pattern?: string) => Promise<string[]>;
}

export async function upstashStore(): Promise<ExtendedCacheStore> {
    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const KEY_TRACKER = 'cache:keys';

    const store: ExtendedCacheStore = {
        async get<T>(key: string): Promise<T | undefined> {
            const value = await redis.get<string>(key);
            if (value === null) return undefined;

            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T;
            }
        },

        async set<T>(key: string, value: T, options?: { ttl: number }): Promise<void> {
            const ttl = options?.ttl ?? 3600;
            const str = typeof value === 'string' ? value : JSON.stringify(value);
            await redis.set(key, str, { ex: ttl });
            await redis.sadd(KEY_TRACKER, key);
        },

        async del(key: string): Promise<void> {
            await redis.del(key);
            await redis.srem(KEY_TRACKER, key);
        },

        async reset(): Promise<void> {
            const allKeys = await redis.smembers(KEY_TRACKER);
            if (allKeys.length > 0) await redis.del(...allKeys);
            await redis.del(KEY_TRACKER);
        },

        async mget(...keys: string[]) {
            const results = await Promise.all(keys.map(k => redis.get(k)));
            return results.map(r => (typeof r === 'string' ? JSON.parse(r) : r));
        },

        async mset(...args: [string, any, number?][]) {
            for (const [key, value, ttl] of args) {
                await store.set(key, value, { ttl });
            }
        },

        async mdel(...keys: string[]) {
            await Promise.all(keys.map(k => redis.del(k)));
        },

        async keys(pattern?: string): Promise<string[]> {
            const allKeys = await redis.smembers(KEY_TRACKER);
            if (!pattern) return allKeys;

            const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
            return allKeys.filter(k => regex.test(k));
        },

    };

    return store;
}

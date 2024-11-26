import redis, { RedisClient } from 'redis';
import { injectable } from 'inversify';
import { error, info } from 'console';
import { REDIS_HOST, REDIS_PASS, REDIS_PORT, REDIS_TIEMPO_VENCIMIENTO } from '@util';
import { promisify } from 'util';
import { RedisException } from '@domain/exceptions';

@injectable()
export class Redis {
    private redis: RedisClient;
    private TIEMPO_VENCIMIENTO_BASE = parseInt(REDIS_TIEMPO_VENCIMIENTO);

    constructor() {
        this.redis = this.connectRedis();
    }

    private connectRedis(): RedisClient {
        return redis
            .createClient({
                port: parseInt(REDIS_PORT),
                host: REDIS_HOST,
                password: REDIS_PASS,
                connect_timeout: 5000,
            })
            .on('error', (error) => {
                console.error('Redis', 'Error al conectar redis', error.message);
                //throw new RedisException(error?.message ?? 'Error al conectar redis', error?.stack ?? 'Sin stack');
            })
            .on('connect', () => {
                info('Connected to Redis');
            });
    }

    private validateConnection(): void {
        if (!this.redis.connected) {
            this.redis = this.connectRedis();
        }
    }

    public async closeConnection() {
        this.redis.quit();
    }
    async hgetall<T>(key: string): Promise<T[] | undefined> {
        this.validateConnection();
        const getAsync = promisify(this.redis.hgetall).bind(this.redis);
        const getValues = await getAsync(key);
        if (getValues) {
            const values = Object.values(getValues);
            return values.map((element: any) => JSON.parse(element));
        }
        return undefined;
    }
    async hget<T>(key: string, field: string): Promise<T | undefined> {
        this.validateConnection();
        try {
            const getAsync = promisify(this.redis.hget).bind(this.redis);
            const value = await getAsync(key, field);
            if (value) return JSON.parse(value);
        } catch ({ stack, message }) {
            error('REDIS ERROR: ', stack);
            throw new RedisException(message as string, stack as string);
        }
        return undefined;
    }
    async get<T>(key: string, parseValue = true): Promise<T | null> {
        this.validateConnection();
        try {
            const getAsync = promisify(this.redis.get).bind(this.redis);
            const value = await getAsync(key);
            if (value) {
                return parseValue ? JSON.parse(value) : value;
            }
            return null;
        } catch ({ message, stack }) {
            error(stack);
            throw new RedisException(message as string, stack as string);
        }
    }
    async hset<T>(
        collection: string,
        field: string,
        value: T,
        expireTime = this.TIEMPO_VENCIMIENTO_BASE,
    ): Promise<boolean> {
        this.validateConnection();
        try {
            const save = this.redis.set(collection, field, JSON.stringify(value));
            this.redis.expire(collection, expireTime);
            return save;
        } catch ({ message, stack }) {
            error(stack);
            throw new RedisException(message as string, stack as string);
        }
    }
    async set<T>(key: string, value: T, expireTime = this.TIEMPO_VENCIMIENTO_BASE): Promise<boolean> {
        this.validateConnection();
        try {
            const data = typeof value === 'object' ? JSON.stringify(value) : String(value);
            const save = this.redis.set(key, data);
            this.redis.expire(key, expireTime);
            return save;
        } catch ({ message, stack }) {
            error(stack);
            throw new RedisException(message as string, stack as string);
        }
    }
    async hdel(collection: string, element: string): Promise<boolean> {
        this.validateConnection();
        try {
            return this.redis.hdel(collection, element);
        } catch ({ message, stack }) {
            error(stack);
            throw new RedisException(message as string, stack as string);
        }
    }
    async del(key: string): Promise<string> {
        this.validateConnection();
        return this.redis.del(key) ? 'REDIS_MESSAGE: Eliminado con exito' : 'REDIS_MESSAGE: No se pudo eliminar';
    }
    async deleteAll(): Promise<void> {
        this.validateConnection();
        try {
            const getAsync = promisify(this.redis.flushall).bind(this.redis);
            await getAsync();
        } catch ({ stack, message }) {
            error(stack);
            throw new RedisException(message as string, stack as string);
        }
    }
}

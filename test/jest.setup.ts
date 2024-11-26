import 'reflect-metadata';
import { createDependencyContainer, DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { IDatabase, IMain } from 'pg-promise';
import redis from 'redis-mock';
import { createDependencyContainerTest, DEPENDENCY_CONTAINER_TEST } from './mocks';
import { DBCmMem, DBDinerosMem } from './mocks/postgresql';
import axios from 'axios';
import { IBolsilloPubSubRepository } from '@infrastructure/pubsub/IBolsilloPubSub';
import { FakePublicador } from './mocks/FakePublicador.mock';

jest.mock('axios');

export const mockApiAxios = axios as jest.MockedFunction<typeof axios>;

beforeAll(() => {
    createDependencyContainer();
    createDependencyContainerTest();
    const dbDineros = DBDinerosMem();
    const dbCm = DBCmMem();

    // Databases
    DEPENDENCY_CONTAINER.rebind<IDatabase<IMain>>(TYPES.dbDineros).toConstantValue(dbDineros);
    DEPENDENCY_CONTAINER.rebind<IDatabase<IMain>>(TYPES.dbCm).toConstantValue(dbCm);

    //PubSub
    DEPENDENCY_CONTAINER.rebind<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo).toConstantValue(new FakePublicador());

    //REDIS
    const redisMock = redis.createClient();
    DEPENDENCY_CONTAINER.rebind(TYPES.RedisClient).toConstantValue(redisMock);
});

afterAll(() => {
    if (DEPENDENCY_CONTAINER) {
        DEPENDENCY_CONTAINER.unbindAll();
    }
    if (DEPENDENCY_CONTAINER_TEST) {
        DEPENDENCY_CONTAINER_TEST.unbindAll();
    }
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockApiAxios.mockReset();
    mockApiAxios.mockRestore();
});

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockApiAxios.mockReset();
    mockApiAxios.mockRestore();
});

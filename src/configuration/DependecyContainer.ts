import { Container } from 'inversify';
import { TYPES } from '@configuration';
import { LegalizacionAppService } from '@application/services/LegalizacionAppService';
import { IBolsilloPubSubRepository } from '@infrastructure/pubsub/IBolsilloPubSub';
import { BolsilloPubsub } from '@infrastructure/pubsub/pubsub';
import { pubsub } from '@infrastructure/pubsub/pubsub/config/PubSubConfig';
import { PubSub } from '@google-cloud/pubsub';
import { LegalizacionRepository } from '@infrastructure/repositories/LegalizacionRepository';
import { LegalizacionesDao } from '@infrastructure/repositories/postgres/dao/LegalizacionesDao';
import { IDatabase, IMain } from 'pg-promise';
import { cm, dineros } from '@infrastructure/repositories/postgres/adapter/Config';
import { AliadosApiService } from '@infrastructure/api-client/aliados-api/AliadosApiService';
import { Redis } from '@infrastructure/redis';
import { ResponsableApiService } from '@infrastructure/api-client/maestros-api/ResponsableApiService';
import { MediosPagoRepository } from '@infrastructure/repositories/MediosPagoRepository';
import { MediosPagoDao } from '@infrastructure/repositories/postgres/dao/MediosPagoDao';
import { PitagorasRepository } from '@infrastructure/repositories';
import { PitagorasDao } from '@infrastructure/repositories/postgres/dao/PitagorasDao';
import { PitagorasService } from '@application/services';

export const DEPENDENCY_CONTAINER = new Container();

export const createDependencyContainer = (): void => {
    DEPENDENCY_CONTAINER.bind(TYPES.RedisClient).to(Redis).inSingletonScope();
    DEPENDENCY_CONTAINER.bind(LegalizacionAppService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo).to(BolsilloPubsub).inSingletonScope();
    DEPENDENCY_CONTAINER.bind<PubSub>(TYPES.PubSub).toConstantValue(pubsub);
    DEPENDENCY_CONTAINER.bind<LegalizacionRepository>(TYPES.SetDataRepository).to(LegalizacionesDao);
    DEPENDENCY_CONTAINER.bind<MediosPagoRepository>(TYPES.MediosPagoRepository).to(MediosPagoDao);
    DEPENDENCY_CONTAINER.bind<PitagorasRepository>(TYPES.PitagorasRepository).to(PitagorasDao);
    DEPENDENCY_CONTAINER.bind<IDatabase<IMain>>(TYPES.dbDineros).toConstantValue(dineros);
    DEPENDENCY_CONTAINER.bind<IDatabase<IMain>>(TYPES.dbCm).toConstantValue(cm);
    DEPENDENCY_CONTAINER.bind(AliadosApiService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(ResponsableApiService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(PitagorasService).toSelf().inSingletonScope();
};

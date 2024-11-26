import 'reflect-metadata';
import { injectable } from 'inversify';
import { PubSub } from '@google-cloud/pubsub';
import { IBolsilloPubSubRepository } from '../IBolsilloPubSub';
import { TOPIC_DINEROS } from './Topics';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { IPubSubBolsillo } from './interfaces/IBolsilloPubSub';

@injectable()
export class BolsilloPubsub implements IBolsilloPubSubRepository {
    private pubsub = DEPENDENCY_CONTAINER.get<PubSub>(TYPES.PubSub);

    async crearBolsillo(model: IPubSubBolsillo): Promise<string> {
        const response = this.pubsub.topic(TOPIC_DINEROS).publishMessage({ json: model });
        return response;
    }
}

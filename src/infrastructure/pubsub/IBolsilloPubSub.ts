import { IPubSubBolsillo } from './pubsub/interfaces/IBolsilloPubSub';

export interface IBolsilloPubSubRepository {
    crearBolsillo(model: IPubSubBolsillo): Promise<string>;
}

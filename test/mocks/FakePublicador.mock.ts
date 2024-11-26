import { IBolsilloPubSubRepository } from '@infrastructure/pubsub/IBolsilloPubSub';
import { IPubSubBolsillo } from '@infrastructure/pubsub/pubsub/interfaces/IBolsilloPubSub';
import { injectable } from 'inversify';

@injectable()
export class FakePublicador implements IBolsilloPubSubRepository {
    readonly eventos: IPubSubBolsillo[] = [];

    async crearBolsillo(evento: IPubSubBolsillo): Promise<string> {
        this.eventos.push(evento);
        return 'OK';
    }
}

import { injectable } from 'inversify';
import 'reflect-metadata';
import { TYPES, DEPENDENCY_CONTAINER } from '@configuration';
import {
    IlegalizacionesEquiposOut,
    ILegalizarEquipoOut,
    IResponsableDataOut,
} from '@application/data/out/ILegalizarEquipoOut';
import { IBolsillosAfectadosOut } from '@application/data/out/IBolsillosAfectadosOut';
import { ILegalizacionDataIn, ILegalizarEquipoRecursoIn } from '@application/data/in/ILegalizacionDataIn';
import { IBolsilloPubSubRepository } from '@infrastructure/pubsub/IBolsilloPubSub';
import { Redis } from '@infrastructure/redis';
import { LegalizacionRepository } from '@infrastructure/repositories/LegalizacionRepository';
import { IRedisResponse } from '@domain/interfaces/IRedisResponse';
import { AtributoOperativo } from './interfaces/IEquipo';
import { ResponseAliados } from '@infrastructure/api-client/aliados-api/interfaces/IAliadosResponse';
import { Equipo } from '@infrastructure/api-client/maestros-api/interfaces/IMaestrosResponse';
import { AliadosApiService } from '@infrastructure/api-client/aliados-api/AliadosApiService';
import { BadSchemaException } from '@domain/exceptions';
import { ResponsableApiService } from '@infrastructure/api-client/maestros-api/ResponsableApiService';
import { MediosPagoRepository } from '@infrastructure/repositories/MediosPagoRepository';
import { MENSAJE_ERROR, MENSAJE_OK } from '@application/services/configuration/ResponsesServices';
import { formatearFechaBolsillo, validarValoresTransaccion } from '@application/services/configuration/UtilsServices';

@injectable()
export class LegalizacionAppService {
    private pubsubPublisher = DEPENDENCY_CONTAINER.get<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo);
    private redisClient: Redis = DEPENDENCY_CONTAINER.get(TYPES.RedisClient);
    private postgresRepository = DEPENDENCY_CONTAINER.get<LegalizacionRepository>(TYPES.SetDataRepository);
    private recaudoApi = DEPENDENCY_CONTAINER.get(AliadosApiService);
    private responsableApi = DEPENDENCY_CONTAINER.get(ResponsableApiService);
    private mediosPagoRepository = DEPENDENCY_CONTAINER.get<MediosPagoRepository>(TYPES.MediosPagoRepository);

    async LegalizarEquipo(data: ILegalizacionDataIn): Promise<ILegalizarEquipoOut> {
        const equipo = this.getRecurso(data.recursos, 1);
        const idEquipo = await this.getIdEquipo(equipo);
        const valorRedis = await this.getValorRedis(equipo);
        if (valorRedis) {
            return this.procesarValorRedis(valorRedis, idEquipo, data);
        }
        const nuevoValorRedis = await this.crearNuevoRegistroRedis(data, idEquipo, equipo);
        return nuevoValorRedis ? MENSAJE_OK : MENSAJE_ERROR;
    }

    private async getIdEquipo(equipo: string): Promise<number> {
        return this.postgresRepository.getRecursoId(equipo, 1);
    }

    private async getValorRedis(equipo: string): Promise<IRedisResponse | null> {
        try {
            return await this.redisClient.get<IRedisResponse>(equipo);
        } catch (error: any) {
            console.error('Redis', 'Error al consultar redis', error.message);
            return null;
        }
    }

    private async procesarValorRedis(
        valorRedis: IRedisResponse,
        idEquipo: number,
        data: ILegalizacionDataIn,
    ): Promise<ILegalizarEquipoOut> {
        if (!valorRedis.interno) {
            const autorizado = await this.recaudoApi.consultaAliadoAutorizado(valorRedis.aliado);
            if (!autorizado) {
                return MENSAJE_ERROR;
            }
            await this.postgresRepository.createAliadoRecurso(valorRedis.aliado, idEquipo, valorRedis.diasLegalizacion);
            return this.finalizarLegalizacion(data, idEquipo, valorRedis.aliado);
        }
        return MENSAJE_ERROR;
    }

    private async crearNuevoRegistroRedis(
        data: ILegalizacionDataIn,
        idEquipo: number,
        equipo: string,
    ): Promise<boolean> {
        const objetoRedis: IRedisResponse = { interno: false, aliado: 0, diasLegalizacion: 0 };
        const interno = await this.validarBolsilloEquipo(data);
        objetoRedis.interno = interno;
        if (!interno) {
            const { aliado, diasLegalizacion } = await this.procesarNuevoAliado(data);
            if (aliado === 0) {
                return false;
            }
            objetoRedis.aliado = aliado;
            objetoRedis.diasLegalizacion = diasLegalizacion;

            try {
                await this.redisClient.set(equipo, objetoRedis);
            } catch (error: any) {
                console.error('Redis', 'Error al establecer redis', error.message);
                return false;
            }
            await this.postgresRepository.createAliadoRecurso(aliado, idEquipo, diasLegalizacion);
            await this.finalizarLegalizacion(data, idEquipo, aliado);
            return true;
        }
        return false;
    }

    private async procesarNuevoAliado(
        data: ILegalizacionDataIn,
    ): Promise<{ aliado: number; diasLegalizacion: number }> {
        let aliado = 0;
        let diasLegalizacion = 0;

        const aliadoResponse = await this.validarAliadoEquipo(data);
        aliado = aliadoResponse.data ? aliadoResponse.data.id_aliado : 0;
        const autorizado = await this.recaudoApi.consultaAliadoAutorizado(aliado);

        if (!aliadoResponse.data || (aliadoResponse.data && !autorizado)) {
            const aliadoMaestros = await this.validarAliadoEquipoMaestros(data);
            if (!aliadoMaestros || aliadoMaestros.length === 0) {
                return { aliado: 0, diasLegalizacion: 0 };
            }
            aliado = aliadoMaestros[0].aliado.id_aliado;
            const autorizado = await this.recaudoApi.consultaAliadoAutorizado(aliado);
            if (!autorizado) {
                return { aliado: 0, diasLegalizacion: 0 };
            }
        }
        diasLegalizacion = aliadoResponse.data ? aliadoResponse.data.dias_legalizacion : 0;
        return { aliado, diasLegalizacion };
    }

    private async finalizarLegalizacion(
        data: ILegalizacionDataIn,
        idEquipo: number,
        aliado: number,
    ): Promise<ILegalizarEquipoOut> {
        const bolsillo = await this.postgresRepository.getBolsilloEquipoAliado(idEquipo);
        const cajero = this.getRecurso(data.recursos, 7);
        const idCajero = await this.postgresRepository.getRecursoId(cajero, 7);
        const response = await this.postgresRepository.legalizarEquipo(data, idCajero, aliado, bolsillo);
        response.map((res) => {
            this.pubsubPublisher.crearBolsillo({
                operacion: 'legalizacion',
                id_transaccion: res + '',
            });
        });

        return MENSAJE_OK;
    }

    getRecurso(data: ILegalizarEquipoRecursoIn[], tipo: number): string {
        for (const recurso of data) {
            if (recurso.tipo === tipo) {
                return recurso.identificador;
            }
        }
        return '999';
    }

    async validarBolsilloEquipo(data: ILegalizacionDataIn): Promise<boolean> {
        const equipo = this.getRecurso(data.recursos, 1);
        const equiposResponse = await this.recaudoApi.consultaEquipo(equipo);
        if (typeof equiposResponse.data === 'string')
            throw new BadSchemaException('Equipo no existe', equiposResponse.data);
        return this.validarAtributosEquipos(equiposResponse.data.atributos_operativos);
    }

    validarAtributosEquipos(atributos_operativos: AtributoOperativo[]): boolean {
        for (const atributo of atributos_operativos) {
            if (atributo.id_tipo_atributo === 1) {
                if (atributo.nombre_atributo === 'Interno') {
                    return true;
                }
            }
        }
        return false;
    }

    async validarAliadoEquipo(data: ILegalizacionDataIn): Promise<ResponseAliados> {
        const equipo = this.getRecurso(data.recursos, 1);
        const aliadoResponse = await this.recaudoApi.consultaAliadoEquipo(equipo);
        return aliadoResponse;
    }

    async validarAliadoEquipoMaestros(data: ILegalizacionDataIn): Promise<Equipo[]> {
        const equipo = this.getRecurso(data.recursos, 1);
        const aliadoResponse = await this.recaudoApi.consultaAliadoEquipoMaestros(equipo);
        return aliadoResponse;
    }

    async getLegalizacionesEquipo(codigo_equipo: string): Promise<IlegalizacionesEquiposOut> {
        const idResponsable = new Set<string>();
        const nombreResponsable: IResponsableDataOut[] = [];
        const idRecurso = await this.postgresRepository.getRecursoId(codigo_equipo, 1);
        const legalizaciones = await this.postgresRepository.getLegalizacionesEquipo(idRecurso);
        legalizaciones.map((legalizacion) => {
            idResponsable.add(legalizacion.identificador_recurso);
        });
        for (const id of idResponsable) {
            const nombre = await this.responsableApi.consultaResponsable(id);
            nombreResponsable.push({
                id_responsable: id,
                nombre_responsable: nombre ?? '',
            });
        }
        console.log(nombreResponsable);
        legalizaciones.map((legalizacion) => {
            nombreResponsable.map((nombre) => {
                if (nombre.id_responsable === legalizacion.identificador_recurso) {
                    legalizacion.nombre_responsable = nombre.nombre_responsable;
                }
            });
        });

        return {
            isError: false,
            cause: '',
            data: legalizaciones,
            code: 200,
        };
    }

    private async validarMediosPago(data: ILegalizacionDataIn): Promise<boolean> {
        const mediosPago = data.recursos
            .filter((recurso) => recurso.tipo === 1)
            .flatMap((recurso) => recurso.medios_pago?.map((medio) => medio.id_medio_pago));
        const mediosPagoFiltrados = mediosPago.filter((medio): medio is number => medio !== undefined);
        const mediosPagoBaseDatos = (await this.mediosPagoRepository.consultarMediosPago(mediosPagoFiltrados)).map(
            (medio) => medio.id_medio_pago,
        );
        const mediosPagoInvalidos = mediosPagoFiltrados.filter(
            (medioDePago) => !mediosPagoBaseDatos.includes(medioDePago),
        );
        return mediosPagoInvalidos.length === 0;
    }

    private obtenerMensajeError(
        validacionMediosPago: boolean,
        validacionSumaValores: { isValid: boolean; message: string },
        aliado: number | undefined,
    ): string {
        if (!validacionMediosPago) {
            return 'No se puede legalizar el equipo. Medios de pago no son válidos';
        }
        if (!validacionSumaValores.isValid) {
            return validacionSumaValores.message;
        }
        if (!aliado || aliado === 0) {
            return 'No puede legalizar el equipo, aliado no válido';
        }
        return '';
    }
    async legalizarAliado(data: ILegalizacionDataIn): Promise<ILegalizarEquipoOut> {
        const equipo = this.getRecurso(data.recursos, 1);
        const validacionMediosPago = await this.validarMediosPago(data);
        const idEquipo = await this.getIdEquipo(equipo);
        const validacionValoresTransaccionIguales = validarValoresTransaccion(data.recursos, data.valor);
        MENSAJE_ERROR.message = this.obtenerMensajeError(
            validacionMediosPago,
            validacionValoresTransaccionIguales,
            data.aliado,
        );
        return !validacionMediosPago ||
            !data.aliado ||
            data.aliado === 0 ||
            !validacionValoresTransaccionIguales.isValid
            ? MENSAJE_ERROR
            : this.finalizarLegalizacion(data, idEquipo, data.aliado);
    }

    async getBolsillosAfectados(idLegalizacion: number): Promise<IBolsillosAfectadosOut> {
        const consultarSobranteBolsillo = await this.postgresRepository.getSobranteBolsillo(idLegalizacion);
        const consultarRepositoryBolsillosAfectados = await this.postgresRepository.getBolsillosAfectados(
            idLegalizacion,
        );
        let causeRespuesta = '';
        let codeStatus = 200;

        const movimientos = consultarRepositoryBolsillosAfectados?.length
            ? consultarRepositoryBolsillosAfectados.map((bolsillo) => ({
                  ...bolsillo,
                  fecha_bolsillo_dia: formatearFechaBolsillo(bolsillo.id_bolsillo),
              }))
            : null;
        const sobrante =
            !consultarRepositoryBolsillosAfectados?.length && consultarSobranteBolsillo === 0
                ? null
                : consultarSobranteBolsillo;

        if (!consultarRepositoryBolsillosAfectados?.length) {
            causeRespuesta = 'No se encontraron bolsillos afectados';
            if (consultarSobranteBolsillo === 0) {
                causeRespuesta += ' y no hay sobrante';
                codeStatus = 204;
            }
        }
        const dataRespuesta = {
            sobrante: sobrante,
            movimientos: movimientos,
        };
        return {
            isError: false,
            cause: causeRespuesta,
            data: dataRespuesta,
            code: codeStatus,
        };
    }
}

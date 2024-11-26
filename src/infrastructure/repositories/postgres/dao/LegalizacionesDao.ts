import { injectable } from 'inversify';
import { IDatabase, IMain, ITask } from 'pg-promise';
import {
    IAliadoResponse,
    IBolsilloCalculoResponse,
    IBolsilloCalculoResponseDB,
    ILegalizacionesEquipoResponse,
    ILegalizarEquipoIn,
} from '@infrastructure/repositories/interfaces/ILegalizarEquipo';
import { IBolsillosAfectadosResponse } from '@infrastructure/repositories/interfaces/IBolsillosAfectados';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { DataBaseError } from '@domain/exceptions';
import { LegalizacionRepository } from '@infrastructure/repositories/LegalizacionRepository';
import { obtenerValoresMediosPago } from '@infrastructure/repositories/postgres/utils/LegalizacionesUtils';

@injectable()
export class LegalizacionesDao implements LegalizacionRepository {
    dbDineros: IDatabase<IMain> = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.dbDineros);

    private async insertarRecursoTraslado(t: ITask<any>, idRecurso: number, idTraslado: number) {
        await t.query(`INSERT INTO recursos_trasacciones_traslados (id_recurso, id_traslado) VALUES ($1, $2)`, [
            idRecurso,
            idTraslado,
        ]);
    }

    private async insertarLegalizacion(
        t: ITask<any>,
        idTraslado: number,
        recurso: any,
        data: ILegalizarEquipoIn,
    ): Promise<number> {
        const idRecurso = await this.getRecursoId(recurso.identificador, recurso.tipo, t);
        const idLegalizacion = await t.one<{ id_legalizacion: number }>(
            `INSERT INTO legalizaciones(id_traslado, valor, recurso,fecha_hora_legalizacion,estado)
            VALUES ($1, $2, $3, $4, $5) RETURNING id_legalizacion`,
            [idTraslado, recurso.valor, idRecurso, data.fecha_hora, 6],
        );
        const valoresMediosPago = obtenerValoresMediosPago(idLegalizacion.id_legalizacion, recurso.medios_pago);
        await t.query(
            `INSERT INTO detalle_legalizaciones(id_legalizacion, id_medio_pago, valor)
            VALUES ${valoresMediosPago}`,
        );
        return idLegalizacion.id_legalizacion;
    }

    private async obtenerInformacionBolsilloPorRecurso(idRecurso: number): Promise<IBolsilloCalculoResponse | null> {
        const query = `SELECT id_responsable,
            valor_total AS valor_total,
            valor_no_vencido AS valor_no_vencido ,
            valor_vencido  AS valor_vencido
            FROM bolsillo b
            WHERE id_recurso = $1`;
        const responseBolsillo = await this.dbDineros.oneOrNone<IBolsilloCalculoResponse | null>(query, [idRecurso]);
        return responseBolsillo;
    }

    private async crearInconsistencia(
        t: ITask<any>,
        recurso: any,
        data: ILegalizarEquipoIn,
        informacionRequerida: any,
    ) {
        const responseBolsillo = await this.obtenerInformacionBolsilloPorRecurso(informacionRequerida.id_recurso);
        if (!responseBolsillo || responseBolsillo.valor_total < +(recurso.valor ?? 0)) {
            await t.query(
                `INSERT INTO inconsistencias (id_recurso, tipo_inconsistencia, recurso_responsable, fecha_hora, valor, estado, observaciones, id_legalizacion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    informacionRequerida.id_recurso,
                    'sobrante',
                    informacionRequerida.aliado ?? informacionRequerida.id_recurso,
                    data.fecha_hora,
                    responseBolsillo ? +(recurso.valor ?? 0) - responseBolsillo.valor_total : +(recurso.valor ?? 0),
                    'abierta',
                    recurso.observacion ? recurso.observacion : null,
                    informacionRequerida.id_legalizacion,
                ],
            );
        }
    }

    private async insertarTransaccion(t: ITask<any>, recurso: any, idLegalizacion: number, idRecurso: number) {
        const transaccion = await t.one<{ id_transaccion: number }>(
            `INSERT INTO  transacciones
            (valor_transaccion, fecha_hora_transaccion, ingreso_dinero, id_tipo_transaccion, id_movimiento, id_recurso)
            values ($1, now(), $2, $3, $4, $5) RETURNING id_transaccion`,
            [recurso.valor, false, 4, idLegalizacion, idRecurso],
        );
        return transaccion.id_transaccion;
    }

    async legalizarEquipo(data: ILegalizarEquipoIn, idCajero: number, aliado: number): Promise<number[]> {
        try {
            const idTransacciones: number[] = [];
            await this.dbDineros.tx(async (t: ITask<any>) => {
                const idTraslado = await t.one<{ id_traslado: number }>(
                    `INSERT INTO  traslados
                    (id_traslado,recurso_destino, fecha_hora_traslado, valor, terminal)
                    VALUES ($1,$2,$3,$4,$5) RETURNING id_traslado`,
                    [data.id_transaccion, idCajero, data.fecha_hora, data.valor, data.terminal],
                );
                for (const recurso of data.recursos) {
                    const idRecurso = await this.getRecursoId(recurso.identificador, recurso.tipo, t);
                    if (recurso.tipo === 2 || recurso.tipo === 7) {
                        await this.insertarRecursoTraslado(t, idRecurso, idTraslado.id_traslado);
                    } else if (recurso.tipo === 1) {
                        const idLegalizacion = await this.insertarLegalizacion(
                            t,
                            idTraslado.id_traslado,
                            recurso,
                            data,
                        );
                        const informacionRequerida = {
                            id_legalizacion: idLegalizacion,
                            id_recurso: idRecurso,
                            aliado: aliado,
                        };
                        await this.crearInconsistencia(t, recurso, data, informacionRequerida);
                        const idTransaccion = await this.insertarTransaccion(t, recurso, idLegalizacion, idRecurso);
                        idTransacciones.push(idTransaccion);
                    }
                }
            });
            return idTransacciones;
        } catch (error: any) {
            console.error('PostgresDao', 'Error al insertar datos en transacción al legalizar un equipo', error);
            throw new DataBaseError(
                `Error al insertar datos en transacción al legalizar un equipo: ${JSON.stringify(data)}`,
                error.message,
            );
        }
    }

    async getBolsilloEquipoAliado(id_responsable: number, aliado?: string): Promise<IBolsilloCalculoResponseDB | null> {
        try {
            const query = `SELECT id_responsable,
            sum(valor_total) AS valor_total,
            sum(valor_no_vencido) AS valor_no_vencido ,
            sum(valor_vencido)  AS valor_vencido
            FROM bolsillo b
            WHERE ${aliado ? 'id_responsable' : 'id_recurso'} = $1
            GROUP BY id_responsable`;
            const response = await this.dbDineros.oneOrNone<IBolsilloCalculoResponse | null>(query, [
                aliado ?? id_responsable,
            ]);
            return response;
        } catch (error: any) {
            console.error('PostgresDao', 'Error obteniendo el bolsillo del equipo', error);
            throw new DataBaseError('Error obteniendo el bolsillo del equipo: ' + id_responsable, error.message);
        }
    }

    async createAliadoRecurso(
        aliado: number,
        equipo: number,
        dias_legalizacion: number | null,
    ): Promise<string | null> {
        try {
            const checkQuery = `SELECT * FROM aliados_equipos WHERE aliado = $1 AND id_equipo = $2;`;
            const response = await this.dbDineros.oneOrNone<{
                aliado: number;
                id_equipo: number;
                dias_legalizacion: number;
            }>(checkQuery, [aliado, equipo]);
            if (response) {
                if (response.dias_legalizacion !== dias_legalizacion) {
                    const updateQuery = `UPDATE aliados_equipos SET dias_legalizacion = $1 WHERE aliado = $2 AND id_equipo = $3;`;
                    await this.dbDineros.query(updateQuery, [dias_legalizacion, aliado, equipo]);
                    const updateBolsillo = `UPDATE bolsillo SET dias_legalizacion = $1 WHERE id_responsable = $2;`;
                    await this.dbDineros.query(updateBolsillo, [dias_legalizacion, aliado]);
                    return 'equipo aliado actualizado correctamente';
                }
                return 'equipo aliado ya existe';
            }
            const insertQuery = `INSERT INTO aliados_equipos (aliado, id_equipo, dias_legalizacion) VALUES ($1, $2, $3);`;
            await this.dbDineros.query(insertQuery, [aliado, equipo, dias_legalizacion]);

            return 'equipo aliado creado correctamente';
        } catch (error: any) {
            throw new DataBaseError('Error creando el equipo aliado del equipo: ' + equipo, error.message);
        }
    }

    public async getRecursoId(recurso: string, idTipoRecurso: number, t?: any): Promise<number> {
        const consultarSql = `
            SELECT id_recurso
            FROM recursos
            WHERE identificador_recurso = $1 AND id_tipo_recurso = $2
            `;
        const consultarResult = await this.dbDineros.oneOrNone(consultarSql, [recurso, idTipoRecurso]);
        let idRecurso: number;
        if (!consultarResult) {
            const insertarSql = `
        INSERT INTO recursos (identificador_recurso, id_tipo_recurso)
        VALUES ($1, $2)
        ON CONFLICT (identificador_recurso, id_tipo_recurso)
        DO UPDATE SET id_tipo_recurso = EXCLUDED.id_tipo_recurso
        RETURNING id_recurso`;
            const insertarResult = t
                ? await t.one(insertarSql, [recurso, idTipoRecurso])
                : await this.dbDineros.one(insertarSql, [recurso, idTipoRecurso]);
            idRecurso = insertarResult.id_recurso;
        } else {
            idRecurso = consultarResult.id_recurso;
        }
        return idRecurso;
    }

    public async getLegalizacionesEquipo(recurso: number): Promise<ILegalizacionesEquipoResponse[]> {
        const consultarSql = `
        SELECT l.fecha_hora_legalizacion, l.valor, l.id_legalizacion, r.identificador_recurso FROM legalizaciones l, traslados t, recursos r
        WHERE l.id_traslado = t.id_traslado
        AND t.recurso_destino = r.id_recurso
        AND recurso = $1 AND
        fecha_hora_legalizacion::timestamptz >= NOW() - INTERVAL '30 days'
        ORDER BY 1 desc;`;
        const consultarResult = await this.dbDineros.manyOrNone<ILegalizacionesEquipoResponse>(consultarSql, [recurso]);
        return consultarResult;
    }

    public async consultarAliadoPorEquipo(idEquipo: number): Promise<IAliadoResponse> {
        const resultado: IAliadoResponse = {
            aliado: 0,
            diasLegalizacion: 0,
        };
        const consultarSql = `
            SELECT aliado, dias_legalizacion
            FROM aliados_equipos
            WHERE id_equipo = $1
            `;
        const consultarResult = await this.dbDineros.oneOrNone(consultarSql, [idEquipo]);
        if (consultarResult) {
            resultado.aliado = consultarResult.aliado;
            resultado.diasLegalizacion = consultarResult.dias_legalizacion;
        }
        return resultado;
    }

    public async getBolsillosAfectados(idLegalizacion: number): Promise<IBolsillosAfectadosResponse[]> {
        const consultarBolsillosAfectadosPorLegalizacion = `
            SELECT l.id_bolsillo,
            l.valor_inicial_bolsillo,
            l.valor as valor_legalizado,
            l.valor_final_bolsillo
            FROM legalizacion_bolsillo l
            WHERE l.id_legalizacion = $1
            `;
        const consultarResult = await this.dbDineros.manyOrNone<IBolsillosAfectadosResponse>(
            consultarBolsillosAfectadosPorLegalizacion,
            [idLegalizacion],
        );

        return consultarResult;
    }

    public async getSobranteBolsillo(idLegalizacion: number): Promise<number> {
        const consultarSobranteBolsillo = `
            SELECT valor as sobrante
            FROM inconsistencias
            WHERE tipo_inconsistencia = 'sobrante' AND id_legalizacion = $1
            `;
        const consultarSobrante = await this.dbDineros.oneOrNone<{ sobrante: number }>(consultarSobranteBolsillo, [
            idLegalizacion,
        ]);
        return consultarSobrante ? consultarSobrante.sobrante : 0;
    }
}

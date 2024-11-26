import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { DataBaseError } from '@domain/exceptions';
import { PitagorasRepository } from '@infrastructure/repositories/PitagorasRepository';
import { IDetalleLegalizacion, IDetalleLegalizacionList } from '@infrastructure/repositories/interfaces';

@injectable()
export class PitagorasDao implements PitagorasRepository {
    dbCm = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.dbCm);
    dbDineros = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.dbDineros);

    async getDetalleLegalizacion(idTransaccion: number): Promise<IDetalleLegalizacionList | null> {
        try {
            const query = `SELECT a.fecha_hora_legalizacion AS fecha,0  AS terminal
                            , r.identificador_recurso as recibidor,rr.identificador_recurso AS equipo
                            ,b.valor,b.id_medio_pago AS forma_de_pago,1 AS entrega, '' AS prefijo, '' AS factura
                            , '' AS banco, '' AS cheque, '' AS cuenta_cheque, 0 AS cuenta_cartera, 'Aut-Dineros' as usuario
                            FROM  transacciones t
                            JOIN public.legalizaciones a on (t.id_transaccion=a.id_legalizacion)
                            JOIN public.detalle_legalizaciones b on (b.id_legalizacion=a.id_legalizacion)
                            JOIN public.recursos_trasacciones_traslados rtt  ON (rtt.id_traslado=a.id_traslado )
                            JOIN recursos r ON (r.id_recurso=rtt.id_recurso)
                            JOIN recursos rr ON (rr.id_recurso=a.recurso)
                            WHERE a.id_legalizacion = $1
            `;

            const detalle = await this.dbDineros.manyOrNone<IDetalleLegalizacion>(query, [idTransaccion]);
            if (detalle) {
                return { registros: detalle }; // Return the correct interface type
            }
            return null;
        } catch (error: any) {
            if (error instanceof DataBaseError) {
                throw error;
            }
            console.error('PitagorasDao', 'Error getting detalle legalizacion', error);
            throw new DataBaseError(error?.code, error?.message ?? 'Error obteniendo detalle legalizacion');
        }
    }

    async insertRecaudoAndUpdateEstado(detalle: IDetalleLegalizacionList, idTransaccion: number): Promise<boolean> {
        try {
            return await this.dbCm.tx(async (t1) => {
                const sql = `select * from func_registrar_sesion('dineros','cm-dineros-legalizacion') as respuesta`;
                await t1.one(sql);
                //await this.dbCm.query('tra');
                try {
                    for (const registro of detalle.registros) {
                        const insertQuery = `INSERT INTO dineros_recibidor (fecha,terminal,recibidor,equipo,valor,forma_de_pago,
                        entrega,prefijo,factura,banco,cheque,cuenta_cheque,cuenta_cartera,usuario)
                        VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9,$10,$11,$12,$13,$14);`;

                        const [equipo, terminal] = registro.equipo.split('-');
                        const fecha = new Date(registro.fecha).toISOString().split('T')[0]; // Extraer la fecha en formato YYYY-MM-DD

                        await t1.none(insertQuery, [
                            fecha,
                            terminal,
                            registro.recibidor,
                            equipo,
                            registro.valor,
                            registro.forma_de_pago,
                            registro.entrega,
                            registro.prefijo,
                            registro.factura,
                            registro.banco,
                            registro.cheque,
                            registro.cuenta_cheque,
                            registro.cuenta_cartera,
                            registro.usuario,
                        ]);
                    }
                    // Then update estado
                    try {
                        await this.dbDineros.tx(async (t2) => {
                            // Transaction on dbDineros
                            const updateQuery = `UPDATE public.legalizaciones SET estado=9 WHERE id_legalizacion = $1`;
                            await t2.none(updateQuery, [idTransaccion]); // Throws if the update fails

                            // dbDineros update was successful, so commit t1 (dbCm) now.
                            await t1.query('COMMIT'); // Manually commit dbCm
                        });

                        return true; // Both transactions successful
                    } catch (dbError) {
                        // dbDineros part failed, rollback dbCm manually
                        await t1.query('ROLLBACK');
                        console.error('Rollback dbCm:', dbError, t1);
                        throw dbError; // Re-throw
                    }
                } catch (dbError: any) {
                    // Catch the database error directly
                    console.error('Error updating estado:', dbError);
                    throw new DataBaseError(dbError?.code, dbError?.message ?? 'Error updating transaction status');
                }
            });
        } catch (dbError: any) {
            console.error('PitagorasDao', 'Error in transaction', dbError);
            throw new DataBaseError(dbError?.code, dbError?.message ?? 'Error in transaction');
        }
    }
}

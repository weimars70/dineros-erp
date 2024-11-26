import { ILegalizarEquipoRecursoIn } from '@application/data/in/ILegalizacionDataIn';
export function formatearFechaBolsillo(idBolsillo: string): string {
    const partesBolsillo = idBolsillo.split('-');
    return `${partesBolsillo[1]}-${partesBolsillo[2]}-${partesBolsillo[3]}`;
}

export function sumarMediosPago(mediosPago: { valor: string }[]): number {
    return mediosPago.reduce((suma, medio) => suma + parseFloat(medio.valor), 0);
}

export function validarRecurso(recurso: ILegalizarEquipoRecursoIn): boolean {
    const sumaMediosPago = sumarMediosPago(recurso.medios_pago ?? []);
    return sumaMediosPago === parseFloat(recurso.valor ?? '0');
}

export function validarValoresTransaccion(
    recursos: ILegalizarEquipoRecursoIn[],
    valorLegalizacion?: string,
): { isValid: boolean; message: string } {
    let sumaRecursos = 0;
    const todosRecursosValidos = recursos.every((recurso) => {
        if (recurso.tipo === 1) {
            const validacionRecurso = validarRecurso(recurso);
            if (!validacionRecurso) {
                return false;
            }
            sumaRecursos += sumarMediosPago(recurso.medios_pago ?? []);
        }
        return true;
    });
    if (!todosRecursosValidos) {
        return { isValid: false, message: 'La suma de los medios de pago no es igual al valor de la legalización' };
    }
    if (sumaRecursos !== parseFloat(valorLegalizacion ?? '0')) {
        return { isValid: false, message: 'La suma de los recursos no es igual al valor de la transacción' };
    }
    return { isValid: true, message: '' };
}

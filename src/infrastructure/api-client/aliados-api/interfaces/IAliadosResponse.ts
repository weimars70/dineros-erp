import { Equipo } from '@infrastructure/api-client/maestros-api/interfaces/IMaestrosResponse';

export interface ResponseAliados {
    isError: boolean;
    data?: {
        dias_legalizacion: number;
        id_aliado: number;
        nombre: string;
    };
    message?: string;
    timestamp: string;
}

export interface Data {
    id_equipo: string;
    terminal: string;
    codigo_equipo: string;
    nombre: string;
    id_categoria: number;
    categoria: string;
    activo: boolean;
    especializacion: number | null;
    nombre_especializacion: string | null;
    atributos_adicionales: AtributoAdicional[];
    horario_detallado: HorarioDetallado;
    atributos_operativos: AtributoOperativo[];
    asociacion: Asociacion;
}

export interface ResponseEquipos {
    isError: boolean;
    data: Data | string;
    timestamp: string;
}

export interface AtributoAdicional {
    id_atributo_adicional: number;
    nombre: string;
    valor: string;
}

export interface Horario {
    horaInicio: string;
    horaFin: string;
}

export interface Dia {
    veinticuatro_horas: boolean;
    abierto: boolean;
    horarios: Horario[];
}

export interface HorarioDetallado {
    Lunes: Dia;
    Martes: Dia;
    Miercoles: Dia;
    Jueves: Dia;
    Viernes: Dia;
    Sabado: Dia;
    Domingo: Dia;
}

export interface AtributoOperativo {
    id_atributo: string;
    nombre_atributo: string;
    id_tipo_atributo: number;
    nombre_tipo_atributo: string;
}

export interface Asociacion {
    codigo_tipo_asociacion: number;
    tipo_asociacion: string;
}

export interface ResponseAliadosMaestros {
    isError: boolean;
    data: {
        equipos: Equipo[];
        paginador: null;
    };
    timestamp: string;
}

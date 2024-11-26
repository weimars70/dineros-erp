export interface Equipo {
    codigo_equipo: string;
    estado: boolean;
    segmento: Segmento;
    aliado: Aliado;
}
export interface Segmento {
    id_segmento: number;
    nombre: string;
    id_aliado: number;
    total_equipos_asociados: number;
}

export interface Aliado {
    id_aliado: number;
    tipo_documento: string;
    nro_identificacion: string;
    nombre_aliado: string;
    fecha_creacion: string;
    hora_creacion: string;
    id_tipo_aliado: number;
    codigo_terminal: number;
    codigo_municipio: string;
    nombre_municipio: string;
    direccion: string;
    tipo_corte: string;
    plazo_pago: number;
    estado: boolean;
    direccion_id_tipovia: number;
    direccion_campo_1: string;
    direccion_campo_2: string;
    codigo_departamento: string;
    nombre_departamento: string;
    direccion_info_adicional: string;
    facturacion_observacion: string;
    nombre_terminal: string;
    id_aliado_contactos: null;
    nombre_representante_legal: null;
    telefono_representante_legal: null;
    email_representante_legal: null;
    nombre_gerente: null;
    telefono_gerente: null;
    email_gerente: null;
    nombre_contacto_operativo: null;
    telefono_contacto_operativo: null;
    email_contacto_operativo: null;
}

export interface ResponseGenerico<T> {
    isError: boolean;
    data: T;
    timestamp: Date;
    id: string;
}

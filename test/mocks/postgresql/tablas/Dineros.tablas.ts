import { IMemoryDb } from 'pg-mem';

export const TABLAS_DINEROS = {
    generarTablaTraslados: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.traslados (
            id_traslado varchar DEFAULT nextval('traslados_id_traslado_seq'::regclass) NOT NULL,
            recurso_destino int4 NOT NULL,
            fecha_hora_traslado timestamp NOT NULL,
            valor numeric NOT NULL,
            estado numeric NULL,
            tenencia varchar(200) NULL,
            soporte varchar(200) DEFAULT NULL::character varying NULL,
            medio_pago text NULL,
            terminal int8 DEFAULT 1 NOT NULL,
            CONSTRAINT pk_traslados PRIMARY KEY (id_traslado),
            CONSTRAINT fk_traslado_relations_recursos_des FOREIGN KEY (recurso_destino) REFERENCES public.recursos(id_recurso)
        );`);
    },

    generarSecuenciaTraslados: (db: IMemoryDb) => {
        db.public.none(`CREATE SEQUENCE public.traslados_id_traslado_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;`);
    },

    generarTablaRecursos: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE recursos (
            id_recurso serial NOT NULL,
            id_tipo_recurso int4 NOT NULL,
            identificador_recurso varchar(100) NOT NULL,
            CONSTRAINT pk_recursos PRIMARY KEY (id_recurso),
            CONSTRAINT uq_tip_iden UNIQUE (identificador_recurso, id_tipo_recurso),
            CONSTRAINT fk_recursos_id_tipo_recurso FOREIGN KEY (id_tipo_recurso) REFERENCES tipos_recursos(id_tipo_recurso)
        );`);
    },
    generarTablaTiposRecursos: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE tipos_recursos (
            id_tipo_recurso serial NOT NULL,
            descripcion_recursos varchar(100) NOT NULL,
            informacion_adicional bool DEFAULT false NULL,
            CONSTRAINT pk_tipos_recursos PRIMARY KEY (id_tipo_recurso)
        );`);
    },
    generarTablaRecursoTransaccionesTraslado: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.recursos_trasacciones_traslados (
            id_recurso_traslado int4 DEFAULT nextval('traslados_id_traslado_seq'::regclass) NOT NULL,
            id_recurso int4 NOT NULL,
            id_traslado varchar NOT NULL,
            CONSTRAINT recursos_trasacciones_traslados_pkey PRIMARY KEY (id_recurso_traslado),
            CONSTRAINT fk_recursos_relations_trans FOREIGN KEY (id_traslado) REFERENCES public.traslados(id_traslado),
            CONSTRAINT fk_recursos_relations_traslado FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso)
        );`);
    },
    generarTablaLegalizaciones: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.legalizaciones (
            id_legalizacion serial NOT NULL,
            id_recibo int4 NULL,
            id_traslado varchar NOT NULL,
            fecha_hora_legalizacion timestamp NOT NULL,
            numero_aprobacion numeric NULL,
            fecha_aprobacion timestamp NULL,
            valor int8 DEFAULT 0 NOT NULL,
            recurso int8 DEFAULT 11 NOT NULL,
            last_date timestamp,
            estado int4 DEFAULT 6 NOT NULL,
            reintentos int4 DEFAULT 0 NOT NULL,
            CONSTRAINT pk_legalizaciones PRIMARY KEY (id_legalizacion),
            CONSTRAINT fk_legaliza_relations_recibos_ FOREIGN KEY (id_recibo) REFERENCES public.recibos_caja(id_recibo),
            CONSTRAINT fk_legaliza_relations_traslado FOREIGN KEY (id_traslado) REFERENCES public.traslados(id_traslado)
        );`);
    },
    generarTablaBolsillo: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.bolsillo (
            id_bolsillo serial NOT NULL,
            id_recurso int4 NOT NULL,
            valor_total numeric NOT NULL,
            valor_vencido numeric NOT NULL,
            valor_no_vencido numeric NOT NULL,
            dias_legalizacion numeric NOT NULL,
            id_responsable int4 NOT NULL,
            CONSTRAINT check_valor_boldia_noven CHECK ((valor_no_vencido >= (0)::numeric)),
            CONSTRAINT check_valor_boldia_total CHECK ((valor_total >= (0)::numeric)),
            CONSTRAINT check_valor_boldia_venc CHECK ((valor_vencido >= (0)::numeric)),
            CONSTRAINT pk_bolsillo PRIMARY KEY (id_bolsillo),
            CONSTRAINT fk_bolsillo_relations_recursos FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso)
        );`);
    },

    generarReciboCaja: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.recibos_caja (
            id_recibo serial NOT NULL,
            fecha_recibo timestamp NOT NULL,
            estado_recibo numeric NOT NULL,
            descripcion_recibo varchar(100) NOT NULL,
            terminal_recibo numeric NOT NULL,
            CONSTRAINT pk_recibos_caja PRIMARY KEY (id_recibo)
        );`);
    },
    generarTablaInconsistencias: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.inconsistencias (
                id_inconsistencia serial NOT NULL,
                id_recurso int4 NOT NULL,
                tipo_inconsistencia varchar(50) NOT NULL,
                recurso_responsable int4 NULL,
                fecha_hora timestamp NOT NULL,
                valor numeric NOT NULL,
                estado varchar(50) NOT NULL,
                fecha_solucion timestamp NULL,
                id_legalizacion numeric NULL,
                observaciones varchar(200) NULL,
                CONSTRAINT pk_inconsistencias PRIMARY KEY (id_inconsistencia),
                CONSTRAINT fk_inconsistencias_relations_recursos FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso)
            );`);
    },
    generarTablaTransacciones: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.transacciones (
            id_transaccion serial NOT NULL,
            id_tipo_transaccion int4 NOT NULL,
            valor_transaccion numeric NOT NULL,
            fecha_hora_transaccion timestamp NOT NULL,
            ingreso_dinero bool NOT NULL,
            id_movimiento varchar(100) NULL,
            id_recurso int4 NULL,
            CONSTRAINT pk_transacciones PRIMARY KEY (id_transaccion),
            CONSTRAINT fk_transacc_relations_tipos_tr FOREIGN KEY (id_tipo_transaccion) REFERENCES public.tipos_transacciones(id_tipo_transaccion),
            CONSTRAINT fk_transacciones_relations_recursos FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso)
        );`);
    },
    generarTipoTransacciones: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.tipos_transacciones (
            id_tipo_transaccion serial NOT NULL,
            descripcion_transaccion varchar(50) NOT NULL,
            CONSTRAINT pk_tipos_transacciones PRIMARY KEY (id_tipo_transaccion)
        );`);
    },
    generarAliadosEquipos: (db: IMemoryDb) => {
        db.public.none(`create table public.aliados_equipos
            (
                aliado            numeric not null,
                id_equipo         integer not null,
                dias_legalizacion numeric,
                constraint pk_aliados_equipos primary key (aliado, id_equipo)
            );`);
    },

    generarTablaMediosPagos: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.medios_pagos (
            id_medio_pago int4 NOT NULL,
            descripcion_medio_pago varchar(40) NOT NULL,
            estado_activo bool NOT NULL,
            CONSTRAINT pk_medios_pagos PRIMARY KEY (id_medio_pago)
        );`);
    },

    generarTablaDetalleLegalizaciones: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.detalle_legalizaciones (
            id_detalle_legalizacion serial NOT NULL,
            id_legalizacion int4 NOT NULL,
            id_medio_pago int4 NOT NULL,
            valor bigint NOT NULL,
            CONSTRAINT pk_detalle_legalizaciones PRIMARY KEY (id_detalle_legalizacion),
            CONSTRAINT fk_detalle_legalizaciones_relations_legalizacion FOREIGN KEY (id_legalizacion) REFERENCES public.legalizaciones(id_legalizacion),
            CONSTRAINT fk_detalle_legalizaciones_relations_medio_pago FOREIGN KEY (id_medio_pago) REFERENCES public.medios_pagos(id_medio_pago)
        );`);
    },

    generarTablaLegalizacionBolsillo: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.legalizacion_bolsillo (
            id_bolsillo varchar(100) NOT NULL,
            id_legalizacion int4 NOT NULL,
            valor numeric NOT NULL,
            valor_inicial_bolsillo numeric NOT NULL,
            valor_final_bolsillo numeric NOT NULL
        );`);
    },
};

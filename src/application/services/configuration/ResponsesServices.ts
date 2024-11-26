export const MENSAJE_OK = {
    isError: false,
    message: 'Legalizacion creada con exito',
    cause: '',
    code: 201,
};

export const MENSAJE_ERROR = {
    isError: false,
    message: 'No puede legalizar el equipo',
    cause: '',
    code: 201,
};

export const MENSAJE_BOLSILLO_VACIO = {
    isError: false,
    cause: 'No se encontró ningun bolsillo afectado',
    data: [],
    code: 204,
};

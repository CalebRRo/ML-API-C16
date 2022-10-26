const objectValidate = (args,msg) => ({args,msg}); // Funcion que retorna el argumento y mensaje

const defaultValidationsRequiredFields = {
    notNull:objectValidate(true,"Campo requerido"), // No puede ser nulo
    notEmpty:objectValidate(true,"Campo requerido") // No puede estar vacio
}

module.exports = {
    objectValidate,
    defaultValidationsRequiredFields
}
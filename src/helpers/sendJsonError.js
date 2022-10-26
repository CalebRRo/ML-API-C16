const mapped = (errors = []) => { 
  return errors.reduce((acum,error) => {
    acum = {...acum,[error.path]:error.message}
    return acum 
  },{})// mapea los errores y lo coloca en un array
  // por cada acumulador que se propague como segundo parametro el path con el mensaje de error
  //los errores se reducen en una funcion colback que lleva como primer parametro un acumulador y como segundo el error
}

const sendJsonError = (err,res,codeStatus = /Sequelize/i.test(err.name) ? 422 : 500) => { 
  
    let prop = "error"
    let responseError; // cambia segun el error
    if(/Sequelize/i.test(err.name) && Array.isArray(err.errors)){ // si el error de sequelize es un array agregame una s prop += "s"
       prop += "s"
       responseError = mapped(err.errors) // responseError mapea el error
    }
    if (err.message) {
        responseError = err.message
    }
   /*  if (err instanceof Object) { //valida si es un objeto
        
    } */
    if(typeof err === "string"){ // si el error es un string mande el err == string
       responseError = err
    }
    return res.status(codeStatus).json({
        ok: false,
        status: codeStatus,
        [prop]: responseError,
    });
}

module.exports = {
    sendJsonError
}
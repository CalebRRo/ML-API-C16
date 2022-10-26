const { ID_ADMIN } = require("../constants") // Requerir el ID_ADMIN de ./constants/index.js
/* NO AUTO ELIMINARSE */
const adminNotAutoDestroy = ( req, res, next) => {
    const userIdParams = +req.params.id //el id del user que viene por parametro
    const {id} = req.userToken //desestructura del req el id del user que esta logeado en ese momento
    if ((userIdParams && userIdParams === ID_ADMIN) || (!userIdParams && id === ID_ADMIN)) { // Si el id que viene por parametro y el id que viene por parametro es igual al id de admin
        // Mandaremos un error que no se puede auto eliminar un user admin id=1
        return res.status(400).json({
            ok:false,
            status:400,
            msg: "Este usuario no puede auto eliminarse",
        });      
    }
    // si no es asi next() nos deja continuar positivamente 
    next()
}

module.exports = {
    adminNotAutoDestroy
}
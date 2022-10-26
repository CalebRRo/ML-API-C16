const path = require("path");
const { use } = require("../routes/auth");
const { literal } = require("sequelize")
const db = require("../database/models")
module.exports = {
  // API -> GET IMAGE IN VIEW
  image: (req, res) => {
   res.sendFile(path.join(__dirname,`../../public/images/avatars/${req.params.img}`))
  },

  update: async (req, res) => {
     const {id} = req.userToken
     const {name, surname, street,city, province} = req.body;
     try {
      const options = {
        include:[{
          association:'addresses',
          attributes: {
            exclude:['userId','deletedAt']
          }
        }],
        attributes: {
          exclude:['deletedAt','password'],
          include: [
            [literal(`CONCAT( '${req.protocol}://${req.get("host")}/users/image/',avatar )`),'avatar']]
        }
      }

      const user = await db.User.findByPy(id,options)
      user.name = name?.trim() || user.name;
      user.surname = surname?.trim() || user.surname;
      user.avatar = req.file?.filename || user.avatar

      const indexAddressActive = user.addresses.findIndex(address => address.active) // indice activo en la tabla addresses
      const address = user.addresses[indexAddressActive] // creamos variable de las direcciones activas
       
      address.street = street?.trim() || address.street;
      address.city = city?.trim() || address.city;
      address.province = province?.trim() || address.province;

      await user.save() //save() guarda la informacion en la base de dato
      await address.save()

      return res.status(200).json({
        ok:true,
        status:200,
        data:user
      })// return satisfactorio
     } catch (error) {
      res.status(500).json({
        ok:false,
        status:500,
        msg: error.message || "Ocurrió un error" //manda el error o sino manda el error que escribimos
      })
     }
  },

  remove: async (req, res) => {
    try {
      const userId = req.params.id || req.userToken.id //siempre primero evalua si existe un params y si no exite tiene en cuenta el Token.
      const removeUser = await db.Uder.destroy({where:{id:userId}})/* force:true forar el eliminado */ //remover el usuario que viene por parametro o por el Token.
      const removeAddress = await db.Address.destroy({where:{userId}}) /*== userId : userId */ // elimina la direcion que viene por la columna userId
if (!removeUser || !removeAddress) { // si el user o address no existe tira el proximo error
  return res.status(404).json({
    ok:false,
    status:404,
    msg:"Es probable que el usuario no exista"
  })
}
//respuesta exitosa y elimina el user y address
return res.status(200).json({
  ok:true,
  status:200
})

    } catch (error) {
      res.status(500).json({
        ok:false,
        status:500,
        msg: error.message || "Ocurrió un error"
      })
    }
  }, 
};

const { checkToken } = require("./checkToken");
const { uploadImageAvatar, uploadImageProduct } = require("./uploadFiles");
const {adminNotAutoDestroy} = require("./adminNotAutoDestroy")// requerimos el adminNotAutoDestroy

module.exports = {
uploadImageProduct,
uploadImageAvatar,
adminNotAutoDestroy,
checkToken
}// exportamos todos los middlewares desde el index
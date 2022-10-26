// ************ Require's ************
const express = require("express");
const router = express.Router();

// ************ Controller Require ************
const { update, remove, image } = require("../controllers/usersController");
const { checkToken, adminNotAutoDestroy } = require("../middlewares");
router
  /* UPDATE USER */
  .patch("/",checkToken, adminNotAutoDestroy, update)

  /* DELETE USER */
  .delete("/:id?",remove) //id? puede o no tomar el ID del parametro, sino toma el token del admin para eliminar a otro usuario.

  /* PREVIEW IMAGE */
  .get("/image/:img", image);

module.exports = router;

"use strict";
const { hashSync } = require("bcryptjs");
const { Model } = require("sequelize");
const { ROL_USER } = require("../../constants");
const { objectValidate,defaultValidationsRequiredFields } = require("../resource");
const {unlinkSync} = require("fs")
const {join} = require("path")

module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    existeEmail(value){
      return new Promise((resolve,reject)=>{ /* resolve: lo que se resolvio*/ /* reject: lo que va al cath */
        const user = User.findOne({whare:{email:value}})// Busco en User 1 valor igual al email      
          resolve(user); // Si user existe que resuelva con ese user
      });
    } //funcion para comprobar si existe el email - sincrona con promesa

    static associate(models) {
      // define association here
      /* Tiene muchas direcciones */
      this.hasMany(models.Address, {
        foreignKey: "userId",
        as: "addresses",
      });
      /* Tiene un rol */
      this.belongsTo(models.Rol, {
        foreignKey: "rolId",
        as: "rol",
      });
    }
  }

  User.init(
    {
      /* datatypes y validations */
      /* NAME */
      name: {
        type: DataTypes.STRING,
        allowNull: false, // no olvidar de agregar la columna NotNull asi toma (defaultValidationsRequiredFields) 
        validate:{ //validate recibe un objeto
          ...defaultValidationsRequiredFields,
          is: objectValidate(/^[a-z]+$/i,"No se permite números (name)") /* agregar a la exprecion regular /exprecion regular/ */
           // is recibe 2 objetos 
          // manda como argumento esta expreción regular solo recibe letras
          // mensaje de error
        }
      },

      // SURNAME
      surname: {
        type: DataTypes.STRING,
        validate:{ //validate recibe un objeto
          is: objectValidate(/^[a-z]+$/i,"No se permite números (surname)")
         // manda como argumento esta expreción regular solo recibe letras
         // mensaje de error
          }
        
      },

      // EMAIL
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate:{
          ...defaultValidationsRequiredFields, // desestructuro la variable creada en index
          isEmail: objectValidate(true,"Ingrese un email valido"),
          // valida si es un email
          // argumento true o false
          async email(value){ /* email@gmail.com */// ejetuto la funcion custon que trae el value por parametro
              const exist = await this.existeEmail(value) // devuelve el metodo async de que si existe el email
            
                if (exist) {
                  throw new Error("El email ya existe") // throw corta la funcion y nos tira el error con el mensaje
                }               
           
            }
        }
      },

      // PASSWORD
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
          ...defaultValidationsRequiredFields,
          isAlphanumeric:objectValidate(true,"Contraseña invalida, solo números y letras"), // Solo permite alfanúmericos
          len: objectValidate([4,30],"el password tiene que ser minimo de 4 y maxomo de 10 caracteres"), // len nos permite validar un minimo y maximo de caracteres
        
          /* CUSTOM */
          hashPass(value){ // Metodo para hash lo que viene por value
            User.beforeCreate((user) => {
                 user.password = hashSync(value) // Si user.password es igual al value que viene al metodo hashSync realisa el hash
            })
        }
        }
      },

      // AVATAR
      avatar: {
        type: DataTypes.STRING,
        defaultValue: "default.png",
        validate:{
          isImage(value){ // toma lo que viene del mider
            if(!/.png|.jpg|.jpeg|.webp/i.test(value)){ /* value = product-21212.png testea */ 
               // si la imagen no es de los formatos /* !/[.png|.jpg|.jpeg|.webp]/i.test(value) */ dara el error
               unlinkSync(join(__dirname, "../../../public/images/avatars/" + value))//unlink borra un archivo. si salta el error te elimina la imagen que trae el value
               throw new Error("Archivo invalido")
              }
          }
        }
      },

      // ROL ID
      rolId: {
        type: DataTypes.INTEGER,
        valueDefault: ROL_USER,
      },
    },
    {
      sequelize,
      modelName: "User",
      paranoid: true,
      validate:{
        sonIguales(){
          if (this.name === this.surname) {
            throw new Error("El nombre y apellido no pueden ser iguales")
          }
        }
      }
    }
  );

  return User;
};

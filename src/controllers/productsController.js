const path = require("path");
const { literal, Op } = require("sequelize");
const db = require("../database/models");
const product = require("../database/models/product");
const { literalQueryUrlImage } = require("../helpers/literalQueryUrlImage");
const { sendJsonError } = require("../helpers/sendJsonError");

const controller = {
  // API -> GET IMAGE IN VIEW
  image: (req, res) => {
    res.sendFile(
      path.join(__dirname, `../../public/images/products/${req.params.img}`)
    );
  },

  // API -> ALL PRODUCTS + QUERIES
  all: async (req, res) => {
    try {
      let {
        page = 1,
        limit = 10,
        offset = 0,
        sales = 0,
        salesDiscount = 0,
        price = 0,
        order = "ASC",
        sortBy = "name",
        search = "",
      } = req.query; // traigo la pagina el limite y el offset que viene por query

      /* 1 2 3 4 5 6 7 8 9 10 */
      // limit 5, offset 0,  la paginación comienza desde 0. 1 2 3 4 5.
      // limit 5, offset 5,  la paginación comienza desde 6. 6 7 5 9 10.

      const typesSort = ["name", "price", "discount", "category", "newest"]; // tipos de ordenamientos

        /* ---------COMPROVACIONES---------------------- */
      limit = +limit > 10 ? 10 : +limit;

      salesDiscount = +salesDiscount < 10 ? 10 : +salesDiscount;

      sortBy = typesSort.includes(sortBy) ? sortBy : "name";

      page = +page <= 0 || isNaN(+page) ? 1 : +page; // si la pagina es menor a 0 o son letras nos manda la pagina 1 o sino mando lo que manda el usuario
      /* ---------FIN DE COMPROVACIONES----------------- */
      
      page -= 1;

      offset = page * limit;

      const orderQuery = sortBy === "category" ? [["category","name",order]] : sortBy === "newest" ? [["createdAt","desc"]] : [[sortBy,order]]

      let options = {
        limit,
        offset,
        include: [
          {
            association: "images", //product.images = [{file:nombre.png,productId:2,...}]
            attributes: {
              include: [
                [
                  literal(
                    `CONCAT( '${req.protocol}://${req.get(
                      "host"
                    )}/products/image/',images.file )`
                  ),
                  "file",
                ],
              ],
            },
          },
          {
            association: "category",
            attributes: {
              exclude: ["updateAt", "createAt"],
            },
          },
        ],
        attributes: {
          exclude: ["updateAt", "createAt", "deleteAt"],
          include: [],
        },
        order: orderQuery
      };
       /* ---------SALES Y SALES DESCOUNT--------------- */
      const optionSales = {
        ...options,
        where: {
          discount: {
            [Op.gte]: salesDiscount, // busca un descuento que mande el usuario por salesDiscount
          },
        },
      };

      if (+sales === 1 && !isNaN(sales)) {
        // si sales es true y tiene que ser un numero
        options = optionSales;
      }

      /* ---------FIN SALES DISCOUNT------------------- */
      /* ---------PRICE-------------------------------- */

      const optionPrice = {
        ...options,
        where: {
          price: {
            [Op.gte]: price, // busca el precio igual o mayor a lo que made el usuario
          },
        },
      };

      if (+price && !isNaN(price)) {
        options = optionPrice
      }
      /* ---------FIN PRICE---------------------------- */

      // El metodo findAndCountAll cuanto todo los productos de la busqueda
      const { count, rows: products } = await db.Product.findAndCountAll(
        options
      );
      const existPrev = page > 0 && offset <= count;
      /*  offset 20 y mi cantidad total es de 16 == false */

      const existNext =
        Math.floor(count / limit) >= page + 1 && limit === count;
      /* 16/5 */ /*  Math.floor redonde para abajo  */

      let urlPrev = null;
      let urlNext = null;

      if (existNext) {
        urlNext = `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${
          page + 2
        }`;
      }
      if (existPrev) {
        urlPrev = `${req.protocol}://${req.get("host")}${
          req.baseUrl
        }?page=${page}`;
      }

      return res.status(200).json({
        meta: {
          ok: true,
          status: 200,
        },
        data: {
          totalProducts: count,
          prev: urlPrev,
          next: urlNext,
          data: products,
        },
      });
    } catch (error) {
      sendJsonError(error, res);
    }
  },

  // API -> DETAIL PRODUCT
  detail: async (req, res) => {
    let options = {
      include: [
        {
          association: "images",
          attributes: {
            include: [literalQueryUrlImage(req, "file", "file")],
          },
        },
      ],
    };
    try {
      const idProduct = req.params.id;
      if (isNaN(idProduct)) {
        return sendJsonError("El pararmetro es invalido", res);
      }
      const product = await db.Product.finByPk(req.params.id, options);
      if (!product) {
        return sendJsonError("El pararmetro no existe", res);
      }
      return res.status(200).json({
        ok: true,
        status: 200,
        data: product,
      });
    } catch (error) {
      sendJsonError(error, res);
    }
  },

  // API -> STORAGE PRODUCT
  store: async (req, res) => {
    try {
      const { name, price, description, categoryId, discount } = req.body;

      const product = await db.Product.create({
        name: name?.trim(),
        description: description?.trim(),
        price: price,
        discount: +discount,
        categoryId: +categoryId,
      });

      let images = [{ productId: product.id, file: "default.png" }];
      if (req.files?.length) {
        images = req.files.map((file) => {
          return {
            productId: id,
            file: file.filename,
          };
        });
      }
      await db.Image(images);

      const productReload = await product.reload({ include: ["images"] });

      return res.status(201).json({
        ok: true,
        status: 201,
        data: productReload,
      });
    } catch (error) {
      sendJsonError(error, res);
    }
  },

  // API -> UPDATE PRODUCT
  update: (req, res) => {},

  // API -> DELETE PRODUCT
  destroy: (req, res) => {},
};

module.exports = controller;

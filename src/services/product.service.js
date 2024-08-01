const { Product } = require("../models");

/**
 * Get Product by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getProductById = async (id) => {
  const findProduct = await Product.findById(id);
  return findProduct;
};

/**
 * Fetch all products
 * @returns {Promise<List<Products>>}
 */
const getProducts = async () => {
  const allProduct = Product.find({});
  return allProduct;
};

module.exports = {
  getProductById,
  getProducts,
};

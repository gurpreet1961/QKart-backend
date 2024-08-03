const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const user_cart = await Cart.findOne({email:user.email});
  if(!user_cart){
    throw new ApiError(404, "User does not have a cart");
  }
  return user_cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  let user_cart = await Cart.findOne({email:user.email});
  if(!user_cart){
    try{
      user_cart = await Cart.create({
        email: user.email,
        cartItems: []
      });
      await user_cart.save();
    }
    catch (error) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Cart Not Created Something Went Wrong!!")
    }

  }
  const cart_item = user_cart.cartItems.some((item) => item.product._id == productId);
    if (cart_item) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product already in cart. Use the cart sidebar to update or remove product from cart");
    }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }
  user_cart.cartItems.push({
    product: product,
    quantity: quantity
  });
  await user_cart.save();
  return user_cart;
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const user_cart = await Cart.findOne({ email: user.email });
  if (!user_cart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product")
  }
  const res = await Product.findOne({_id: productId});
  if (!res) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }

  const product = user_cart.cartItems.findIndex((i) => i.product._id == productId);
  if (product== -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }
  console.log(product);
  user_cart.cartItems[product].quantity = quantity;
  await user_cart.save();
  return user_cart
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const user_cart = await Cart.findOne({email: user.email});
  if(!user_cart){
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }
  const product = user_cart.cartItems.findIndex((i) => i.product._id == productId);
  if (product === -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }
  user_cart.cartItems.splice(product, 1);
  await user_cart.save();
};


module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
};

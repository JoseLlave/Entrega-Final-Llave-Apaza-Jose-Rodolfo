const Product = require('./models/product.model');

class ProductManager {
  async getProducts({ limit = 10, page = 1, sort, query } = {}) {
    try {
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        lean: true
      };

      if (sort) {
        options.sort = { price: sort === 'asc' ? 1 : -1 };
      }

      let filter = {};
      if (query) {
        if (query.category) {
          filter.category = query.category;
        } else if (query.status !== undefined) {
          filter.status = query.status === 'true';
        }
      }

      const result = await Product.paginate(filter, options);

      const baseUrl = '/api/products?';
      const queryParams = new URLSearchParams();

      if (limit) queryParams.set('limit', limit);
      if (query) {
        if (query.category) queryParams.set('query', `category:${query.category}`);
        if (query.status !== undefined) queryParams.set('query', `status:${query.status}`);
      }
      if (sort) queryParams.set('sort', sort);

      const prevPage = result.hasPrevPage 
        ? `${baseUrl}page=${result.prevPage}&${queryParams.toString()}`
        : null;

      const nextPage = result.hasNextPage 
        ? `${baseUrl}page=${result.nextPage}&${queryParams.toString()}`
        : null;

      return {
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: prevPage,
        nextLink: nextPage
      };
    } catch (error) {
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id);
      return product;
    } catch (error) {
      throw error;
    }
  }

  async addProduct(productData) {
    try {
      const newProduct = new Product(productData);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id, updatedFields) {
    try {
      if (updatedFields.id) delete updatedFields.id;

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updatedFields,
        { new: true, runValidators: true }
      );

      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const result = await Product.findByIdAndDelete(id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getProductsByCategory(category) {
    try {
      const products = await Product.find({ category, status: true });
      return products;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductManager;

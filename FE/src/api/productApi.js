import api from "./axios";

// ─── Product API ──────────────────────────────────────────────────────────
//        Semua fungsi return raw axios response.
//        Destructuring res.data dilakukan di useProduct hook.
//
// Endpoint yang diasumsikan (Product Service via Gateway):
//   GET    /products              → { data: Product[] }
//   GET    /products/:id          → { data: Product }
//   POST   /products              → { data: Product }       [admin only]
//   PUT    /products/:id          → { data: Product }       [admin only]
//   DELETE /products/:id          → 204 No Content          [admin only]
//   PATCH  /products/:id/stock    → { data: Product }       [admin only]
//
// Tipe Product (referensi dari skema Product Service DB):
//   {
//     id, name, description, price, stock_qty,
//     category_id, category: { name },
//     image_url
//   }

// ── Get All Products ──────────────────────────────────────────────────────
// @param {{ category_id?: number, search?: string, page?: number, limit?: number }} params
export const getProducts = (params = {}) =>
  api.get("/products", { params });

// ── Get Single Product ────────────────────────────────────────────────────
// @param {string|number} id
export const getProductById = (id) =>
  api.get(`/products/${id}`);

// ── Create Product ────────────────────────────────────────────────────────
// @param {{ name: string, description?: string, price: number, stock_qty: number, category_id: number, image_url?: string }} data
// Admin only. Validasi role dilakukan di Gateway.
export const createProduct = (data) =>
  api.post("/products", data);

// ── Update Product ────────────────────────────────────────────────────────
// @param {string|number} id
// @param {Partial<Product>} data
// Admin only.
export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data);

// ── Delete Product ────────────────────────────────────────────────────────
// @param {string|number} id
// Admin only. Pertimbangkan soft delete di backend agar history order tidak rusak.
export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

// ── Update Stock ──────────────────────────────────────────────────────────
// @param {string|number} id
// @param {{ qty: number, type: 'increment'|'decrement'|'set', reason?: string }} data
// Backend akan catat perubahan ke STOCK_LOGS otomatis.
// Gunakan type 'set' untuk koreksi stok, 'increment'/'decrement' untuk mutasi normal.
export const updateStock = (id, data) =>
  api.patch(`/products/${id}/stock`, data);
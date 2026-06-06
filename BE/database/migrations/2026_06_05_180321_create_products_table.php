<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh stock_logs, prescriptions (snapshot)
            $table->id('product_id');

            $table->string('product_name');

            // SKU: Stock Keeping Unit — identifikasi unik produk untuk manajemen stok
            $table->string('SKU')->unique();

            // cascade: kategori dihapus → produk dalam kategori tersebut ikut terhapus
            // pertimbangkan ubah ke restrict jika ingin proteksi lebih ketat
            $table->foreignId('category_id')
                  ->constrained('product_categories', 'category_id')
                  ->cascadeOnDelete();

            $table->text('description')->nullable();

            // image_url: URL gambar dari storage/CDN — tidak disimpan binary di DB
            $table->string('image_url')->nullable();

            $table->decimal('price', 12, 2)->default(0);

            // stock_qty: stok saat ini — diupdate via ProductService::updateStock()
            // perubahan stok selalu dicatat di stock_logs untuk audit trail
            $table->integer('stock_qty')->default(0);

            // unit: satuan produk untuk tampilan
            // contoh: "tablet", "botol", "kapsul", "sachet"
            $table->string('unit');

            // rating: rata-rata rating produk, 1 desimal (contoh: 4.5)
            // nullable — produk baru belum punya rating
            $table->decimal('rating', 3, 1)->nullable();

            // tag: tag pencarian opsional untuk filter di frontend
            // contoh: "vitamin,imun,anak"
            $table->string('tag')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
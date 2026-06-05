<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id');
            $table->string('product_name');
            $table->string('SKU')->unique();

            // FK eksplisit ke category_id — karena PK product_categories bukan default 'id'
            $table->unsignedBigInteger('category_id');
            $table->foreign('category_id')
                  ->references('category_id')
                  ->on('product_categories')
                  ->cascadeOnDelete();

            $table->text('description')->nullable();
            $table->string('image_url')->nullable();  // URL gambar produk — opsional
            $table->decimal('price', 12, 2)->default(0);
            $table->integer('stock_qty')->default(0);
            $table->string('unit');                   // satuan: tablet, botol, kapsul, dll
            $table->decimal('rating', 3, 1)->nullable();
            $table->string('tag')->nullable();        // tag pencarian opsional
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id('prescription_id');
            $table->unsignedBigInteger('record_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->unsignedInteger('qty')->default(1);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('record_id')
                ->references('record_id')
                ->on('medical_records')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('specializations', function (Blueprint $table) {
            // PK eksplisit — direferensi oleh doctors.spec_id
            $table->id('spec_id');

            // spec_name: unique — tidak boleh ada dua spesialisasi dengan nama sama
            // contoh: "Dokter Umum", "Spesialis Anak", "Spesialis Kulit"
            $table->string('spec_name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('specializations');
    }
};
<?php

namespace App\Models;

use App\Models\Service;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

// ServiceCategory: Model untuk tabel service_categories.
// Dipakai untuk mengelompokkan layanan klinik (misal: Konsultasi, Terapi, dll).
class ServiceCategory extends Model
{
    use HasFactory;

    protected $table      = 'service_categories';
    protected $primaryKey = 'category_id';
    public $timestamps    = true;

    protected $fillable = [
        'category_name',
        'description',
    ];

    // services: Relasi ke Service (1:N).
    // Satu kategori bisa punya banyak service.
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'category_id', 'category_id');
    }
}
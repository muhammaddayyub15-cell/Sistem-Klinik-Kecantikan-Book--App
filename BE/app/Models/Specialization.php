<?php

namespace App\Models;

use App\Models\Doctor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Specialization extends Model
{
    use HasFactory;

    protected $table = 'specializations';

    // primaryKey: custom karena migration pakai id('spec_id') bukan id()
    protected $primaryKey = 'spec_id';

    protected $fillable = [
        'spec_name',
        'description',
    ];

    // doctors: semua dokter dengan spesialisasi ini (1:N)
    public function doctors(): HasMany
    {
        return $this->hasMany(Doctor::class, 'spec_id', 'spec_id');
    }
}
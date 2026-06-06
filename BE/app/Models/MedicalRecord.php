<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    protected $primaryKey = 'record_id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $guarded = [];

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'record_id', 'record_id');
    }
}

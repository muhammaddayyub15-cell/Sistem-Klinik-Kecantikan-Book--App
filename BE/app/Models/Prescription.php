<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\MedicalRecord;

class Prescription extends Model
{
    protected $primaryKey = 'prescription_id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $guarded = [];

    public function medicalRecord()
    {
        return $this->belongsTo(MedicalRecord::class, 'record_id', 'record_id');
    }
}

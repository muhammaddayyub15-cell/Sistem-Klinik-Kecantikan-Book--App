<?php

namespace App\Repositories;

use App\Models\MedicalRecord;
use App\Models\Prescription;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class MedicalRepository extends BaseRepository
{
    public function __construct(MedicalRecord $model)
    {
        parent::__construct($model);
    }

    public function allWithRelations(): Collection
    {
        return $this->model->get();
    }

    public function findByBooking(int $bookingId): ?MedicalRecord
    {
        return $this->model
            ->where('booking_id', $bookingId)
            ->first();
    }

    public function findByPatient(int $patientId): Collection
    {
        return $this->model
            ->where('patient_id', $patientId)
            ->get();
    }

    public function findByDoctor(int $doctorId): Collection
    {
        return $this->model
            ->where('doctor_id', $doctorId)
            ->get();
    }

    public function storePrescriptions(int $recordId, array $prescriptions): void
    {
        $insertData = array_map(fn ($item) => array_merge(
            is_array($item) ? $item : ['description' => $item],
            ['record_id' => $recordId, 'created_at' => now(), 'updated_at' => now()]
        ), $prescriptions);

        if (!empty($insertData)) {
            DB::table((new Prescription())->getTable())->insert($insertData);
        }
    }

    public function deletePrescriptionsByRecord(int $recordId): int
    {
        return DB::table((new Prescription())->getTable())
            ->where('record_id', $recordId)
            ->delete();
    }
}

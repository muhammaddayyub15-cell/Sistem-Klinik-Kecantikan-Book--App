<?php

namespace App\Services;

use App\Repositories\MedicalRepository;
use App\Services\BaseService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MedicalService extends BaseService
{
    protected MedicalRepository $medicalRepository;

    public function __construct(MedicalRepository $medicalRepository)
    {
        parent::__construct($medicalRepository);
        $this->medicalRepository = $medicalRepository;
    }

    // ==============================
    // GET ALL
    // ==============================
    public function getAllWithRelations(): Collection
    {
        return $this->medicalRepository->allWithRelations();
    }

    // ==============================
    // CREATE RECORD (SAFE)
    // ==============================
    public function createRecord(array $data): mixed
    {
        return DB::transaction(function () use ($data) {

            // ❗ VALIDASI: 1 booking = 1 record
            if ($this->medicalRepository->findByBooking($data['booking_id'])) {
                throw ValidationException::withMessages([
                    'booking_id' => 'Booking sudah memiliki rekam medis'
                ]);
            }

            $data['recorded_at'] = now();

            return $this->medicalRepository->create($data);
        });
    }

    // ==============================
    // ADD PRESCRIPTIONS
    // ==============================
    public function addPrescriptions(int $recordId, array $prescriptions): mixed
    {
        $record = $this->medicalRepository->findOrFail($recordId);

        return DB::transaction(function () use ($record, $prescriptions) {

            $this->medicalRepository->storePrescriptions(
                $record->record_id,
                $prescriptions
            );

            return $this->medicalRepository->findOrFail($record->record_id);
        });
    }

    // ==============================
    // REPLACE PRESCRIPTIONS
    // ==============================
    public function replacePrescriptions(int $recordId, array $prescriptions): mixed
    {
        $record = $this->medicalRepository->findOrFail($recordId);

        return DB::transaction(function () use ($record, $prescriptions) {

            $this->medicalRepository->deletePrescriptionsByRecord($record->record_id);

            $this->medicalRepository->storePrescriptions(
                $record->record_id,
                $prescriptions
            );

            return $this->medicalRepository->findOrFail($record->record_id);
        });
    }

    // ==============================
    // FILTER
    // ==============================
    public function getByPatient(int $patientId): Collection
    {
        return $this->medicalRepository->findByPatient($patientId);
    }

    public function getByDoctor(int $doctorId): Collection
    {
        return $this->medicalRepository->findByDoctor($doctorId);
    }

    public function getByBooking(int $bookingId): mixed
    {
        $record = $this->medicalRepository->findByBooking($bookingId);

        if (!$record) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException(
                'Rekam medis tidak ditemukan'
            );
        }

        return $record;
    }

    // ==============================
    // UPDATE (STRICT)
    // ==============================
    public function updateRecord(int $id, array $data): mixed
    {
        $allowedFields = ['diagnosis', 'prescription_text'];

        $filteredData = array_intersect_key($data, array_flip($allowedFields));

        if (empty($filteredData)) {
            throw ValidationException::withMessages([
                'data' => 'Tidak ada field yang bisa diupdate'
            ]);
        }

        return $this->medicalRepository->update($id, $filteredData);
    }
}
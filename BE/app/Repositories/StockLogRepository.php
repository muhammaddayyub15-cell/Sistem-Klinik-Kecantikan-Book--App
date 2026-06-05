<?php

namespace App\Repositories;

use App\Models\StockLog;
use Illuminate\Database\Eloquent\Collection;

// StockLogRepository: Query layer untuk tabel stock_logs.
// Hanya mendukung CREATE dan READ — DELETE tidak disediakan secara sengaja.
// Log tidak boleh dihapus untuk menjaga integritas audit trail stok.
class StockLogRepository extends BaseRepository
{
    public function __construct(StockLog $model)
    {
        parent::__construct($model);
    }

    // createLog: Catat satu entri perubahan stok.
    // Dipanggil dari ProductService setiap kali stok berubah via updateStock.
    // $data wajib berisi: product_id, change_qty, type, reason
    // $data opsional    : reference_id (ID order terkait jika stok berubah karena order)
    public function createLog(array $data): StockLog
    {
        return $this->model->create($data);
    }

    // findByProductId: Ambil riwayat perubahan stok untuk satu produk.
    // Diurutkan dari yang terbaru untuk kebutuhan audit di admin panel.
    public function findByProductId(int $productId): Collection
    {
        return $this->model
            ->where('product_id', $productId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
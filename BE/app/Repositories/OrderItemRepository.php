<?php

namespace App\Repositories;

use App\Models\OrderItem;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

class OrderItemRepository extends BaseRepository
{
    public function __construct(OrderItem $model)
    {
        parent::__construct($model);
    }

    // fungsi: bulk insert item order
    public function createBulk(array $items): bool
    {
        return $this->model->insert($items);
    }

    // fungsi: ambil item berdasarkan order
    public function findByOrderId(int $orderId): Collection
    {
        return $this->model
            ->where('order_id', $orderId)
            ->get();
    }
}
<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Services\OrderService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected OrderService $orderService) {}

    // fungsi: list order (admin)
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 15);

            $orders = $this->orderService->getAllOrders((int) $perPage);

            return $this->successResponse($orders);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch orders', 500);
        }
    }

    // fungsi: detail order
    public function show(int $id): JsonResponse
    {
        try {
            $order = $this->orderService->getOrderById($id);

            return $this->successResponse($order);

        } catch (\Throwable $e) {
            return $this->errorResponse('Order not found', 404);
        }
    }

    // fungsi: create order
    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->createOrder($request->validated());

            return $this->createdResponse($order, 'Order berhasil dibuat');

        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());

        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal membuat order', 500);
        }
    }

    // fungsi: order by patient (self)
    public function getByPatient(Request $request): JsonResponse
    {
        try {
            $patient = $request->user()->patient;

            if (!$patient) {
                return $this->errorResponse('Patient not found', 404);
            }

            $orders = $this->orderService
                ->getOrdersByPatient($patient->patient_id);

            return $this->successResponse($orders);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to fetch orders', 500);
        }
    }

    // fungsi: filter status (admin)
    public function getByStatus(string $status): JsonResponse
    {
        try {
            $orders = $this->orderService->getOrdersByStatus($status);

            return $this->successResponse($orders);

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to filter orders', 500);
        }
    }

    // fungsi: update status manual
    public function updateStatus(UpdateOrderStatusRequest $request, int $id): JsonResponse
    {
        try {
            $status = $request->validated()['status'];

            $order = match ($status) {
                'cancelled' => $this->orderService->cancelOrder($id),
                'completed' => $this->orderService->completeOrder($id),
                default     => throw new \Exception('Invalid status', 422),
            };

            return $this->successResponse($order, 'Status updated');

        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());

        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update status', 500);
        }
    }
}
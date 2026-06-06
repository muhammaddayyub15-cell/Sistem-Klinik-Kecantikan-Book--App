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

// OrderController: Handle request order.
// Business logic didelegasi ke OrderService.
class OrderController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected OrderService $orderService) {}

    // index: Ambil semua order dengan pagination — admin only.
    public function index(Request $request): JsonResponse
    {
        try {
            $orders = $this->orderService->getAllOrders(
                (int) $request->query('per_page', 15)
            );

            return $this->successResponse($orders);
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil data order.', 500);
        }
    }

    // show: Detail satu order beserta items dan payment.
    public function show(int $id): JsonResponse
    {
        try {
            return $this->successResponse(
                $this->orderService->getOrderById($id)
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Order tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil detail order.', 500);
        }
    }

    // store: Buat order baru — patient only.
    // patient_id di-resolve dari token di OrderService.
    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->createOrder($request->validated());

            return $this->createdResponse($order, 'Order berhasil dibuat.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), $e->getMessage());
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal membuat order.', 500);
        }
    }

    // getByPatient: Ambil order milik patient yang sedang login.
    public function getByPatient(Request $request): JsonResponse
    {
        try {
            $patient = $request->user()->patient;

            if (!$patient) {
                return $this->notFoundResponse('Patient tidak ditemukan.');
            }

            $orders = $this->orderService->getOrdersByPatient($patient->patient_id);

            return $this->successResponse($orders);
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal mengambil data order.', 500);
        }
    }

    // getByStatus: Filter order berdasarkan status — admin only.
    public function getByStatus(string $status): JsonResponse
    {
        try {
            $orders = $this->orderService->getOrdersByStatus($status);

            return $this->successResponse($orders);
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal memfilter order.', 500);
        }
    }

    // cancel: Batalkan order — hanya jika status masih pending.
    // Dipakai patient via PATCH /orders/{id}/cancel.
    public function cancel(int $id): JsonResponse
    {
        try {
            $order = $this->orderService->cancelOrder($id);

            return $this->successResponse($order, 'Order berhasil dibatalkan.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), $e->getMessage());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Order tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal membatalkan order.', 500);
        }
    }

    // updateStatus: Update status order manual — admin only.
    // Dipakai via PATCH /orders/{id}/status.
    public function updateStatus(UpdateOrderStatusRequest $request, int $id): JsonResponse
    {
        try {
            $order = $this->orderService->updateStatus($id, $request->validated());

            return $this->successResponse($order, 'Status order berhasil diperbarui.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), $e->getMessage());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Order tidak ditemukan.');
        } catch (\Throwable $e) {
            return $this->errorResponse('Gagal memperbarui status order.', 500);
        }
    }
}
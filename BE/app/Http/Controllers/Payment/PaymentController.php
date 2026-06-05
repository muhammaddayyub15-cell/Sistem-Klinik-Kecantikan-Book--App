<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\InitiatePaymentRequest;
use App\Services\PaymentService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// PaymentController: Menangani endpoint untuk inisiasi pembayaran dan webhook Midtrans.
class PaymentController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private PaymentService $paymentService)
    {
    }

    // show: GET /payments/order/{orderId}
    // Ambil data payment berdasarkan order_id.
    public function show(int $orderId): JsonResponse
    {
        $payment = $this->paymentService->getPaymentByOrderId($orderId);

        if (!$payment) {
            return $this->notFoundResponse('Data pembayaran tidak ditemukan untuk order ini.');
        }

        return $this->successResponse($payment, 'Data pembayaran berhasil diambil');
    }

    // initiate: POST /payments/initiate
    // Inisiasi pembayaran — membuat payment record dan menyiapkan data untuk Midtrans.
    // TODO: Setelah package midtrans-php terinstall, method ini akan mengembalikan
    //       snap_token dan redirect_url dari Midtrans.
    public function initiate(InitiatePaymentRequest $request): JsonResponse
    {
        $payment = $this->paymentService->initiate($request->validated()['order_id']);
        return $this->createdResponse($payment, 'Pembayaran berhasil diinisiasi');
    }

    // webhook: POST /payments/webhook
    // Endpoint untuk menerima notifikasi dari Midtrans.
    // CATATAN KEAMANAN:
    //   - Route ini tidak dilindungi auth:sanctum karena dipanggil oleh server Midtrans
    //   - Verifikasi dilakukan via signature key di dalam PaymentService::handleWebhook()
    //   - Pastikan IP whitelist Midtrans dikonfigurasi di level server/firewall
    public function webhook(Request $request): JsonResponse
    {
        $this->paymentService->handleWebhook($request->all());
        // Midtrans mengharapkan HTTP 200 sebagai konfirmasi webhook diterima
        return $this->successResponse(null, 'Webhook berhasil diproses');
    }
}
<?php

namespace App\Http\Controllers\Service;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Services\ServiceService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

// ServiceController: Handle HTTP request/response untuk manajemen layanan klinik.
// Business logic didelegasi ke ServiceService.
// Semua route di-protect middleware role:admin kecuali index dan show (public).
class ServiceController extends Controller
{
    use ApiResponseTrait;

    public function __construct(protected ServiceService $serviceService) {}

    // index: Ambil semua service yang aktif — public, dipakai BookingPage frontend.
    public function index(Request $request): JsonResponse
    {
        $services = $request->query('all') === 'true' && auth('sanctum')->check()
            ? $this->serviceService->getAll()
            : $this->serviceService->getAllActive();

        return $this->successResponse($services);
    }

    // show: Ambil detail satu service by ID.
    public function show(int $id): JsonResponse
    {
        return $this->successResponse(
            $this->serviceService->findOrFail($id)
        );
    }

    // store: Buat service baru — admin only.
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = $this->serviceService->createService($request->validated());

        return $this->successResponse($service, 'Service created successfully', 201);
    }

    // update: Update service — admin only, partial update didukung.
    public function update(UpdateServiceRequest $request, int $id): JsonResponse
    {
        $service = $this->serviceService->updateService($id, $request->validated());

        return $this->successResponse($service, 'Service updated successfully');
    }

    // destroy: Soft delete service — admin only.
    // Service yang sudah dipakai di booking tidak akan hilang dari history.
    public function destroy(int $id): JsonResponse
    {
        $this->serviceService->delete($id);

        return $this->successResponse(null, 'Service deleted successfully');
    }

    // toggle: Toggle is_active service — admin only.
    // Service non-aktif tidak muncul di BookingPage.
    public function toggle(int $id): JsonResponse
    {
        $service = $this->serviceService->toggleActive($id);

        return $this->successResponse($service, 'Service status updated');
    }
}

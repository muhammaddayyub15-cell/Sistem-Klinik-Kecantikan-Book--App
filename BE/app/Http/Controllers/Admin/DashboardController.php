<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    // fungsi: ambil seluruh data dashboard admin
    // logic:
    // - total booking
    // - total revenue
    // - total order
    // - total product
    // - total doctor
    // - statistik tambahan (optional)
    public function index(): JsonResponse
    {
        try {
            $data = $this->dashboardService->getStats();

            return $this->successResponse(
                $data,
                'Dashboard data retrieved successfully'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to load dashboard data',
                500
            );
        }
    }


// fungsi: ambil recent activity dengan pagination
    // logic: terima query param ?page=N, return paginated activity
    public function recentActivity(): JsonResponse
    {
        try {
            $page = (int) request()->query('page', 1);
            $data = $this->dashboardService->getRecentActivity($page);

            return $this->successResponse($data, 'Recent activity retrieved');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to load activity', 500);
        }
    }
}
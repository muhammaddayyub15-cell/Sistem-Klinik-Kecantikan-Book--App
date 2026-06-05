<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Order;
use App\Models\Product;
use App\Models\Doctor;
use Carbon\Carbon;

class DashboardService
{
    // fungsi: ambil statistik utama dashboard
    public function getStats(): array
    {
        return [
            // ── SUMMARY ─────────────────────────
            'summary' => [
                'total_bookings' => Booking::count(),
                'total_orders'   => Order::count(),
                'total_products' => Product::count(),
                'total_doctors'  => Doctor::count(),
            ],

            // ── REVENUE ─────────────────────────
            'revenue' => [
                'total' => Order::where('status', 'completed')->sum('total_amount'),

                'today' => Order::where('status', 'completed')
                    ->whereDate('created_at', today())
                    ->sum('total_amount'),

                'this_month' => Order::where('status', 'completed')
                    ->whereMonth('created_at', now()->month)
                    ->sum('total_amount'),
            ],

            // ── BOOKING STATS ───────────────────
            'booking_stats' => [
                'pending'   => Booking::where('status', 'pending')->count(),
                'confirmed' => Booking::where('status', 'confirmed')->count(),
                'completed' => Booking::where('status', 'completed')->count(),
                'cancelled' => Booking::where('status', 'cancelled')->count(),
            ],

            // ── ORDER STATS ─────────────────────
            'order_stats' => [
                'pending'   => Order::where('status', 'pending')->count(),
                'completed' => Order::where('status', 'completed')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
            ],
        ];
    }
}
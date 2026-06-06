<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Order;
use App\Models\Product;
use App\Models\Doctor;
use App\Models\StockLog;
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

            // ── MONTHLY REVENUE ──────────────────
            // Revenue per bulan tahun berjalan — 12 titik untuk bar chart
            'monthly_revenue' => $this->getMonthlyRevenue(),

            // ── BOOKINGS BY SERVICE ──────────────
            // Jumlah booking per service untuk breakdown chart
            'bookings_by_service' => $this->getBookingsByService(),

            // ── RECENT ACTIVITY ──────────────────
            // Gabungan booking + order + stock terbaru, limit 6 + pagination
            'recent_activity' => $this->getRecentActivity(),

            // ── TOP DOCTORS ──────────────────────
            // Dokter dengan booking terbanyak, limit 3
            'top_doctors' => $this->getTopDoctors(),
        ];
    }

    // fungsi: revenue per bulan untuk tahun berjalan
    // logic: group orders completed by month, fill bulan kosong dengan 0
    private function getMonthlyRevenue(): array
    {
        $rows = Order::where('status', 'completed')
            ->whereYear('created_at', now()->year)
            ->selectRaw('MONTH(created_at) as month, SUM(total_amount) as total')
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        return collect(range(1, 12))->map(fn($m) => [
            'month' => $months[$m - 1],
            'value' => (int) ($rows[$m] ?? 0),
        ])->values()->toArray();
    }

    // fungsi: jumlah booking per service
    // logic: join bookings → services, group by service_name, order by count desc
    private function getBookingsByService(): array
    {
        $total = Booking::count() ?: 1; // hindari division by zero

        return Booking::join('services', 'bookings.service_id', '=', 'services.service_id')
            ->selectRaw('services.service_name as name, COUNT(*) as count')
            ->groupBy('services.service_name')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(fn($row) => [
                'name'  => $row->name,
                'count' => $row->count,
                'pct'   => round(($row->count / $total) * 100),
            ])
            ->toArray();
    }

    // fungsi: recent activity gabungan booking + order + stock log
    // logic: union 3 tabel → sort by created_at desc → paginate 6
    // [NOTE] page diterima dari luar agar bisa dipanggil dengan parameter page
    public function getRecentActivity(int $page = 1, int $perPage = 6): array
    {
        $bookings = Booking::with('patient.user', 'service')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn($b) => [
                'type'      => 'booking',
                'icon'      => '✦',
                'color'     => '#b87c5a',
                'title'     => 'New Booking',
                'desc'      => ($b->patient?->user?->full_name ?? 'Unknown') . ' booked ' . ($b->service?->service_name ?? '—'),
                'created_at'=> $b->created_at,
                'time'      => $b->created_at->diffForHumans(),
            ]);

        $orders = Order::latest()
            ->limit(20)
            ->get()
            ->map(fn($o) => [
                'type'      => 'order',
                'icon'      => '◈',
                'color'     => '#6a9a6a',
                'title'     => 'Order Placed',
                'desc'      => 'Order #' . $o->id . ' placed — Rp ' . number_format($o->total_amount, 0, ',', '.'),
                'created_at'=> $o->created_at,
                'time'      => $o->created_at->diffForHumans(),
            ]);

        $stocks = StockLog::with('product')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn($s) => [
                'type'      => 'stock',
                'icon'      => '◇',
                'color'     => '#aa8a6a',
                'title'     => 'Stock Update',
                'desc'      => ($s->product?->product_name ?? 'Product') . ' — qty ' . ($s->change_qty > 0 ? '+' : '') . $s->change_qty,
                'created_at'=> $s->created_at,
                'time'      => $s->created_at->diffForHumans(),
            ]);

        // Gabung + sort by created_at desc + paginate manual
        $all = $bookings->concat($orders)->concat($stocks)
            ->sortByDesc('created_at')
            ->values();

        $total    = $all->count();
        $lastPage = (int) ceil($total / $perPage);
        $items    = $all->slice(($page - 1) * $perPage, $perPage)->values();

        return [
            'data'      => $items->toArray(),
            'page'      => $page,
            'per_page'  => $perPage,
            'total'     => $total,
            'last_page' => $lastPage,
        ];
    }

    // fungsi: top 3 dokter berdasarkan jumlah booking
    // logic: join bookings → doctors → users, group by doctor, order by count desc
    private function getTopDoctors(): array
    {
        return Doctor::withCount('bookings')
            ->with('user', 'specialization')
            ->orderByDesc('bookings_count')
            ->limit(3)
            ->get()
            ->map(fn($d) => [
                'name'        => $d->user?->full_name ?? '—',
                'initials'    => collect(explode(' ', $d->user?->full_name ?? ''))
                                    ->take(2)->map(fn($w) => strtoupper($w[0] ?? ''))->implode(''),
                'sessions'    => $d->bookings_count,
                'specialization' => $d->specialization?->spec_name ?? '—',
            ])
            ->toArray();
    }
}
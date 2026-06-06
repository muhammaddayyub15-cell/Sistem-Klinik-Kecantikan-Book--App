<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;

// -- Models --
use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Booking;
use App\Models\MedicalRecord;
use App\Models\Service;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\StockLog;

// -- Repositories --
use App\Repositories\UserRepository;
use App\Repositories\PatientRepository;
use App\Repositories\DoctorRepository;
use App\Repositories\ScheduleRepository;
use App\Repositories\BookingRepository;
use App\Repositories\MedicalRepository;
use App\Repositories\ServiceRepository;
use App\Repositories\OrderRepository;
use App\Repositories\OrderItemRepository;
use App\Repositories\PaymentRepository;
use App\Repositories\ProductRepository;
use App\Repositories\ProductCategoryRepository;
use App\Repositories\StockLogRepository;

// -- Services --
use App\Services\AuthService;
use App\Services\BookingService;
use App\Services\DoctorService;
use App\Services\ScheduleService;
use App\Services\MedicalService;
use App\Services\PatientService;
use App\Services\ServiceService;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Services\ProductService;
use App\Services\ProductCategoryService;

// -- Events & Listeners --
use App\Events\Booking\BookingCreated;
use App\Listeners\SendBookingNotificationListener;

// AppServiceProvider: Binding manual IoC Container untuk seluruh monolith.
//
// MENGAPA BINDING MANUAL?
// BaseRepository butuh instance $model yang konkret — Laravel tidak bisa auto-resolve ini.
// Semua repository dan service didaftarkan di sini agar Container tahu cara membuat setiap instance.
class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // ── REPOSITORIES ────────────────────────────────────────────

        $this->app->singleton(
            UserRepository::class,
            fn() =>
            new UserRepository(new User())
        );

        $this->app->singleton(
            PatientRepository::class,
            fn() =>
            new PatientRepository(new Patient())
        );

        $this->app->singleton(
            DoctorRepository::class,
            fn() =>
            new DoctorRepository(new Doctor())
        );

        $this->app->singleton(
            ScheduleRepository::class,
            fn() =>
            new ScheduleRepository(new DoctorSchedule())
        );

        $this->app->singleton(
            BookingRepository::class,
            fn() =>
            new BookingRepository(new Booking())
        );

        $this->app->singleton(
            MedicalRepository::class,
            fn() =>
            new MedicalRepository(new MedicalRecord())
        );

        $this->app->singleton(
            ServiceRepository::class,
            fn() =>
            new ServiceRepository(new Service())
        );

        $this->app->singleton(
            OrderRepository::class,
            fn() =>
            new OrderRepository(new Order())
        );

        $this->app->singleton(
            OrderItemRepository::class,
            fn() =>
            new OrderItemRepository(new OrderItem())
        );

        $this->app->singleton(
            PaymentRepository::class,
            fn() =>
            new PaymentRepository(new Payment())
        );

        $this->app->singleton(
            ProductRepository::class,
            fn() =>
            new ProductRepository(new Product())
        );

        $this->app->singleton(
            ProductCategoryRepository::class,
            fn() =>
            new ProductCategoryRepository(new ProductCategory())
        );

        $this->app->singleton(
            StockLogRepository::class,
            fn() =>
            new StockLogRepository(new StockLog())
        );

        // ── SERVICES ─────────────────────────────────────────────────

        // AuthService: butuh UserRepository + PatientRepository
        $this->app->singleton(
            AuthService::class,
            fn($app) =>
            new AuthService(
                $app->make(UserRepository::class),
                $app->make(PatientRepository::class),
            )
        );

        // BookingService: butuh BookingRepository + ScheduleRepository
        $this->app->singleton(
            BookingService::class,
            fn($app) =>
            new BookingService(
                $app->make(BookingRepository::class),
                $app->make(ScheduleRepository::class),
            )
        );

        $this->app->singleton(
            DoctorService::class,
            fn($app) =>
            new DoctorService(
                $app->make(DoctorRepository::class),
                $app->make(UserRepository::class),
            )
        );

        // ScheduleService: butuh ScheduleRepository + DoctorRepository
        $this->app->singleton(
            ScheduleService::class,
            fn($app) =>
            new ScheduleService(
                $app->make(ScheduleRepository::class),
                $app->make(DoctorRepository::class),
            )
        );

        // MedicalService: butuh MedicalRepository saja
        $this->app->singleton(
            MedicalService::class,
            fn($app) =>
            new MedicalService(
                $app->make(MedicalRepository::class),
            )
        );

        $this->app->singleton(
            PatientService::class,
            fn($app) =>
            new PatientService(
                $app->make(PatientRepository::class),
            )
        );

        $this->app->singleton(
            ServiceService::class,
            fn($app) =>
            new ServiceService(
                $app->make(ServiceRepository::class),
            )
        );

        // OrderService: butuh OrderRepository + OrderItemRepository
        $this->app->singleton(
            OrderService::class,
            fn($app) =>
            new OrderService(
                $app->make(OrderRepository::class),
                $app->make(OrderItemRepository::class),
            )
        );

        // PaymentService: butuh PaymentRepository + OrderRepository
        $this->app->singleton(
            PaymentService::class,
            fn($app) =>
            new PaymentService(
                $app->make(PaymentRepository::class),
                $app->make(OrderRepository::class),
            )
        );

        // ProductService: butuh ProductRepository + StockLogRepository
        $this->app->singleton(
            ProductService::class,
            fn($app) =>
            new ProductService(
                $app->make(ProductRepository::class),
                $app->make(StockLogRepository::class),
            )
        );

        $this->app->singleton(
            ProductCategoryService::class,
            fn($app) =>
            new ProductCategoryService(
                $app->make(ProductCategoryRepository::class),
            )
        );
    }

    public function boot(): void
    {
        // BookingCreated → SendBookingNotificationListener
        // kirim notifikasi database ke patient setiap booking dibuat
        Event::listen(
            BookingCreated::class,
            SendBookingNotificationListener::class,
        );
    }
}

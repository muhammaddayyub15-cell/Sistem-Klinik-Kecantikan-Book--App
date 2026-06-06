<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        // Relasi 1:1 dengan orders — satu order hanya punya satu payment record
        // payment_id: named PK sesuai migration $table->id('payment_id')
        // order_id: unique FK → orders.order_id (cascade delete)
        // midtrans_id: diisi setelah redirect Midtrans, nullable saat baru diinisiasi
        // status mapping:
        //   'success'  → webhook 'settlement' dari Midtrans diterima
        //   'pending'  → payment diinisiasi, user belum membayar
        DB::table('payments')->insertOrIgnore([
            [
                'payment_id'      => 1,
                'order_id'        => 1,
                'midtrans_id'     => 'MIDTRANS-TRX-001',
                'amount'          => 695000.00,
                'payment_method'  => 'bca_va',           // metode dipilih user di halaman Midtrans
                'payment_channel' => 'bank_transfer',
                'status'          => 'success',
                'paid_at'         => Carbon::parse('2025-05-05 11:00:00'),
                'created_at'      => Carbon::parse('2025-05-05 10:30:00'),
                'updated_at'      => Carbon::parse('2025-05-05 11:00:00'),
            ],
            [
                'payment_id'      => 2,
                'order_id'        => 2,
                'midtrans_id'     => 'MIDTRANS-TRX-002',
                'amount'          => 1045000.00,
                'payment_method'  => 'gopay',
                'payment_channel' => 'e-wallet',
                'status'          => 'success',
                'paid_at'         => Carbon::parse('2025-05-07 16:00:00'),
                'created_at'      => Carbon::parse('2025-05-07 15:30:00'),
                'updated_at'      => Carbon::parse('2025-05-07 16:00:00'),
            ],
            [
                'payment_id'      => 3,
                'order_id'        => 3,
                'midtrans_id'     => null,               // belum redirect ke Midtrans
                'amount'          => 295000.00,
                'payment_method'  => null,               // belum dipilih user
                'payment_channel' => null,
                'status'          => 'pending',
                'paid_at'         => null,
                'created_at'      => Carbon::parse('2025-05-20 12:00:00'),
                'updated_at'      => Carbon::parse('2025-05-20 12:00:00'),
            ],
        ]);
    }
}
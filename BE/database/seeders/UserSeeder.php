<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $now        = Carbon::now();
        $verifiedAt = Carbon::now()->subDays(30);

        DB::table('users')->insertOrIgnore([
            ['user_id' => 1, 'full_name' => 'Admin Aura',        'email' => 'admin@auraclinic.com',          'phone' => '081200000001', 'password' => Hash::make('password123'), 'role' => 'admin',   'status' => 'active', 'email_verified_at' => $verifiedAt, 'last_login_at' => Carbon::now()->subHours(1),  'remember_token' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 2, 'full_name' => 'Admin Operasional', 'email' => 'ops@auraclinic.com',            'phone' => '081200000002', 'password' => Hash::make('password123'), 'role' => 'admin',   'status' => 'active', 'email_verified_at' => $verifiedAt, 'last_login_at' => Carbon::now()->subHours(3),  'remember_token' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 3, 'full_name' => 'dr. Sari Indah',    'email' => 'sari.indah@auraclinic.com',     'phone' => '081200000003', 'password' => Hash::make('password123'), 'role' => 'doctor',  'status' => 'active', 'email_verified_at' => $verifiedAt, 'last_login_at' => Carbon::now()->subHours(5),  'remember_token' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 4, 'full_name' => 'dr. Budi Santoso',  'email' => 'budi.santoso@auraclinic.com',   'phone' => '081200000004', 'password' => Hash::make('password123'), 'role' => 'doctor',  'status' => 'active', 'email_verified_at' => $verifiedAt, 'last_login_at' => Carbon::now()->subDays(1),   'remember_token' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 5, 'full_name' => 'Dewi Kusuma',        'email' => 'dewi.kusuma@gmail.com',         'phone' => '081300000005', 'password' => Hash::make('password123'), 'role' => 'patient', 'status' => 'active', 'email_verified_at' => $verifiedAt, 'last_login_at' => Carbon::now()->subDays(2),   'remember_token' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 6, 'full_name' => 'Anisa Putri',        'email' => 'anisa.putri@gmail.com',         'phone' => '081300000006', 'password' => Hash::make('password123'), 'role' => 'patient', 'status' => 'active', 'email_verified_at' => $verifiedAt, 'last_login_at' => Carbon::now()->subDays(5),   'remember_token' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => 7, 'full_name' => 'Rina Maharani',      'email' => 'rina.maharani@gmail.com',       'phone' => '081300000007', 'password' => Hash::make('password123'), 'role' => 'patient', 'status' => 'active', 'email_verified_at' => null,        'last_login_at' => null,                        'remember_token' => null, 'deleted_at' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
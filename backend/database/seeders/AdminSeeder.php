<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'first_name'  => 'System',
                'last_name'   => 'Admin',
                'middle_name' => null, // Optional
                'suffix'      => null, // Optional
                'password' => Hash::make('secret123'), // Change this to your new password
                'role' => 'admin',
            ]
        );
    }
}
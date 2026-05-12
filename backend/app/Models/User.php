<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // ── Accessors ────────────────────────────────────────────────

    /**
     * "Juan P. Dela Cruz Jr."
     * Use this wherever you previously used $user->name
     */
    public function getFullNameAttribute(): string
    {
        $middle = $this->middle_name
            ? ' ' . strtoupper(substr($this->middle_name, 0, 1)) . '.'
            : '';
        $suffix = $this->suffix ? ', ' . $this->suffix : '';

        return $this->first_name . $middle . ' ' . $this->last_name . $suffix;
    }

    /**
     * "Dela Cruz, Juan P."
     * Good for tables and lists
     */
    public function getDisplayNameAttribute(): string
    {
        $middle = $this->middle_name
            ? ' ' . strtoupper(substr($this->middle_name, 0, 1)) . '.'
            : '';

        return $this->last_name . ', ' . $this->first_name . $middle;
    }

    // ── Relationships ────────────────────────────────────────────

    public function student()
    {
        return $this->hasOne(Student::class);
    }
}
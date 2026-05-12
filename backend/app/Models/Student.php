<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($student) {
            if (empty($student->student_id)) {
                $yearPrefix = date('y'); // e.g., '26' for 2026
                $lastStudent = static::where('student_id', 'LIKE', "{$yearPrefix}%")
                    ->orderBy('student_id', 'desc')
                    ->first();

                $newNumber = $lastStudent
                    ? str_pad((int) substr($lastStudent->student_id, 4) + 1, 5, '0', STR_PAD_LEFT)
                    : '00001';

                $student->student_id = $yearPrefix . $newNumber; // e.g., "2600001"
            }
        });
    }

    protected $fillable = [
        'user_id',
        'student_id',
        'course_id',
        'year_level',
        'semester',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }
}
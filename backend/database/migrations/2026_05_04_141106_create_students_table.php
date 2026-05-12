<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('students', function (Blueprint $table) {
        $table->id();
        // This links the record to the users table
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
        $table->string('student_id')->unique(); // remove nullable // Add this line
        $table->string('course');
        $table->string('year');
        $table->decimal('math', 5, 2)->default(0);
        $table->decimal('english', 5, 2)->default(0);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

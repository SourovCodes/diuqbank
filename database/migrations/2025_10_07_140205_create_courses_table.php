<?php

use App\Models\Department;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Department::class)->constrained();
            $table->string('name');
            $table->timestamps();

            $table->unique(['department_id', 'name']);

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};

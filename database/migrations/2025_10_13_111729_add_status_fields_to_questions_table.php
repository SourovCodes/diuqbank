<?php

use App\Enums\QuestionStatus;
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
        Schema::table('questions', function (Blueprint $table) {
            $table->string('status')->default(QuestionStatus::PUBLISHED->value)->after('section');
            $table->string('under_review_reason')->nullable()->after('status');
            $table->text('duplicate_reason')->nullable()->after('under_review_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['status', 'under_review_reason', 'duplicate_reason']);
        });
    }
};

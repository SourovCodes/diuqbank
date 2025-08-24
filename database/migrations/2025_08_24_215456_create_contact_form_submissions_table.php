<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('contact_form_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email_or_phone');
            $table->string('message');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('contact_form_submissions');
    }
};

<?php

namespace App\Listeners;

use App\Events\NewUserRegistered;
use App\Mail\NewUserNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class NotifyAdmin implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        // dd("asd");
    }

    /**
     * Handle the event.
     */
    public function handle(NewUserRegistered $event)
    {

        Mail::to('sourov2305101004@diu.edu.bd')->send(new NewUserNotification($event->user));
    }
}

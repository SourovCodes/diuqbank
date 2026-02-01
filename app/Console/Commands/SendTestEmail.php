<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestEmail extends Command
{
    protected $signature = 'mail:test {email=sourovcodes@gmail.com : The email address to send the test email to}';

    protected $description = 'Send a test email to verify mail configuration';

    public function handle(): int
    {
        $email = $this->argument('email');

        $this->info("Sending test email to {$email}...");

        try {
            Mail::raw('This is a test email from DIUQBank to verify that email configuration is working correctly.', function ($message) use ($email) {
                $message->to($email)
                    ->subject('DIUQBank - Test Email');
            });

            $this->info('Test email sent successfully!');

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed to send test email: {$e->getMessage()}");

            return self::FAILURE;
        }
    }
}

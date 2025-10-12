<x-mail::message>
# New Contact Form Submission

**Name:** {{ $name }}

**Email:** {{ $email }}

<x-mail::panel>
{{ $messageBody }}
</x-mail::panel>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

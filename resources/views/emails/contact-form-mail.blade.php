<x-mail::message>
    # New Contact Form Submission


    **Name:** [{{ $name }}]
    **Email:** [{{ $email }}]
    **phone:** [{{ $phone }}]
    **subject:** [{{ $subject }}]
    **message:** [{{ $message }}]


    Thanks,<br>
    {{ config('app.name') }}
</x-mail::message>

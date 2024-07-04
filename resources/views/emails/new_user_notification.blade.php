<x-mail::message>
# New User Registration

A new user has registered on {{ config('app.name') }}:

**Name:** [{{ $user->name }}]  
**Email:** [{{ $user->email }}]


Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

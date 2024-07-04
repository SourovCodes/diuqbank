<x-mail::message>
# Hello {{ $user->name }}

We're thrilled to welcome you to {{ config('app.name') }}, your go-to destination for contributing to our comprehensive question bank!

Share your question to our website to help others.

<x-mail::button :url="route('my-account.questions.create')">
Start Uploading
</x-mail::button>

Once logged in, you can begin sharing missing questions or improving existing ones to help your fellow students and enrich our question bank.

Thank you for joining us in our mission to make exam preparation more collaborative and effective for students worldwide. If you have any questions or need assistance, feel free to reach out to our support team at [support@diuqbank.com](mailto:support@diuqbank.com).

Happy contributing!

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>

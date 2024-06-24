<button
    {{ $attributes->merge(['type' => 'button', 'class' => 'inline-flex items-center justify-center  px-4 py-2 text-base font-semibold transition-all duration-200 bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-md focus:outline-none hover:border-blue-700 focus:border-blue-700']) }}>
    {{ $slot }}
</button>

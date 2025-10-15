@php
    $pdfUrl = $record?->getFirstMediaUrl('pdf');
@endphp

<div>
    @if($pdfUrl)
        <div style="position: relative; width: 100%; overflow: hidden; border-radius: 0.5rem; border: 1px solid; border-color: rgb(229 231 235); background-color: white; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);">
            @darkmode
                <style>
                    .pdf-viewer-container {
                        border-color: rgb(55 65 81);
                        background-color: rgb(31 41 55);
                    }
                    .pdf-header {
                        border-color: rgb(55 65 81);
                        background-color: rgb(17 24 39);
                    }
                    .pdf-header-text {
                        color: rgb(209 213 219);
                    }
                    .pdf-icon-text {
                        color: rgb(107 114 128);
                    }
                    .pdf-button {
                        background-color: rgb(31 41 55);
                        color: rgb(209 213 219);
                        border-color: rgb(75 85 99);
                    }
                    .pdf-button:hover {
                        background-color: rgb(55 65 81);
                    }
                    .pdf-footer {
                        border-color: rgb(55 65 81);
                        background-color: rgb(17 24 39);
                    }
                    .pdf-footer-text {
                        color: rgb(156 163 175);
                    }
                    .pdf-background {
                        background-color: rgb(17 24 39);
                    }
                </style>
            @enddarkmode
            
            <div class="pdf-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgb(229 231 235); background-color: rgb(249 250 251); padding: 0.75rem 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <x-filament::icon
                        icon="heroicon-o-document-text"
                        class="pdf-icon-text"
                        style="height: 1.25rem; width: 1.25rem; color: rgb(156 163 175);"
                    />
                    <span class="pdf-header-text" style="font-size: 0.875rem; line-height: 1.25rem; font-weight: 500; color: rgb(55 65 81);">
                        Question PDF
                    </span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <x-filament::button
                        :href="$pdfUrl"
                        tag="a"
                        target="_blank"
                        color="gray"
                        size="xs"
                        icon="heroicon-o-arrow-top-right-on-square"
                    >
                        Open in New Tab
                    </x-filament::button>
                    
                    <x-filament::button
                        :href="$pdfUrl"
                        tag="a"
                        download
                        color="gray"
                        size="xs"
                        icon="heroicon-o-arrow-down-tray"
                    >
                        Download
                    </x-filament::button>
                </div>
            </div>
            
            <div class="pdf-background" style="position: relative; background-color: rgb(243 244 246); height: 600px;">
                <iframe
                    src="{{ $pdfUrl }}"
                    style="height: 100%; width: 100%; border: 0;"
                    title="PDF Viewer"
                    loading="lazy"
                ></iframe>
            </div>
            
            <div class="pdf-footer" style="border-top: 1px solid rgb(229 231 235); background-color: rgb(249 250 251); padding: 0.5rem 1rem; text-align: center;">
                <p class="pdf-footer-text" style="font-size: 0.75rem; line-height: 1rem; color: rgb(107 114 128);">
                    If the PDF doesn't display correctly, please use the "Open in New Tab" button above.
                </p>
            </div>
        </div>
    @else
        <div style="border-radius: 0.5rem; border: 1px solid rgb(229 231 235); background-color: rgb(249 250 251); padding: 2rem; text-align: center;">
            <x-filament::icon
                icon="heroicon-o-document"
                style="margin-left: auto; margin-right: auto; height: 3rem; width: 3rem; color: rgb(156 163 175);"
            />
            <p style="margin-top: 0.5rem; font-size: 0.875rem; line-height: 1.25rem; color: rgb(107 114 128);">
                No PDF file uploaded yet.
            </p>
        </div>
    @endif
</div>

@php
    use App\Filament\Resources\Questions\QuestionResource;
    
    $currentPdfUrl = $record?->pdf_url;
    $originalPdfUrl = $originalQuestion?->pdf_url;
    $editUrl = $originalQuestion ? QuestionResource::getUrl('edit', ['record' => $originalQuestion->id]) : null;
@endphp

<div>
    @if($currentPdfUrl)
        <div style="display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 1.5rem;">
            @media (min-width: 1024px)
                <style>
                    .pdf-comparison-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                </style>
            @endmedia

            <div class="pdf-comparison-grid" style="display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 1.5rem;">
                <!-- Current Question PDF -->
                <div style="position: relative; width: 100%; overflow: hidden; border-radius: 0.5rem; border: 2px solid; border-color: rgb(239 68 68); background-color: white; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);">
                    @darkmode
                        <style>
                            .current-pdf-container {
                                border-color: rgb(239 68 68);
                                background-color: rgb(31 41 55);
                            }
                            .current-pdf-header {
                                border-color: rgb(239 68 68);
                                background-color: rgb(127 29 29);
                            }
                            .pdf-header-text {
                                color: rgb(254 202 202);
                            }
                            .pdf-icon-text {
                                color: rgb(252 165 165);
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
                    
                    <div class="current-pdf-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid rgb(239 68 68); background-color: rgb(254 226 226); padding: 0.75rem 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <x-filament::icon
                                icon="heroicon-o-document-duplicate"
                                class="pdf-icon-text"
                                style="height: 1.25rem; width: 1.25rem; color: rgb(220 38 38);"
                            />
                            <span class="pdf-header-text" style="font-size: 0.875rem; line-height: 1.25rem; font-weight: 600; color: rgb(127 29 29);">
                                Current Question (Duplicate)
                            </span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <x-filament::button
                                :href="$currentPdfUrl"
                                tag="a"
                                target="_blank"
                                color="gray"
                                size="xs"
                                icon="heroicon-o-arrow-top-right-on-square"
                            >
                                Open
                            </x-filament::button>
                            
                            <x-filament::button
                                :href="$currentPdfUrl"
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
                            src="{{ $currentPdfUrl }}"
                            style="height: 100%; width: 100%; border: 0;"
                            title="Current Question PDF"
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>

                <!-- Original Question PDF -->
                @if($originalPdfUrl)
                    <div style="position: relative; width: 100%; overflow: hidden; border-radius: 0.5rem; border: 2px solid; border-color: rgb(34 197 94); background-color: white; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);">
                        @darkmode
                            <style>
                                .original-pdf-container {
                                    border-color: rgb(34 197 94);
                                    background-color: rgb(31 41 55);
                                }
                                .original-pdf-header {
                                    border-color: rgb(34 197 94);
                                    background-color: rgb(20 83 45);
                                }
                                .original-pdf-header-text {
                                    color: rgb(187 247 208);
                                }
                                .original-pdf-icon-text {
                                    color: rgb(134 239 172);
                                }
                            </style>
                        @enddarkmode
                        
                        <div class="original-pdf-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid rgb(34 197 94); background-color: rgb(220 252 231); padding: 0.75rem 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <x-filament::icon
                                    icon="heroicon-o-check-circle"
                                    class="original-pdf-icon-text"
                                    style="height: 1.25rem; width: 1.25rem; color: rgb(22 163 74);"
                                />
                                <span class="original-pdf-header-text" style="font-size: 0.875rem; line-height: 1.25rem; font-weight: 600; color: rgb(20 83 45);">
                                    Original Question (Published)
                                </span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <x-filament::button
                                    :href="$editUrl"
                                    tag="a"
                                    target="_blank"
                                    color="success"
                                    size="xs"
                                    icon="heroicon-o-pencil-square"
                                >
                                    Edit Original
                                </x-filament::button>
                                
                                <x-filament::button
                                    :href="$originalPdfUrl"
                                    tag="a"
                                    target="_blank"
                                    color="gray"
                                    size="xs"
                                    icon="heroicon-o-arrow-top-right-on-square"
                                >
                                    Open
                                </x-filament::button>
                                
                                <x-filament::button
                                    :href="$originalPdfUrl"
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
                                src="{{ $originalPdfUrl }}"
                                style="height: 100%; width: 100%; border: 0;"
                                title="Original Question PDF"
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                @else
                    <div style="position: relative; width: 100%; overflow: hidden; border-radius: 0.5rem; border: 2px solid; border-color: rgb(251 191 36); background-color: rgb(254 252 232); padding: 2rem; text-align: center;">
                        @darkmode
                            <style>
                                .no-original-container {
                                    border-color: rgb(251 191 36);
                                    background-color: rgb(68 64 60);
                                }
                                .no-original-text {
                                    color: rgb(253 224 71);
                                }
                            </style>
                        @enddarkmode
                        
                        <x-filament::icon
                            icon="heroicon-o-exclamation-triangle"
                            style="margin-left: auto; margin-right: auto; height: 3rem; width: 3rem; color: rgb(245 158 11);"
                        />
                        <p style="margin-top: 0.5rem; font-size: 0.875rem; line-height: 1.25rem; font-weight: 600; color: rgb(146 64 14);">
                            No Original Question Found
                        </p>
                        <p style="margin-top: 0.25rem; font-size: 0.75rem; line-height: 1rem; color: rgb(120 53 15);">
                            Could not find the original published question with matching criteria.
                        </p>
                    </div>
                @endif
            </div>

            <div class="pdf-footer" style="margin-top: 0.5rem; border-top: 1px solid rgb(229 231 235); background-color: rgb(249 250 251); padding: 0.5rem 1rem; text-align: center; border-radius: 0.5rem;">
                <p class="pdf-footer-text" style="font-size: 0.75rem; line-height: 1rem; color: rgb(107 114 128);">
                    @if($originalPdfUrl)
                        Compare the duplicate question (left) with the original question (right) to verify the duplicate status.
                    @else
                        Unable to locate the original question. The duplicate may have been deleted or the criteria may not match exactly.
                    @endif
                </p>
            </div>
        </div>
    @endif
</div>

<style>
    @media (min-width: 1024px) {
        .pdf-comparison-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
    }
</style>

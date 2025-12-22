import { useEffect } from 'react';

export default function AffiliateBanner() {
    useEffect(() => {
        // Push the ad to AdSense when component mounts
        try {
            (window. adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 shadow-lg">
            <script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4157128010679783"
                crossOrigin="anonymous"
            ></script>
            {/* banner horizontal */}
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-4157128010679783"
                data-ad-slot="9766668556"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
}

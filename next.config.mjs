import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "**",
            },
        ],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                process: false,
                crypto: false,
                stream: false,
                zlib: false,
                canvas: false,
            };
        }
        
        // Add aliases for PDF.js
        config.resolve.alias = {
            ...config.resolve.alias,
            'pdfjs-dist': 'pdfjs-dist/build/pdf.mjs',
        };
        
        return config;
    },
};

export default withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
    buildExcludes: [/middleware-manifest\.json$/],
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts",
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
        },
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-images",
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
        },
        {
            urlPattern: /^https:\/\/.*/,
            handler: "NetworkFirst",
            options: {
                cacheName: "https-calls",
                networkTimeoutSeconds: 15,
                expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 },
            },
        },
    ],
})(nextConfig);


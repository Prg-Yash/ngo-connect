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

export default nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
    output: 'standalone',
    images: {
        // Product images can come from any URL in the CSV import, so skip the optimizer
        unoptimized: true,
    },
}

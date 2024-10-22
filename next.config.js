/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ['images.unsplash.com'],
	},
	reactStrictMode: false,
	async redirects(){
		return [
			{
				source: '/home',
				destination: '/',
				permanent: true,
			},
			{
				source: '/indexx',
				destination: '/',
				permanent: true,
			},
		]
	}
}

module.exports = nextConfig

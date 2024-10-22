import Head from "next/head";

export default function Index() {
	return (
		<>
			<Head>
				<title>Alert</title>
			</Head>
			<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
				<h1 className="text-5xl text-white font-bold mb-8 animate-pulse">
					Application Permanently Closed
				</h1>
				<p className="text-white text-lg mb-8">
					This application has been fully migrated to NOVA.
				</p>
			</div>
		</>
	)
}

import {BarChart, Card, Title} from "@tremor/react";

export default function Chart2({data,}) {
	return (<Card className={``}>
		<Title>Diagram Per Customer</Title>
		<BarChart
			className={`mt-2`}
			data={data}
			index="customer"
			layout={'horizontal'}
			showXAxis={true}
			showTooltip={true}
			showLegend={true}
			showGridLines={true}
			showAnimation={true}
			categories={["Tersedia", "Keluar", "Maintenance"]}
			colors={["blue", "purple", "yellow"]}
			yAxisWidth={60}
			stack={false}
			relative={false}
			startEndOnly={false}
			showYAxis={true}
			// maxValue={250}
			autoMinValue={false}
		/>
	</Card>)
}
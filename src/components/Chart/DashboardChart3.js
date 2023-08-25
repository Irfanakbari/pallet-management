import {BarChart, Card, Title} from "@tremor/react";

export default function Chart3({data}) {
	return (<Card className={``}>
		<Title>Diagram Per Department</Title>
		<BarChart
			className="mt-2"
			data={data}
			index="department"
			layout={'vertical'}
			showXAxis={true}
			showTooltip={true}
			showLegend={true}
			showGridLines={false}
			showAnimation={true}
			categories={["Total", "Keluar", "Maintenance"]}
			colors={["green", "red", "amber"]}
			yAxisWidth={65}
			stack={false}
			relative={false}
			startEndOnly={false}
			showYAxis={true}
			// maxValue={250}
			autoMinValue={false}
		/>
	</Card>)
}
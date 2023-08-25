import {BarChart, Card, Title} from "@tremor/react";


export default function Chart1({data}) {
	return (<Card className={`md:col-span-2`}>
		<Title>Diagram Per Part</Title>
		<BarChart
			className="mt-2"
			data={data}
			index="part"
			showXAxis={false}
			showTooltip={true}
			showLegend={true}
			showGridLines={true}
			showAnimation={true}
			categories={["Total", "Keluar", "Maintenance"]}
			colors={["green", "red", "amber"]}
			yAxisWidth={30}
			stack={false}
			relative={false}
			startEndOnly={false}
			showYAxis={true}
			autoMinValue={false}
		/>
	</Card>)
}


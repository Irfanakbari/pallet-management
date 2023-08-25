import {BiCheck, BiExitFullscreen, BiFullscreen, BiLogOut, BiSolidMoon, BiSolidSun} from "react-icons/bi";
import React, {useEffect, useState} from "react";
import {showErrorToast} from "@/utils/toast";
import {Card, Metric, Text, Title} from "@tremor/react";
import Chart1 from "@/components/Chart/DashboardChart1";
import dayjs from "dayjs";
import Chart2 from "@/components/Chart/DashboardChart2";
import Image from "next/image";
import Chart3 from "@/components/Chart/DashboardChart3";
import DetailPalletSlow from "@/components/Modal/DetailPalletSlow";
import {modalState} from "@/context/states";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {FullScreen, useFullScreenHandle} from "react-full-screen";
import {GiAutoRepair, GiServerRack} from "react-icons/gi";
import {MdPallet} from "react-icons/md";
import {Alert, Progress, Typography} from "antd";

export default function Dashboard() {
	const [history, setHistory] = useState([])
	const {modal, setModal} = modalState()
	const [dark, setDark] = useState(true);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [cardInfo, setCardInfo] = useState({
		stok: '-',
		total: '-',
		keluar: '-',
		repair: '-',
		mendep: [],
		totalMendep: 0,
		memory: 0,
		cpuUsage: 0,
	})
	const [dataChart1, setDataChart1] = useState([])
	const [dataChart2, setDataChart2] = useState([])
	const [dataChart3, setDataChart3] = useState([])
	const handle = useFullScreenHandle();

	useEffect(() => {
		fetchData()
		const interval = setInterval(fetchData, 5000); // Panggil fetchData setiap 3 detik
		return () => {
			clearInterval(interval); // Hentikan interval saat komponen dibongkar
		};
	}, [])

	const fetchData = async () => {
		try {
			const response = await axiosInstance.get('/api/dashboard');
			setCardInfo({
				stok: response.data['data']['totalStokPallet'] ?? '-',
				total: response.data['data']['totalPallet'] ?? '-',
				keluar: response.data['data']['totalPalletKeluar'] ?? '-',
				repair: response.data['data']['totalPalletRepair'] ?? '-',
				totalMendep: response.data['data']['totalPaletMendep'] ?? 0,
				mendep: response.data['data']['paletMendep'] ?? [],
				memory: response.data['data']['load']['memoryUsage'] ?? 0,
				cpuUsage: response.data['data']['load']['cpuUsage'] ?? 0,
			})
			setHistory(response.data['data']['historyPallet'] ?? [])
			setDataChart1(response.data.data['stokPart'] ?? [])
			setDataChart2(response.data.data['chartStok'] ?? [])
			setDataChart3(response.data.data['stokDepartment'] ?? [])
		} catch (e) {
			showErrorToast("Gagal Fetch Data");
		}
	}

	return (
		<>
			<Head>
				<title>Dashboard | PT Vuteq Indonesia</title>
			</Head>
			{modal && <DetailPalletSlow selected={selectedCustomer}/>}
			<FullScreen handle={handle} className={`w-full p-2 flex-grow overflow-hidden ${
				handle.active ? dark ? 'dark' : 'bg-white' : 'bg-white'}`}>
				<div className={`py-1.5 px-2 text-white flex flex-row justify-between ${
					handle.active ? dark ? 'bg-tremor-background-emphasis' : 'bg-[#2589ce]' : 'bg-[#2589ce]'}`}>
					<div className={`flex flex-row justify-between w-full mr-1 items-center`}>
						<div className={`flex items-center gap-4`}>
							<Image src={'/logos.png'} alt={'Logo'} width={90} height={80}/>
							<h2 className={`font-bold text-[18px] hidden md:block`}>PT VUTEQ INDONESIA - Pallet Control
								System</h2>
						</div>
					</div>
					<div className={`flex gap-3`}>
						{
							dark ? <div
								onClick={() => setDark(false)}
								className={`flex items-center`}>
								<BiSolidSun size={20}/>
							</div> : <div
								onClick={() => setDark(true)}
								className={`flex items-center`}>
								<BiSolidMoon size={20}/>
							</div>
						}
						{handle.active ? <div
							onClick={handle.exit}
							className={`flex items-center`}>
							<BiExitFullscreen size={20}/>
						</div> : <div
							onClick={handle.enter}
							className={`flex items-center`}>
							<BiFullscreen size={20}/>
						</div>}
					</div>
				</div>
				<div className={`w-full p-5`} style={{
					maxHeight: handle.active ? '100vh' : '75vh',
					overflowY: 'scroll',
					paddingBottom: handle.active ? '8vh' : '0'
				}}>
					{
						cardInfo.mendep.length > 0 && (<Alert
							className={`mb-2 bg-red-500`}
							message={(
								<h3 className={`text-xl text-white font-semibold`}>{cardInfo.totalMendep + ' Pallet Belum Kembali ke Vuteq Lebih Dari Seminggu'}</h3>)}
							description={cardInfo.mendep.map(e => (
								<span
									key={e['Pallet.Customer.name']}
									onClick={() => {
										setSelectedCustomer(e['Pallet.Customer.name'])
										setModal(true)
									}}
									className={`cursor-pointer text-green-500 font-semibold hover:text-black`}>
                                        {`${e['Pallet.Customer.name']} = ${e.total} Pallet, `}
                                     </span>
							))}
							type="warning"
							showIcon
						/>)
					}
					<div
						className={`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 pt-2 grid gap-5 text-white mb-5`}>
						<Card className={`flex bg-blue-500`}>
							<div>
								<Text className={`text-xl text-white`}>Total Pallet</Text>
								<Metric className={`font-bold text-white`}>{cardInfo.total} Pallet</Metric>
							</div>
							<div className="ml-auto">
								<MdPallet size={80} color="blue"/>
							</div>
						</Card>
						<Card className={`flex bg-green-500`}>
							<div>
								<Text className={`text-xl text-white`}>Pallet Tersedia</Text>
								<Metric className={`font-bold text-white`}>{cardInfo.stok} Pallet</Metric>
							</div>
							<div className="ml-auto">
								<BiCheck size={80} color="green"/>
							</div>
						</Card>
						<Card className={`flex bg-red-500`}>
							<div>
								<Text className={`text-xl text-white`}>Pallet Keluar</Text>
								<Metric className={`font-bold text-white`}>{cardInfo.keluar} Pallet</Metric>
							</div>
							<div className="ml-auto">
								<BiLogOut size={80} color="red"/>
							</div>
						</Card>
						<Card className={`flex bg-orange-500`}>
							<div>
								<Text className={`text-xl text-white`}>Pallet Repair</Text>
								<Metric className={`font-bold text-white`}>{cardInfo.repair} Pallet</Metric>
							</div>
							<div className="ml-auto">
								<GiAutoRepair size={80} color="orange"/>
							</div>
						</Card>
						<Card className={`flex bg-purple-500`}>
							<div>
								<Text className={`text-xl text-white`}>Status Server</Text>
								<Metric className={`font-bold text-white `}>
									<div className={'gap-3 flex items-center'}>
										<Typography.Text className={'!text-white'}
										                 level={5}>CPU</Typography.Text>
										<Progress
											percent={cardInfo.cpuUsage ?? 0}
											steps={10}
											size={'small'}
											showInfo={false}
											trailColor={'gray'}
											strokeColor={'red'}
										/>
										<Typography.Text className={'!text-white'}
										                 level={5}>{cardInfo.cpuUsage ?? 0}%</Typography.Text>
									</div>
									<div className={'gap-3 flex items-center'}>
										<Typography.Text className={'!text-white'} level={5}>RAM</Typography.Text>
										<Progress
											percent={cardInfo.memory ?? 0}
											steps={10}
											className={'!text-white'}
											size={'small'}
											showInfo={false}
											trailColor={'gray'}
											strokeColor={'red'}
										/>
										<Typography.Text className={'!text-white'}
										                 level={5}>{cardInfo.memory ?? 0}%</Typography.Text>
									</div>
								</Metric>
							</div>
							<div className="ml-auto">
								<GiServerRack size={80} color="indigo"/>
							</div>
						</Card>
					</div>
					<div className={`grid-cols-1 md:grid-cols-2 pt-2 grid gap-5 mb-5`}>
						<Chart2 data={dataChart2}/>
						<Chart3 data={dataChart3}/>
						{/*<Card className={`overflow-y-scroll]`}>*/}
						{/*    <div className={`bg-red-800 text-white p-2 font-semibold`}>*/}
						{/*        Detail Stok*/}
						{/*    </div>*/}
						{/*   <div className={`flex`}>*/}
						{/*       <List className={`p-2`}>*/}
						{/*           {*/}
						{/*               dataChart1.map((item, index) => {*/}
						{/*                   if (index < 7) {*/}
						{/*                       return (*/}
						{/*                           <ListItem className={`text-sm`} key={item.customer}>*/}
						{/*                               <span>{item.customer}</span>*/}
						{/*                               <span>{item.Total} Pallet</span>*/}
						{/*                           </ListItem>*/}
						{/*                       )*/}
						{/*                   }*/}
						{/*               } )}*/}
						{/*       </List>*/}
						{/*   </div>*/}
						{/*</Card>*/}
						<Chart1 data={dataChart1}/>
					</div>
					<Card className={`w-full overflow-x-scroll mb-6`}>
						<Title>Riwayat In/Out Pallet</Title>
						<div>
							<table className="min-w-full divide-y divide-gray-200 mt-1 dark:text-white">
								<thead className={`dark:bg-gray-600`}>
								<tr>
									<th scope="col"
									    className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Kode Pallet
									</th>
									<th scope="col"
									    className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Part
									</th>
									<th scope="col"
									    className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Tujuan
									</th>
									<th scope="col"
									    className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Operator Out
									</th>
									<th scope="col"
									    className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Out
									</th>
									<th scope="col"
									    className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Operator In
									</th>
									<th scope="col"
									    className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										In
									</th>
								</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200 dark:bg-tremor-content-emphasis">
								{
									history.map((val, index) => (
										<tr key={index}>
											<td className="px-6 py-2 whitespace-nowrap">{val.id_pallet}</td>
											<td className="px-6 py-2 whitespace-nowrap">{val['Pallet']?.part}</td>
											<td className="px-6 py-2 whitespace-nowrap">{val['Pallet']?.customer}</td>
											<td className="px-6 py-2 whitespace-nowrap">{val.user_out}</td>
											<td className="px-6 py-2 whitespace-nowrap">{
												val['keluar'] ? dayjs(val['keluar']).locale('id').format('DD MMMM YYYY HH:mm') : '-'
											}</td>
											<td className="px-6 py-2 whitespace-nowrap">{val.user_in ?? '-'}</td>
											<td className="px-6 py-2 whitespace-nowrap">{
												val['masuk'] ? dayjs(val['masuk']).locale('id').format('DD MMMM YYYY HH:mm') : '-'
											}</td>
										</tr>
									))
								}
								</tbody>
							</table>
						</div>
					</Card>
				</div>
			</FullScreen>
		</>
	)
}
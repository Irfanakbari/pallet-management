import {BiExitFullscreen, BiFullscreen} from "react-icons/bi";
import React, {useEffect, useRef, useState} from "react";
import {showErrorToast} from "@/utils/toast";
import {Card, Metric, Text} from "@tremor/react";
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

export default function Dashboard() {
    const [history, setHistory] = useState([])
    const {modal, setModal} = modalState()
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [cardInfo, setCardInfo] = useState({
        stok: '-',
        total: '-',
        keluar:'-',
        repair: '-',
        mendep: [],
        totalMendep: 0
    })
    const [dataChart1, setDataChart1] = useState([])
    const [dataChart2, setDataChart2] = useState([])
    const [dataChart3, setDataChart3] = useState([])
    const handle = useFullScreenHandle();

    useEffect(()=>{
        fetchData()

        const interval = setInterval(fetchData, 5000); // Panggil fetchData setiap 3 detik

        return () => {
            clearInterval(interval); // Hentikan interval saat komponen dibongkar
        };
    },[])

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/api/dashboard');
            setCardInfo({
                stok: response.data['data']['totalStokPallet'] ?? '-',
                total: response.data['data']['totalPallet'] ?? '-',
                keluar: response.data['data']['totalPalletKeluar'] ?? '-',
                repair: response.data['data']['totalPalletRepair'] ?? '-',
                totalMendep: response.data['data']['totalPaletMendep'] ?? 0,
                mendep: response.data['data']['paletMendep'] ?? []
            })
            setHistory(response.data['data']['historyPallet'] ?? [])
            setDataChart1(response.data.data['stokPart'] ?? [])
            setDataChart2(response.data.data['chartStok'] ?? [])
            setDataChart3(response.data.data['stokDepartment'] ?? [])
        } catch (e) {
            showErrorToast("Gagal Fetch Data");
        }
    }

    return(
        <>
            <Head>
                <title>Dashboard | PT Vuteq Indonesia</title>
            </Head>
            {modal && <DetailPalletSlow selected={selectedCustomer} />}
            <FullScreen handle={handle} className="w-full bg-white p-2 flex-grow overflow-hidden">
                <div className={`bg-[#2589ce] py-1.5 px-2 text-white flex flex-row justify-between`}>
                    <div className={`flex flex-row justify-between w-full mr-1 items-center`}>
                        <div className={`flex items-center gap-4`}>
                            <Image src={'/logos.png'} alt={'Logo'} width={90} height={80} />
                            <h2 className={`font-bold text-[18px]`}>PT VUTEQ INDONESIA - Realtime Pallet Monitoring System</h2>
                        </div>
                        <h2 className={`font-bold text-[14px]`}>Dasboard Status Pallet</h2>
                    </div>
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
                <div className={`w-full p-5`} style={{ maxHeight: handle.active ? '100vh' : '77vh', overflowY: 'auto' }}>
                    {
                        (cardInfo.totalMendep !== 0) && <div role="alert" className={`mb-3`}>
                            <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2 text-2xl">
                                WARNING!!!
                            </div>
                            <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700 text-xl">
                                <p>{
                                    cardInfo.totalMendep
                                } Pallet Belum Kembali ke Vuteq Lebih Dari Seminggu</p>
                                <p className={`text-sm`}>
                                    {cardInfo.mendep.map(e => (
                                        <span
                                            key={e['Pallet.Customer.name']}
                                            onClick={() => {
                                                setSelectedCustomer(e['Pallet.Customer.name'])
                                                setModal(true)
                                            }}
                                            className={`cursor-pointer text-blue-500 hover:text-red-500`}>
                                        {`${e['Pallet.Customer.name']} = ${e.total} Pallet, `}
                                     </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    }
                    <div className={`grid-cols-4 pt-2 grid gap-5 text-white mb-5`}>
                        <Card className="bg-blue-500" >
                            <Text className={`text-xl text-white`}>Total Stok</Text>
                            <Metric className={`font-bold text-white`}>{cardInfo.total } Pallet</Metric>
                        </Card>
                        <Card className="bg-green-500" >
                            <Text className={`text-xl text-white`}>Stok Tersedia</Text>
                            <Metric className={`font-bold text-white`}>{cardInfo.stok } Pallet</Metric>
                        </Card>
                        <Card className="bg-red-500" >
                            <Text className={`text-xl text-white`}>Keluar</Text>
                            <Metric className={`font-bold text-white`}>{cardInfo.keluar } Pallet</Metric>
                        </Card>
                        <Card className="bg-orange-500">
                            <Text className={`text-xl text-white`}>Repair</Text>
                            <Metric className={`font-bold text-white`}>{cardInfo.repair } Pallet</Metric>
                        </Card>
                    </div>
                    <div className={`w-full grid grid-cols-2 gap-4`}>
                        <Chart2 data={dataChart2} />
                        <Chart3 data={dataChart3} />
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
                        <Chart1 data={dataChart1} />
                    </div>
                    <div className={`w-full`}>
                        <div className={`bg-red-800 text-white p-2 font-semibold`}>
                            Riwayat In/Out Pallet
                        </div>
                        <div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kode Pallet
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Part
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tujuan
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Operator Out
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Out
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Operator In
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        In
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {
                                    history.map((val, index) =>(
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">{val.id_pallet}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{val['Pallet'].part}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{val['Pallet'].customer}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{val.user_out}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{
                                                val['keluar'] ? dayjs(val['keluar']).locale('id').format('DD MMMM YYYY HH:mm') : '-'
                                            }</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{val.user_in ?? '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{
                                                val['masuk'] ? dayjs(val['masuk']).locale('id').format('DD MMMM YYYY HH:mm') : '-'
                                            }</td>
                                        </tr>
                                    ))
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </FullScreen>
        </>
    )
}
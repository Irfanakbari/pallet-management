import {BiPrinter, BiRefresh, BiSolidUpArrow} from "react-icons/bi";
import {ImCross} from "react-icons/im";
import {AiFillFileExcel} from "react-icons/ai";
import React, {useCallback, useEffect, useRef, useState} from "react";
import { useExcelJS } from "react-use-exceljs"
import PaginationSelect from "@/components/PaginationSelect";
import {showErrorToast} from "@/utils/toast";
import {dataState} from "@/context/states";
import dayjs from "dayjs";
import {useReactToPrint} from "react-to-print";
import {FaRegWindowMaximize} from "react-icons/fa";
import Image from "next/image";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Spin, Table} from "antd";


export default function LapMaintenance() {
    const [dataMaintenance, setDataMaintenance] = useState([])
    const {listCustomer, listVehicle,listPart} = dataState()
    const [loading, setLoading] = useState(true)
    const selectKodeCust = useRef(null);
    const selectKodeProj = useRef(null);


    useEffect(() => {
        fetchData();
    }, [])

    // Fungsi get data dari API
    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get('/api/repairs?page=1&limit=50');
            setDataMaintenance(response.data);
        } catch (error) {
            showErrorToast("Gagal Fetch Data");
        } finally {
            setLoading(false)
        }
    };

    const excel = useExcelJS({
        filename: "lap_maintenance.xlsx",
        worksheets: [
            {
                name: "Data Maintenance",
                columns: [
                    {
                        header: "No",
                        key: "no",
                        width: 10,
                    },
                    {
                        header: "Id Pallet",
                        key: "id",
                        width: 32,
                    },
                    {
                        header: "Customer",
                        key: "customer",
                        width: 10,
                    },
                    {
                        header: "Vehicle",
                        key: "vehicle",
                        width: 32,
                    },
                    {
                        header: "Part",
                        key: "part",
                        width: 32,
                    },
                ],
            },
        ],
    })

    // Fungsi untuk melakukan save/export data ke excel
    const saveExcel = async (e) => {
        e.preventDefault();
        const data = dataMaintenance.data.map((item, index) => ({
            no: index + 1,
            id: item.kode,
            customer: item.customer + ' - '+  item['Customer']['name'],
            vehicle: item.vehicle + ' - '+  item['Vehicle']['name'],
            part: item.part + ' - '+  item['Part']['name'],
        }));
        await excel.download(data)
    }

    const onChange = (pagination, filters, sorter, extra) => {
        setLoading(true)
        const searchParam = (filters?.kode && filters?.kode[0]) || '';
        const customerParam = (filters?.customer && filters?.customer[0]) || '';
        const vehicleParam = (filters?.vehicle && filters?.vehicle[0]) || '';
        const partParam = (filters?.part && filters?.part[0]) || '';
        const url = `/api/repairs?search=${searchParam}&customer=${customerParam || ''}&vehicle=${vehicleParam || ''}&part=${partParam || ''}&page=${pagination.current}&limit=${pagination.pageSize}`;
        axiosInstance.get(url)
            .then(response => {
                setDataMaintenance(response.data);
            })
            .catch(() => {
                showErrorToast("Gagal Fetch Data");
            })
            .finally(() => {
                setLoading(false);
            });

    };

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            width: '5%',
            render: (_, __, index) => index + 1
        },
        {
            title: 'Kode Pallet',
            dataIndex: 'kode',
            sorter: (a, b) => a.kode.localeCompare(b.kode),
            width: '30%'
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            sorter: (a, b) => a.customer.localeCompare(b.customer),
            filters: listCustomer.map(e=>(
                {
                    text: e.name,
                    value: e.kode
                }
            )),
            filterMultiple: false,
            onFilter: (value, record) => record.customer.indexOf(value) === 0,
            render: (_, record) => record.customer + " - " + record['Customer'].name
        },
        {
            title: 'Vehicle',
            dataIndex: 'vehicle',
            sorter: (a, b) => a.vehicle.localeCompare(b.vehicle),
            filterMultiple: false,
            filters: listVehicle.map(e=>(
                {
                    text: e.name,
                    value: e.kode
                }
            )),
            onFilter: (value, record) => record.vehicle.indexOf(value) === 0,
            render: (_, record) => record.vehicle + " - " + record['Vehicle'].name
        },
        {
            title: 'Part',
            dataIndex: 'part',
            sorter: (a, b) => a.part.localeCompare(b.part),
            filterMultiple: false,
            filters: listPart.map(e=>(
                {
                    text: e.name,
                    value: e.kode
                }
            )),
            onFilter: (value, record) => record.part.indexOf(value) === 0,
            render: (_, record) => record.part + " - " + record['Part'].name
        },
    ];


    return(
        <>
            <Head>
                <title>Laporan Maintenance | PT Vuteq Indonesia</title>
            </Head>
            <div className={`bg-white h-full flex flex-col`}>
                <div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
                    <PrintAll data={dataMaintenance} />
                    <div
                        onClick={saveExcel}
                        className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                        <AiFillFileExcel size={12} />
                        <p className={`text-white font-bold text-sm`}>Excel</p>
                    </div>
                    <div
                        onClick={()=> fetchData()}
                        className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                        <BiRefresh size={12} />
                        <p className={`text-white font-bold text-sm`}>Refresh</p>
                    </div>
                </div>
                <div className="w-full bg-white p-2 flex-grow overflow-hidden">
                    <Table
                        loading={
                            loading && <Spin tip="Loading..." delay={1000}/>
                        }
                        bordered
                        scroll={{
                            y: "68vh"
                        }}
                        style={{
                            width: "100%"
                        }}
                        rowKey={'kode'}
                        columns={columns}
                        dataSource={dataMaintenance.data}
                        onChange={onChange}
                        size={'small'}
                        pagination={{
                            total:dataMaintenance.totalData,
                            defaultPageSize: 50,
                            pageSizeOptions: [30, 50, 100],
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                        }} />
                </div>
            </div>
        </>
    )
}

function PrintAll({ data }) {
    const componentRef = useRef(null);
    const [modal, setModal] = useState(false)
    const currentDate = dayjs(); // Ambil tanggal dan waktu saat ini
    const formattedDate = currentDate.format('DD MMMM YYYY HH:mm [WIB]');


    const reactToPrintContent = useCallback(() => {
        return componentRef.current;
    }, [componentRef.current]);

    const handlePrint = useReactToPrint({
        content: reactToPrintContent,
        documentTitle: "AwesomeFileName",
        onAfterPrint: ()=>setModal(false),
        removeAfterPrint: true,
    });

    return (
        <>
            {
                modal && <div className="fixed bg-black h-full bg-opacity-20 flex items-center justify-center top-0 left-0 z-[5000] w-full overflow-x-hidden outline-none">
                    <div className="h-2/3 flex flex-col rounded bg-white border-4 border-base">
                        <div className="w-full flex items-center justify-between bg-base font-light py-1 px-2 text-white text-sm">
                            <div className="flex items-center gap-2">
                                <FaRegWindowMaximize />
                                Print Preview
                            </div>
                            <div onClick={() => setModal(false)} className="hover:bg-red-800 p-1">
                                <ImCross size={10} />
                            </div>
                        </div>
                        <div className="p-2 flex flex-col gap-5 h-full w-full">
                            <div ref={componentRef} className={`text-black text-sm overflow-y-auto `} >
                                <div className="w-full flex flex-col">
                                    <div className={`flex gap-4 items-center print-header`}>
                                        <Image src={'/logos.png'} alt={'Logo'} width={120} height={120} />
                                        <div className={`flex flex-col`}>
                                            <h2 className={`font-bold text-xl `}>Laporan Pallet Maintenance</h2>
                                            <h3>Tanggal : {formattedDate}</h3>
                                        </div>
                                    </div>
                                    <table className="print-table w-full">
                                        <thead>
                                        <tr>
                                            <th className="text-center p-2 bg-gray-100 w-10">#</th>
                                            <th className="p-2 bg-gray-100">ID Pallet</th>
                                            <th className="p-2 bg-gray-100">Department</th>
                                            <th className="p-2 bg-gray-100">Customer</th>
                                            <th className="p-2 bg-gray-100">Vehicle</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data['data'].map((e, index) => (
                                            <>
                                                <tr className={`font-semibold border-b border-gray-500`} key={index}>
                                                    <td className="text-center p-1.5">{index + 1}</td>
                                                    <td className="px-4">{e['kode']}</td>
                                                    <td className="px-4">Produksi {e['Vehicle']['department']}</td>
                                                    <td className="px-4">{e['customer']} - {e['Customer']['name']}</td>
                                                    <td className="px-4">{e['vehicle']} - {e['Vehicle']['name']}</td>
                                                </tr>
                                            </>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm mb-6">
                                <div className="flex flex-row justify-center gap-2 text-black">
                                    <button onClick={() => {
                                        handlePrint()
                                    }} className="border w-full border-gray-500 py-1 text-sm rounded">
                                        Print
                                    </button>
                                    <button onClick={() => {
                                        setModal(false)
                                    }} className="border w-full border-gray-500 py-1 text-sm rounded">
                                        Batal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            <div>
                <div onClick={()=>setModal(true)} className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                    <BiPrinter size={12} />
                    <p className={`text-white font-bold text-sm`}>Cetak Laporan</p>
                </div>
            </div>
        </>
    )
}
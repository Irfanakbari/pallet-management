import {BiPrinter, BiRefresh, BiSolidUpArrow} from "react-icons/bi";
import {ImCross} from "react-icons/im";
import {AiFillFileExcel} from "react-icons/ai";
import {useCallback, useEffect, useRef, useState} from "react";
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


export default function LapMaintenance() {
    const [dataMaintenance, setDataMaintenance] = useState([])
    const {listCustomer, listVehicle} = dataState()
    const [selectedCell, setSelectedCell] = useState(null)
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState([])
    const selectKodeCust = useRef(null);
    const selectKodeProj = useRef(null);


    useEffect(() => {
        fetchData();
    }, [])

    // Fungsi get data dari API
    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/api/repairs?page=1');
            setDataMaintenance(response.data);
            setFilters(response.data['data'])
        } catch (error) {
            showErrorToast("Gagal Fetch Data");
        }
    };

    // Fungsi menghandle search data
    const handleSearch = () => {
        const searchResult = searchValue(searchTerm);
        setFilters(searchResult);
    };

    // Fungsi Untuk melakukan search data
    function searchValue(value) {
        if (value.trim() === '') {
            return dataMaintenance.data;
        }
        const searchValueLowerCase = value.toLowerCase();
        return dataMaintenance.data.filter((item) => {
            for (let key in item) {
                if (typeof item[key] === 'string' && item[key].toLowerCase().includes(searchValueLowerCase)) {
                    return true;
                }
            }
            return false;
        });
    }

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
                    {
                        header: "Status",
                        key: "status",
                        width: 32,
                    },
                ],
            },
        ],
    })

    // Fungsi untuk menghandle perubahan halaman
    const handlePageChange = async (selectedPage) => {
        // Lakukan perubahan halaman di sini
        const response3 = await axiosInstance.get(`/api/repairs?page=` + selectedPage);
        setDataMaintenance(response3.data);
        setFilters(response3.data['data'])
    };

    // Fungsi untuk melakukan save/export data ke excel
    const saveExcel = async (e) => {
        e.preventDefault();
        const data = filters.map((item, index) => ({
            no: index + 1,
            id: item.kode,
            customer: item.customer,
            vehicle: item.vehicle,
            part: item.part,
            status: "Maintenance"
        }));
        await excel.download(data)
    }

    // Fungsi untuk melakukan filter pencarian
    const getFilteredData = async (e) => {
        e.preventDefault()
        try {
            const response = await axiosInstance.get(`/api/filters?customer=${selectKodeCust.current.value}&vehicle=${selectKodeProj.current.value}&page=1`);
            setDataMaintenance(response.data);
            setFilters(response.data['data']);
        } catch (error) {
            showErrorToast("Gagal Fetch Data");
        }
    };


    return(
        <>
            <Head>
                <title>Laporan Maintenance | PT Vuteq Indonesia</title>
            </Head>
            <div className={`h-full bg-white`}>
                <div className={`bg-[#2589ce] py-1.5 px-2 text-white flex flex-row justify-between`}>
                    <h2 className={`font-bold text-[14px]`}>Filter</h2>
                    <div className={`flex items-center`}>
                        <BiSolidUpArrow  size={10}/>
                    </div>
                </div>
                <div className={`w-full gap-8 flex items-center bg-white px-3 py-2`}>
                    <div className={`flex flex-row items-center`}>
                        <label className={`text-sm font-semibold mr-3`}>Cari : </label>
                        <input
                            type="text"
                            className="h-6 border-gray-500 mr-3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <ImCross
                            className="hover:cursor-pointer text-blue-700 mr-4"
                            onClick={() => setSearchTerm('')}
                        />
                        <button
                            className="bg-green-500 py-1 px-2 text-white font-semibold text-sm"
                            onClick={handleSearch}
                        >
                            Dapatkan Data
                        </button>
                    </div>
                    <div className={`flex flex-row items-center`}>
                        <label className={`text-sm font-semibold mr-3`}>Customer : </label>
                        <select
                            ref={selectKodeCust}
                            className="border border-gray-300 rounded p-1 text-sm"
                        >
                            <option className={`text-sm`} value={''}>
                                Semua
                            </option>
                            {
                                listCustomer.map((e,index) =>(
                                    <option className={`text-sm`} key={index} value={e['kode']}>
                                        {
                                            `${e['kode']} - ${e['name']}`
                                        }
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className={`flex flex-row items-center`}>
                        <label className={`text-sm font-semibold mr-3`}>Project/Line : </label>
                        <select
                            ref={selectKodeProj}
                            className="border border-gray-300 rounded p-1 text-sm"
                        >
                            <option className={`text-sm`} value={''}>
                                Semua
                            </option>
                            {
                                listVehicle.map((e,index) =>(
                                    <option className={`text-sm`} key={index} value={e['kode']}>
                                        {
                                            `${e['kode']} - ${e['name']}`
                                        }
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <button
                        className="ml-3 bg-green-500 py-1 px-2 text-white font-semibold text-sm"
                        onClick={getFilteredData}
                    >
                        Dapatkan Data
                    </button>
                </div>
                <div className={`w-full bg-white h-4 border border-gray-500`} />
                <div className={`w-full bg-white p-2`}>
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
                    <table className="w-full">
                        <thead>
                        <tr>
                            <th className="p-2 bg-gray-100 text-left w-10">#</th>
                            <th className="p-2 bg-gray-100 text-left">Kode Pallet</th>
                            <th className="p-2 bg-gray-100 text-left">Customer</th>
                            <th className="p-2 bg-gray-100 text-left">Vehicle</th>
                            <th className="p-2 bg-gray-100 text-left">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            filters.map((e, index) =>(
                                <>
                                    <tr className={`${selectedCell === index ? 'bg-[#85d3ff]': ''} text-sm font-semibold border-b border-gray-500`} key={index} onClick={()=>setSelectedCell(index)}>
                                        <td className="text-center p-1.5">{index+1}</td>
                                        <td className="px-4">{e['kode']}</td>
                                        <td className="px-4">{e['customer']}</td>
                                        <td className="px-4">{e['vehicle']}</td>
                                        <td className="px-4">Maintenance</td>
                                    </tr>
                                </>
                            ))
                        }
                        </tbody>
                    </table>
                    <br/>
                    <PaginationSelect
                        totalPages={dataMaintenance['totalPages']}
                        currentPage={dataMaintenance['currentPage']}
                        onPageChange={handlePageChange}
                    />
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
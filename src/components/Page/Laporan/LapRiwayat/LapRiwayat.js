import {BiFilter, BiPrinter, BiRefresh, BiSolidUpArrow} from "react-icons/bi";
import { ImCross } from "react-icons/im";
import { AiFillFileExcel } from "react-icons/ai";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import ExcelJS from "exceljs"
import PaginationSelect from "@/components/PaginationSelect";
import {showErrorToast} from "@/utils/toast";
import FilterModal from "@/components/Page/Laporan/LapRiwayat/FilterModal";
import {filterState, modalState} from "@/context/states";
import Head from "next/head";

export default function LapRiwayat() {
    const [dataHistory, setDataHistory] = useState([]);
    const {modalFilter,setModalFilter} = modalState()
    const {
        custFilterValue,
        vehicleFilterValue,
        partFilterValue,
        statusFilterValue,
        startDateValue,
        endDateValue,
    } = filterState();
    const [selectedCell, setSelectedCell] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const getFilteredData = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.get(`/api/history?customer=${custFilterValue}&vehicle=${vehicleFilterValue}&part=${partFilterValue}&status=${statusFilterValue}&start=${startDateValue}&end=${endDateValue}&page=1`);
            setDataHistory(response.data);
            setFilters(response.data['data']);
        } catch (error) {
            showErrorToast("Gagal Fetch Data");
        } finally {
            setModalFilter(false)
        }
    };

    const fetchData =  () => {
        axios.get(`/api/history?page=1`).then(response=>{
            setDataHistory(response.data);
            setFilters(response.data['data']);
        }).catch(()=>{
            showErrorToast("Gagal Fetch Data");
        })
    };

    const handlePageChange = async (selectedPage) => {
        // Lakukan perubahan halaman di sini
        const response3 = await axios.get(`/api/history?customer=${custFilterValue}&vehicle=${vehicleFilterValue}&part=${partFilterValue}&status=${statusFilterValue}&start=${startDateValue}&end=${endDateValue}&page=` + selectedPage);
        setDataHistory(response3.data);
        setFilters(response3.data['data'])
    };

    const handleSearch = async () => {
        const searchValueLowerCase = searchTerm.toLowerCase().split(' ').join('');
        const response = await axios.get(`/api/history?search=${searchValueLowerCase}`);
        setDataHistory(response.data);
        setFilters(response.data['data']);
    };

    const isMoreThanAWeekAgoAndNoEntry = (keluar, masuk) => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        // Parse tanggal 'keluar' menjadi objek Date
        const keluarDate = new Date(keluar);
        // Memeriksa apakah 'keluarDate' lebih dari seminggu lalu
        const isMoreThanAWeekAgo = keluarDate < oneWeekAgo;
        // Memeriksa apakah 'masuk' kosong atau bernilai null
        const isEntryEmpty = !masuk || false;
        return isMoreThanAWeekAgo && isEntryEmpty;
    };

    const saveExcel = async (e) => {
        e.preventDefault();
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("My Sheet", {
            headerFooter:{firstHeader: "Hello Exceljs", firstFooter: "Hello World"},
            pageSetup:{paperSize: 9, orientation:'landscape'}
        });
        sheet.getCell('A1:I1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor : {argb: '0366fc'}
        }
        sheet.getCell('B1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor : {argb: '0366fc'}
        }
        sheet.getCell('C1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor : {argb: '0366fc'}
        }
        sheet.getCell('D1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor : {argb: '0366fc'}
        }
        sheet.getCell('E1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor : {argb: '0366fc'}
        }
        sheet.getCell('F1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor : {argb: '0366fc'}
        }
        sheet.getCell('G1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor : {argb: '0366fc'}
        }
        sheet.getCell('H1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor : {argb: '0366fc'}
        }
        sheet.getCell('I1').fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor : {argb: '0366fc'}
        }
        sheet.getRow(1).font = {
            size: 12,
            bold: true,
            color: {argb: 'FFFFFF'}
        }
        sheet.columns = [
            {
                header: "No",
                key: "no",
                width: 4,
            },
            {
                header: "Kode Pallet",
                key: "id",
                width: 25,
            },
            {
                header: "Customer",
                key: "customer",
                width: 20,
            },
            {
                header: "Vehicle",
                key: "vehicle",
                width: 24,
            },
            {
                header: "Part",
                key: "part",
                width: 32,
            },
            {
                header: "Keluar",
                key: "keluar",
                width: 27,
            },
            {
                header: "Operator Out",
                key: "user_out",
                width: 13,
            },
            {
                header: "Masuk",
                key: "masuk",
                width: 27,
            },
            {
                header: "Operator In",
                key: "user_in",
                width: 13,
            },
        ];
        filters.map((item, index) => {
            sheet.addRow({
                no: index + 1,
                id: item.id_pallet,
                customer: `${item['Pallet']['Customer'].kode} - ${item['Pallet']['Customer'].name}`,
                vehicle: `${item['Pallet']['Vehicle'].kode} - ${item['Pallet']['Vehicle'].name}`,
                part: `${item['Pallet']['Part'].kode} - ${item['Pallet']['Part'].name}`,
                keluar: item['keluar'] ? dayjs(item['keluar']).locale('id').format('DD MMMM YYYY HH:mm') : '-',
                user_out: item['user_out'],
                masuk: item['masuk'] ? dayjs(item['masuk']).locale('id').format('DD MMMM YYYY HH:mm') : '-',
                user_in: item['user_in'],
            });
        });
        await workbook.xlsx.writeBuffer().then(data=>{
            const blob = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet'})
            const url = window.URL.createObjectURL(blob)
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'Lap. Riwayat.xlsx';
            anchor.click();
            window.URL.revokeObjectURL(anchor);
        })
    };


    return (
        <>
            <Head>
                <title>Laporan Riwayat | PT Vuteq Indonesia</title>
            </Head>
            <div className="h-full bg-white">
                <div className="bg-[#2589ce] py-1.5 px-2 text-white flex flex-row justify-between">
                    <h2 className="font-bold text-[14px]">Filter</h2>
                    <div className="flex items-center">
                        <BiSolidUpArrow size={10} />
                    </div>
                </div>
                <div className="w-full gap-8 flex items-center bg-white px-3 py-2">
                    <div className="flex flex-row items-center">
                        <label className="text-sm font-semibold mr-3">Cari :</label>
                        <input
                            type="text"
                            className="border border-gray-300 rounded mr-3"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <ImCross
                            className="hover:cursor-pointer text-blue-700 mr-4"
                            onClick={getFilteredData}
                        />
                        <button
                            className="bg-green-500 py-1 px-2 text-white font-semibold text-sm"
                            onClick={handleSearch}
                        >
                            Dapatkan Data
                        </button>
                    </div>
                    {modalFilter&&
                        <FilterModal onSubmit={getFilteredData}/>
                    }
                </div>
                <div className="w-full bg-white h-4 border border-gray-500" />
                <div className="w-full bg-white p-2">
                    <div className="w-full bg-base py-0.5 px-1 text-white flex flex-row">
                        <div className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
                            <BiPrinter size={12} />
                            <p className="text-white font-bold text-sm">Cetak</p>
                        </div>
                        <div onClick={saveExcel} className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
                            <AiFillFileExcel size={12} />
                            <p className="text-white font-bold text-sm">Excel</p>
                        </div>
                        <div onClick={fetchData} className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
                            <BiRefresh size={12} />
                            <p className="text-white font-bold text-sm">Refresh</p>
                        </div>
                        <div onClick={()=>setModalFilter(true)} className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
                            <BiFilter size={12} />
                            <p className="text-white font-bold text-sm">Filter</p>
                        </div>
                    </div>
                    <table className="w-full">
                        <thead>
                        <tr>
                            <th className="py-2 bg-gray-100 text-left w-10">#</th>
                            <th className="py-2 bg-gray-100 text-left">Kode Pallet</th>
                            <th className="py-2 bg-gray-100 text-left">Customer</th>
                            <th className="py-2 bg-gray-100 text-left">Vehicle</th>
                            <th className="py-2 bg-gray-100 text-left">Part</th>
                            <th className="py-2 bg-gray-100 text-left">Keluar</th>
                            <th className="py-2 bg-gray-100 text-left">Operator Out</th>
                            <th className="py-2 bg-gray-100 text-left">Masuk</th>
                            <th className="py-2 bg-gray-100 text-left">Operator In</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            filters.map((e, index) => (
                                <tr
                                    className={`${selectedCell === index ? 'bg-[#85d3ff]' : ''} ${isMoreThanAWeekAgoAndNoEntry(e['keluar'], e['masuk']) ? 'bg-red-500 text-white' : ''} text-sm font-semibold border-b border-gray-500`}
                                    key={index}
                                    onClick={() => setSelectedCell(index)}
                                >
                                    <td className="text-center p-1.5">{index + 1}</td>
                                    <td>{e['id_pallet']}</td>
                                    <td>{e['Pallet']['Customer']['kode'] + ' - ' + e['Pallet']['Customer']['name']}</td>
                                    <td>{e['Pallet']['Vehicle']['kode'] + ' - ' + e['Pallet']['Vehicle']['name']}</td>
                                    <td>{e['Pallet']['Part']['kode'] + ' - ' + e['Pallet']['Part']['name']}</td>
                                    <td>{e['keluar'] ? dayjs(e['keluar']).locale('id').format('DD MMMM YYYY HH:mm') : '-'}</td>
                                    <td>{e['user_out'] ?? '-'}</td>
                                    <td>{e['masuk'] ? dayjs(e['masuk']).locale('id').format('DD MMMM YYYY HH:mm') : '-'}</td>
                                    <td className="px-4">{e['user_in'] ?? '-'}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                    <br/>
                    <PaginationSelect
                        totalPages={dataHistory['totalPages']}
                        currentPage={dataHistory['currentPage']}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    );
}

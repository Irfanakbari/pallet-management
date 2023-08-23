import {BiPrinter, BiRefresh, BiSolidUpArrow} from "react-icons/bi";
import {ImCross} from "react-icons/im";
import {AiFillFileExcel} from "react-icons/ai";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {dataState} from "@/context/states";
import ExcelJS from "exceljs";
import dayjs from "dayjs";
import {useReactToPrint} from "react-to-print";
import {FaRegWindowMaximize} from "react-icons/fa";
import Image from "next/image";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Form, Popconfirm, Spin, Table} from "antd";

export default function LapStok() {
    const [dataStok, setDataStok] = useState([])
    const {listDepartment, listCustomer} = dataState()
    const [loading, setLoading] = useState(true)
    const custFilter = useRef(null);
    const deptFilter = useRef(null);

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get('/api/stok');
            setDataStok(response.data['data']);
        } catch (error) {
            showErrorToast("Gagal Fetch Data");
        } finally {
            setLoading(false)
        }
    };

    // const getFilter = () => {
    //     axiosInstance.get(`/api/stok?customer=${custFilter.current.value??''}&department=${deptFilter.current.value??''}`).then(response=>{
    //         setDataStok(response.data['data']);
    //     }).catch(()=>{
    //         showErrorToast("Gagal Fetch Data");
    //     })
    // };

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
                header: "Part Name",
                key: "name",
                width: 45,
            },
            {
                header: "Total Stok",
                key: "stok",
                width: 20,
            },
            {
                header: "Total Keluar",
                key: "keluar",
                width: 20,
            },
            {
                header: "Total Maintenance",
                key: "maintenance",
                width: 20,
            },
        ];
        dataStok.map((item, index) => {
            sheet.addRow({
                no: index + 1,
                name: item.part,
                stok: item.Total,
                keluar: item.Keluar,
                maintenance: item.Maintenance
            });
            // row.fill = rowFill
        });
        await workbook.xlsx.writeBuffer().then(data=>{
            const blob = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet'})
            const url = window.URL.createObjectURL(blob)
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'Lap. Stok.xlsx';
            anchor.click();
            window.URL.revokeObjectURL(anchor);
        })
    };

    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            width: '5%',
            render: (_, __, index) => index + 1
        },
        {
            title: 'Nama Part',
            dataIndex: 'part',
            sorter: (a, b) => a.part.localeCompare(b.part),
            width: '30%'
        },
        {
            title: 'Total Stok',
            dataIndex: 'Total',
            sorter: (a, b) => a.Total - b.Total,
        },
        {
            title: 'Total Keluar',
            dataIndex: 'Keluar',
            sorter: (a, b) => a.Keluar - b.Keluar,
        },
        {
            title: 'Total Maintenance',
            dataIndex: 'Maintenance',
            sorter: (a, b) => a.Maintenance - b.Maintenance,
        },
    ];

    return(
        <>
            <Head>
                <title>Laporan Stok | PT Vuteq Indonesia</title>
            </Head>
            <div className={`bg-white h-full flex flex-col`}>
                <div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
                    <PrintAll data={dataStok} />
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
                            rowKey={'index'}
                            columns={columns}
                            dataSource={dataStok}
                            onChange={onChange}
                            size={'small'}
                            pagination={false} />
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
        documentTitle: "Laporan Stok Pallet",
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
                                            <h2 className={`font-bold text-xl `}>Laporan Stok Pallet Per Part</h2>
                                            <h3>Tanggal : {formattedDate}</h3>
                                        </div>
                                    </div>
                                    <table className="print-table w-full">
                                        <thead>
                                        <tr>
                                            <th className="text-centerbg-gray-100 w-10">#</th>
                                            <th className="py-2 bg-gray-100">Part</th>
                                            <th className="py-2 bg-gray-100">Total Keluar</th>
                                            <th className="py-2 bg-gray-100">Total Maintenance</th>
                                            <th className="py-2 bg-gray-100">Total Stok</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {data.map((e, index) => (
                                            <>
                                                <tr className={`font-semibold border-b border-gray-500`} key={index}>
                                                    <td className="text-center py-1">{index + 1}</td>
                                                    <td className="px-4">{e['part']}</td>
                                                    <td className="px-4">{e['Keluar']}</td>
                                                    <td className="px-4">{e['Maintenance']}</td>
                                                    <td className="px-4">{e['Total']}</td>
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
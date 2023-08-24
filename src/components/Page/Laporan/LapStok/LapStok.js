import {BiRefresh} from "react-icons/bi";
import {AiFillFileExcel} from "react-icons/ai";
import React, {useEffect, useRef, useState} from "react";
import {showErrorToast} from "@/utils/toast";
import ExcelJS from "exceljs";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Spin, Table} from "antd";
import PrintAll from "@/components/Page/Laporan/LapStok/Print";

export default function LapStok() {
    const [dataStok, setDataStok] = useState([])
    const [loading, setLoading] = useState(true)
    useRef(null);
    useRef(null);
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
            title: 'Total Pallet',
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
                            rowKey={'part'}
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


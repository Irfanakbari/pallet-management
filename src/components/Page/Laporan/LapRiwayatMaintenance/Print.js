import dayjs from "dayjs";
import {useReactToPrint} from "react-to-print";
import {FaRegWindowMaximize} from "react-icons/fa";
import {ImCross} from "react-icons/im";
import Image from "next/image";
import {Table} from "antd";
import {BiPrinter} from "react-icons/bi";
import {useCallback, useRef, useState} from "react";

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
        onAfterPrint: ()=>{

            setModal(false)
        },
        removeAfterPrint: true,
    });

    return (
        <>
            {
                modal && <div className="fixed bg-black h-full bg-opacity-20 flex items-center justify-center top-0 left-0 z-[5000] w-full overflow-x-hidden outline-none">
                    <div className="h-2/3 w-2/3 flex flex-col rounded bg-white border-4 border-base">
                        <div className="w-full flex items-center justify-between bg-base font-light py-1 px-2 text-white text-sm">
                            <div className="flex items-center gap-2">
                                <FaRegWindowMaximize />
                                Print Preview
                            </div>
                            <div onClick={() => setModal(false)} className="hover:bg-red-800 p-1">
                                <ImCross size={10} />
                            </div>
                        </div>
                        <div className="p-2 flex flex-col gap-5 h-full w-full overflow-y-scroll ">
                            <div className="border bottom-0 border-gray-300 w-full p-3 flex flex-col gap-3 text-sm mb-2">
                                <div className="flex flex-row justify-center gap-2 text-white">
                                    <button onClick={() => {
                                        handlePrint()
                                    }} className="w-full py-1 text-sm rounded bg-blue-600">
                                        Print
                                    </button>
                                    <button onClick={() => {
                                        setModal(false)
                                    }} className="w-full py-1 text-sm rounded bg-red-600">
                                        Batal
                                    </button>
                                </div>
                            </div>
                            <div className={`border bottom-0 border-gray-300 w-full p-3 gap-3 text-sm mb-2 flex-grow`}>
                                <div ref={componentRef} className={`text-black text-sm flex-grow`} >
                                    <div className="w-full flex flex-col">
                                        <div className={`flex gap-4 items-center print-header`}>
                                            <Image src={'/logos.png'} alt={'Logo'} width={120} height={120} />
                                            <div className={`flex flex-col`}>
                                                <h2 className={`font-bold text-xl `}>Laporan Riwayat Pallet</h2>
                                                <h3>Tanggal : {formattedDate}</h3>
                                            </div>
                                        </div>
                                        <Table
                                            bordered
                                            style={{
                                                width: "100%",
                                            }}
                                            rowKey={'id'}
                                            columns={[
                                                {
                                                    title: '#',
                                                    dataIndex: 'index',
                                                    render: (_, __, index) => index + 1
                                                },
                                                {
                                                    title: 'Kode Pallet',
                                                    dataIndex: 'id_pallet',
                                                },
                                                {
                                                    title: 'Customer',
                                                    dataIndex: 'customer',
                                                    render: (_, record) => record['Pallet']?.['Customer']['kode'] + ' - ' + record['Pallet']?.['Customer']['name']
                                                },
                                                {
                                                    title: 'Vehicle',
                                                    dataIndex: 'vehicle',
                                                    render: (_, record) => record['Pallet']?.['Vehicle']['kode'] + ' - ' + record['Pallet']?.['Vehicle']['name']
                                                },
                                                {
                                                    title: 'Part',
                                                    dataIndex: 'part',
                                                    render: (_, record) => record['Pallet']?.['Part']['kode'] + ' - ' + record['Pallet']?.['Part']['name']
                                                },
                                                {
                                                    title: 'Destinasi',
                                                    dataIndex: 'destination',
                                                    render: (_, record) => record.destination ?? '-'
                                                },
                                                {
                                                    title: 'Keluar',
                                                    dataIndex: 'keluar',
                                                    render: (_, record) => {
                                                        return record['keluar']
                                                            ? dayjs(record['keluar']).locale('id').format('DD MMMM YYYY HH:mm')
                                                            : '-'
                                                    }
                                                },
                                                {
                                                    title: 'Operator Out',
                                                    dataIndex: 'user_out',
                                                    render: (_, record) => record['user_out'] ?? '-'
                                                },
                                                {
                                                    title: 'Masuk',
                                                    dataIndex: 'masuk',
                                                    render: (_, record) => {
                                                        return record['masuk']
                                                            ? dayjs(record['masuk']).locale('id').format('DD MMMM YYYY HH:mm')
                                                            : '-'
                                                    }
                                                },
                                                {
                                                    title: 'Operator In',
                                                    dataIndex: 'user_in',
                                                    render: (_, record) => record['user_in'] ?? '-'
                                                },
                                            ]}
                                            rowClassName={'text-[10px]'}
                                            dataSource={data.data}
                                            components={{
                                                body: {
                                                    cell: (props) => {
                                                        return <td {...props} style={{ padding: '4px 8px' }} />;
                                                    },
                                                },
                                            }}
                                            pagination={false}
                                            size={'small'} />

                                    </div>
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

export default PrintAll
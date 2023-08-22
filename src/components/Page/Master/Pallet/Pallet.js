import {BiPlusMedical, BiRefresh, BiSearch, BiSolidUpArrow, BiTrash} from "react-icons/bi";
import {BsQrCode} from "react-icons/bs";
import {AiFillFileExcel} from "react-icons/ai";
import {useEffect, useRef, useState} from "react";
import DeleteModal from "@/components/Modal/DeleteModal";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import Print from "@/components/print/label";
import {useExcelJS} from "react-use-exceljs";
import PaginationSelect from "@/components/PaginationSelect";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import AddModalLayout from "@/components/Page/Master/Pallet/AddModal";
import QRModalLayout from "@/components/Page/Master/Pallet/QRModal";
import PrintAll from "@/components/print/printall";
import Head from "next/head";
import {HiOutlineTrash} from "react-icons/hi";
import {Tooltip} from "react-tooltip";
import axiosInstance from "@/utils/interceptor";
import DeleteModal2 from "@/components/Modal/DeleteModal2";
import '@inovua/reactdatagrid-community/index.css'


export default function Pallet() {
    const {listCustomer, listVehicle, listPart,user} = dataState()
    const [listPallet, setPallet] = useState([])
    const {setModalAdd, modalAdd,  modalDelete, modalDelete2,setModalDelete2,setModalDelete, modalQr, setModalQR} = modalState()
    const [selectedCell, setSelectedCell] = useState({})
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState([])
    const custFilter = useRef(null);
    const vehicleFilter = useRef(null);
    const partFilter = useRef(null);

    const {
        register,
        handleSubmit,
        reset
    } = useForm()

    useEffect(() => {
        setPallet([]); // Reset the selected page when the component unmounts
        fetchData()
    }, [])

    const fetchData = (selectedPage=1) => {
        const searchValueLowerCase = searchTerm.toLowerCase().split(' ').join('');
        axiosInstance.get(`/api/pallets?search=${searchValueLowerCase}&customer=${custFilter.current.value??''}&vehicle=${vehicleFilter.current.value??''}&part=${partFilter.current.value??''}&page=${selectedPage}`).then(response=>{
           setPallet(response.data);
           setFilters(response.data['data'])
       }).catch(()=>{
           showErrorToast("Gagal Fetch Data")
       })
    };

    const handleSearch = async (e) => {
        e.preventDefault()
        const searchValueLowerCase = searchTerm.toLowerCase().split(' ').join('');
        if (searchValueLowerCase) {
            const response = await axiosInstance.get(`/api/pallets?search=${searchValueLowerCase}`);
            setPallet(response.data);
            setFilters(response.data['data']);
        } else {
            fetchData(listPallet['currentPage'])
        }
    };

    const submitData = (data) => {
        axiosInstance.post('/api/pallets',data).then(() =>{
            showSuccessToast("Sukses Simpan Data")
        }).catch(()=>{
            showErrorToast("Gagal Simpan Data")
        }).finally(()=>{
            fetchData(listPallet['currentPage'])
            setModalAdd(false)
        })
    }

    const deleteData = (e) => {
        axiosInstance.delete('/api/pallets/' + e).then(()=>{
            showSuccessToast("Sukses Hapus Data")
        }).catch(()=>{
            showErrorToast("Gagal Hapus Data")
        }).finally(()=>{
            setModalDelete(false)
            fetchData(listPallet['currentPage'])
        })
    }

    const handlePageChange = (selectedPage) => {
        // Lakukan perubahan halaman di sini
        fetchData(selectedPage)
    };

    const excel = useExcelJS({
        filename: "data_pallet.xlsx",
        worksheets: [
            {
                name: "Data Pallet",
                columns: [
                    {
                        header: "No",
                        key: "no",
                        width: 10,
                    },
                    {
                        header: "Kode Pallet",
                        key: "id",
                        width: 32,
                    },
                    {
                        header: "Nama Pallet",
                        key: "name",
                        width: 40,
                    },
                    {
                        header: "Customer",
                        key: "customer",
                        width: 10,
                    },
                    {
                        header: "Vehicle",
                        key: "vehicle",
                        width: 20,
                    },
                    {
                        header: "Part",
                        key: "part",
                        width: 32,
                    },
                    {
                        header: "Qr Code",
                        key: "qr",
                        width: 32,
                    },
                ],
            },
        ],
    })

    const saveExcel = async (e) => {
        e.preventDefault();
        const data = filters.map((item, index) => ({
            no: index + 1,
            id: item.kode,
            name: item.name,
            customer: item.customer + ' - ' +item['Customer']['name'],
            vehicle: item.vehicle,
            part: item.part + ' - ' +item['Part']['name'],
            qr: "Ongoing"
        }));
        await excel.download(data)
    }

    const handleItemSelection = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(kode => kode !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleMultiDelete = () => {
        Promise.all(selectedItems.map(itemId => axiosInstance.delete(`/api/pallets/${itemId}`)))
            .then(() => {
                showSuccessToast("Sukses Hapus Data");
            })
            .catch(() => {
                showErrorToast("Gagal Hapus Data");
            })
            .finally(() => {
                setSelectedItems([]);
                fetchData()
            });
    };



    return (
        <>
            <Head>
                <title>Pallet | PT Vuteq Indonesia</title>
            </Head>
            <div className={`h-full bg-white`}>
                {modalDelete && (<DeleteModal data={selectedCell} setCloseModal={setModalDelete} action={deleteData} />)}
                {modalDelete2 && (<DeleteModal2 data={selectedItems} setCloseModal={setModalDelete2} action={handleMultiDelete} />)}
                {modalAdd && (<AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register} />)}
                {modalQr && (<QRModalLayout selectedCell={selectedCell} />) }
                <div className={`bg-[#2589ce] py-1.5 px-2 text-white flex flex-row justify-between`}>
                    <h2 className={`font-bold text-[14px]`}>Filter</h2>
                    <div className={`flex items-center`}>
                        <BiSolidUpArrow  size={10}/>
                    </div>
                </div>
                <div className="w-full gap-8 flex items-center bg-white px-3 py-2">
                    <form onSubmit={handleSearch} className="flex flex-row items-center">
                        <label className="text-sm font-semibold mr-3">Cari :</label>
                        <input
                            value={searchTerm}
                            onChange={(e)=>setSearchTerm(e.target.value)}
                            type="text"
                            className="border border-gray-300 rounded mr-3 px-1"
                        />
                        <button
                            type={'submit'}
                        >
                            <BiSearch fontSize={25} />
                        </button>
                    </form>
                    <div className="flex flex-row items-center">
                        <label className="text-sm font-semibold mr-3">Customer :</label>
                        <select ref={custFilter} className="border border-gray-300 rounded p-1 text-sm">
                            <option className="text-sm" value="">
                                Semua
                            </option>
                            {listCustomer.map((e, index) => (
                                <option className="text-sm p-4" key={index} value={e['kode']}>
                                    {`${e['kode']} - ${e['name']}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-row items-center">
                        <label className="text-sm font-semibold mr-3">Part :</label>
                        <select ref={partFilter} className="border border-gray-300 rounded p-1 text-sm">
                            <option className="text-sm" value="">
                                Semua
                            </option>
                            {listPart.map((e, index) => (
                                <option className="text-sm p-4" key={index} value={e['kode']}>
                                    {`${e['kode']} - ${e['name']}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-row items-center">
                        <label className="text-sm font-semibold mr-3">Vehicle :</label>
                        <select ref={vehicleFilter} className="border border-gray-300 rounded p-1 text-sm">
                            <option className="text-sm" value="">
                                Semua
                            </option>
                            {listVehicle.map((e, index) => (
                                <option className="text-sm" key={index} value={e['kode']}>
                                    {`${e['kode']} - ${e['name']}`}
                                </option>
                            ))}
                        </select>
                        <button
                            className="ml-3 bg-green-500 py-1 px-2 text-white font-semibold text-sm"
                            onClick={fetchData}
                        >
                            Dapatkan Data
                        </button>
                    </div>
                </div>
                <div className={`w-full bg-white h-4 border border-gray-500`} />
                <div className={`w-full bg-white p-2`}>
                    <div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
                        {user.role !== 'viewer' && (
                            <>
                                <div
                                    onClick={() => setModalAdd(true)}
                                    className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
                                    <BiPlusMedical size={12} />
                                    <p className="text-white font-bold text-sm">Baru</p>
                                </div>
                                <PrintAll data={filters} />
                                <div
                                    onClick={saveExcel}
                                    className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
                                    <AiFillFileExcel size={12} />
                                    <p className="text-white font-bold text-sm">Excel</p>
                                </div>
                            </>
                        )}
                        <div
                            onClick={()=> fetchData()}
                            className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                            <BiRefresh size={12} />
                            <p className={`text-white font-bold text-sm`}>Refresh</p>
                        </div>
                        {user.role !== 'super' && user.role !== 'admin' ? null : (
                            <div
                                onClick={()=> setModalDelete2(true)}
                                className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                                <BiTrash size={12} />
                                <p className={`text-white font-bold text-sm`}>Hapus Pilihan</p>
                            </div>
                        )}
                    </div>
                    <table className="w-full overflow-y-scroll">
                        <thead>
                        <tr>
                            <th className="py-2 bg-gray-100 text-left w-5"></th>
                            <th className="py-2 bg-gray-100 text-center w-10">#</th>
                            <th className="py-2 bg-gray-100 text-left">Kode Pallet</th>
                            <th className="py-2 bg-gray-100 text-left">Nama Pallet</th>
                            <th className="py-2 bg-gray-100 text-left">Customer</th>
                            <th className="py-2 bg-gray-100 text-left">Vehicle</th>
                            <th className="py-2 bg-gray-100 text-left">Part</th>
                            <th className="py-2 bg-gray-100 text-left">Department</th>
                            <th className="py-2 bg-gray-100 text-left">Aksi</th>
                        </tr>
                        </thead>
                        <tbody className={`overflow-y-scroll`}>
                        {
                            filters.map((e, index) =>(
                                <>
                                    <tr className={`text-sm font-semibold border-b border-gray-500`} key={index}>
                                        <td className="text-center p-1.5">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(e.kode)}
                                                onChange={() => handleItemSelection(e.kode)}
                                            />
                                        </td>
                                        <td className="text-center p-1.5">{index + 1 + (listPallet['currentPage'] - 1) * 20}</td>
                                        <td>{e['kode']}</td>
                                        <td>{e['name'] ?? '-'}</td>
                                        <td>{e['customer'] + ' - ' + e['Customer']['name']}</td>
                                        <td>{e['vehicle'] + ' - ' + e['Vehicle']['name']}</td>
                                        <td>{e['part'] + ' - ' + e['Part']['name']}</td>
                                        <td>{'Produksi ' + e['Vehicle']['department']}</td>
                                        <td>
                                            <div className={'flex gap-2'}>
                                                {
                                                    user.role !== 'super' && user.role !== 'admin' ? null : (
                                                        <>
                                                            <Tooltip id="trash" />
                                                            <HiOutlineTrash
                                                                data-tooltip-id="trash"
                                                                data-tooltip-content="Hapus Pallet!"
                                                                onClick={() => {
                                                                    setSelectedCell(e);
                                                                    setModalDelete(true);
                                                                }}
                                                                size={25}
                                                                className={`hover:text-red-500 hover:cursor-pointer`}
                                                            />
                                                        </>
                                                    )
                                                }
                                                <Print data={e} />
                                                <Tooltip id="qrcode" />
                                                <BsQrCode data-tooltip-id="qrcode" data-tooltip-content="Lihat Barcode!" onClick={() => {
                                                    setSelectedCell(e)
                                                    setModalQR(true)
                                                }} size={25} className={`hover:text-green-500 hover:cursor-pointer`} />
                                            </div>
                                        </td>
                                    </tr>
                                </>
                            ))
                        }
                        </tbody>
                    </table>
                    {/*<div className="flex">*/}
                    {/*    <ReactDataGrid*/}
                    {/*        idProperty="kode"*/}
                    {/*        style={{*/}
                    {/*            minHeight: "calc(100vh - 320px)", // Adjust as needed based on other elements on your page*/}
                    {/*        }}*/}
                    {/*        defaultFilterValue={[*/}
                    {/*            { name: 'kode', operator: 'contains', type: 'string', value: '' },*/}
                    {/*            { name: 'name', operator: 'contains', type: 'string', value: '' },*/}
                    {/*        ]}*/}
                    {/*        columns={[*/}
                    {/*            { name: 'kode', header: 'Kode Pallet' ,defaultWidth:100},*/}
                    {/*            { name: 'name', header: 'Nama Pallet', },*/}
                    {/*            { name: 'customer', header: 'Customer', },*/}
                    {/*            { name: 'vehicle', header: 'Vehicle', },*/}
                    {/*            { name: 'part', header: 'Part', },*/}
                    {/*            { name: 'department', header: 'Department',*/}
                    {/*                render: (row) => row['Vehicle']department || 'N/A', // Ambil data department dari objek Vehicle*/}

                    {/*            },*/}
                    {/*            { name: '', header: 'Aksi',  },*/}
                    {/*        ]}*/}
                    {/*        pagination*/}
                    {/*        dataSource={filters}*/}
                    {/*        selected={selected}*/}
                    {/*        checkboxColumn*/}
                    {/*        onSelectionChange={onSelectionChange}*/}
                    {/*    />*/}
                    {/*</div>*/}

                    <br/>
                    <PaginationSelect
                        totalPages={listPallet['totalPages']}
                        currentPage={listPallet['currentPage']}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    )
}
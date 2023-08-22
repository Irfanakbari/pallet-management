import {BiPlusMedical, BiRefresh, BiSearch, BiSolidUpArrow, BiTrash} from "react-icons/bi";
import {useEffect, useRef, useState} from "react";
import DeleteModal from "@/components/Modal/DeleteModal";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import Head from "next/head";
import {HiOutlineTrash} from "react-icons/hi";
import {Tooltip} from "react-tooltip";
import axiosInstance from "@/utils/interceptor";
import AddModalLayout from "@/components/Page/Master/Destination/AddModal";
import DeleteModal2 from "@/components/Modal/DeleteModal2";

export default function Destination() {
    const {user,setListDestination, modalDelete2, setModalDelete2} = dataState()
    const {setModalAdd, modalAdd,  modalDelete,setModalDelete} = modalState()
    const [selectedCell, setSelectedCell] = useState({})
    const [selectedItems, setSelectedItems] = useState([]);
    const [filters, setFilters] = useState([])
    const {
        register,
        handleSubmit,
        reset
    } = useForm()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = () => {
        axiosInstance.get(`/api/destination`).then(response=>{
            setListDestination(response.data);
            setFilters(response.data['data'])
       }).catch(()=>{
           showErrorToast("Gagal Fetch Data")
       })
    };

    const submitData = (data) => {
        axiosInstance.post('/api/destination',data).then(() =>{
            showSuccessToast("Sukses Simpan Data")
        }).catch(()=>{
            showErrorToast("Gagal Simpan Data")
        }).finally(()=>{
            fetchData()
            setModalAdd(false)
        })
    }

    const deleteData = (e) => {
        axiosInstance.delete('/api/destination/' + e).then(()=>{
            showSuccessToast("Sukses Hapus Data")
        }).catch(()=>{
            showErrorToast("Gagal Hapus Data")
        }).finally(()=>{
            setModalDelete(false)
            fetchData()
        })
    }

    const handleItemSelection = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(kode => kode !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleMultiDelete = () => {
        Promise.all(selectedItems.map(itemId => axiosInstance.delete(`/api/destination/${itemId}`)))
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
                <title>Destination | PT Vuteq Indonesia</title>
            </Head>
            <div className={`h-full bg-white`}>
                {modalDelete && (<DeleteModal data={selectedCell} setCloseModal={setModalDelete} action={deleteData} />)}
                {modalDelete2 && (<DeleteModal2 data={selectedItems} setCloseModal={setModalDelete2} action={handleMultiDelete} />)}
                {modalAdd && (<AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register} />)}
                <div className={`bg-[#2589ce] py-1.5 px-2 text-white flex flex-row justify-between`}>
                    <h2 className={`font-bold text-[14px]`}>Filter</h2>
                    <div className={`flex items-center`}>
                        <BiSolidUpArrow  size={10}/>
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
                            <th className="py-2 bg-gray-100 text-left">Destinasi</th>
                            <th className="py-2 bg-gray-100 text-left">Part</th>
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
                                                checked={selectedItems.includes(e.id)}
                                                onChange={() => handleItemSelection(e.id)}
                                            />
                                        </td>
                                        <td className={'text-center'}>{index+1}</td>
                                        <td>{e['name'] ?? '-'}</td>
                                        <td>{e['part'] + ' - ' + e['Part']['name']}</td>
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
                                            </div>
                                        </td>
                                    </tr>
                                </>
                            ))
                        }
                        </tbody>
                    </table>
                    <br/>
                    {/*<PaginationSelect*/}
                    {/*    totalPages={listPallet['totalPages']}*/}
                    {/*    currentPage={1}*/}
                    {/*    onPageChange={handlePageChange}*/}
                    {/*/>*/}
                </div>
            </div>
        </>
    )
}
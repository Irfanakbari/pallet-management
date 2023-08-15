import { BiEdit, BiPlusMedical, BiRefresh, BiSolidUpArrow } from "react-icons/bi";
import { BsFillTrashFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import DeleteModal from "@/components/Modal/DeleteModal";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import AddModalLayout from "@/components/Page/Master/Department/AddModal";
import EditModalLayout from "@/components/Page/Master/Department/EditModal";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
export default function Department() {
    const {setListDepartment, listDepartment} = dataState()
    const {setModalAdd, modalAdd, modalEdit, setModalEdit, modalDelete,setModalDelete} = modalState()
    const [selectedCell, setSelectedCell] = useState({});
    const {
        register,
        handleSubmit,
        reset
    } = useForm()
    
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData =  () => {
        axiosInstance.get('/api/departments').then(response => {
            setListDepartment(response.data['data']);
        }).catch(()=>{
            showErrorToast("Gagal Fetch Data");
        })
    };

    const submitData = (data) => {
        axiosInstance.post('/api/departments', data).then(() => {
            showSuccessToast("Sukses Simpan Data");
            fetchData();
        }).catch(()=>{
            showErrorToast("Gagal Simpan Data");
        }).finally(()=>{
            reset()
            setModalAdd(false)
        })
    };

    const deleteData = (e) => {
        axiosInstance
            .delete('/api/departments/' + e)
            .then(() => {
                showSuccessToast("Sukses Hapus Data");
            })
            .catch(() => {
                showErrorToast("Gagal Hapus Data");
            })
            .finally(() => {
                setModalDelete(false);
                fetchData();
            });
    };

    const editData = (data) => {
        axiosInstance
            .put('/api/departments/' + selectedCell.kode, data)
            .then(() => {
                showSuccessToast("Sukses Edit Data");
                fetchData();
            })
            .catch(() => {
                showErrorToast("Gagal Edit Data");
            })
            .finally(() => {
                reset();
                setModalEdit(false);
            });
    };

    return (
        <>
            <Head>
                <title>Department | PT Vuteq Indonesia</title>
            </Head>
            <div className="h-full bg-white">
                {modalDelete && (<DeleteModal data={selectedCell.kode} setCloseModal={setModalDelete} action={deleteData} />)}
                {modalAdd && (<AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register} />)}
                {modalEdit && (<EditModalLayout onSubmit={handleSubmit(editData)} reset={reset} register={register} selectedCell={selectedCell} />)}
                <div className="bg-[#2589ce] py-1.5 px-2 text-white flex flex-row justify-between">
                    <h2 className="font-bold text-[14px]">Filter</h2>
                    <div className="flex items-center">
                        <BiSolidUpArrow size={10} />
                    </div>
                </div>

                <div className="w-full h-4 border border-gray-500" />
                <div className="w-full p-2">
                    <div className="w-full bg-base py-0.5 px-1 text-white flex flex-row">
                        <div
                            onClick={() => setModalAdd(true)}
                            className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer"
                        >
                            <BiPlusMedical size={12} />
                            <p className="text-white font-bold text-sm">Baru</p>
                        </div>
                        <div
                            onClick={() => setModalEdit(true)}
                            className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer"
                        >
                            <BiEdit size={12} />
                            <p className="text-white font-bold text-sm">Ubah</p>
                        </div>
                        <div
                            onClick={() => setModalDelete(true)}
                            className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer"
                        >
                            <BsFillTrashFill size={12} />
                            <p className="text-white font-bold text-sm">Hapus</p>
                        </div>
                        <div
                            onClick={fetchData}
                            className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer"
                        >
                            <BiRefresh size={12} />
                            <p className="text-white font-bold text-sm">Refresh</p>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr>
                                <th className="py-2 bg-gray-100 text-center w-20">#</th>
                                <th className="py-2 bg-gray-100 text-left">Kode Department (A~Z)</th>
                                <th className="py-2 bg-gray-100 text-left">Nama Department</th>
                            </tr>
                            </thead>
                            <tbody>
                            {listDepartment.map((e, index) => (
                                <tr
                                    className={`${selectedCell.kode === e['kode'] ? 'bg-[#85d3ff]' : ''} text-sm font-semibold border-b border-gray-500`}
                                    key={e['kode']}
                                    onClick={() => setSelectedCell(e)}
                                >
                                    <td className="text-center p-1.5">{index + 1}</td>
                                    <td>{e['kode']}</td>
                                    <td>{e['name']}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

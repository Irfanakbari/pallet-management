import {BiEdit, BiPlusMedical, BiRefresh, BiSolidUpArrow} from "react-icons/bi";
import {ImCross} from "react-icons/im";
import {BsFillTrashFill} from "react-icons/bs";
import {useEffect, useState} from "react";
import axios from "axios";
import DeleteModal from "@/components/Modal/DeleteModal";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import AddModalLayout from "@/components/Page/Master/Vehicle/AddModal";
import EditModalLayout from "@/components/Page/Master/Vehicle/EditModal";
import Head from "next/head";

export default function Vehicle() {
    const {setVehicle, listVehicle} = dataState()
    const {setModalAdd, modalAdd, modalEdit, setModalEdit, modalDelete,setModalDelete} = modalState()

    const [selectedCell, setSelectedCell] = useState('')
    const [searchTerm, setSearchTerm] = useState('');
    
    const [filters, setFilters] = useState([])

    const {
        register,
        handleSubmit,
        reset
    } = useForm()


    useEffect(() => {
        fetchData();
    }, [])

    const fetchData =  () => {
        axios.get('/api/vehicle').then(response =>{
            setVehicle(response.data['data']);
            setFilters(response.data['data'])
        }).catch(()=>{
            showErrorToast("Gagal Fetch Data");
        })
    };

    const submitData = async (data) => {
        axios.post('/api/vehicle',data).then(() =>{
            showSuccessToast("Sukses Simpan Data");
            fetchData()
        }).catch(()=>{
            showErrorToast("Gagal Simpan Data");
        }).finally(()=>{
            setModalAdd(false)
            reset()
        })
    }

    const deleteData = async (e) => {
        axios.delete('/api/vehicle/' + e).then(()=>{
            showSuccessToast("Sukses Hapus Data");
        }).catch (()=>{
            showErrorToast("Gagal Hapus Data");
        }).finally(()=>{
            setModalDelete(false)
            fetchData()
        })
    }

    const editData = (data) => {
        axios.put('/api/vehicle/' + selectedCell.kode,data).then(() =>{
            showSuccessToast("Sukses Edit Data");
            fetchData()
        }).catch(()=>{
            showErrorToast("Gagal Edit Data");
        }).finally(()=>{
            setModalEdit(false)
            reset()
        })
    }

    function searchValue(value) {
        if (value.trim() === '') {
            return listVehicle;
        }
        const searchValueLowerCase = value.toLowerCase();
        return listVehicle.filter((item) => {
            for (let key in item) {
                if (typeof item[key] === 'string' && item[key].toLowerCase().includes(searchValueLowerCase)) {
                    return true;
                }
                if (typeof item[key] === 'object') {
                    for (let subKey in item[key]) {
                        if (
                            typeof item[key][subKey] === 'string' &&
                            item[key][subKey].toLowerCase().includes(searchValueLowerCase)
                        ) {
                            return true;
                        }
                    }
                }
            }
            return false;
        });
    }
    
    const handleSearch = () => {
        const searchResult = searchValue(searchTerm);
        setFilters(searchResult);
    };

    return(
        <>
            <Head>
                <title>Vehicle | PT Vuteq Indonesia</title>
            </Head>
            <div className={`h-full bg-white`}>
                {modalDelete && <DeleteModal data={selectedCell} setCloseModal={setModalDelete} action={deleteData} />}
                {modalAdd && <AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register} />}
                {modalEdit && (<EditModalLayout onSubmit={handleSubmit(editData)} reset={reset} register={register} selectedCell={selectedCell} />)}
                <div className={`bg-[#2589ce] py-1.5 px-2 text-white flex flex-row justify-between`}>
                    <h2 className={`font-bold text-[14px]`}>Filter</h2>
                    <div className={`flex items-center`}>
                        <BiSolidUpArrow  size={10}/>
                    </div>
                </div>
                <div className={`w-full flex items-center bg-white px-3 py-2`}>
                    <label className={`text-sm font-semibold mr-3`}>Cari : </label>
                    <input
                        type="text"
                        className="border border-gray-300 rounded mr-3"
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
                <div className={`w-full bg-white h-4 border border-gray-500`} />
                <div className={`w-full bg-white p-2`}>
                    <div className={`w-full bg-[#3da0e3] py-0.5 px-1 text-white flex flex-row`}>
                        <div
                            onClick={()=> setModalAdd(true)}
                            className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                            <BiPlusMedical size={12} />
                            <p className={`text-white font-bold text-sm`}>Baru</p>
                        </div>
                        <div
                            onClick={()=>setModalEdit(true)}
                            className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                            <BiEdit size={12} />
                            <p className={`text-white font-bold text-sm`}>Ubah</p>
                        </div>
                        <div
                            onClick={()=>setModalDelete(true)}
                            className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                            <BsFillTrashFill size={12} />
                            <p className={`text-white font-bold text-sm`}>Hapus</p>
                        </div>
                        <div
                            onClick={()=> fetchData()}
                            className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                            <BiRefresh size={12} />
                            <p className={`text-white font-bold text-sm`}>Refresh</p>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr>
                                <th className="py-2 bg-gray-100 text-left w-10">#</th>
                                <th className="py-2 bg-gray-100 text-left">Kode Vehicle</th>
                                <th className="py-2 bg-gray-100 text-left">Nama Vehicle</th>
                                <th className="py-2 bg-gray-100 text-left">Customer</th>
                                <th className="py-2 bg-gray-100 text-left">Department</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                filters.map((e, index) =>(
                                    <>
                                        <tr className={`${selectedCell.kode === e['kode'] ? 'bg-[#85d3ff]': ''} text-sm font-semibold border-b border-gray-500`} key={index} onClick={()=>setSelectedCell(e)}>
                                            <td className="text-center p-1.5">{index+1}</td>
                                            <td>{e['kode']}</td>
                                            <td>{e['name']}</td>
                                            <td>{e['customer'] + ' - ' + e['Customer']['name']}</td>
                                            <td>{e['Department']['name']}</td>
                                        </tr>
                                    </>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}
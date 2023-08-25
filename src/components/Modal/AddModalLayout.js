import {FaRegWindowMaximize} from "react-icons/fa";
import {ImCross} from "react-icons/im";
import {modalState} from "@/context/states";

export default function ModalLayout({children, onSubmit, reset}) {
    const {setModalAdd, setModalEdit} = modalState()
    return (
        <div className="fixed bg-black bg-opacity-20 h-full flex items-center justify-center top-0 left-0 z-[5000] w-full overflow-y-auto overflow-x-hidden outline-none">
            <div className="w-1/3 rounded bg-white border-4 border-base">
                <div className="w-full flex items-center justify-between bg-base font-light py-1 px-2 text-white text-sm">
                    <div className="flex items-center gap-2">
                        <FaRegWindowMaximize />
                        Form Tambah/Ubah Data
                    </div>
                    <div onClick={() => {
                        setModalAdd(false)
                        setModalEdit(false)
                    }} className="hover:bg-red-800 p-1">
                        <ImCross size={10} />
                    </div>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="p-2 flex flex-col gap-5">
                        {
                            children
                        }
                        <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
                            <div className="flex flex-row justify-center gap-2">
                                <input type={'submit'} className="bg-[#f17373] w-full text-white py-1 text-sm rounded"/>
                                <button onClick={() => {
                                    setModalAdd(false)
                                    setModalEdit(false)
                                    reset()
                                }} className="border w-full border-gray-500 py-1 text-sm rounded">
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
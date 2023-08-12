export default function ConfirmLogoutModal({setCloseModal, action}) {
    return (
            <div className={`fixed bg-black bg-opacity-20 h-full flex items-center justify-center top-0 left-0 z-[5000] w-full text-center overflow-y-auto overflow-x-hidden outline-none`}>
                <div className={`w-1/4 rounded bg-white`}>
                    <div className={`w-full bg-[#f17373] text-center font-bold py-1 text-white text-sm`}>
                        Konfirmasi Logout
                    </div>
                    <div className={`mt-6 mb-6`}>
                                <span className={`text-sm`}>
                                    Yakin Ingin Logout?
                                 </span>
                    </div>
                    <div className={`flex flex-row justify-center gap-2 p-5`}>
                        <button onClick={action} className={`bg-[#f17373] w-full text-white py-1 text-sm rounded`}>Logout</button>
                        <button onClick={()=> setCloseModal(false)} className={`border w-full border-gray-500 py-1 text-sm rounded`}>Cancel</button>
                    </div>
                </div>
            </div>
    )
}
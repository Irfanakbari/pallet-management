export default function DeleteModal({data, setCloseModal, action}) {
    return(
       data !== '' ?
           <div className={`fixed bg-black bg-opacity-20 h-full flex items-center justify-center top-0 left-0 z-[5000] w-full text-center overflow-y-auto overflow-x-hidden outline-none`}>
               <div className={`w-1/4 rounded bg-white`}>
                   <div className={`w-full bg-[#f17373] text-center font-bold py-1 text-white text-sm`}>
                       Konfirmasi
                   </div>
                   <div className={`mt-6 mb-6`}>
                                <span className={`text-sm`}>
                                    Yakin Hapus Data {data.kode ?? data.id}?
                                 </span>
                   </div>
                   <div className={`flex flex-row justify-center gap-2 p-5`}>
                       <button onClick={async () => {
                           await action(data.kode ?? data.id)
                       }} className={`bg-[#f17373] w-full text-white py-1 text-sm rounded`}>Ok</button>
                       <button onClick={()=> setCloseModal(false)} className={`border w-full border-gray-500 py-1 text-sm rounded`}>Cancel</button>
                   </div>
               </div>
           </div> :
           <div className={`fixed bg-black bg-opacity-20 h-full flex items-center justify-center top-0 left-0 z-[5000] w-full text-center overflow-y-auto overflow-x-hidden outline-none`}>
               <div className={`w-1/4 rounded bg-white`}>
                   <div className={`w-full bg-[#e6951ad9] text-center font-bold py-1 text-white text-sm`}>
                       Warning
                   </div>
                   <div className={`mt-6 mb-6`}>
                                <span className={`text-sm`}>
                                   Anda Belum Memilih Apapun
                                 </span>
                   </div>
                   <div className={`flex flex-row justify-center gap-2 p-5`}>
                       <button onClick={()=> setCloseModal(false)} className={`bg-base w-full text-white py-1 text-sm rounded`}>Close</button>
                   </div>
               </div>
           </div>
    )
}
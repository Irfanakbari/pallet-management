import {useCallback, useRef, useState} from 'react';
import {useReactToPrint} from 'react-to-print';
import {BiPrinter} from "react-icons/bi";
import {FaRegWindowMaximize} from "react-icons/fa";
import {ImCross} from "react-icons/im";
import {LabelComponent} from "@/components/print/label";

// PrintAll component
export default function PrintAll({ data }) {
    const componentRef = useRef(null);
    const [modal, setModal] = useState(false)

    const reactToPrintContent = useCallback(() => {
        return componentRef.current;
    }, [componentRef.current]);

    const handlePrint = useReactToPrint({
        content: reactToPrintContent,
        documentTitle: "AwesomeFileName",
        onAfterPrint: ()=>setModal(false),
        removeAfterPrint: true
    });

    return (
        <>
            {
                modal && <div className="fixed bg-black h-screen bg-opacity-20 flex items-center justify-center top-0 left-0 z-[5000] w-full  overflow-x-hidden outline-none">
                    <div className="w-1/3 h-2/3 rounded bg-white border-4 border-base">
                        <div className="w-full flex items-center justify-between bg-base font-light py-1 px-2 text-white text-sm">
                            <div className="flex items-center gap-2">
                                <FaRegWindowMaximize />
                                Print Preview
                            </div>
                            <div onClick={() => setModal(false)} className="hover:bg-red-800 p-1">
                                <ImCross size={10} />
                            </div>
                        </div>
                        <div className="p-2 flex flex-col gap-5 h-full">
                            <div ref={componentRef} className={`overflow-y-auto h-full text-black`} >
                                {
                                    data.map((labelData, index) => (
                                        <div key={index} className="page-break">
                                            <LabelComponent {...labelData} />
                                        </div>
                                    ))
                                }
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
                    <p className={`text-white font-bold text-sm`}>Cetak QR Massal</p>
                </div>
            </div>
        </>
    )
}

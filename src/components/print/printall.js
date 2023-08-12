import {useCallback, useRef, useState} from 'react';
import {useReactToPrint} from 'react-to-print';
import { QRCode } from 'react-qrcode-logo';
import {BiPrinter} from "react-icons/bi";
import {FaRegWindowMaximize} from "react-icons/fa";
import {ImCross} from "react-icons/im";

const LabelComponent = ({ assetName, palletID, customerID, partID })=>{
    return (
        <div className={`break-before-page`}>
            <div className="flex w-full p-1 mt-2 h-full">
                <div className={`w-full flex flex-col border-2 border-black text-[12px]`}>
                    <div className={`w-full p-0.5 text-center font-bold`}>PT VUTEQ INDONESIA</div>
                    <div className={`grow flex text-center font-normal`}>
                        <table className={`w-full grow`}>
                            <tbody className={`border-t border-black text-[10px]`}>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white`}>Asset Name</td>
                                <td className={`text-center border border-black border-r-0 truncate`}>{assetName}</td>
                            </tr>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white truncate`}>Pallet ID</td>
                                <td className={`text-center border border-black border-r-0 truncate`}>{palletID}</td>
                            </tr>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white truncate`}>Customer</td>
                                <td className={`text-center border border-black border-r-0 truncate`}>{customerID}</td>
                            </tr>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white truncate`}>Part</td>
                                <td className={`text-center border border-black border-r-0 truncate`}>{partID}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={`grow border-2 flex items-center justify center border-l-0 border-black`}>
                    <center>
                        <QRCode
                            ecLevel={'H'}
                            size={68}
                            bgColor={`transparent`}
                            value={palletID}
                            qrStyle={'dots'}
                        />
                    </center>
                </div>
            </div>
        </div>
    )
}

// PrintAll component
export default function PrintAll({ data }) {
    const componentRef = useRef(null);
    const [modal, setModal] = useState(false)

    // Create an array to store the converted data
    let labelDataArray = [];
    data.forEach(item => {
        const labelData = {
            assetName: item.name,
            palletID: item.kode,
            customerID: item['Customer'] ? item['Customer']['kode'] + ' - ' + item['Customer']['name'] : '-',
            partID: item['Part'] ? item['Part']['name'] : '-',
        };

        // Push the labelData object to the labelDataArray
        labelDataArray.push(labelData);
    });

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
                                    labelDataArray.map((labelData, index) => (
                                        <div key={index}>
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
                    <p className={`text-white font-bold text-sm`}>Cetak QR Per Halaman</p>
                </div>
            </div>
        </>
    )
}

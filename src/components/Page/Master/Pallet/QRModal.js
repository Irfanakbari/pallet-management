import React from "react";
import {QRCode} from "react-qrcode-logo";
import {FaRegWindowMaximize} from "react-icons/fa";
import {ImCross} from "react-icons/im";
import {modalState} from "@/context/states";

export default function QRModalLayout({ selectedCell }) {
    const {setModalQR} = modalState()

    return (
        <div className={`fixed bg-black bg-opacity-20 h-full flex items-center justify-center top-0 left-0 z-[5000] w-full overflow-y-auto overflow-x-hidden outline-none`}>
            <div className={`rounded bg-white border-4 border-[#3da0e3]`}>
                <div className={`w-full flex items-center justify-between bg-[#3da0e3] font-light py-1 px-2 text-white text-sm`}>
                    <div className={'flex items-center gap-2'}>
                        <FaRegWindowMaximize />
                        {
                            `QR Code - ${selectedCell.kode}`
                        }
                    </div>
                    <div onClick={()=> setModalQR(false)} className={`hover:bg-red-800 p-1`}>
                        <ImCross size={10} />
                    </div>
                </div>
                <div className={`p-6 flex flex-col gap-3 justify-center items-center`}>
                    <QRCode
                        logoWidth={70}
                        ecLevel={'Q'}
                        size={350}
                        logoOpacity={0.5}
                        value={selectedCell.kode}
                        qrStyle={'squares'}
                        removeQrCodeBehindLogo={true} />
                    <h2 className={`text-xl font-bold`}>
                        {
                            selectedCell.kode + ` - ` + selectedCell.name
                        }
                    </h2>
                </div>
            </div>
        </div>
    );
}

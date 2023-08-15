import React from 'react';
import ReactToPrint from 'react-to-print';
import html2canvas from 'html2canvas';
import { QRCode } from 'react-qrcode-logo';
import {BiPrinter} from "react-icons/bi";
import {Tooltip} from "react-tooltip";

class LabelComponent extends React.Component {
    render() {
        const { assetName, palletID, customerID, partID } = this.props;
        return (
            <div className="flex w-full p-1 mt-2 h-full">
                <div className={`w-full flex flex-col border-2 border-black text-[12px]`}>
                    <div className={`w-full p-0.5 text-center font-bold`}>PT VUTEQ INDONESIA</div>
                    <div className={`grow flex text-center font-normal`}>
                        <table className={`w-full grow`}>
                            <tbody className={`border-t border-black text-[10px]`}>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white`}>Asset Name</td>
                                <td className={`text-center border border-black border-r-0`}>{assetName}</td>
                            </tr>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white`}>Pallet ID</td>
                                <td className={`text-center border border-black border-r-0`}>{palletID}</td>
                            </tr>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white`}>Customer</td>
                                <td className={`text-center border border-black border-r-0`}>{customerID}</td>
                            </tr>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white`}>Part</td>
                                <td className={`text-center border border-black border-r-0`}>{partID}</td>
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
                           value={palletID}
                           qrStyle={'dots'}
                       />
                   </center>
                </div>
            </div>
        );
    }
}

class PrintPage extends React.Component {
    render() {
        const labelData = this.props;
        return (
            <div>
                <ReactToPrint
                    trigger={() =>
                       <div>
                           <Tooltip id="label" />
                           <BiPrinter data-tooltip-id="qrcode" data-tooltip-content="Lihat Barcode!" size={25} className={`hover:text-blue-500 hover:cursor-pointer`} />
                       </div>
                    }
                    content={() => this.labelRef}
                    onBeforeGetContent={() => html2canvas(document.body)}
                />
                {/* Label component */}
                <div style={{ display: 'none' }}>
                    <LabelComponent ref={(ref) => (this.labelRef = ref)} {...labelData} />
                </div>
            </div>
        );
    }
}

export default function Print({data}) {
    const labelData = {
        assetName: data.name,
        palletID: data.kode,
        customerID: data['Customer'] ? data['Customer']['kode'] + ' - ' + data['Customer']['name'] : '-',
        partID: data['Part'] ? data['Part']['kode'] + ' - ' + data['Part']['name'] : '-',
    };
    return <PrintPage {...labelData} />;
}
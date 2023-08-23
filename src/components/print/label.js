import React from 'react';
import { QRCode } from 'react-qrcode-logo';


export class LabelComponent extends React.Component {
    render() {
        const labelData = {
            assetName: this.props.name,
            palletID: this.props.kode,
            customerID: this.props['Customer'] ? this.props['Customer']['kode'] + ' - ' + this.props['Customer']['name'] : '-',
            partID: this.props['Part'] ? this.props['Part']['kode'] + ' - ' + this.props['Part']['name'] : '-',
        };
        return (

            <div className="flex w-full p-1 mt-2 h-full">
                <div className={`w-full flex flex-col border-2 border-black text-[12px]`}>
                    <div className={`w-full flex flex-row p-0.5`}>
                        <img src="/logo.png" alt="Logo" width={61} />
                        <div className={`w-full text-center font-bold`}>PT VUTEQ INDONESIA</div>
                    </div>
                    <div className={`grow flex text-center font-normal`}>
                        <table className={`w-full grow`}>
                            <tbody className={`border-t border-black text-[10px]`}>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white w-[30%]`}>Pallet Name</td>
                                <td className={`text-center border border-black border-r-0`}>{labelData.assetName}</td>
                            </tr>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white`}>Pallet ID</td>
                                <td className={`text-center border border-black border-r-0`}>{labelData.palletID}</td>
                            </tr>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white`}>Customer</td>
                                <td className={`text-center border border-black border-r-0`}>{labelData.customerID}</td>
                            </tr>
                            <tr className={`w-full text-left`}>
                                <td className={`border border-black bg-black text-white`}>Part</td>
                                <td className={`text-center border border-black border-r-0`}>{labelData.partID}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={`grow border-2 flex items-center justify center border-l-0 border-black`}>
                   <center>
                       <QRCode
                           ecLevel={'Q'}
                           size={71}
                           value={labelData.palletID}
                           qrStyle={'dots'}
                       />
                   </center>
                </div>
            </div>
        );
    }
}

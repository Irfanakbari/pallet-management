import ModalLayout from "@/components/Modal/AddModalLayout";
import {dataState} from "@/context/states";

export default function AddModalLayout({ onSubmit, reset, register }) {
    const {listPart} = dataState()

    return (
        <ModalLayout onSubmit={onSubmit} reset={reset}>
            <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Nama Pallet : </label>
                    <input {...register("name")} className="border border-gray-300 p-1 flex-grow" />
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Part : </label>
                    <select {...register("part")} className="border border-gray-300 p-1 flex-grow">
                        {
                            listPart.map((e, index)=>(
                                <option key={index} value={e.kode}>
                                    {
                                        `${e['Customer'].name} - ${e.name} - Produksi ${e['Vehicle'].department}`
                                    }
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Jenis Pallet (Khusus Prod B & C) : </label>
                    <select {...register("jenis")} className="border border-gray-300 p-1 flex-grow">
                        <option value={"B"}>
                            Box
                        </option>
                        <option value={"R"}>
                            Rak
                        </option>
                        <option value={"K"}>
                            Kayu
                        </option>
                        <option value={"T"}>
                            Trolley
                        </option>
                    </select>
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Total Pallet : </label>
                    <input type={'number'} defaultValue={1} min={1} {...register("total")} className="border border-gray-300 p-1 flex-grow" />
                </div>
            </div>
        </ModalLayout>
    );
}

import ModalLayout from "@/components/Modal/AddModalLayout";
import {dataState} from "@/context/states";

export default function AddModalLayout({ onSubmit, reset, register }) {
    const {listCustomer, listDepartment} = dataState()

    return (
        <ModalLayout onSubmit={onSubmit} reset={reset}>
            <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Customer : </label>
                    <select {...register("customer")} className="border border-gray-300 p-1 flex-grow">
                        {
                            listCustomer.map((e, index)=>(
                                <option key={index} value={e.kode}>
                                    {
                                        `${e.kode} - ${e.name}`
                                    }
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Department : </label>
                    <select {...register("department")} className="border border-gray-300 p-1 flex-grow">
                        {
                            listDepartment.map((e, index)=>(
                                <option key={index} value={e.kode}>
                                    {
                                        `${e.kode} - ${e.name}`
                                    }
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Nama Vehicle : </label>
                    <input {...register("name")} className="border border-gray-300 p-1 flex-grow" />
                </div>
            </div>
        </ModalLayout>
    );
}

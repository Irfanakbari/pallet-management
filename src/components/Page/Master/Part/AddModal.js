import React from "react";
import ModalLayout from "@/components/Modal/AddModalLayout";
import {dataState} from "@/context/states";

export default function AddModalLayout({ onSubmit, reset, register }) {
    const {listCustomer, listVehicle} = dataState()

    return (
        <ModalLayout onSubmit={onSubmit} reset={reset}>
            <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Kode Part (A~Z) : </label>
                    <input {...register("kode")} className="border border-gray-300 p-1 flex-grow" />
                </div>
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
                    <label className="w-1/4">Vehicle : </label>
                    <select {...register("vehicle")} className="border border-gray-300 p-1 flex-grow">
                        {
                            listVehicle.map((e, index)=>(
                                <option key={index} value={e.kode}>
                                    {
                                        `${e.kode} - ${e.name} - ${e['Department'].name}`
                                    }
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Nama Part : </label>
                    <input {...register("name")} className="border border-gray-300 p-1 flex-grow" />
                </div>
            </div>
        </ModalLayout>
    );
}

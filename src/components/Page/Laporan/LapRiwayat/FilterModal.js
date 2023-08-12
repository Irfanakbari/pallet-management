import React from "react";
import {FaRegWindowMaximize} from "react-icons/fa";
import {ImCross} from "react-icons/im";
import {dataState, filterState, modalState} from "@/context/states";

export default function FilterModal({ onSubmit }) {
    const {setModalFilter} = modalState()
    const {listCustomer, listVehicle,listPart} = dataState()
    const {
        custFilterValue,
        vehicleFilterValue,
        partFilterValue,
        statusFilterValue,
        startDateValue,
        endDateValue,
        setFilterValues,
        setStartDateValue,
        setEndDateValue,
    } = filterState();


    const handleCustFilterChange = (event) => {
        setFilterValues({ custFilterValue: event.target.value });
    };

    const handleVehicleFilterChange = (event) => {
        setFilterValues({ vehicleFilterValue: event.target.value });
    };

    const handlePartFilterChange = (event) => {
        setFilterValues({ partFilterValue: event.target.value });
    };

    const handleStatusFilterChange = (event) => {
        setFilterValues({ statusFilterValue: event.target.value });
    };

    // Handle changes to the startDate and endDate values
    const handleStartDateChange = (event) => {
        setStartDateValue(event.target.value);
    };

    const handleEndDateChange = (event) => {
        setEndDateValue(event.target.value);
    };


    return (
        <div className="fixed bg-black bg-opacity-20 h-full flex items-center justify-center top-0 left-0 z-[5000] w-full overflow-y-auto overflow-x-hidden outline-none">
            <div className="w-1/3 rounded bg-white border-4 border-base">
                <div className="w-full flex items-center justify-between bg-base font-light py-1 px-2 text-white text-sm">
                    <div className="flex items-center gap-2">
                        <FaRegWindowMaximize />
                        Filter Data
                    </div>
                    <div onClick={() => setModalFilter(false)} className="hover:bg-red-800 p-1">
                        <ImCross size={10} />
                    </div>
                </div>
                <div className="p-2 flex flex-col gap-5">
                    <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
                        <div className="flex flex-col justify-between gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold mr-3">Customer :</label>
                                <select value={custFilterValue} onChange={handleCustFilterChange} className="border border-gray-300 rounded p-1 text-sm">
                                    <option className="text-sm" value="">
                                        Semua
                                    </option>
                                    {listCustomer.map((e, index) => (
                                        <option className="text-sm p-4" key={index} value={e['kode']}>
                                            {`${e['kode']} - ${e['name']}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold mr-3">Vehicle :</label>
                                <select value={vehicleFilterValue} onChange={handleVehicleFilterChange} className="border border-gray-300 rounded p-1 text-sm">
                                    <option className="text-sm" value="">
                                        Semua
                                    </option>
                                    {listVehicle.map((e, index) => (
                                        <option className="text-sm" key={index} value={e['kode']}>
                                            {`${e['kode']} - ${e['name']}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold mr-3">Part :</label>
                            <select value={partFilterValue} onChange={handlePartFilterChange} className="border border-gray-300 rounded p-1 text-sm">
                                <option className="text-sm" value="">
                                    Semua
                                </option>
                                {listPart.map((e, index) => (
                                    <option className="text-sm" key={index} value={e['kode']}>
                                        {`${e['kode']} - ${e['name']}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold mr-3">Status :</label>
                            <select value={statusFilterValue} onChange={handleStatusFilterChange} className="border border-gray-300 rounded p-1 text-sm">
                                <option className="text-sm" value="">
                                    Semua
                                </option>
                                <option className="text-sm" value={'0'}>
                                    Keluar
                                </option>
                                <option className="text-sm" value={'1'}>
                                    Masuk
                                </option>
                            </select>
                        </div>
                        <div className={`flex flex-col gap-2`}>
                            <label className="text-sm font-semibold mr-3">Tanggal Awal :</label>
                            <input value={startDateValue} onChange={handleStartDateChange} type={'date'} className={`border border-gray-300 rounded p-1 text-sm`} />
                        </div>
                        <div className={`flex flex-col gap-2`}>
                            <label className="text-sm font-semibold mr-3">Tanggal Akhir :</label>
                            <input value={endDateValue} onChange={handleEndDateChange} type={'date'} className={`border border-gray-300 rounded p-1 text-sm`} />
                        </div>
                    </div>
                    <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
                        <div className="flex flex-row justify-center gap-2">
                            <button onClick={onSubmit} className="bg-[#f17373] w-full text-white py-1 text-sm rounded">
                                Simpan
                            </button>
                            <button onClick={() => {
                                setModalFilter(false)
                            }} className="border w-full border-gray-500 py-1 text-sm rounded">
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

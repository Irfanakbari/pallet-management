import ModalLayout from "@/components/Modal/AddModalLayout";

export default function EditModalLayout({ onSubmit, reset, register, selectedCell }) {
    return (
        <ModalLayout onSubmit={onSubmit} reset={reset}>
            <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Kode : </label>
                    <input disabled defaultValue={selectedCell.kode} {...register("kode")} className="border border-gray-300 p-1 flex-grow" />
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Customer : </label>
                    <input disabled defaultValue={selectedCell.customer} {...register("customer")} className="border border-gray-300 p-1 flex-grow" />
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Department : </label>
                    <input disabled defaultValue={selectedCell.department} {...register("department")} className="border border-gray-300 p-1 flex-grow" />
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Nama Vehicle : </label>
                    <input defaultValue={selectedCell.name} {...register("name")} className="border border-gray-300 p-1 flex-grow" />
                </div>
            </div>
        </ModalLayout>
    );
}

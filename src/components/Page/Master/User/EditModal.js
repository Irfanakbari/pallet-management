import ModalLayout from "@/components/Modal/AddModalLayout";

export default function EditModalLayout({ onSubmit, reset, register ,record}) {
    return (
        <ModalLayout onSubmit={onSubmit} reset={reset}>
            <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Username : </label>
                    <input defaultValue={record.username} disabled className="border border-gray-300 p-1 flex-grow" />
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Password : </label>
                    <input {...register("password")} type={'password'} className="border border-gray-300 p-1 flex-grow" />
                </div>
            </div>
        </ModalLayout>
    );
}

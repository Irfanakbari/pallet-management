import ModalLayout from "@/components/Modal/AddModalLayout";
import {dataState} from "@/context/states";

export default function AddModalLayout({ onSubmit, reset, register ,watch}) {
    const {listDepartment} = dataState()

    return (
        <ModalLayout onSubmit={onSubmit} reset={reset}>
            <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Username : </label>
                    <input {...register("username")} className="border border-gray-300 p-1 flex-grow" />
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Password : </label>
                    <input type={'password'} {...register("password")} className="border border-gray-300 p-1 flex-grow" />
                </div>
                <div className="flex flex-row w-full justify-between items-center gap-2">
                    <label className="w-1/4">Role User :</label>
                    <select {...register("role")} className="border border-gray-300 p-1 flex-grow" >
                        <option value={'super'}>Super Admin</option>
                        <option value={'admin'}>Admin Department</option>
                        <option value={'viewer'}>Viewer</option>
                        <option value={'operator'}>Operator</option>
                    </select>
                </div>
                {
                    (watch('role') === 'admin' || watch('role') === 'viewer' ) && <div className="flex flex-row w-full justify-between items-center gap-2">
                        <label className="w-1/4">Department :</label>
                        <div className="border border-gray-300 p-1 flex-grow flex flex-col">
                            {
                                listDepartment.map((e, index)=>(
                                    <label key={index}>
                                        <input
                                            type="checkbox"
                                            name="department"
                                            value={e.kode}
                                            {...register("department")}
                                        />
                                        {
                                            e.name
                                        }
                                    </label>
                                ))
                            }
                        </div>
                    </div>
                }
            </div>
        </ModalLayout>
    );
}

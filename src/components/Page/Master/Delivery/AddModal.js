import ModalLayout from "@/components/Modal/AddModalLayout";
import {dataState} from "@/context/states";

export default function AddModalLayout({onSubmit, reset, register, watch}) {
	const {listPart, listDestination} = dataState()

	return (
		<ModalLayout onSubmit={onSubmit} reset={reset}>
			<div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm">
				<div className="flex flex-row w-full justify-between items-center gap-2">
					<label className="w-1/4">Kode Delivery : </label>
					<input required {...register("kode")} className="border border-gray-300 p-1 flex-grow"/>
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
					<label className="w-1/4">Total Pallet : </label>
					<input type={'number'} required {...register("total_pallet")} className="border border-gray-300 p-1 flex-grow"/>
				</div>
				<div className="flex flex-row w-full justify-between items-center gap-2">
					<label className="w-1/4">Tanggal Delivery : </label>
					<input type={'date'} required {...register("tanggal")} className="border border-gray-300 p-1 flex-grow"/>
				</div>
				<div className="flex flex-row w-full justify-between items-center gap-2">
					<label className="w-1/4">Tujuan : </label>
					<select {...register("tujuan")} className="border border-gray-300 p-1 flex-grow">
						<option value="-" selected>Pilih Tujuan</option> {/* Default value */}
						{listDestination
							.filter((destination) => destination.part === watch('part')) // Menggunakan filter daripada find
							.map((destination, index) => (
								<option key={index} value={destination.name}>
									{destination.name}
								</option>
							))}
					</select>
				</div>
				<div className="flex flex-row w-full justify-between items-center gap-2">
					<label className="w-1/4">Sopir : </label>
					<input required {...register("sopir")} className="border border-gray-300 p-1 flex-grow"/>
				</div>
				<div className="flex flex-row w-full justify-between items-center gap-2">
					<label className="w-1/4">No. Polisi Mobil : </label>
					<input required {...register("no_pol")} className="border border-gray-300 p-1 flex-grow"/>
				</div>

			</div>
		</ModalLayout>
	);
}

import {FaRegWindowMaximize} from "react-icons/fa";
import {ImCross} from "react-icons/im";
import {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import {modalState} from "@/context/states";
import dayjs from "dayjs";
import {useReactToPrint} from "react-to-print";
import Image from "next/image";
import {Table} from "antd";

export default function DetailPalletSlow({selected}) {
	const {setModal} = modalState();
	const [data, setData] = useState([]);
	const componentRef = useRef(null);
	const currentDate = dayjs(); // Ambil tanggal dan waktu saat ini
	const formattedDate = currentDate.format('DD MMMM YYYY HH:mm [WIB]');

	const reactToPrintContent = useCallback(() => {
		return componentRef.current;
	}, [componentRef.current]);

	const handlePrint = useReactToPrint({
		content: reactToPrintContent,
		documentTitle: "Laporan Pallet Slow Move " + selected,
		onAfterPrint: () => setModal(false),
		removeAfterPrint: true,
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = () => {
		axios.get('/api/dashboard/slowmove/' + selected).then(r => {
			setData(r.data['data']);
		});
	};

	return (
		<>
			{/* Tampilan modal detail */}
			{data.length > 0 && (
				<div
					className="fixed bg-black h-full bg-opacity-20 flex items-center justify-center top-0 left-0 z-[5000] w-full outline-none">
					<div className="h-2/3 w-2/3 flex flex-col rounded bg-white border-4 border-base">
						<div
							className="w-full flex items-center justify-between bg-base font-light py-1 px-2 text-white text-sm">
							<div className="flex items-center gap-2">
								<FaRegWindowMaximize/>
								Detail Pallet Belum Kembali
							</div>
							<div onClick={() => setModal(false)} className="hover:bg-red-800 p-1">
								<ImCross size={10}/>
							</div>
						</div>
						<div className="p-2 flex flex-col gap-5 h-full w-full overflow-y-scroll ">
							<div
								className="border bottom-0 border-gray-300 w-full p-3 flex flex-col gap-3 text-sm mb-2">
								<div className="flex flex-row justify-center gap-2 text-white">
									<button onClick={() => {
										handlePrint()
									}} className="w-full py-1 text-sm rounded bg-blue-600">
										Print
									</button>
									<button onClick={() => {
										setModal(false)
									}} className="w-full py-1 text-sm rounded bg-red-600">
										Batal
									</button>
								</div>
							</div>
							<div className={`border bottom-0 border-gray-300 w-full p-3 gap-3 text-sm mb-2 flex-grow`}>
								<div ref={componentRef} className={`text-black text-sm`}>
									<div className="w-full flex flex-col">
										<div className={`flex gap-4 items-center print-header`}>
											<Image src={'/logos.png'} alt={'Logo'} width={120} height={120}/>
											<div className={`flex flex-col`}>
												<h2 className="font-bold text-xl">Data Pallet Slow Moving</h2>
												<h3>Tanggal : {formattedDate}</h3>
												<h3>Customer : {selected}</h3>
											</div>
										</div>
										<Table
											bordered
											style={{
												width: "100%",
											}}
											rowKey={'part'}
											columns={[
												{
													title: '#',
													dataIndex: 'index',
													render: (_, __, index) => index + 1
												},
												{
													title: 'Kode Pallet',
													dataIndex: 'kode',
													render: (_, record) => (record['id_pallet'])
												},
												{
													title: 'Nama Part',
													dataIndex: 'part',
													render: (_, record) => (record['Pallet']['Part']['name'])
												},
												{
													title: 'Customer',
													dataIndex: 'Keluar',
													render: (_, record) => (record['Pallet']['Customer']['name'])
												},
												{
													title: 'Last Update',
													dataIndex: 'last_update',
													render: (_, record) => (dayjs(record['Pallet']['updated_at']).locale('id').format('DD MMMM YYYY HH:mm'))
												},
											]}
											components={{
												body: {
													cell: (props) => {
														return <td {...props} style={{padding: '4px 8px'}}/>;
													},
												},
											}}
											rowClassName={'text-[12px]'}
											dataSource={data}
											pagination={false}
											size={'small'}/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				// <div className="fixed h-full bg-black bg-opacity-20 flex items-center justify-center top-0 left-0 z-[5000] w-full overflow-x-hidden outline-none">
				//     <div className="h-2/3 md:w-2/4 w-full flex flex-col rounded bg-white border-4 border-base">
				//         {/* Header modal */}
				//         <div className="w-full flex items-center justify-between bg-base font-light py-1 px-2 text-white text-sm">
				//             <div className="flex items-center gap-2">
				//                 <FaRegWindowMaximize />
				//                 Detail Pallet Belum Kembali
				//             </div>
				//             <div onClick={() => setModal(false)} className="hover:bg-red-800 p-1">
				//                 <ImCross size={10} />
				//             </div>
				//         </div>
				//
				//         {/* Konten modal */}
				//         <div ref={componentRef} className="p-2 flex flex-col gap-5 h-full overflow-y-auto w-full">
				//             {/* Informasi header cetakan */}
				//             <div className="text-black text-sm">
				//                 <div className="w-full flex flex-col">
				//                     <div className="flex gap-4 items-center print-header">
				//                         <Image src="/logos.png" alt="Logo" width={120} height={120} />
				//                         <div className="flex flex-col">
				//                             <h2 className="font-bold text-xl">Data Pallet Slow Moving</h2>
				//                             <h3>Tanggal : {formattedDate}</h3>
				//                             <h3>Customer : {selected}</h3>
				//                         </div>
				//                     </div>
				//
				//                     {/* Tabel data */}
				//                     <table className="w-full print-table">
				//                         <thead>
				//                         <tr>
				//                             <th className="text-center bg-gray-100 w-10">#</th>
				//                             <th className="bg-gray-100">ID Pallet</th>
				//                             <th className="bg-gray-100">Nama Part</th>
				//                             <th className="bg-gray-100">Customer</th>
				//                             <th className="bg-gray-100">Last Update</th>
				//                         </tr>
				//                         </thead>
				//                         <tbody>
				//                         {data.map((e, index) => (
				//                             <tr className="font-semibold border-b border-gray-500" key={index}>
				//                                 <td className="text-center py-1">{index + 1}</td>
				//                                 <td className="px-4">{e['id_pallet']}</td>
				//                                 <td className="px-4">{e['Pallet']['Part']['name']}</td>
				//                                 <td className="px-4">{e['Pallet']['Customer']['name']}</td>
				//                                 <td className="px-4">{dayjs(e['Pallet']['updated_at']).locale('id').format('DD MMMM YYYY HH:mm')}</td>
				//                             </tr>
				//                         ))}
				//                         </tbody>
				//                     </table>
				//                 </div>
				//             </div>
				//         </div>
				//
				//         {/* Tombol Print dan Batal */}
				//         <div className="border border-gray-300 w-full p-3 flex flex-col gap-3 text-sm mb-6">
				//             <div className="flex flex-row justify-center gap-2 text-black">
				//                 <button onClick={handlePrint} className="border w-full border-gray-500 py-1 text-sm rounded">
				//                     Print
				//                 </button>
				//                 <button onClick={() => setModal(false)} className="border w-full border-gray-500 py-1 text-sm rounded">
				//                     Batal
				//                 </button>
				//             </div>
				//         </div>
				//     </div>
				// </div>
			)}
		</>
	);
}

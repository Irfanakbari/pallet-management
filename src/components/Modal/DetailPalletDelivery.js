import {FaRegWindowMaximize} from "react-icons/fa";
import {ImCross} from "react-icons/im";
import {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";
import {modalState} from "@/context/states";
import dayjs from "dayjs";
import {useReactToPrint} from "react-to-print";
import Image from "next/image";
import { Descriptions, List } from "antd";
import {QRCode} from "react-qrcode-logo";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import axiosInstance from "@/utils/interceptor";


export default function DetailPalletDelivery({selected}) {
	const {setModal} = modalState();
	const [data, setData] = useState({});
	const componentRef = useRef(null);
	const currentDate = dayjs(); // Ambil tanggal dan waktu saat ini
	const formattedDate = currentDate.format('DD MMMM YYYY HH:mm [WIB]');

	const reactToPrintContent = useCallback(() => {
		return componentRef.current;
	}, [componentRef.current]);

	const handlePrint = useReactToPrint({
		content: reactToPrintContent,
		documentTitle: "Laporan Detail Delivery" + selected,
		onAfterPrint: () => setModal(false),
		removeAfterPrint: true,
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = () => {
		axios.get('/api/delivery/' + selected).then(r => {
			setData(r.data['data']);
		});
	};

	const handleConvertToImage = () => {
		html2canvas(componentRef.current, {scale: 3}).then((canvas) => {
			const image = canvas.toDataURL('image/png', 100);
			const link = document.createElement('a');
			link.href = image;
			link.download = 'component.png';
			link.click();
		});
	};

	const handleConvertToPDF = () => {
		const element = componentRef.current;

		// Mengukur ukuran elemen HTML target
		const width = element.offsetWidth;
		const height = element.offsetHeight;

		// Membuat elemen canvas sesuai dengan ukuran elemen HTML
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		// Mengonversi elemen HTML ke canvas dengan ukuran yang sesuai
		html2canvas(element, { canvas: canvas, scale: 3 }).then((canvas) => {
			const imgData = canvas.toDataURL('image/png');
			const dpi = 300; // Tentukan DPI yang diinginkan (misalnya 300 untuk kualitas tinggi)
			const pdf = new jsPDF({
				unit: 'px',
				format: [width * 0.5, height * 0.5],
				precision: dpi / 25.4,
			});
			pdf.addImage(imgData, 'PNG', 0, 0, width, height);
			pdf.save('component.pdf');
		});
	};




	const handleSendEmail = () => {
		// Mengonversi komponen ke gambar PNG
		html2canvas(componentRef.current, {scale: 4}).then(async (canvas) => {
			const imageData = canvas.toDataURL('image/png', 100);
			const blob = new Blob([imageData],  { type: "image/png" })
			// Mengonversi gambar ke PDF (opsional)
			const pdf = new jsPDF();
			pdf.addImage({
				imageData: imageData,
				format: 'PNG',
			});
			const pdfData = pdf.output('blob');

			// Mengirim email dengan lampiran gambar PNG atau PDF
			const formData = new FormData();
			// formData.append('image', pdfData, 'component.png'); // Ganti 'component.png' menjadi 'component.pdf' jika ingin menggunakan format PDF
			formData.append('to', 'selpian@vuteq.co.id');
			formData.append('subject', 'Pallet Delivery Receipt ' + data['id']);
			formData.append('text', 'Body of the Email');
			formData.append('attachments', blob, `Receipt ${data['id']}.png`); // Menggunakan file input untuk memilih lampiran

			try {
				const response = await fetch('/api/utils/email', {
					method: 'POST',
					body: formData,
				});

				if (response.ok) {
					const data = await response.json();
					showSuccessToast('Sukses Kirim Email');
				} else {
					// console.error('Failed to send email');
					showErrorToast("Gagal Kirim Email");
				}
			} catch (error) {
				showErrorToast("Gagal Kirim Email");
			}
		});
	};

	async function handleApprove(e) {
		e.preventDefault();
		try {
			await axiosInstance.put('/api/delivery/'+ selected, {
				status: 1
			});
			showSuccessToast('Sukses Approve Delivery');
		} catch (error) {
			showErrorToast(error.response.data.data);
		}
	}

	return (
		<>
			{/* Tampilan modal detail */}
			{data && (
				<div
					className="fixed bg-black h-full bg-opacity-20 flex items-center justify-center top-0 left-0 z-[5000] w-full outline-none">
					<div className="h-2/3 w-1/3 flex flex-col rounded bg-white border-4 border-base">
						<div
							className="w-full flex items-center justify-between bg-base font-light py-1 px-2 text-white text-sm">
							<div className="flex items-center gap-2">
								<FaRegWindowMaximize/>
								Detail Pallet Delivery {selected}
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
									<button onClick={handleApprove} className="w-full py-1 text-sm rounded bg-green-600">
										Approve
									</button>
									<button onClick={() => {
										handleSendEmail()
									}} className="w-full py-1 text-sm rounded bg-pink-600">
										SendEmail
									</button>
									<button onClick={() => {
										setModal(false)
									}} className="w-full py-1 text-sm rounded bg-red-600">
										Batal
									</button>
								</div>
							</div>
							<div className={`border bottom-0 border-gray-300 p-3 gap-3 text-sm mb-2 flex-grow`}>
								<div ref={componentRef} className={`text-black text-sm p-5`}>
									<div className="w-full flex flex-col">
										<div className={`flex gap-4 items-center print-header bg-base p-2`}>
											<div className={`flex flex-col items-center`}>
												<h2 className="font-bold text-lg text-white">PT VUTEQ INDONESIA</h2>
												{/*<Image src={'/logos.png'} alt={'Logo'} width={100} height={100}/>*/}

												{/*<h3>Tanggal : {formattedDate}</h3>*/}
												{/*<h3>Kode Delivery : {selected}</h3>*/}
												{/*<h3>Total Pallet : {data['total_pallet'] ?? 0}</h3>*/}
											</div>
											<div className={`flex-grow flex justify-end`}>
												<QRCode
													ecLevel={'Q'}
													size={55}
													value={data['id']}
													qrStyle={'squares'} />
											</div>
										</div>
										<Descriptions
											className={`mt-2`}
											bordered
											column={1}
											// title="Data Delivery"
											size={'small'}
											// extra={<Button type="primary">Edit</Button>}
											items={[
												{
													key: '1',
													label: 'Delivery ID',
													children: <b>{data['id']}</b>,
													span: 2
												},
												{
													key: '2',
													label: 'Delivery Code',
													children: <b>{data['kode_delivery']}</b>,
													span: 2
												},
												{
													key: '3',
													label: 'Part Name',
													children: data['Part'] && data['part'] + ' - ' + data['Part']['name']    ,
													span: 2
												},
												{
													key: '4',
													label: 'Tujuan',
													children: data['tujuan'],
												},
												{
													key: '5',
													label: 'Delivery Date',
													children: dayjs(data['tanggal_delivery']).locale('id-ID').format('DD MMMM YYYY'),
												},
												{
													key: '6',
													label: 'Total Pallet',
													children: data['total_pallet'],
												},
												{
													key: '7',
													label: 'Status',
													children: data['isCukup'] ? 'Lengkap' : 'Tidak Lengkap',
												},
												{
													key: '1',
													label: 'Nama Supir',
													children: data['sopir'],
												},
												{
													key: '2',
													label: 'Nomor Polisi',
													children: data['no_pol'],
												},
											]}
										/>
										<div className={`mt-4`}>
											<List
												size="small"
												header={<div>List Pallet From Vuteq</div>}
												// footer={<div>Footer</div>}
												bordered
												dataSource={data['PalletDeliveries']}
												renderItem={(item, index) => <List.Item>{(index +1) + ' - '+item['History']['id_pallet']+ ' - '+item['History']['user_out']}</List.Item>}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

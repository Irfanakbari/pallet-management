import {BiRefresh} from "react-icons/bi";
import {useEffect, useState} from "react";
import {showErrorToast} from "@/utils/toast";
import {dataState} from "@/context/states";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Button, Input, Space, Spin, Table} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import ExcelJS from "exceljs";
import dayjs from "dayjs";
import {AiFillFileExcel} from "react-icons/ai";

export default function DataSO() {
	const {listCustomer, listVehicle, listPart, user, listDepartment} = dataState()
	const [listPallet, setPallet] = useState([])
	const [loading, setLoading] = useState(true)
	const [filterParams, setFilterParams] = useState({
		search: '',
		customer: '',
		vehicle: '',
		part: '',
		department: '',
		status: ''
	});
	// const [pagination, setPagination] = useState({
	// 	current: 1,
	// 	pageSize: 30,
	// });

	const getColumnSearchProps = (dataIndex) => ({
		filterDropdown: ({setSelectedKeys, selectedKeys, confirm, close}) => (
			<div
				style={{
					padding: 8,
				}}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<Input
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => confirm}
					style={{
						marginBottom: 8,
						display: 'block',
					}}
				/>
				<Space>
					<Button
						type={'primary'}
						size="small"
						style={{
							width: 90,
						}}
						onClick={() => confirm({
							closeDropdown: false,
						})}
					>
						Search
					</Button>
					<Button
						style={{
							width: 90,
						}}
						size="small"
						onClick={() => {
							close();
						}}
					>
						Close
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered) => (
			<SearchOutlined
				style={{
					color: filtered ? '#1890ff' : undefined,
				}}
			/>
		),
		onFilter: (value, record) =>
			record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
	});

	useEffect(() => {
		setPallet([]); // Reset the selected page when the component unmounts
		fetchData()
	}, [])

	const fetchData = () => {
		// const {current, pageSize} = pagination;
		const {search, customer, vehicle, part, department, status} = filterParams;
		const url = `/api/so/data?search=${search}&customer=${customer}&vehicle=${vehicle}&department=${department}&part=${part}&status=${status || ''}`;
		axiosInstance.get(url).then(response => {
			setPallet(response.data);
		}).catch((e) => {
			showErrorToast(e.response.data['data'] || "Gagal Fetch Data")
		}).finally(() => {
			setLoading(false)
		})
	};

	const onChange = (pagination, filters) => {
		setLoading(true)
		const searchParam = (filters?.kode && filters?.kode[0]) || '';
		const customerParam = (filters?.customer && filters?.customer[0]) || '';
		const vehicleParam = (filters?.vehicle && filters?.vehicle[0]) || '';
		const partParam = (filters?.part && filters?.part[0]) || '';
		const department = (filters?.department && filters?.department[0]) || '';
		const status = (filters?.status && filters?.status[0]) || '';

		// setPagination(pagination)
		setFilterParams({
			customer: customerParam,
			vehicle: vehicleParam,
			part: partParam,
			search: searchParam,
			department: department,
			status: status
		})
		const url = `/api/so/data?search=${searchParam}&customer=${customerParam || ''}&vehicle=${vehicleParam || ''}&part=${partParam || ''}&department=${department || ''}&status=${status || ''}`;
		axiosInstance.get(url)
		             .then(response => {
			             setPallet(response.data);
		             })
		             .catch(() => {
			             showErrorToast("Gagal Fetch Data");
		             })
		             .finally(() => {
			             setLoading(false);
		             });

	};

	const columns = [
		{
			title: '#',
			dataIndex: 'index',
			width: 50,
			fixed: 'left',
			render: (_, __, index) => index + 1
		},
		{
			title: 'Kode Pallet',
			dataIndex: 'kode',
			sorter: (a, b) => a.kode.localeCompare(b.kode),
			width: 200,
			fixed: 'left',
			...getColumnSearchProps('kode'),

		},
		// {
		// 	title: 'Nama Pallet',
		// 	dataIndex: 'name',
		// 	width: 350,
		// },
		{
			title: 'Customer',
			dataIndex: 'customer',
			width: 350,
			sorter: (a, b) => a.customer.localeCompare(b.customer),
			filters: listCustomer.map(e => (
				{
					text: e.name,
					value: e.kode
				}
			)),
			filterMultiple: false,
			onFilter: (value, record) => record.customer.indexOf(value) === 0,
			render: (_, record) => record.customer + " - " + record['Customer'].name
		},
		{
			title: 'Vehicle',
			dataIndex: 'vehicle',
			width: 350,
			sorter: (a, b) => a.vehicle.localeCompare(b.vehicle),
			filterMultiple: false,
			filters: listVehicle.map(e => (
				{
					text: e.name,
					value: e.kode
				}
			)),
			onFilter: (value, record) => record.vehicle.indexOf(value) === 0,
			render: (_, record) => record.vehicle + " - " + record['Vehicle'].name
		},
		{
			title: 'Part',
			dataIndex: 'part',
			width: 450,
			sorter: (a, b) => a.part.localeCompare(b.part),
			filterMultiple: false,
			filters: listPart.map(e => (
				{
					text: e.name,
					value: e.kode
				}
			)),
			onFilter: (value, record) => record.part.indexOf(value) === 0,
			render: (_, record) => record.part + " - " + record['Part'].name
		},
		{
			title: 'Department',
			dataIndex: 'department',
			width: 250,
			filterMultiple: false,
			sorter: (a, b) => a['Vehicle'].department.localeCompare(b['Vehicle'].department),
			filters: listDepartment.map(e => (
				{
					text: e.name,
					value: e.kode
				}
			)),
			onFilter: (value, record) => record['Vehicle'].department.indexOf(value) === 0,
			render: (_, record) => "Produksi " + record['Vehicle'].department
		},

		{
			title: 'Status SO',
			dataIndex: 'status',
			width: 350,
			filterMultiple: false,
			render: (_, record) => {
				const statusText = record.status === 0 ? 'Belum' : 'Sudah';
				const backgroundColor = record.status === 0 ? 'red' : 'green'; // Ubah warna latar belakang sesuai kondisi

				return (
					<div style={{backgroundColor, color: 'white', padding: '4px'}}>
						{statusText}
					</div>
				);
			},
			filters: [
				{
					text: 'Belum',
					value: 0
				},
				{
					text: 'Sudah',
					value: 1
				}
			],
			onFilter: (value, record) => record.status === value,
			sorter: (a, b) => {
				// Menggunakan nilai numerik untuk penyortiran
				const statusValueA = a.status === 0 ? 0 : 1;
				const statusValueB = b.status === 0 ? 0 : 1;
				return statusValueA - statusValueB;
			},
		},
		{
			title: 'Scanned At',
			dataIndex: 'scanned_at',
			width: 250,
			render: (_, record) => record.scanned_at ? dayjs(record['scanned_at']['scanned_at']).locale('id').format('DD MMMM YYYY HH:mm') : '-'
		},
	];

	const saveExcel = async (e) => {
		e.preventDefault();
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet("Laporan Opname Pallet", {
			headerFooter: {firstHeader: "Hello Exceljs", firstFooter: "Hello World"},
			pageSetup: {paperSize: 9, orientation: 'landscape'}
		});
		sheet.getCell('A1:I1').fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: '0366fc'}
		}
		sheet.getCell('B1').fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: '0366fc'}
		}
		sheet.getCell('C1').fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: '0366fc'}
		}
		sheet.getCell('D1').fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: '0366fc'}
		}
		sheet.getCell('E1').fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: '0366fc'}
		}
		sheet.getCell('F1').fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: '0366fc'}
		}
		sheet.getCell('G1').fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: '0366fc'}
		}
		sheet.getCell('H1').fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: '0366fc'}
		}
		sheet.getCell('I1').fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: {argb: '0366fc'}
		}
		sheet.columns = [
			{
				header: "No",
				key: "no",
				width: 4,
			},
			{
				header: "Kode Pallet",
				key: "kode",
				width: 25,
			},
			{
				header: "Customer",
				key: "customer",
				width: 20,
			},
			{
				header: "Vehicle",
				key: "vehicle",
				width: 24,
			},
			{
				header: "Part",
				key: "part",
				width: 32,
			},
			{
				header: "Department",
				key: "department",
				width: 27,
			},
			{
				header: "Status",
				key: "status",
				width: 13,
			},
			{
				header: "Scanned At",
				key: "scanned_at",
				width: 25,
			},
		];
		listPallet.data.map((item, index) => {
			const statusText = item['status'] === 1 ? 'Sudah' : 'Belum';
			const statusColor = item['status'] === 1 ? { argb: '00FF00' } : { argb: 'FF0000' }; // Warna hijau jika status adalah 1, merah jika tidak

			sheet.addRow({
				no: index + 1,
				kode: item.kode ?? '-',
				customer: item.customer?
					item.customer + " - " + item['Customer'].name
					: '-',
				vehicle: item['vehicle']
					? item.vehicle + " - " + item['Vehicle'].name
					: '-',
				part: item['part']
					? `${item['part']} - ${item['Part'].name}`
					: '-',
				department: item['Vehicle']['department']
					? "Produksi " + item['Vehicle'].department
					: '-',
				status:statusText,
				scanned_at: item['scanned_at']
					? dayjs(item['scanned_at']['scanned_at']).locale('id').format('DD MMMM YYYY HH:mm')
					: '-',
			});
			// Mendapatkan baris terakhir yang telah ditambahkan
			const currentRow = sheet.lastRow;

			// Memeriksa apakah status adalah 1 (Sudah) dan menerapkan warna hijau pada cell 'Status'
			if (item['status'] === 1) {
				currentRow.getCell('G').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: statusColor,
				};
			}     else {
				currentRow.getCell('G').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: statusColor,
				};
			}
		});

		await workbook.xlsx.writeBuffer().then(data => {
			const blob = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet'})
			const url = window.URL.createObjectURL(blob)
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = 'Lap. Data SO.xlsx';
			anchor.click();
			window.URL.revokeObjectURL(anchor);
		})
	};

	return (
		<>
			<Head>
				<title>Pallet | PT Vuteq Indonesia</title>
			</Head>
			<div className={`bg-white h-full flex flex-col`}>
				<div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
					<div onClick={saveExcel}
						 className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
						<AiFillFileExcel size={12}/>
						<p className="text-white font-bold text-sm">Excel</p>
					</div>
					<div
						onClick={() => fetchData()}
						className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
						<BiRefresh size={12}/>
						<p className={`text-white font-bold text-sm`}>Refresh</p>
					</div>
				</div>
				<div className={`w-full bg-white p-2 flex-grow overflow-hidden`}>
					<Table
						loading={
							loading && <Spin tip="Loading..." delay={1500}/>
						}
						bordered
						scroll={{
							y: "68vh",
							x: "100vw",
						}}
						style={{
							width: "100%"
						}}
						rowKey={'kode'}
						columns={columns}
						dataSource={listPallet.data}
						onChange={onChange}
						size={'small'}
						rowClassName="editable-row"
						// pagination={false}
						pagination={{
							total: listPallet.totalData,
							defaultPageSize: 100,
							pageSizeOptions: [100, 200, 1000],
							showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
						}}
					/>
				</div>
			</div>
		</>
	)
}
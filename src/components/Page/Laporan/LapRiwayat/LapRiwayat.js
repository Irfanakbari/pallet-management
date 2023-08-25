import {BiRefresh} from "react-icons/bi";
import {AiFillFileExcel} from "react-icons/ai";
import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import ExcelJS from "exceljs"
import {showErrorToast} from "@/utils/toast";
import {dataState} from "@/context/states";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Button, DatePicker, Input, Space, Spin, Table} from "antd";
import {CalendarOutlined, SearchOutlined} from "@ant-design/icons";
import PrintAll from "@/components/Page/Laporan/LapRiwayat/Print";

export default function LapRiwayat() {
	const [dataHistory, setDataHistory] = useState([]);
	const [filters, setFilters] = useState([]);
	const {listCustomer, listVehicle, listPart} = dataState()
	const [loading, setLoading] = useState(true)
	const {RangePicker} = DatePicker;

	useEffect(() => {
		fetchData();
	}, []);


	const fetchData = () => {
		setLoading(true)
		axiosInstance.get(`/api/history?page=1`).then(response => {
			setDataHistory(response.data);
			setFilters(response.data['data']);
		}).catch(() => {
			showErrorToast("Gagal Fetch Data");
		}).finally(() => {
			setLoading(false)
		})
	};

	const isMoreThanAWeekAgoAndNoEntry = (keluar, masuk) => {
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		// Parse tanggal 'keluar' menjadi objek Date
		const keluarDate = new Date(keluar);
		// Memeriksa apakah 'keluarDate' lebih dari seminggu lalu
		const isMoreThanAWeekAgo = keluarDate < oneWeekAgo;
		// Memeriksa apakah 'masuk' kosong atau bernilai null
		const isEntryEmpty = !masuk || false;
		return isMoreThanAWeekAgo && isEntryEmpty;
	};

	const saveExcel = async (e) => {
		e.preventDefault();
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet("My Sheet", {
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
		sheet.getRow(1).font = {
			size: 12,
			bold: true,
			color: {argb: 'FFFFFF'}
		}
		sheet.columns = [
			{
				header: "No",
				key: "no",
				width: 4,
			},
			{
				header: "Kode Pallet",
				key: "id",
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
				header: "Keluar",
				key: "keluar",
				width: 27,
			},
			{
				header: "Operator Out",
				key: "user_out",
				width: 13,
			},
			{
				header: "Masuk",
				key: "masuk",
				width: 27,
			},
			{
				header: "Operator In",
				key: "user_in",
				width: 13,
			},
		];
		filters.map((item, index) => {
			sheet.addRow({
				no: index + 1,
				id: item.id_pallet,
				customer: `${item['Pallet']['Customer'].kode} - ${item['Pallet']['Customer'].name}`,
				vehicle: `${item['Pallet']['Vehicle'].kode} - ${item['Pallet']['Vehicle'].name}`,
				part: `${item['Pallet']['Part'].kode} - ${item['Pallet']['Part'].name}`,
				keluar: item['keluar'] ? dayjs(item['keluar']).locale('id').format('DD MMMM YYYY HH:mm') : '-',
				user_out: item['user_out'],
				masuk: item['masuk'] ? dayjs(item['masuk']).locale('id').format('DD MMMM YYYY HH:mm') : '-',
				user_in: item['user_in'],
			});
		});
		await workbook.xlsx.writeBuffer().then(data => {
			const blob = new Blob([data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet'})
			const url = window.URL.createObjectURL(blob)
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = 'Lap. Riwayat.xlsx';
			anchor.click();
			window.URL.revokeObjectURL(anchor);
		})
	};

	const onChange = (pagination, filters, sorter, extra) => {
		setLoading(true)
		console.log('params', pagination, filters, sorter, extra);
		const searchParam = (filters?.kode && filters?.kode[0]) || '';
		const keluarStart = (filters?.keluar && filters?.keluar[0][0]) || '';
		const keluarEnd = (filters?.keluar && filters?.keluar[0][1]) || '';
		const masukStart = (filters?.masuk && filters?.masuk[0][0]) || '';
		const masukEnd = (filters?.masuk && filters?.masuk[0][1]) || '';
		const customerParam = (filters?.customer && filters?.customer[0]) || '';
		const vehicleParam = (filters?.vehicle && filters?.vehicle[0]) || '';
		const partParam = (filters?.part && filters?.part[0]) || '';
		// Parse the original date strings
		// Parse the original date strings
		const parsedKeluarStart = dayjs(keluarStart);
		const parsedKeluarEnd = dayjs(keluarEnd);
		const parsedMasukStart = dayjs(masukStart);
		const parsedMasukEnd = dayjs(masukEnd);

		const formattedKeluarStart = parsedKeluarStart.isValid() ? parsedKeluarStart.format('YYYY-MM-DD') : '';
		const formattedKeluarEnd = parsedKeluarEnd.isValid() ? parsedKeluarEnd.format('YYYY-MM-DD') : '';
		const formattedMasukStart = parsedMasukStart.isValid() ? parsedMasukStart.format('YYYY-MM-DD') : '';
		const formattedMasukEnd = parsedMasukEnd.isValid() ? parsedMasukEnd.format('YYYY-MM-DD') : '';

		const url = `/api/history?search=${searchParam}&customer=${customerParam || ''}&vehicle=${vehicleParam || ''}&part=${partParam || ''}&keluarStart=${formattedKeluarStart || ''}&keluarEnd=${formattedKeluarEnd || ''}&masukStart=${formattedMasukStart || ''}&masukEnd=${formattedMasukEnd || ''}&page=${pagination.current}&limit=${pagination.pageSize}`;
		axiosInstance.get(url)
		             .then(response => {
			             setDataHistory(response.data);
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
			width: 100,
			fixed: 'left',
			render: (_, __, index) => (dataHistory.currentPage - 1) * dataHistory.limit + index + 1
		},
		{
			title: 'Kode Pallet',
			dataIndex: 'id_pallet',
			fixed: 'left',
			width: 200,
			filterDropdown: ({setSelectedKeys, selectedKeys, confirm, close}) => (
				<div
					style={{
						padding: 8,
					}}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<Input
						placeholder={`Search Kode`}
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
							onClick={() => {
								confirm({
									closeDropdown: false,
								});
							}}>
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
				record['id_pallet'].toString().toLowerCase().includes(value.toLowerCase()),
			sorter: (a, b) => a.id_pallet.localeCompare(b.id_pallet),
		},
		{
			title: 'Customer',
			dataIndex: 'customer',
			sorter: (a, b) => {
				const customerA = a['Pallet']?.customer || '';
				const customerB = b['Pallet']?.customer || '';
				return customerA.localeCompare(customerB);
			},
			filters: listCustomer.map(e => ({
				text: e.name,
				value: e.kode
			})),
			width: 400,
			filterMultiple: false,
			onFilter: (value, record) => (record['Pallet']?.customer || '').indexOf(value) === 0,
			render: (_, record) => {
				const customer = record['Pallet']?.['Customer'];
				return customer ? customer['kode'] + ' - ' + customer['name'] : '-';
			}
		},
		{
			title: 'Vehicle',
			dataIndex: 'vehicle',
			sorter: (a, b) => {
				const vehicleA = a['Pallet']?.vehicle || '';
				const vehicleB = b['Pallet']?.vehicle || '';
				return vehicleA.localeCompare(vehicleB);
			},
			filterMultiple: false,
			filters: listVehicle.map(e => ({
				text: e.name,
				value: e.kode
			})),
			width: 400,
			onFilter: (value, record) => (record['Pallet']?.vehicle || '').indexOf(value) === 0,
			render: (_, record) => {
				const vehicle = record['Pallet']?.['Vehicle'];
				return vehicle ? vehicle['kode'] + ' - ' + vehicle['name'] : '-';
			}
		},
		{
			title: 'Part',
			dataIndex: 'part',
			sorter: (a, b) => {
				const partA = a['Pallet']?.part || '';
				const partB = b['Pallet']?.part || '';
				return partA.localeCompare(partB);
			},
			filterMultiple: false,
			width: 700,
			filters: listPart.map(e => ({
				text: e.name,
				value: e.kode
			})),
			onFilter: (value, record) => (record['Pallet']?.part || '').indexOf(value) === 0,
			render: (_, record) => {
				const part = record['Pallet']?.['Part'];
				return part ? part['kode'] + ' - ' + part['name'] : '-';
			}
		},
		{
			title: 'Destinasi',
			dataIndex: 'destination',
			width: 300,
			sorter: (a, b) => {
				const destinationA = a.destination || '';
				const destinationB = b.destination || '';
				return destinationA.localeCompare(destinationB);
			},
			render: (_, record) => record.destination ?? '-'
		},
		{
			title: 'Keluar',
			dataIndex: 'keluar',
			width: 400,
			sorter: (a, b) => {
				// Convert the 'keluar' values to Date objects for comparison
				const dateA = a['keluar'] ? new Date(a['keluar']) : null;
				const dateB = b['keluar'] ? new Date(b['keluar']) : null;
				// Handle cases when one of the dates is null
				if (!dateA && dateB) return -1;
				if (dateA && !dateB) return 1;
				if (!dateA && !dateB) return 0;
				// Compare the dates
				return dateA.getTime() - dateB.getTime();
			},
			filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}) => (
				<div
					style={{
						padding: 8,
					}}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<RangePicker
						style={{
							marginBottom: 8,
							width: "100%",
						}}
						value={selectedKeys[0]}
						onChange={newDateRange => {
							setSelectedKeys(newDateRange ? [newDateRange] : [])
						}}
					/>
					<Space>
						<Button
							type="primary"
							size="small"
							style={{
								width: 90,
							}}
							onClick={() => {
								confirm({
									closeDropdown: true,
								});
							}}
						>
							Filter
						</Button>
						<Button
							onClick={() => clearFilters}
							size="small"
							style={{
								width: 90,
							}}
						>
							Reset
						</Button>
						<Button
							type="link"
							size="small"
							onClick={() => {
								close();
							}}
						>
							close
						</Button>
					</Space>
				</div>
			),
			filterIcon: filtered => (
				<CalendarOutlined
					style={{
						color: filtered ? '#1890ff' : undefined,
					}}
				/>
			),
			render: (_, record) => {
				return record['keluar']
					? dayjs(record['keluar']).locale('id').format('DD MMMM YYYY HH:mm')
					: '-'
			}
		},
		{
			title: 'Operator Out',
			dataIndex: 'user_out',
			width: 200,
			sorter: (a, b) => a.user_out?.localeCompare(b.user_out),
			render: (_, record) => record['user_out'] ?? '-'
		},
		{
			title: 'Masuk',
			dataIndex: 'masuk',
			width: 400,
			sorter: (a, b) => {
				// Convert the 'keluar' values to Date objects for comparison
				const dateA = a['masuk'] ? new Date(a['masuk']) : null;
				const dateB = b['masuk'] ? new Date(b['masuk']) : null;
				// Handle cases when one of the dates is null
				if (!dateA && dateB) return -1;
				if (dateA && !dateB) return 1;
				if (!dateA && !dateB) return 0;
				// Compare the dates
				return dateA.getTime() - dateB.getTime();
			},
			filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}) => (
				<div
					style={{
						padding: 8,
					}}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<RangePicker
						style={{
							marginBottom: 8,
							width: "100%",
						}}
						value={selectedKeys[0]}
						onChange={newDateRange => {
							setSelectedKeys(newDateRange ? [newDateRange] : [])
						}}
					/>
					<Space>
						<Button
							type="primary"
							size="small"
							style={{
								width: 90,
							}}
							onClick={() => {
								confirm({
									closeDropdown: true,
								});
							}}
						>
							Filter
						</Button>
						<Button
							onClick={() => clearFilters}
							size="small"
							style={{
								width: 90,
							}}
						>
							Reset
						</Button>
						<Button
							type="link"
							size="small"
							onClick={() => {
								close();
							}}
						>
							close
						</Button>
					</Space>
				</div>
			),
			filterIcon: filtered => (
				<CalendarOutlined
					style={{
						color: filtered ? '#1890ff' : undefined,
					}}
				/>
			),
			render: (_, record) => {
				return record['masuk']
					? dayjs(record['masuk']).locale('id').format('DD MMMM YYYY HH:mm')
					: '-'
			}
		},
		{
			title: 'Operator In',
			dataIndex: 'user_in',
			width: 200,
			sorter: (a, b) => {
				const userInA = a.user_in || '';
				const userInB = b.user_in || '';
				return userInA.localeCompare(userInB);
			},
			render: (_, record) => record['user_in'] ?? '-'
		}
	];

	return (
		<>
			<Head>
				<title>Laporan Riwayat | PT Vuteq Indonesia</title>
			</Head>
			<div className={`bg-white h-full flex flex-col`}>
				<div className="w-full bg-base py-0.5 px-1 text-white flex flex-row">
					<PrintAll data={dataHistory}/>
					<div onClick={saveExcel}
					     className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
						<AiFillFileExcel size={12}/>
						<p className="text-white font-bold text-sm">Excel</p>
					</div>
					<div onClick={fetchData}
					     className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
						<BiRefresh size={12}/>
						<p className="text-white font-bold text-sm">Refresh</p>
					</div>
				</div>
				<div className="w-full bg-white p-2 flex-grow overflow-hidden">
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
						rowKey={'id'}
						tableLayout={"fixed"}
						columns={columns}
						dataSource={dataHistory.data}
						onChange={onChange}
						size={'small'}
						pagination={{
							total: dataHistory.totalData,
							defaultPageSize: 30,
							pageSizeOptions: [30, 50, 100],
							showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
						}}/>
				</div>
			</div>
		</>
	);
}

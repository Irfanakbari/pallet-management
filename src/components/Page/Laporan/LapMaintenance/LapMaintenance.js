import {BiRefresh} from "react-icons/bi";
import {AiFillFileExcel} from "react-icons/ai";
import React, {useEffect, useState} from "react";
import {useExcelJS} from "react-use-exceljs"
import {showErrorToast} from "@/utils/toast";
import {dataState} from "@/context/states";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Spin, Table} from "antd";
import PrintAll from "@/components/Page/Laporan/LapMaintenance/Print";


export default function LapMaintenance() {
	const [dataMaintenance, setDataMaintenance] = useState([])
	const {listCustomer, listVehicle, listPart} = dataState()
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchData();
	}, [])

	// Fungsi get data dari API
	const fetchData = async () => {
		setLoading(true)
		try {
			const response = await axiosInstance.get('/api/repairs?page=1&limit=50');
			setDataMaintenance(response.data);
		} catch (error) {
			showErrorToast("Gagal Fetch Data");
		} finally {
			setLoading(false)
		}
	};

	const onChange = (pagination, filters) => {
		setLoading(true)
		const searchParam = (filters?.kode && filters?.kode[0]) || '';
		const customerParam = (filters?.customer && filters?.customer[0]) || '';
		const vehicleParam = (filters?.vehicle && filters?.vehicle[0]) || '';
		const partParam = (filters?.part && filters?.part[0]) || '';
		const url = `/api/repairs?search=${searchParam}&customer=${customerParam || ''}&vehicle=${vehicleParam || ''}&part=${partParam || ''}&page=${pagination.current}&limit=${pagination.pageSize}`;
		axiosInstance.get(url)
		             .then(response => {
			             setDataMaintenance(response.data);
		             })
		             .catch(() => {
			             showErrorToast("Gagal Fetch Data");
		             })
		             .finally(() => {
			             setLoading(false);
		             });

	};

	const excel = useExcelJS({
		filename: "lap_maintenance.xlsx",
		worksheets: [
			{
				name: "Data Maintenance",
				columns: [
					{
						header: "No",
						key: "no",
						width: 10,
					},
					{
						header: "Id Pallet",
						key: "id",
						width: 32,
					},
					{
						header: "Customer",
						key: "customer",
						width: 10,
					},
					{
						header: "Vehicle",
						key: "vehicle",
						width: 32,
					},
					{
						header: "Part",
						key: "part",
						width: 32,
					},
				],
			},
		],
	})

	// Fungsi untuk melakukan save/export data ke excel
	const saveExcel = async (e) => {
		e.preventDefault();
		const data = dataMaintenance.data.map((item, index) => ({
			no: index + 1,
			id: item.kode,
			customer: item.customer + ' - ' + item['Customer']['name'],
			vehicle: item.vehicle + ' - ' + item['Vehicle']['name'],
			part: item.part + ' - ' + item['Part']['name'],
		}));
		await excel.download(data)
	}

	const columns = [
		{
			title: '#',
			dataIndex: 'index',
			width: '5%',
			render: (_, __, index) => index + 1
		},
		{
			title: 'Kode Pallet',
			dataIndex: 'kode',
			sorter: (a, b) => a.kode.localeCompare(b.kode),
			width: '30%'
		},
		{
			title: 'Customer',
			dataIndex: 'customer',
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
	];


	return (
		<>
			<Head>
				<title>Laporan Maintenance | PT Vuteq Indonesia</title>
			</Head>
			<div className={`bg-white h-full flex flex-col`}>
				<div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
					<PrintAll data={dataMaintenance}/>
					<div
						onClick={saveExcel}
						className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
						<AiFillFileExcel size={12}/>
						<p className={`text-white font-bold text-sm`}>Excel</p>
					</div>
					<div
						onClick={() => fetchData()}
						className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
						<BiRefresh size={12}/>
						<p className={`text-white font-bold text-sm`}>Refresh</p>
					</div>
				</div>
				<div className="w-full bg-white p-2 flex-grow overflow-hidden">
					<Table
						loading={
							loading && <Spin tip="Loading..." delay={1500}/>
						}
						bordered
						scroll={{
							y: "68vh"
						}}
						style={{
							width: "100%"
						}}
						rowKey={'kode'}
						columns={columns}
						dataSource={dataMaintenance.data}
						onChange={onChange}
						size={'small'}
						pagination={{
							total: dataMaintenance.totalData,
							defaultPageSize: 30,
							hideOnSinglePage: true,
							pageSizeOptions: [30, 50, 100],
							showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
						}}/>
				</div>
			</div>
		</>
	)
}
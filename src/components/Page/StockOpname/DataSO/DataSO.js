import {BiRefresh} from "react-icons/bi";
import {useEffect, useState} from "react";
import {showErrorToast} from "@/utils/toast";
import {dataState} from "@/context/states";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Button, Input, Space, Spin, Table} from "antd";
import {SearchOutlined} from "@ant-design/icons";

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
		const {search, customer, vehicle, part, department} = filterParams;
		const url = `/api/so/data?search=${search}&customer=${customer}&vehicle=${vehicle}&department=${department}&part=${part}`;
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

		// setPagination(pagination)
		setFilterParams({
			customer: customerParam,
			vehicle: vehicleParam,
			part: partParam,
			search: searchParam,
			department: department
		})
		const url = `/api/so/data?search=${searchParam}&customer=${customerParam || ''}&vehicle=${vehicleParam || ''}&part=${partParam || ''}&department=${department || ''}`;
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
			dataIndex: 'name',
			width: 350,
			render: (_, record) => {
				const statusText = record.status === 0 ? 'Belum' : 'Sudah';
				const backgroundColor = record.status === 0 ? 'red' : 'green'; // Ubah warna latar belakang sesuai kondisi

				return (
					<div style={{backgroundColor, color: 'white', padding: '4px'}}>
						{statusText}
					</div>
				);
			},
			sorter: (a, b) => {
				// Menggunakan nilai numerik untuk penyortiran
				const statusValueA = a.status === 0 ? 0 : 1;
				const statusValueB = b.status === 0 ? 0 : 1;

				return statusValueA - statusValueB;
			},
		},
	];

	return (
		<>
			<Head>
				<title>Pallet | PT Vuteq Indonesia</title>
			</Head>
			<div className={`bg-white h-full flex flex-col`}>
				<div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
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
						pagination={false}
						// pagination={{
						// 	total: listPallet.totalData,
						// 	defaultPageSize: 30,
						// 	pageSizeOptions: [30, 50, 100],
						// 	showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
						// }}
					/>
				</div>
			</div>
		</>
	)
}
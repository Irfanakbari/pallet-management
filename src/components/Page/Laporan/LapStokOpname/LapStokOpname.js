import {BiRefresh} from "react-icons/bi";
import React, {useEffect, useRef, useState} from "react";
import {showErrorToast} from "@/utils/toast";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Spin, Table} from "antd";
import dayjs from "dayjs";
import PrintAll from "@/components/Page/Laporan/LapStokOpname/Print";

export default function LapStokOpname() {
	const [dataOpname, setDataOpname] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedRow, setSelectedRow] = useState([])
	useRef(null);
	useRef(null);
	useEffect(() => {
		fetchData();
	}, [])

	const fetchData = async () => {
		setLoading(true)
		try {
			const response = await axiosInstance.get('/api/so/laporan');
			setDataOpname(response.data['data']);
		} catch (error) {
			showErrorToast("Gagal Fetch Data");
		} finally {
			setLoading(false)
		}
	};

	// const getFilter = () => {
	//     axiosInstance.get(`/api/stok?customer=${custFilter.current.value??''}&department=${deptFilter.current.value??''}`).then(response=>{
	//         setDataStok(response.data['data']);
	//     }).catch(()=>{
	//         showErrorToast("Gagal Fetch Data");
	//     })
	// };

	// const onChange = (pagination, filters, sorter, extra) => {
	// 	console.log('params', pagination, filters, sorter, extra);
	// };

	const expandedRowRender = (record) => {
		const columns = [
			{
				title: 'Part Name',
				dataIndex: 'part',
				key: 'part',
			},
			{
				title: 'Terdata Di Sistem',
				dataIndex: 'stok_sistem_part',
				key: 'stok_sistem_part',
			},
			{
				title: 'Jumlah Aktual',
				dataIndex: 'stok_aktual_part',
				key: 'stok_aktual_part'
			},
			{
				title: 'Selisih Total',
				dataIndex: 'selisih_part',
				key: 'selisih_part',
				render: (selisih) => {
					const backgroundColor = selisih > 0 ? 'bg-orange-500 text-white' : selisih < 0 ? 'bg-red-500 text-white' : '';

					return (
						<div className={`rounded px-2 py-1 ${backgroundColor}`}>{selisih}</div>
					);
				},
			}
		];
		return <Table bordered={true}
		              columns={columns} dataSource={record.data} pagination={false}/>;
	};
	const expandedRowRender2 = (record) => {
		const columns = [
			{
				title: 'Department',
				dataIndex: 'department',
				key: 'department',
			},
			{
				title: 'Terdata Di Sistem',
				dataIndex: 'stok_sistem_department',
				key: 'stok_sistem_department',
			},
			{
				title: 'Jumlah Aktual',
				dataIndex: 'stok_aktual_department',
				key: 'stok_aktual_department',
			},
			{
				title: 'Selisih Total',
				dataIndex: 'selisih_department',
				key: 'selisih_department',
				render: (selisih) => {
					const backgroundColor = selisih > 0 ? 'bg-orange-500 text-white' : selisih < 0 ? 'bg-red-500 text-white' : '';

					return (
						<div className={`rounded px-2 py-1 ${backgroundColor}`}>{selisih}</div>
					);
				},
			}
		];
		return <Table
			bordered={true}
			columns={columns} rowKey={'department'} dataSource={record.data} pagination={false} expandable={{
			expandedRowRender: (record) => expandedRowRender(record),
		}}/>;
	};

	const columns = [
		{
			title: 'Kode SO',
			dataIndex: 'id_so',
			key: 'id_so',
		},
		{
			title: 'Keterangan',
			dataIndex: 'catatan',
			key: 'catatan',
		},
		{
			title: 'Tanggal Mulai',
			dataIndex: 'tanggal_mulai',
			key: 'tanggal_mulai',
			render: (_, record) => {
				return record['tanggal_mulai']
					? dayjs(record['tanggal_mulai']).locale('id').format('DD MMMM YYYY HH:mm')
					: '-'
			}
		},
		{
			title: 'Tanggal Tutup',
			dataIndex: 'tanggal_akhir',
			key: 'tanggal_akhir',
			render: (_, record) => {
				return record['tanggal_akhir']
					? dayjs(record['tanggal_akhir']).locale('id').format('DD MMMM YYYY HH:mm')
					: '-'
			}
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
		},
		{
			title: 'Sudah Di Hitung',
			dataIndex: 'sudah_dihitung',
			key: 'sudah_dihitung',
		},
		{
			title: 'Belum Di Hitung',
			dataIndex: 'belum_dihitung',
			key: 'belum_dihitung',
		},
	];

	const rowSelection = {
		onChange: (selectedRowKeys, selectedRows) => {
			const allParts = [];

			selectedRows[0].data.forEach((departmentData) => {
				departmentData.data.forEach((partData) => {
					allParts.push({
						name: partData.part,
						stok_aktual_part: partData.stok_aktual_part,
						stok_sistem_part: partData.stok_sistem_part,
						selisih_part: partData.selisih_part
					});
				});
			});
			setSelectedRow({
				so_id: selectedRows[0].id_so,
				data: allParts
			})
		},
	};

	return (
		<>
			<Head>
				<title>Laporan Stok | PT Vuteq Indonesia</title>
			</Head>
			<div className={`bg-white h-full flex flex-col`}>
				<div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
					{/*<PrintAll data={dataStok}/>*/}
					{/*<div*/}
					{/*	onClick={saveExcel}*/}
					{/*	className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>*/}
					{/*	<AiFillFileExcel size={12}/>*/}
					{/*	<p className={`text-white font-bold text-sm`}>Excel</p>*/}
					{/*</div>*/}
					<PrintAll data={selectedRow}/>
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
						rowSelection={{
							type: 'radio',
							...rowSelection,
						}}
						columns={columns}
						rowKey={'id_so'}
						bordered={true}
						pagination={{
							hideOnSinglePage: true
						}}
						expandable={{
							expandedRowRender: (record) => expandedRowRender2(record),
						}}
						dataSource={dataOpname}
					/>
				</div>
			</div>
		</>
	)
}


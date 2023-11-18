import {BiEdit, BiPlusMedical, BiRefresh, BiSave, BiTrash, BiX} from "react-icons/bi";
import React, {useEffect, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Form, Popconfirm, Spin, Table} from "antd";
import AddModalLayout from "@/components/Page/StockOpname/StockOpname/AddModal";
import EditableCell from "@/components/Page/StockOpname/StockOpname/EditCell";
import dayjs from "dayjs";

export default function StockOpname() {
	const {listDepartment, setSO, listSO} = dataState()
	const {setModalAdd, modalAdd} = modalState()
	const [form] = Form.useForm();
	const [editingKey, setEditingKey] = useState('');
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [loading, setLoading] = useState(true)
	const isEditing = (record) => record.kode === editingKey;

	const {
		register,
		handleSubmit,
		reset
	} = useForm()

	useEffect(() => {
		fetchData();
	}, [])

	const fetchData = () => {
		setLoading(true)
		axiosInstance.get('/api/so').then(response => {
			setSO(response.data['data']);
		}).catch(() => {
			showErrorToast("Gagal Fetch Data");
		}).finally(() => {
			setLoading(false)
		})
	};

	const submitData = async (data) => {
		axiosInstance.post('/api/so', data).then(() => {
			showSuccessToast("Sukses Simpan Data");
			fetchData()
		}).catch((e) => {
			showErrorToast(e.response.data.data);
		}).finally(() => {
			setModalAdd(false)
			reset()
		})
	}

	const deleteData = async (e) => {
		setConfirmLoading(true)
		axiosInstance.delete('/api/so/' + e).then(() => {
			showSuccessToast("Sukses Hapus Data");
		}).catch(() => {
			showErrorToast("Gagal Hapus Data");
		}).finally(() => {
			fetchData()
			setConfirmLoading(false)
		})
	}

	// const onChange = (pagination, filters, sorter, extra) => {
	// 	console.log('params', pagination, filters, sorter, extra);
	// };

	const edit = (record) => {
		form.setFieldsValue({
			name: '',
			...record
		});
		setEditingKey(record.kode);
	};

	const cancel = () => {
		setEditingKey('');
	};

	const save = async (key) => {
		try {
			const row = await form.validateFields();
			const newData = [...listSO];
			const index = newData.findIndex((item) => key === item.kode);
			if (index > -1) {
				const item = newData[index];
				newData.splice(index, 1, {
					...item,
					...row
				});
				await axiosInstance.put(`/api/so/${item.kode}`, row);
				showSuccessToast('Sukses Edit Data');
				await fetchData();
			} else {
				newData.push(row);
				setSO(newData);
			}
		} catch (errInfo) {
			showErrorToast(errInfo.response.data['data']?? "Gagal Simpan Data");
		} finally {
			setEditingKey('');
		}
	};

	const columns = [
		{
			title: '#',
			dataIndex: 'index',
			width: '5%',
			render: (_, __, index) => index + 1
		},
		{
			title: 'Kode SO',
			dataIndex: 'kode',
			sorter: (a, b) => a.kode.localeCompare(b.kode),
			// width: '30%'
		},
		{
			title: 'Tanggal Mulai SO',
			dataIndex: 'tanggal_so',
			// width: '40%',
			// sorter: (a, b) => a.name.localeCompare(b.name),
			// onFilter: (value, record) => record.name.startsWith(value),
			render: (_, record) => {
				return record['tanggal_so']
					? dayjs(record['tanggal_so']).locale('id').format('DD MMMM YYYY HH:mm')
					: '-'
			}
		},
		// {
		// 	title: 'Department',
		// 	dataIndex: 'department',
		// 	// width: '40%',
		// 	sorter: (a, b) => a.customer.localeCompare(b.customer),
		// 	// editable: true,
		// 	filters: listDepartment.map(e => (
		// 		{
		// 			text: e.name,
		// 			value: e.kode
		// 		}
		// 	)),
		// 	onFilter: (value, record) => record.department.indexOf(value) === 0,
		// 	render: (_, record) => "Produksi " + record.department
		// },
		{
			title: 'Tanggal Tutup SO',
			dataIndex: 'tanggal_so_closed',
			// width: '40%',
			// sorter: (a, b) => a.department.localeCompare(b.department),
			// onFilter: (value, record) => record.department.indexOf(value) === 0,
			// render: (_, record) => "Produksi " + record.department
			render: (_, record) => {
				return record['tanggal_so_closed']
					? dayjs(record['tanggal_so_closed']).locale('id').format('DD MMMM YYYY HH:mm')
					: '-'
			}
		},
		{
			title: 'Dibuat Oleh',
			dataIndex: 'created_by',
			// width: '40%',
			// sorter: (a, b) => a.department.localeCompare(b.department),
			// onFilter: (value, record) => record.department.indexOf(value) === 0,
			// editable: true
			// render: (_, record) => "Produksi " + record.department

		},
		{
			title: 'Status',
			dataIndex: 'status',
			// width: '40%',
			// sorter: (a, b) => a.department.localeCompare(b.department),
			// onFilter: (value, record) => record.department.indexOf(value) === 0,
			editable: true,
			inputType: 'select', // Kolom ini menggunakan select
			options: [
				{value: 1, label: 'Dibuka'},
				{value: 0, label: 'Ditutup'}
			],
			render: (_, record) => (record.status === 1) ? 'Dibuka' : 'Ditutup'

		},
		{
			title: 'Catatan',
			dataIndex: 'catatan',
			// width: '40%',
			// sorter: (a, b) => a.department.localeCompare(b.department),
			// onFilter: (value, record) => record.department.indexOf(value) === 0,
			inputType: 'text', // Kolom ini menggunakan input teks
			editable: true
			// render: (_, record) => (record.status ===1 ) ? 'Dibuka' : 'Ditutup'

		},
		{
			title: 'Aksi',
			dataIndex: 'operation',
			render: (_, record) => {
				const editable = isEditing(record);

				return (
					<span>
                {editable ? (
	                <span>
                        <button onClick={() => save(record.kode)} style={{marginRight: 8}}>
                            <BiSave size={22} color="green"/>
                        </button>
                        <button onClick={cancel} style={{marginRight: 8}}>
                            <BiX size={22} color="red"/>
                        </button>
                    </span>
                ) : (
	                <span className="flex">
                        <button
	                        disabled={editingKey !== ''}
	                        onClick={() => edit(record)}
	                        style={{marginRight: 8}}
                        >
                            <BiEdit size={22} color="orange"/>
                        </button>
                        <Popconfirm
	                        title="Apakah Anda yakin ingin menghapus?"
	                        onConfirm={() => deleteData(record.kode)}
	                        okType="primary"
	                        okButtonProps={{loading: confirmLoading}}
                        >
                            <button>
                                <BiTrash size={22} color="red"/>
                            </button>
                        </Popconfirm>
                    </span>
                )}
            </span>
				);
			}
		}
	];


	const mergedColumns = columns.map((col) => {
		if (!col.editable) {
			return col;
		}
		return {
			...col,
			onCell: (record) => ({
				record,
				inputType: col.inputType || 'text', // Gunakan inputType yang diberikan atau default 'text'
				options: col.options || [],
				dataIndex: col.dataIndex,
				title: col.title,
				editing: isEditing(record)
			})
		};
	});

	return (
		<>
			<Head>
				<title>Stock Opname | PT Vuteq Indonesia</title>
			</Head>
			<div className={`bg-white h-full flex flex-col`}>
				{modalAdd && <AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register}/>}
				<div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
					<div
						onClick={() => setModalAdd(true)}
						className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
						<BiPlusMedical size={12}/>
						<p className={`text-white font-bold text-sm`}>Baru</p>
					</div>
					<div
						onClick={() => fetchData()}
						className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
						<BiRefresh size={12}/>
						<p className={`text-white font-bold text-sm`}>Refresh</p>
					</div>
				</div>
				<div className="w-full bg-white p-2 flex-grow overflow-hidden">
					<Form form={form} component={false}>
						<Table
							loading={
								loading && <Spin tip="Loading..." delay={1500}/>
							}
							bordered
							scroll={{
								y: "68vh"
							}}
							components={{
								body: {
									cell: EditableCell,
								},
							}}
							style={{
								width: "100%"
							}} rowKey={'kode'} columns={mergedColumns} dataSource={listSO}
							// onChange={onChange}
							size={'small'} rowClassName="editable-row"
							pagination={false}/>
					</Form>
				</div>
			</div>
		</>
	)
}
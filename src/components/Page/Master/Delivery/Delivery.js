import {BiDetail, BiEdit, BiPlusMedical, BiRefresh, BiSave, BiTrash, BiX} from "react-icons/bi";
import React, {useEffect, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Form, Popconfirm, Spin, Table} from "antd";
import dayjs from "dayjs";
import AddModalLayout from "@/components/Page/Master/Delivery/AddModal";
import EditableCell from "@/components/Page/Master/Delivery/EditCell";
import DetailPalletDelivery from "@/components/Modal/DetailPalletDelivery";

export default function Delivery() {
	const {listDelivery, setDelivery} = dataState()
	const {setModalAdd, modalAdd,modal, setModal} = modalState()
	const [selectedDelivery, setSelectedDelivery] = useState(null);
	const [form] = Form.useForm();
	const [editingKey, setEditingKey] = useState('');
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [loading, setLoading] = useState(true)
	const isEditing = (record) => record.id === editingKey;

	const {
		register,
		handleSubmit,
		reset  ,
		watch
	} = useForm()

	useEffect(() => {
		fetchData();
	}, [])

	const fetchData = () => {
		setLoading(true)
		axiosInstance.get('/api/delivery').then(response => {
			setDelivery(response.data['data']);
		}).catch(() => {
			showErrorToast("Gagal Fetch Data");
		}).finally(() => {
			setLoading(false)
		})
	};

	const submitData = async (data) => {
		axiosInstance.post('/api/delivery', data).then(() => {
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
		axiosInstance.delete('/api/delivery/' + e).then(() => {
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
		setEditingKey(record.id);
	};

	const cancel = () => {
		setEditingKey('');
	};

	const save = async (key) => {
		try {
			const row = await form.validateFields();
			const newData = [...listDelivery];
			const index = newData.findIndex((item) => key === item.kode);
			if (index > -1) {
				const item = newData[index];
				newData.splice(index, 1, {
					...item,
					...row
				});
				await axiosInstance.put(`/api/delivery/${item.kode}`, row);
				showSuccessToast('Sukses Edit Data');
				await fetchData();
			} else {
				newData.push(row);
				setDelivery(newData);
			}
		} catch (errInfo) {
			showErrorToast("Gagal Simpan Data");
			console.log('Validate Failed:', errInfo);
		} finally {
			setEditingKey('');
		}
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
			title: 'Kode',
			dataIndex: 'id',
			fixed: 'left',
			width: 150,
			sorter: (a, b) => a.id.localeCompare(b.id),
			// width: '30%'
		},
		{
			title: 'Kode Delivery',
			dataIndex: 'kode_delivery',
			editable: true,
			width: 300,
			fixed: 'left',
			sorter: (a, b) => a.kode_delivery.localeCompare(b.kode_delivery),
			// width: '30%'
		},
		{
			title: 'Part',
			fixed: 'left',
			dataIndex: 'part',
			width: 280,
			sorter: (a, b) => a.part.localeCompare(b.part),
			// width: '30%'
			render: (_,record)=> record['Part']['kode'] +' - ' + record['Part']['name']
		},
		{
			title: 'Department',
			dataIndex: 'department',
			width: 150,

			sorter: (a, b) => a['Part']['Vehicle'].department.localeCompare(b['Part']['Vehicle'].department),
			// width: '30%'
			render: (_,record)=> record['Part']['Vehicle'].department
		},
		{
			title: 'Total',
			width: 100,
			dataIndex: 'total_pallet',
			sorter: (a, b) => a.total_pallet.localeCompare(b.total_pallet),
			// width: '30%'
		},
		{
			title: 'Tujuan',
			dataIndex: 'tujuan',
			width: 200,
			editable: true,
			sorter: (a, b) => a.tujuan.localeCompare(b.tujuan),
			// width: '30%'
		},
		{
			title: 'Sopir',
			dataIndex: 'sopir',
			width: 200,
			editable: true,
			sorter: (a, b) => a.sopir.localeCompare(b.sopir),
			// width: '30%'
		},
		{
			title: 'No. Polisi Mobil',
			dataIndex: 'no_pol',
			width: 200,
			editable: true,
			sorter: (a, b) => a.no_pol.localeCompare(b.no_pol),
			// width: '30%'
		},
		{
			title: 'Tanggal Delivery',
			dataIndex: 'tanggal_delivery',
			width: 300,
			// width: '40%',
			// sorter: (a, b) => a.name.localeCompare(b.name),
			// onFilter: (value, record) => record.name.startsWith(value),
			render: (_, record) => {
				return record['tanggal_delivery']
					? dayjs(record['tanggal_delivery']).locale('id').format('DD MMMM YYYY')
					: '-'
			}
		},
		{
			title: 'Status',
			width: 200,
			dataIndex: 'status',
			// width: '40%',
			// sorter: (a, b) => a.name.localeCompare(b.name),
			// onFilter: (value, record) => record.name.startsWith(value),
			render: (_, record) => {
				return record['status'] ? 'Success' : 'Pending';
			}
		},
		{
			title: 'Aksi',
			width: 200,
			fixed: 'right',
			dataIndex: 'operation',
			render: (_, record) => {
				const editable = isEditing(record);

				return (
					<span>
                {editable ? (
	                <span>
                        <button onClick={() => save(record.id)} style={{marginRight: 8}}>
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
						 <button
							 onClick={() => {
								 setSelectedDelivery(record['id'])
								 setModal(true)
							 }}
							 style={{marginRight: 8}}
						 >
                            <BiDetail size={22} color="blue"/>
                        </button>
                        <Popconfirm
	                        title="Apakah Anda yakin ingin menghapus?"
	                        onConfirm={() => deleteData(record.id)}
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
				<title>Delivery | PT Vuteq Indonesia</title>
			</Head>
			<div className={`bg-white h-full flex flex-col`}>
				{modal && <DetailPalletDelivery selected={selectedDelivery}/>}
				{modalAdd && <AddModalLayout onSubmit={handleSubmit(submitData)} watch={watch} reset={reset} register={register}/>}
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
								y: "65vh" ,
								x: "100vw",

							}}
							components={{
								body: {
									cell: EditableCell,
								},
							}}
							style={{
								width: "100%"
							}} rowKey={'id'} columns={mergedColumns} dataSource={listDelivery}
							// onChange={onChange}
							size={'small'} rowClassName="editable-row"
							pagination={false}/>
					</Form>
				</div>
			</div>
		</>
	)
}
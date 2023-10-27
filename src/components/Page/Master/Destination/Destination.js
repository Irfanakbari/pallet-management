import {BiEdit, BiPlusMedical, BiRefresh, BiSave, BiTrash, BiX} from "react-icons/bi";
import React, {useEffect, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import AddModalLayout from "@/components/Page/Master/Destination/AddModal";
import {Form, Popconfirm, Spin, Table} from "antd";
import EditableCell from "@/components/Page/Master/Destination/EditCell";

export default function Destination() {
	const {user, setListDestination, setModalDelete2, listDestination} = dataState()
	const {setModalAdd, modalAdd} = modalState()
	const [form] = Form.useForm();
	const [editingKey, setEditingKey] = useState('');
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [loading, setLoading] = useState(true)
	const isEditing = (record) => record.id === editingKey;
	const {
		register,
		handleSubmit,
		reset
	} = useForm()

	useEffect(() => {
		fetchData()
	}, [])

	const fetchData = () => {
		axiosInstance.get(`/api/destination`).then(response => {
			setListDestination(response.data['data']);
		}).catch(() => {
			showErrorToast("Gagal Fetch Data")
		}).finally(() => {
			setLoading(false)
		})
	};

	const submitData = (data) => {
		axiosInstance.post('/api/destination', data).then(() => {
			showSuccessToast("Sukses Simpan Data")
		}).catch(() => {
			showErrorToast("Gagal Simpan Data")
		}).finally(() => {
			fetchData()
			setModalAdd(false)
		})
	}

	const deleteData = (e) => {
		setConfirmLoading(true)
		axiosInstance.delete('/api/destination/' + e).then(() => {
			showSuccessToast("Sukses Hapus Data")
		}).catch(() => {
			showErrorToast("Gagal Hapus Data")
		}).finally(() => {
			fetchData()
			setConfirmLoading(false)
		})
	}

	const onChange = (pagination, filters, sorter, extra) => {
		console.log('params', pagination, filters, sorter, extra);
	};

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
			const newData = [...listDestination];
			const index = newData.findIndex((item) => key === item.id);
			if (index > -1) {
				const item = newData[index];
				newData.splice(index, 1, {
					...item,
					...row
				});
				await axiosInstance.put(`/api/destination/${item.id}`, row);
				showSuccessToast('Sukses Edit Data');
				await fetchData();
			} else {
				newData.push(row);
				setListDestination(newData);
			}
		} catch (errInfo) {
			console.log('Validate Failed:', errInfo);
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
			title: 'Nama Destinasi',
			dataIndex: 'name',
			width: '40%',
			editable: true
		},
		{
			title: 'Part',
			dataIndex: 'part',
			render: (_, record) => record.part + " - " + record['Part'].name
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
				inputType: 'text',
				dataIndex: col.dataIndex,
				title: col.title,
				editing: isEditing(record)
			})
		};
	});

	return (
		<>
			<Head>
				<title>Destinasi | PT Vuteq Indonesia</title>
			</Head>
			<div className={`bg-white h-full flex flex-col`}>
				{modalAdd && (<AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register}/>)}
				<div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
					{user.role !== 'viewer' && (
						<>
							<div
								onClick={() => setModalAdd(true)}
								className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
								<BiPlusMedical size={12}/>
								<p className="text-white font-bold text-sm">Baru</p>
							</div>
						</>
					)}
					<div
						onClick={() => fetchData()}
						className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
						<BiRefresh size={12}/>
						<p className={`text-white font-bold text-sm`}>Refresh</p>
					</div>
					{user.role !== 'super' && user.role !== 'admin' ? null : (
						<div
							onClick={() => setModalDelete2(true)}
							className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
							<BiTrash size={12}/>
							<p className={`text-white font-bold text-sm`}>Hapus Pilihan</p>
						</div>
					)}
				</div>
				<div className="w-full bg-white p-2 flex-grow overflow-hidden">
					<Form form={form} component={false}>
						<Table
							loading={
								loading && <Spin tip="Loading..." delay={1500}/>
							}
							bordered
							scroll={{
								y: "65vh"
							}}
							components={{
								body: {
									cell: EditableCell,
								},
							}}
							style={{
								width: "100%"
							}} rowKey={'id'} columns={mergedColumns} dataSource={listDestination} onChange={onChange}
							size={'small'} rowClassName="editable-row"
							pagination={false}/>
					</Form>
				</div>
			</div>
		</>
	)
}
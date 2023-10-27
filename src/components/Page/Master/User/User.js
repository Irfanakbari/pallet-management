import {BiPlusMedical, BiRefresh, BiTrash} from "react-icons/bi";
import {useEffect, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {useForm} from "react-hook-form";
import {modalState} from "@/context/states";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Popconfirm, Spin, Table, Tag} from "antd";
import AddModalLayout from "@/components/Page/Master/User/AddModal";
import EditableCell from "@/components/Page/Master/User/EditCell";
import {MdOutlinePassword} from "react-icons/md";
import EditModalLayout from "@/components/Page/Master/User/EditModal";

export default function User() {
	const [dataUser, setDataUser] = useState([])
	const [selectedCell, setSelectedCell] = useState([])
	const {setModalEdit, modalEdit, modalAdd, setModalAdd} = modalState()
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [loading, setLoading] = useState(true)
	const {
		register,
		handleSubmit,
		reset, watch
	} = useForm()

	useEffect(() => {
		fetchData()
	}, [])

	const fetchData = async () => {
		setLoading(true)
		try {
			const response = await axiosInstance.get('/api/users', {
				withCredentials: true,
			});
			setDataUser(response.data['data']);
		} catch (error) {
			showErrorToast("Gagal Fetch Data");
		} finally {
			setLoading(false)
		}
	};

	const submitData = async (data) => {
		try {
			await axiosInstance.post('/api/users', data).then(() => {
				showSuccessToast("Sukses Simpan Data");
				fetchData()
			})
		} catch (e) {
			showErrorToast("Gagal Simpan Data");

		} finally {
			setModalAdd(false)
		}
	}

	const editData = async (data) => {
		try {
			await axiosInstance.put('/api/users/' + selectedCell.id, data).then(() => {
				showSuccessToast("Sukses Edit Data");
			})
		} catch (e) {
			showErrorToast("Gagal Edit Data");
		} finally {
			await fetchData()
			setModalEdit(false)
		}
	}


	const deleteData = async (e) => {
		setConfirmLoading(true)
		try {
			await axiosInstance.delete('/api/users/' + e)
			showSuccessToast("Sukses Hapus Data");
		} catch (e) {
			showErrorToast("Gagal Hapus Data");
		} finally {
			await fetchData()
			setConfirmLoading(false)
		}
	}

	const columns = [
		{
			title: '#',
			dataIndex: 'index',
			width: '5%',
			render: (_, __, index) => index + 1
		},
		{
			title: 'ID',
			dataIndex: 'id',
		},
		{
			title: 'Username',
			dataIndex: 'username',
			sorter: (a, b) => a.username.localeCompare(b.username),
		},
		{
			title: 'Role',
			dataIndex: 'role',
		},
		{
			title: 'Department',
			dataIndex: 'DepartmentUsers',
			render: (_, record) => (
				<span>
                    {record['DepartmentUsers'].map((tag) => {
	                    let color = 'lime';
	                    if (tag === 'A') {
		                    color = 'volcano';
	                    } else if (tag === 'B') {
		                    color = 'blue';
	                    } else if (tag === 'B') {
		                    color = 'purple';
	                    }
	                    return (
		                    <Tag color={color} key={tag}>
			                    {'Produksi ' + tag.toUpperCase()}
		                    </Tag>
	                    );
                    })}
                 </span>
			),
		},
		{
			title: 'Aksi',
			dataIndex: 'operation',
			render: (_, record) => {
				return (
					<span className="flex">
                         <button
	                         onClick={() => {
		                         setSelectedCell(record)
		                         setModalEdit(true)
	                         }}
	                         style={{marginRight: 8}}
                         >
                            <MdOutlinePassword size={22} color="blue"/>
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
				);
			}
		}
	];


	return (
		<>
			<Head>
				<title>User | PT Vuteq Indonesia</title>
			</Head>
			<div className={`bg-white h-full flex flex-col`}>
				{modalAdd && (<AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register}
				                              watch={watch}/>)}
				{modalEdit && (<EditModalLayout onSubmit={handleSubmit(editData)} reset={reset} register={register}
				                                record={selectedCell}/>)}
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
					<Table
						loading={
							loading && <Spin tip="Loading..." delay={1500}/>
						}
						bordered
						components={{
							body: {
								cell: EditableCell,
							},
						}}
						scroll={{
							y: "65vh"
						}}
						style={{
							width: "100%"
						}}
						rowKey={'id'}
						dataSource={dataUser}
						size={'small'}
						columns={columns}
						rowClassName="editable-row"
						pagination={false}/>
				</div>
			</div>
		</>
	)
}
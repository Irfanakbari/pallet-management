import {BiEdit, BiPlusMedical, BiRefresh, BiSave, BiTrash, BiX} from "react-icons/bi";
import {useEffect, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {useForm} from "react-hook-form";
import {modalState} from "@/context/states";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Form, Popconfirm, Spin, Table, Tag} from "antd";
import AddModalLayout from "@/components/Page/Master/User/AddModal";
import EditableCell from "@/components/Page/Master/User/EditCell";
import {MdOutlinePassword} from "react-icons/md";
import EditModalLayout from "@/components/Page/Master/User/EditModal";

export default function User() {
    const [dataUser, setDataUser] = useState([])
    const [selectedCell, setSelectedCell] = useState([])
    const {setModalEdit, modalEdit, modalAdd,setModalAdd} = modalState()
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [loading, setLoading] = useState(true)
    const isEditing = (record) => record.kode === editingKey;
    const {
        register,
        handleSubmit,
        reset, watch
    } = useForm()

    useEffect(()=>{
        fetchData()
    },[])

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get('/api/users',{
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
            await axiosInstance.post('/api/users',data).then(() =>{
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
            await axiosInstance.put('/api/users/' + selectedCell.id,data).then(() =>{
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
            const newData = [...dataUser];
            const index = newData.findIndex((item) => key === item.id);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row
                });
                await axiosInstance.put(`/api/users/${item.id}`, row);
                showSuccessToast('Sukses Edit Data');
                await fetchData();
            } else {
                newData.push(row);
                setDataUser(newData);
            }
        } catch (errInfo) {
            showErrorToast("Gagal Simpan Data");
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
                                {'Produksi '+tag.toUpperCase()}
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
                const editable = isEditing(record);

                return (
                    <span>
                {editable ? (
                    <span>
                        <button onClick={() => save(record.id)} style={{ marginRight: 8 }}>
                            <BiSave size={22} color="green" />
                        </button>
                        <button onClick={cancel} style={{ marginRight: 8 }}>
                            <BiX size={22} color="red" />
                        </button>
                    </span>
                ) : (
                    <span className="flex">
                        <button
                            disabled={editingKey !== ''}
                            onClick={() => edit(record)}
                            style={{ marginRight: 8 }}
                        >
                            <BiEdit size={22} color="orange" />
                        </button>
                         <button
                             disabled={editingKey !== ''}
                             onClick={() => {
                                 setSelectedCell(record)
                                 setModalEdit(true)
                             }}
                             style={{ marginRight: 8 }}
                         >
                            <MdOutlinePassword size={22} color="blue" />
                        </button>
                        <Popconfirm
                            title="Apakah Anda yakin ingin menghapus?"
                            onConfirm={() => deleteData(record.kode)}
                            okType="primary"
                            okButtonProps={{ loading: confirmLoading }}
                        >
                            <button>
                                <BiTrash size={22} color="red" />
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

    return(
        <>
            <Head>
                <title>User | PT Vuteq Indonesia</title>
            </Head>
            <div className={`h-full bg-white`}>
                { modalAdd && (<AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register} watch={watch} />) }
                { modalEdit && (<EditModalLayout onSubmit={handleSubmit(editData)} reset={reset} register={register} record={selectedCell} />) }
                <div className={`w-full p-2`}>
                    <div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
                        <div
                            onClick={()=> setModalAdd(true)}
                            className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                            <BiPlusMedical size={12} />
                            <p className={`text-white font-bold text-sm`}>Baru</p>
                        </div>
                        <div
                            onClick={()=> fetchData()}
                            className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                            <BiRefresh size={12} />
                            <p className={`text-white font-bold text-sm`}>Refresh</p>
                        </div>
                    </div>
                    <div className="w-full bg-white p-2 flex-grow overflow-hidden">
                        <Form form={form} component={false}>
                            <Table
                                loading={
                                    loading && <Spin tip="Loading..." delay={1000}/>
                                }
                                bordered
                                components={{
                                    body: {
                                        cell: EditableCell,
                                    },
                                }}
                                scroll={{
                                    y: "68vh"
                                }}
                                style={{
                                    width: "100%"
                                }} rowKey={'kode'}
                                columns={mergedColumns}
                                dataSource={dataUser}
                                size={'small'}
                                rowClassName="editable-row"
                                pagination={false} />
                        </Form>
                    </div>
                </div>
            </div>
        </>
    )
}
import {BiPlusMedical, BiRefresh, BiSolidUpArrow} from "react-icons/bi";
import React, {useEffect, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import AddModalLayout from "@/components/Page/Master/Vehicle/AddModal";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Form, Popconfirm, Spin, Table} from "antd";
import EditableCell from "@/components/Page/Master/Customer/EditCell";

export default function Vehicle() {
    const {setVehicle, listVehicle,listCustomer,listDepartment} = dataState()
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

    const fetchData =  () => {
        setLoading(true)
        axiosInstance.get('/api/vehicle').then(response =>{
            setVehicle(response.data['data']);
        }).catch(()=>{
            showErrorToast("Gagal Fetch Data");
        }).finally(()=>{
            setLoading(false)
        })
    };

    const submitData = async (data) => {
        axiosInstance.post('/api/vehicle',data).then(() =>{
            showSuccessToast("Sukses Simpan Data");
            fetchData()
        }).catch(()=>{
            showErrorToast("Gagal Simpan Data");
        }).finally(()=>{
            setModalAdd(false)
            reset()
        })
    }

    const deleteData = async (e) => {
        setConfirmLoading(true)
        axiosInstance.delete('/api/vehicle/' + e).then(()=>{
            showSuccessToast("Sukses Hapus Data");
        }).catch (()=>{
            showErrorToast("Gagal Hapus Data");
        }).finally(()=>{
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
        setEditingKey(record.kode);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const newData = [...listVehicle];
            const index = newData.findIndex((item) => key === item.kode);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row
                });
                await axiosInstance.put(`/api/vehicle/${item.kode}`, row);
                showSuccessToast('Sukses Edit Data');
                await fetchData();
            } else {
                newData.push(row);
                setVehicle(newData);
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
            title: 'Kode Vehicle',
            dataIndex: 'kode',
            sorter: (a, b) => a.kode.localeCompare(b.kode),
            // width: '30%'
        },
        {
            title: 'Nama Vehicle',
            dataIndex: 'name',
            // width: '40%',
            sorter: (a, b) => a.name.localeCompare(b.name),
            editable: true,
            filterMode: 'menu',
            filterSearch:true,
            onFilter: (value, record) => record.name.startsWith(value),
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            // width: '40%',
            sorter: (a, b) => a.customer.localeCompare(b.customer),
            // editable: true,
            filters: listCustomer.map(e=>(
                {
                    text: e.name,
                    value: e.kode
                }
            )),
            onFilter: (value, record) => record.customer.indexOf(value) === 0,
            render: (_, record) => record.customer + " - " + record['Customer'].name
        },
        {
            title: 'Department',
            dataIndex: 'department',
            // width: '40%',
            sorter: (a, b) => a.department.localeCompare(b.department),
            filters: listDepartment.map(e=>(
                {
                    text: e.name,
                    value: e.kode
                }
            )),
            onFilter: (value, record) => record.department.indexOf(value) === 0,
            // editable: true
            render: (_, record) => "Produksi " + record.department

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
                            <button
                                onClick={() => save(record.kode)}
                                style={{
                                    marginRight: 8
                                }}
                            >
                                Save
                            </button>
                            <button
                                onClick={cancel}
                                style={{
                                    marginRight: 8
                                }}
                            >
                                Cancel
                            </button>
                        </span>
                    ) : (
                        <span>
                            <button
                                disabled={editingKey !== ''}
                                onClick={() => edit(record)}
                                style={{
                                    marginRight: 8
                                }}
                            >
                                Edit
                            </button>
                            <Popconfirm
                                title="Apakah Anda yakin ingin menghapus?"
                                onConfirm={() => deleteData(record.kode)}
                                okType={'primary'}
                                okButtonProps={{
                                    loading: confirmLoading,
                                }}
                            >
                                <button>
                                    Hapus
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
                <title>Vehicle | PT Vuteq Indonesia</title>
            </Head>
            <div className={`bg-white h-full flex flex-col`}>
                {modalAdd && <AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register} />}
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
                            }} rowKey={'kode'} columns={mergedColumns} dataSource={listVehicle} onChange={onChange} size={'small'} rowClassName="editable-row"
                            pagination={false} />
                    </Form>
                </div>
            </div>
        </>
    )
}
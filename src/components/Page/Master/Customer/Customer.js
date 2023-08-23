import { BiEdit, BiPlusMedical, BiRefresh, BiSolidUpArrow } from "react-icons/bi";
import { ImCross } from "react-icons/im";
import { BsFillTrashFill } from "react-icons/bs";
import React, { useEffect, useState } from "react";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import AddModalLayout from "@/components/Page/Master/Customer/AddModal";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Form, Popconfirm, Spin, Table} from "antd";
import EditableCell from "@/components/Page/Master/Customer/EditCell";

export default function Customer() {
    const {setCustomer, listCustomer} = dataState()
    const {setModalAdd, modalAdd, setModalEdit, setModalDelete} = modalState()
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
    }, []);

    const fetchData =  () => {
        axiosInstance.get('/api/customers').then(response => {
            setCustomer(response.data['data']);
        }).catch(()=>{
            showErrorToast("Gagal Fetch Data");
        }).finally(()=>{
            setLoading(false)
        })
    };

    const submitData = (data) => {
        axiosInstance.post('/api/customers', data).then(() => {
            showSuccessToast("Sukses Simpan Data");
            fetchData();
        }).catch(()=>{
            showErrorToast("Gagal Simpan Data");
        }).finally(()=>{
            reset()
            setModalAdd(false)
        })
    };

    const deleteData = (e) => {
        setConfirmLoading(true)
        axiosInstance
            .delete('/api/customers/' + e)
            .then(() => {
                showSuccessToast("Sukses Hapus Data");
            })
            .catch(() => {
                showErrorToast("Gagal Hapus Data");
            })
            .finally(() => {
                fetchData();
                setConfirmLoading(false)
            });
    };

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
            const newData = [...listCustomer];
            const index = newData.findIndex((item) => key === item.kode);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row
                });
                await axiosInstance.put(`/api/customers/${item.kode}`, row);
                showSuccessToast('Sukses Edit Data');
                await fetchData();
            } else {
                newData.push(row);
                setCustomer(newData);
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
            title: 'Kode Customer',
            dataIndex: 'kode',
            sorter: (a, b) => a.kode.localeCompare(b.kode),
            width: '30%'
        },
        {
            title: 'Nama Customer',
            dataIndex: 'name',
            width: '40%',
            editable: true
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

    return (
       <>
           <Head>
               <title>Customer | PT Vuteq Indonesia</title>
           </Head>
           <div className={`bg-white h-full flex flex-col`}>
               {modalAdd && (<AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register} />)}
               <div className="w-full bg-base py-0.5 px-1 text-white flex flex-row">
                   <div
                       onClick={() => setModalAdd(true)}
                       className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer"
                   >
                       <BiPlusMedical size={12} />
                       <p className="text-white font-bold text-sm">Baru</p>
                   </div>
                   <div
                       onClick={fetchData}
                       className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer"
                   >
                       <BiRefresh size={12} />
                       <p className="text-white font-bold text-sm">Refresh</p>
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
                           }} rowKey={'kode'} columns={mergedColumns} dataSource={listCustomer} onChange={onChange} size={'small'} rowClassName="editable-row"
                           pagination={false} />
                   </Form>
               </div>
           </div>
       </>
    );
}

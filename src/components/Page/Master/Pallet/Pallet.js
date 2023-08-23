import {
    BiEdit,
    BiPlusMedical,
    BiPrinter,
    BiQr,
    BiRefresh,
    BiSave,
    BiTrash,
    BiX
} from "react-icons/bi";
import {AiFillFileExcel} from "react-icons/ai";
import {useEffect, useRef, useState} from "react";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {useExcelJS} from "react-use-exceljs";
import {dataState, modalState} from "@/context/states";
import {useForm} from "react-hook-form";
import AddModalLayout from "@/components/Page/Master/Pallet/AddModal";
import QRModalLayout from "@/components/Page/Master/Pallet/QRModal";
import PrintAll from "@/components/print/printall";
import Head from "next/head";
import axiosInstance from "@/utils/interceptor";
import {Button, Form, Input, Popconfirm, Popover, Space, Spin, Table, QRCode} from "antd";
import EditableCell from "@/components/Page/Master/Customer/EditCell";
import { SearchOutlined} from "@ant-design/icons";
import {LabelComponent} from "@/components/print/label";
import {useReactToPrint} from "react-to-print";
import DeleteModal2 from "@/components/Modal/DeleteModal2";


export default function Pallet() {
    const {listCustomer, listVehicle, listPart,user,listDepartment} = dataState()
    const [listPallet, setPallet] = useState([])
    const {setModalAdd, modalAdd,  setModalDelete2,setModalDelete, modalQr,modalDelete2} = modalState()
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [confirmLoading] = useState(false);
    const [loading,setLoading] = useState(true)
    const isEditing = (record) => record.kode === editingKey;
    const [selected, setSelected] = useState([]);
    const searchInput = useRef(null);
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });
    const {
        register,
        handleSubmit,
        reset
    } = useForm()
    const handleSearch = (selectedKeys, confirm) => {
        confirm();
    };
    const handleReset = (clearFilters) => {
        clearFilters();
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        size="small"
                        style={{
                            width: 90,
                        }}
                        onClick={() => handleSearch(selectedKeys, confirm)}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
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
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    });

    useEffect(() => {
        setPallet([]); // Reset the selected page when the component unmounts
        fetchData()
    }, [])

    const fetchData = () => {
        axiosInstance.get(`/api/pallets?page=1&limit=50`).then(response=>{
           setPallet(response.data);
       }).catch(()=>{
           showErrorToast("Gagal Fetch Data")
       }).finally(()=>{
            setLoading(false)
        })
    };

    const submitData = (data) => {
        axiosInstance.post('/api/pallets',data).then(() =>{
            showSuccessToast("Sukses Simpan Data")
        }).catch(()=>{
            showErrorToast("Gagal Simpan Data")
        }).finally(()=>{
            fetchData()
            setModalAdd(false)
        })
    }

    const deleteData = (e) => {
        axiosInstance.delete('/api/pallets/' + e).then(()=>{
            showSuccessToast("Sukses Hapus Data")
        }).catch(()=>{
            showErrorToast("Gagal Hapus Data")
        }).finally(()=>{
            setModalDelete(false)
            fetchData()
        })
    }

    const excel = useExcelJS({
        filename: "data_pallet.xlsx",
        worksheets: [
            {
                name: "Data Pallet",
                columns: [
                    {
                        header: "No",
                        key: "no",
                        width: 10,
                    },
                    {
                        header: "Kode Pallet",
                        key: "id",
                        width: 32,
                    },
                    {
                        header: "Nama Pallet",
                        key: "name",
                        width: 40,
                    },
                    {
                        header: "Customer",
                        key: "customer",
                        width: 10,
                    },
                    {
                        header: "Vehicle",
                        key: "vehicle",
                        width: 20,
                    },
                    {
                        header: "Part",
                        key: "part",
                        width: 32,
                    },
                    {
                        header: "Qr Code",
                        key: "qr",
                        width: 32,
                    },
                ],
            },
        ],
    })

    const saveExcel = async (e) => {
        e.preventDefault();
        const data = listPallet.data.map((item, index) => ({
            no: index + 1,
            id: item.kode,
            name: item.name,
            customer: item.customer + ' - ' +item['Customer']['name'],
            vehicle: item.vehicle,
            part: item.part + ' - ' +item['Part']['name'],
            qr: "Ongoing"
        }));
        await excel.download(data)
    }

    const onChange = (pagination, filters, sorter, extra) => {
        setLoading(true)
        const searchParam = (filters?.kode && filters?.kode[0]) || '';
        const customerParam = (filters?.customer && filters?.customer[0]) || '';
        const vehicleParam = (filters?.vehicle && filters?.vehicle[0]) || '';
        const partParam = (filters?.part && filters?.part[0]) || '';
        const url = `/api/pallets?search=${searchParam}&customer=${customerParam || ''}&vehicle=${vehicleParam || ''}&part=${partParam || ''}&page=${pagination.current}&limit=${pagination.pageSize}`;
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

    const handleRowSelection = (selectedRowKeys, selectedRows) => {
        setSelected(selectedRows);
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
            const newData = [...listPallet.data];
            const index = newData.findIndex((item) => key === item.kode);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row
                });
                await axiosInstance.put(`/api/pallets/${item.kode}`, row);
                showSuccessToast('Sukses Edit Data');
                await fetchData();
            } else {
                newData.push(row);
                setPallet({
                    ...listPallet,
                    data: newData
                });
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
            render: (_, __, index) => (listPallet.currentPage - 1) * listPallet.limit + index + 1
        },
        {
            title: 'Kode Pallet',
            dataIndex: 'kode',
            sorter: (a, b) => a.kode.localeCompare(b.kode),
            // width: '30%'
            ...getColumnSearchProps('kode'),

        },
        {
            title: 'Nama Pallet',
            dataIndex: 'name',
            // width: '40%',
            editable: true,
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
            filterMultiple: false,

            onFilter: (value, record) => record.customer.indexOf(value) === 0,
            render: (_, record) => record.customer + " - " + record['Customer'].name
        },
        {
            title: 'Vehicle',
            dataIndex: 'vehicle',
            // width: '40%',
            sorter: (a, b) => a.vehicle.localeCompare(b.vehicle),
            // editable: true,
            filterMultiple: false,
            filters: listVehicle.map(e=>(
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
            // width: '40%',
            sorter: (a, b) => a.part.localeCompare(b.part),
            // editable: true,
            filterMultiple: false,
            filters: listPart.map(e=>(
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
            // width: '40%',
            filterMultiple: false,
            sorter: (a, b) => a['Vehicle'].department.localeCompare(b['Vehicle'].department),
            filters: listDepartment.map(e=>(
                {
                    text: e.name,
                    value: e.kode
                }
            )),
            onFilter: (value, record) => record['Vehicle'].department.indexOf(value) === 0,
            // editable: true
            render: (_, record) => "Produksi " + record['Vehicle'].department
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
              <BiSave size={16} color="green" />
            </button>
            <button
                onClick={cancel}
                style={{
                    marginRight: 8
                }}
            >
              <BiX size={16} color="red" />
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
              <BiEdit size={16} color="orange" />
            </button>
                <Popover content={()=>(
                    <center>
                        <QRCode value={record.kode} bordered={false} />
                        <span>{record.kode}</span>
                    </center>
                )}>
                    <span style={{
                        marginRight: 8
                    }}>
                        <BiQr size={16} color="green" />
                    </span>
                </Popover>
                 <button
                     onClick={handlePrint}
                     style={{
                         marginRight: 8
                     }}
                 >
              <BiPrinter size={16} color="blue" />
            </button>
                <div style={{ display: 'none' }}>
                    <LabelComponent ref={componentRef} {...record} />
                </div>
            <Popconfirm
                title="Apakah Anda yakin ingin menghapus?"
                onConfirm={() => deleteData(record.kode)}
                okType={'primary'}
                okButtonProps={{
                    loading: confirmLoading,
                }}
            >
              <button>
                <BiTrash size={16} color="red" />
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

    const handleMultiDelete = () => {
        Promise.all(selected.map(itemId => axiosInstance.delete(`/api/pallets/${itemId.kode}`)))
            .then(() => {
                showSuccessToast("Sukses Hapus Data");
            })
            .catch(() => {
                showErrorToast("Gagal Hapus Data");
            })
            .finally(() => {
                setSelected([]);
                fetchData()
            });
    };

    return (
        <>
            <Head>
                <title>Pallet | PT Vuteq Indonesia</title>
            </Head>
            <div className={`bg-white h-full flex flex-col`}>
                {modalDelete2 && (<DeleteModal2 data={selected} setCloseModal={setModalDelete2} action={handleMultiDelete} />)}
                {modalAdd && (<AddModalLayout onSubmit={handleSubmit(submitData)} reset={reset} register={register} />)}
                {modalQr && (<QRModalLayout selectedCell={selectedCell} />) }
                {/*<div className={`w-full bg-white h-4 border border-gray-500`} />*/}
                <div className={`w-full bg-base py-0.5 px-1 text-white flex flex-row`}>
                    {user.role !== 'viewer' && (
                        <>
                            <div
                                onClick={() => setModalAdd(true)}
                                className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
                                <BiPlusMedical size={12} />
                                <p className="text-white font-bold text-sm">Baru</p>
                            </div>
                            <div
                                onClick={saveExcel}
                                className="flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer">
                                <AiFillFileExcel size={12} />
                                <p className="text-white font-bold text-sm">Excel</p>
                            </div>
                        </>
                    )}
                    <div
                        onClick={()=> fetchData()}
                        className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                        <BiRefresh size={12} />
                        <p className={`text-white font-bold text-sm`}>Refresh</p>
                    </div>
                    {user.role !== 'super' && user.role !== 'admin' ? null : (
                        <div
                            onClick={()=>setModalDelete2(true)}
                            className={`flex-row flex items-center gap-1 px-3 py-1 hover:bg-[#2589ce] hover:cursor-pointer`}>
                            <BiTrash size={12} />
                            <p className={`text-white font-bold text-sm`}>Hapus Massal</p>
                        </div>
                    )}
                    <PrintAll data={selected??[]} />
                </div>
                <div className={`w-full bg-white p-2 flex-grow overflow-hidden`}>
                    <Form form={form} component={false}>
                        <Table
                            loading={
                                loading && <Spin tip="Loading..." delay={1000}/>
                            }
                            bordered
                            rowSelection={{
                                checkStrictly:true,
                                onChange: handleRowSelection,
                                preserveSelectedRowKeys: true
                            }}
                            components={{
                                body: {
                                    cell: EditableCell,
                                },
                            }}
                            scroll={{
                                y: "68vh",
                            }}
                            style={{
                                width: "100%"
                            }}
                            rowKey={'kode'}
                            columns={mergedColumns}
                            dataSource={listPallet.data}
                            onChange={onChange}
                            size={'small'} rowClassName="editable-row"
                            pagination={{
                                total:listPallet.totalData,
                                defaultPageSize: 50,
                                pageSizeOptions: [30, 50, 100],
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                            }} />
                    </Form>
                </div>
            </div>
        </>
    )
}
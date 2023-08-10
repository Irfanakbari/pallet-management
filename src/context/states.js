import {create} from "zustand";

const dataState = create((set) => ({
    listCustomer:[],
    listVehicle:[],
    listPart: [],
    listPallet:[],
    listDepartment: [],
    user: [],
    setCustomer: (data) => set ({listCustomer: data}),
    setVehicle: (data) => set ({listVehicle: data}),
    setPart: (data) => set ({listPart: data}),
    setPallet: (data) => set ({listPallet: data}),
    setUser: (data) => set ({user: data}),
    setListDepartment: (data) => set ({listDepartment: data})
}));

const useStoreTab = create((set) => ({
    activeMenu: "Dashboard",
    setActiveMenu: (value) => set({ activeMenu: value }),
    listTab: ['Dashboard'],
    setNewTab: (value) => set(state => {
        if (!state.listTab.includes(value)) {
            return {
                listTab: [...state.listTab, value],
                activeMenu: value
            };
        } else {
            return {
                ...state,
                activeMenu: value
            };
        }
    }),
    setCloseTab: (value) => set((state) => (
        {
            listTab: state.listTab.filter((tab) => tab !== value),
        }
    )),
}));

const modalState = create((set) => ({
    modalAdd: false,
    modalFilter: false,
    modalEdit: false,
    modalDelete: false,
    modalQr: false,
    modal: false,
    setModalAdd: (data) => set ({modalAdd: data}),
    setModalEdit: (data) => set ({modalEdit: data}),
    setModalDelete: (data) => set ({modalDelete: data}),
    setModalQR: (data) => set ({modalQr: data}),
    setModalFilter: (data) => set ({modalFilter: data}),
    setModal: (data) => set ({modal: data})
}));

const filterState = create((set) => ({
    custFilterValue: '',
    vehicleFilterValue: '',
    partFilterValue: '',
    statusFilterValue: '',
    startDateValue: '',
    endDateValue: '',
    setFilterValues: (values) => set(values),
    setStartDateValue: (startDate) => set({ startDateValue: startDate }),
    setEndDateValue: (endDate) => set({ endDateValue: endDate }),
}));


export {dataState, useStoreTab, modalState, filterState}
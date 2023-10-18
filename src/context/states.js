import {create} from "zustand";

// State untuk data umum
const dataState = create((set) => ({
	listCustomer: [],
	listVehicle: [],
	listPart: [],
	listPallet: [],
	listDepartment: [],
	listDestination: [],
	user: [],
	listSO: [],
	setCustomer: (data) => set({listCustomer: data}),
	setVehicle: (data) => set({listVehicle: data}),
	setPart: (data) => set({listPart: data}),
	setPallet: (data) => set({listPallet: data}),
	setUser: (data) => set({user: data}),
	setListDepartment: (data) => set({listDepartment: data}),
	setListDestination: (data) => set({listDestination: data}),
	setSO: (data) => set({listSO: data}),
}));

// State untuk pengaturan tab
const useStoreTab = create((set) => ({
	activeMenu: "Dashboard",
	listTab: ['Dashboard'],
	setActiveMenu: (value) => set({activeMenu: value}),
	setNewTab: (value) => set(state => {
		if (!state.listTab.includes(value)) {
			return {
				listTab: [...state.listTab, value],
				activeMenu: value,
			};
		} else {
			return {
				...state,
				activeMenu: value,
			};
		}
	}),
	setCloseTab: (value) => set(state => {
		const index = state.listTab.indexOf(value);
		if (index !== -1) {
			const newListTab = state.listTab.filter(tab => tab !== value);
			let newActiveMenu = state.activeMenu;

			// Jika tab yang ditutup adalah activeMenu,
			// maka ubah activeMenu ke tab sebelumnya jika ada.
			if (state.activeMenu === value && newListTab.length > 0) {
				if (index === newListTab.length) {
					newActiveMenu = newListTab[index - 1];
				} else {
					newActiveMenu = newListTab[index];
				}
			}

			return {
				listTab: newListTab,
				activeMenu: newActiveMenu,
			};
		} else {
			return state;
		}
	}),
}));

// State untuk modal
const modalState = create((set) => ({
	modalAdd: false,
	modalFilter: false,
	modalEdit: false,
	modalDelete: false,
	modalDelet2: false,
	modalQr: false,
	modal: false,
	modal2: false,
	setModalAdd: (data) => set({modalAdd: data}),
	setModalEdit: (data) => set({modalEdit: data}),
	setModalDelete: (data) => set({modalDelete: data}),
	setModalDelete2: (data) => set({modalDelete2: data}),
	setModalQR: (data) => set({modalQr: data}),
	setModalFilter: (data) => set({modalFilter: data}),
	setModal2: (data) => set({modal2: data}),
	setModal: (data) => set({modal: data}),
}));

// State untuk filter
const filterState = create((set) => ({
	custFilterValue: '',
	vehicleFilterValue: '',
	partFilterValue: '',
	statusFilterValue: '',
	startDateValue: '',
	endDateValue: '',
	setFilterValues: (values) => set(values),
	setStartDateValue: (startDate) => set({startDateValue: startDate}),
	setEndDateValue: (endDate) => set({endDateValue: endDate}),
}));

export {dataState, useStoreTab, modalState, filterState};

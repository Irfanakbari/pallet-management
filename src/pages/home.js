import {useEffect} from "react";
import {ImCross} from "react-icons/im";
import axios from "axios";
import {getCookie} from "cookies-next";
import {useRouter} from "next/router";
import {dataState, useStoreTab} from "@/context/states";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {delivery, laporan, master, master2, stockOpname} from "@/utils/constants";
import HeadTitle from "@/components/Head/HeadTitle";
import MainMenu from "@/components/MainMenu/MainMenu";
import axiosInstance from "@/utils/interceptor";
import {Result} from "antd";
import DataSO from "@/components/Page/StockOpname/DataSO/DataSO";
import LapStokOpname from "@/components/Page/Laporan/LapStokOpname/LapStokOpname";
import StockOpname from "@/components/Page/StockOpname/StockOpname/StockOpname";
import LapRiwayat from "@/components/Page/Laporan/LapRiwayat/LapRiwayat";
import Dashboard from "@/components/Page/Dashboard";
import DashboardAdmin from "@/components/Page/DashboardAdmin";
import Department from "@/components/Page/Master/Department/Department";
import Customer from "@/components/Page/Master/Customer/Customer";
import Vehicle from "@/components/Page/Master/Vehicle/Vehicle";
import Part from "@/components/Page/Master/Part/Part";
import Destination from "@/components/Page/Master/Destination/Destination";
import Pallet from "@/components/Page/Master/Pallet/Pallet";
import LapMaintenance from "@/components/Page/Laporan/LapMaintenance/LapMaintenance";
import LapStok from "@/components/Page/Laporan/LapStok/LapStok";
import User from "@/components/Page/Master/User/User";
import Delivery from "@/components/Page/Master/Delivery/Delivery";


export default function Home() {

	const {listTab, setCloseTab, activeMenu, setActiveMenu} = useStoreTab();
	const {setCustomer, setVehicle, setPart, setListDepartment, user, setUser, setListDestination} = dataState();
	const router = useRouter();


	useEffect(() => {
		getCurrentUser();
		fetchData();
	}, []);
	const fetchData = async () => {
		const [response1, response2, response3, response4,response5] = await Promise.all([
			axiosInstance.get('/api/customers'),
			axiosInstance.get('/api/departments'),
			axiosInstance.get('/api/vehicle'),
			axiosInstance.get('/api/parts'),
			axiosInstance.get('/api/destination'),
		]).catch(() => {
			showErrorToast("Gagal Mengambil Data");
		})
		setCustomer(response1.data['data']);
		setListDepartment(response2.data['data']);
		setVehicle(response3.data['data']);
		setPart(response4.data['data']);
		setListDestination(response5.data['data']);
	};

	function getCurrentUser() {
		axiosInstance.get('/api/auth/user')
		             .then(response => {
			             if (response.data['data'] === null) {
				             axios.get('/api/auth/logout')
				                  .then(async () => {
					                  showSuccessToast('Logout Berhasil');
					                  await router.replace('/');
					                  router.reload();
				                  })
				                  .catch(() => {
					                  showErrorToast("Gagal Logout");
				                  });
			             }
			             setUser(response.data['data']);
		             });
	}

	return (
		<>
			<div className={`border p-1.5 border-gray-500 flex flex-col h-screen`}>
				<HeadTitle user={user}/>
				<div className={`py-2`}>
					<div className={`w-full py-1.5 flex bg-[#EBEBEB] text-sm font-semibold`}>
						{
							user.role !== 'super' ? <MainMenu data={master2} title={'Master Data'}/> :
								<MainMenu data={master} title={'Master Data'}/>
						}
						<MainMenu data={laporan} title={'Laporan'}/>
						{
							user.role === 'super' &&
							<MainMenu data={stockOpname} title={'Stock Opname'}/>
						}
						{
							(user.role === 'super' || user.role ==='admin') &&
							<MainMenu data={delivery} title={'Delivery'}/>
						}
					</div>
				</div>
				<div className={`bg-base w-full mt-2 flex pt-1 px-1`}>
					{
						listTab.map((e, index) => {
							return (
								<div
									key={index}
									onClick={() => setActiveMenu(e)}
									className={`${activeMenu === e ? "bg-white text-black" : "text-white"} flex items-center bg-[#2589ce] py-1 px-5 text-sm font-bold mr-2 hover:bg-white hover:text-black hover:cursor-pointer`}
									style={{flexShrink: 0}}>
									{e} {
									e !== 'Dashboard' &&
									<ImCross className={`ml-2`} size={10} onClick={() => setCloseTab(e)}/>
								}
								</div>
							)
						})
					}
				</div>

				<div className="w-full bg-white p-2 h-full">
					{
						(user.role !== 'operator') ? <div className="bg-[#EBEBEB] p-2 h-full">
								{activeMenu === "Dashboard" && user.role === 'super' && <Dashboard/>}
								{(activeMenu === "Dashboard" && (user.role === 'admin' || user.role === 'viewer')) &&
									<DashboardAdmin/>}
								{activeMenu === "Department" && <Department/>}
								{activeMenu === "Customer" && <Customer/>}
								{activeMenu === "Vehicle" && <Vehicle/>}
								{activeMenu === "Part" && <Part/>}
								{activeMenu === "Destinasi" && <Destination/>}
								{activeMenu === "Pallet" && <Pallet/>}
								{activeMenu === "Lap. Riwayat Pallet" && <LapRiwayat/>}
								{activeMenu === "Lap. Maintenance Pallet" && <LapMaintenance/>}
								{activeMenu === "Lap. Stok Pallet" && <LapStok/>}
								{activeMenu === "Users" && <User/>}
								{activeMenu === "Stock Opname" && <StockOpname/>}
								{activeMenu === "Lap. Stok Opname" && <LapStokOpname/>}
								{activeMenu === "Data SO" && <DataSO/>}
								{activeMenu === "Data Delivery" && <Delivery/>}
							</div>
							:
							<center className={`flex items-center justify-center h-full`}>
								<Result
									status="403"
									title="403"
									subTitle="Maaf Hak Akses Kamu Tidak Cukup, Hanya Admin/Super Yang Dapat Mengakses Ini"
								/>
							</center>
					}
				</div>
			</div>
		</>
	)
}

// Fungsi untuk mengizinkan akses hanya jika ada cookie token
export const getServerSideProps = async ({req, res}) => {
	const cookie = getCookie('vuteq-token', {req, res});

	if (!cookie) {
		res.writeHead(302, {Location: '/'});
		res.end();
	}

	return {props: {}};
};
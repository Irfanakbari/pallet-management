import { useEffect } from "react";
import { ImCross } from "react-icons/im";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { dataState, useStoreTab } from "@/context/states";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { laporan, master } from "@/utils/constants";
import HeadTitle from "@/components/Head/HeadTitle";
import Customer from "@/components/Page/Master/Customer/Customer";
import Dashboard from "@/components/Page/Dashboard";
import Pallet from "@/components/Page/Master/Pallet/Pallet";
import LapRiwayat from "@/components/Page/Laporan/LapRiwayat/LapRiwayat";
import LapMaintenance from "@/components/Page/Laporan/LapMaintenance/LapMaintenance";
import User from "@/components/Page/Master/User";
import Vehicle from "@/components/Page/Master/Vehicle/Vehicle";
import Part from "@/components/Page/Master/Part/Part";
import MainMenu from "@/components/MainMenu/MainMenu";
import Department from "@/components/Page/Master/Department/Department";
import DashboardAdmin from "@/components/Page/DashboardAdmin";
import LapStok from "@/components/Page/Laporan/LapStok/LapStok";
import axiosInstance from "@/utils/interceptor";
import Destination from "@/components/Page/Master/Destination/Destination";

export default function Home() {
    const { listTab, setCloseTab, activeMenu, setActiveMenu } = useStoreTab();
    const { setCustomer, setVehicle, setPart, setListDepartment, user, setUser } = dataState();
    const router = useRouter();

    useEffect(() => {
        getCurrentUser();
        fetchData();
    }, []);

    const logoutHandle = async (e) => {
        e.preventDefault();
        try {
            await axios.get('/api/auth/logout');
            showSuccessToast('Logout Berhasil');
            await router.replace('/');
        } catch (error) {
            showErrorToast("Gagal Logout");
        }
    }

    const fetchData = async () => {
        const [response1, response2, response3, response4] = await Promise.all([
            axiosInstance.get('/api/customers'),
            axiosInstance.get('/api/departments'),
            axiosInstance.get('/api/vehicle'),
            axiosInstance.get('/api/parts'),
        ]).catch(e=>{
            showErrorToast("Gagal Mengambil Data");
        })
        setCustomer(response1.data['data']);
        setListDepartment(response2.data['data']);
        setVehicle(response3.data['data']);
        setPart(response4.data['data']);
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
            <div className={`p-2 min-h-screen flex overflow-x-scroll`}>
                <div className={`w-full bg-white border border-gray-500 h-full`}>
                    <HeadTitle user={user} />
                    <div className={`p-2`}>
                        <div className={`w-full flex bg-[#EBEBEB] text-sm font-bold`}>
                            <MainMenu data={master} title={'Master Data'}/>
                            <MainMenu data={laporan} title={'Laporan'}/>
                        </div>
                    </div>
                    <div className={`bg-base w-full mt-2 flex pt-1 px-1`}>
                        {
                            listTab.map((e, index)=>{
                                return (
                                    <div
                                        key={index}
                                        onClick={() => setActiveMenu(e)}
                                        className={`${activeMenu === e ? "bg-white text-black" : "text-white"} flex items-center bg-[#2589ce] py-1 px-5 text-sm font-bold mr-2 hover:bg-white hover:text-black hover:cursor-pointer`}>
                                        {e} {
                                            e !== 'Dashboard' && <ImCross className={`ml-2`} size={10} onClick={()=>setCloseTab(e)} />
                                    }
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="w-full bg-white p-2 h-full overflow-y-scroll">
                        {
                            (user.role !== 'operator') ? <div className="bg-[#EBEBEB] p-2 h-full">
                                    {activeMenu === "Dashboard" && user.role === 'super' && <Dashboard />}
                                    {(activeMenu === "Dashboard" && (user.role === 'admin' || user.role === 'viewer') ) && <DashboardAdmin />}
                                    {activeMenu === "Department" && <Department />}
                                    {activeMenu === "Customer" && <Customer />}
                                    {activeMenu === "Vehicle" && <Vehicle />}
                                    {activeMenu === "Part" && <Part />}
                                    {activeMenu === "Destination" && <Destination />}
                                    {activeMenu === "Pallet" && <Pallet />}
                                    {activeMenu === "Lap. Riwayat Pallet" && <LapRiwayat />}
                                    {activeMenu === "Lap. Maintenance Pallet" && <LapMaintenance />}
                                    {activeMenu === "Lap. Stok Pallet" && <LapStok />}
                                    {activeMenu === "Users" && <User />}
                            </div>
                                :
                                <div
                                    className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75">
                                    <div className="bg-red-500 p-4 rounded-md shadow-lg text-white text-xl">
                                        <p className="text-2xl font-semibold mb-2">Error!</p>
                                        <p>Hanya Role Admin yang Dapat Mengakses Halaman Ini</p>
                                        <button onClick={logoutHandle} className={`bg-green-400 rounded px-5 py-1 text-lg mt-8`}>Logout</button>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

// Fungsi untuk mengizinkan akses hanya jika ada cookie token
export const getServerSideProps = async ({ req, res }) => {
    const cookie = getCookie('vuteq-token', { req, res });

    if (!cookie) {
        res.writeHead(302, { Location: '/' });
        res.end();
    }

    return { props: {} };
};
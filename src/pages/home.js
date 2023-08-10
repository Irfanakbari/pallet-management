import HeadTitle from "@/components/Head/HeadTitle";
import {useEffect} from "react";
import Customer from "@/components/Page/Master/Customer/Customer";
import Dashboard from "@/components/Page/Dashboard";
import {ImCross} from "react-icons/im";
import Pallet from "@/components/Page/Master/Pallet/Pallet";
import LapRiwayat from "@/components/Page/Laporan/LapRiwayat/LapRiwayat";
import LapMaintenance from "@/components/Page/Laporan/LapMaintenance";
import User from "@/components/Page/Master/User";
import {getCookie} from "cookies-next";
import axios from "axios";
import Vehicle from "@/components/Page/Master/Vehicle/Vehicle";
import Part from "@/components/Page/Master/Part/Part";
import MainMenu from "@/components/Menu/MainMenu";
import {laporan, master} from "@/components/Menu/ListMenu";
import {dataState, useStoreTab} from "@/context/states";
import {showErrorToast, showSuccessToast} from "@/utils/toast";
import {useRouter} from "next/router";
import Department from "@/components/Page/Master/Department/Department";
import DashboardAdmin from "@/components/Page/DashboardAdmin";
import LapStok from "@/components/Page/Laporan/LapStok/LapStok";


export default function Home() {
    const { listTab, setCloseTab, activeMenu, setActiveMenu } = useStoreTab();
    const {setCustomer, setVehicle, setPart, setListDepartment, user, setUser} = dataState()
    const router = useRouter()


    useEffect(()=>{
        getCurrentUser()
        fetchData()
    },[])

    const logoutHandle = (e) => {
        e.preventDefault()
        axios.get('/api/auth/logout').then(async () => {
            showSuccessToast('Logout Berhasil')
            await router.replace('/')
        }).catch(()=>{
            showErrorToast("Gagal Logout");
        })
    }

    const fetchData = async () => {
        try {
            const [response1, response2, response3, response4] = await Promise.all([
                axios.get('/api/customers'),
                axios.get('/api/departments'),
                axios.get('/api/vehicle'),
                axios.get('/api/parts'),
            ]);

            setCustomer(response1.data['data']);
            setListDepartment(response2.data['data']);
            setVehicle(response3.data['data']);
            setPart(response4.data['data']);
            // Do other necessary processing here
        } catch (error) {
            showErrorToast("Gagal Fetch Data");
        }
    };


    function getCurrentUser(){
        axios.get('/api/auth/user').then(r =>  {
            if (r.data['data'] === null){
                axios.get('/api/auth/logout').then(async () => {
                    showSuccessToast('Logout Berhasil')
                    await router.replace('/').then(()=>router.reload)
                }).catch(()=>{
                    showErrorToast("Gagal Logout");
                })
            }
            setUser(r.data['data'])
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
                            <MainMenu data={laporan} title={'Transaksi'}/>
                        </div>
                    </div>
                    <div className={`bg-[#3da0e3] w-full mt-2 flex pt-1 px-1`}>
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

export const getServerSideProps = async ({req, res}) => {
    const cookie = getCookie('@vuteq-token', {req, res});

    if (!cookie) {
        res.writeHead(302, {Location: '/'});
        res.end();
    }

    return {props: {}};
};
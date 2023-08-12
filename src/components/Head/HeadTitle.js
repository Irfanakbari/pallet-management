import { FaUserAlt } from "react-icons/fa";
import { BiSolidDownArrow } from "react-icons/bi";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import ConfirmLogoutModal from "@/components/Modal/ConfirmLogoutModal";
import Image from "next/image";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export default function HeadTitle({ user }) {
    const [dropdownUser, setDropdownUser] = useState(false);
    const [closeModal, setCloseModal] = useState(false);
    const router = useRouter();

    // Fungsi untuk menangani proses logout
    async function logoutHandle() {
        try {
            await axios.get('/api/auth/logout').then(async () => {
                showSuccessToast('Logout Berhasil');
                await router.replace('/').then(() => router.reload());
            });
        } catch (error) {
            showErrorToast(error.response.data['data']);
        }
    }

    return (
        <>
            {
                closeModal &&
                <ConfirmLogoutModal setCloseModal={setCloseModal} action={logoutHandle} />
            }
            {/* Bagian header */}
            <div className="w-full bg-base py-1.5 px-2 text-white flex flex-row justify-between items-center mb-2">
                {/* Logo dan nama perusahaan */}
                <div className="flex items-center gap-3">
                    <Image src="/logos.png" alt="Logo" width={90} height={80} />
                    <h2 className="font-bold text-[14px]">PT VUTEQ INDONESIA</h2>
                </div>
                {/* Dropdown pengguna */}
                <div
                    className="hover:cursor-pointer"
                    onMouseEnter={() => setDropdownUser(true)}
                    onMouseLeave={() => setDropdownUser(false)}
                >
                    <div className="flex flex-row items-center">
                        <FaUserAlt size={10} />
                        <h2 className="font-bold text-[14px] mx-2">
                            Halo, {user.username ?? "-"}
                        </h2>
                        <BiSolidDownArrow size={10} />
                    </div>
                    {/* Tampilkan dropdown saat dihover */}
                    {
                        dropdownUser &&
                        <div className="px-8 py-2 bg-white shadow-2xl text-black text-sm shadow-gray-500 absolute flex flex-col gap-2">
                            <span onClick={() => setCloseModal(true)}>Logout</span>
                        </div>
                    }
                </div>
            </div>
        </>
    );
}

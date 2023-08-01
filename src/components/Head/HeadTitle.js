import {FaUserAlt} from "react-icons/fa";
import {BiSolidDownArrow} from "react-icons/bi";
import {useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {useRouter} from "next/router";
import ConfirmLogoutModal from "@/components/Modal/ConfirmLogoutModal";
import Image from "next/image";

export default function HeadTitle({user}) {
    const [dropdownUser, setDropdownUser] = useState(false)
    const [closeModal, setCloseModal] = useState(false)
    const router = useRouter()

    async function logoutHandle() {
        try {
            await axios.get('/api/auth/logout').then(async () => {
                toast.success("Logout Berhasil", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                await router.replace('/').then(()=> router.reload())
            })

        } catch (error) {
            toast.error("Gagal Logout", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    }

    return (
        <>
            {
                closeModal ?
                    <ConfirmLogoutModal setCloseModal={setCloseModal} action={logoutHandle} />
                    :
                    null
            }
            <div className={`w-full bg-[#3da0e3] py-1.5 px-2 text-white flex flex-row justify-between items-center mb-2`}>
                <div className={`flex items-center gap-3`}>
                    <Image src={'/logos.png'} alt={'Logo'} width={90} height={80} />
                    <h2 className={`font-bold text-[14px]`}>PT VUTEQ INDONESIA</h2>
                </div>
                <div className={`hover:cursor-pointer`}  onMouseEnter={()=> setDropdownUser(true)}
                     onMouseLeave={()=> setDropdownUser(false)}>
                    <div>
                        <div className={`flex flex-row items-center`}>
                            <FaUserAlt size={10} />
                            <h2 className={`font-bold text-[14px] mx-2`}>Halo, {user.username ?? '-'}</h2>
                            <BiSolidDownArrow  size={10}/>
                        </div>
                        {
                            dropdownUser ?  <div className={`px-8 py-2 bg-white shadow-2xl text-black text-sm shadow-gray-500 absolute flex flex-col gap-2`}>
                                <span onClick={()=>setCloseModal(true)}>Logout</span>
                            </div> : null
                        }
                    </div>
                </div>
            </div>
        </>
    )
}
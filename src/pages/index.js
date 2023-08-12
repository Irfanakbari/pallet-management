import Head from "next/head";
import { FaLock, FaUserAlt } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/router";
import { getCookie } from "cookies-next";
import { useForm } from "react-hook-form";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export default function Index() {
    const {
        register,
        handleSubmit,
    } = useForm(); // Inisialisasi react-hook-form
    const router = useRouter(); // Menggunakan router Next.js

    // Fungsi yang dipanggil saat formulir login di-submit
    const handleLogin = async (data) => {
        try {
            // Melakukan permintaan ke endpoint login
            await axios.post('api/auth/login', data).then(() => {
                showSuccessToast('Login Berhasil'); // Menampilkan pesan sukses
                router.replace('/home'); // Mengarahkan pengguna ke halaman home setelah login
            });
        } catch (e) {
            showErrorToast(e.response.data['data']); // Menampilkan pesan error jika login gagal
        }
    }

    return (
        <>
            <Head>
                <title>Login</title>
            </Head>
            <div className="min-h-screen w-full bg-[#051467de] flex flex-col items-center">
                <div className="w-[35%] h-full bg-white rounded-xl mt-[5cm] py-4">
                    <div className="bg-[#09209f] w-[260px] ">
                        <h2 className="text-white text-[1.2em] font-semibold rounded-br rounded-tr py-[10px] pr-[5px] pl-[27px]">
                            PT VUTEQ INDONESIA
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit(handleLogin)} className="p-5 mt-8">
                        {/* Input untuk username */}
                        <div className="flex items-center border border-gray-300 rounded-lg py-3 px-4">
                            <div className="mr-2">
                                <FaUserAlt />
                            </div>
                            <input
                                {...register('username')} // Menghubungkan input dengan react-hook-form
                                className="focus:outline-none w-full border-none outline-none focus:border-none" type="text" placeholder="Username" />
                        </div>
                        <br />
                        {/* Input untuk password */}
                        <div className="flex items-center border border-gray-300 rounded-lg py-3 px-4">
                            <div className="mr-2">
                                <FaLock />
                            </div>
                            <input
                                {...register('password')} // Menghubungkan input dengan react-hook-form
                                className="focus:outline-none w-full border-none outline-none focus:border-none" type="password" placeholder="Password" />
                        </div>
                        {/* Tombol untuk submit form login */}
                        <button
                            type="submit"
                            className="w-full bg-[#09209f] py-4 text-white text-center text-xl mt-7 rounded-b-xl">
                            Login
                        </button>
                    </form>
                </div>
                {/* Informasi hak cipta dan versi aplikasi */}
                <p className="text-white mt-8">
                    Hak Cipta © 2023
                </p>
                <p className="text-white mt-2">
                    Versi 2.2.7
                </p>
            </div>
        </>
    )
}

// Fungsi untuk mendapatkan props server-side
export const getServerSideProps = ({ req, res }) => {
    const cookie = getCookie('@vuteq-token', { req, res });

    // Jika cookie sudah ada (pengguna sudah login), maka arahkan ke halaman home
    if (cookie) {
        res.writeHead(302, { Location: '/home' });
        res.end();
    }

    return { props: {} };
};

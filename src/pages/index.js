import Head from "next/head";
import {FaLock, FaUserAlt} from "react-icons/fa";
import axios from "axios";
import {toast} from "react-toastify";
import {useRouter} from "next/router";
import {getCookie} from "cookies-next";
import {useForm} from "react-hook-form";

export default function Index() {
    const {
        register,
        handleSubmit,
    } = useForm()
    const router = useRouter()

    const handleLogin = async (data) =>{
        try {
            await axios.post('api/auth/login',data).then(() =>{
                toast.success("Login Sukses", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                router.replace('/home')
            })
        } catch (e) {
            toast.error(e.response.data['data'], {
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
            <Head>
                <title>Login</title>
            </Head>
            <div className={`min-h-screen w-full bg-[#051467de] flex flex-col items-center`}>
                <div className={`w-[35%] h-full bg-white rounded-xl mt-[5cm] py-4`}>
                    <div className={`bg-[#09209f] w-[260px] `}>
                        <h2 className={`text-white text-[1.2em] font-semibold rounded-br rounded-tr py-[10px] pr-[5px] pl-[27px]`}>
                            PT VUTEQ INDONESIA
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit(handleLogin)} className={`p-5 mt-8`}>
                        <div className="flex items-center border border-gray-300 rounded-lg py-3 px-4">
                            <div className="mr-2">
                                <FaUserAlt />
                            </div>
                            <input
                                {...register('username')}
                                className="focus:outline-none w-full border-none outline-none focus:border-none" type="text" placeholder="Username" />
                        </div>
                        <br/>
                        <div className="flex items-center border border-gray-300 rounded-lg py-3 px-4">
                            <div className="mr-2">
                               <FaLock />
                            </div>
                            <input
                                {...register('password')}
                                className="focus:outline-none w-full border-none outline-none focus:border-none" type="password" placeholder="Password" />
                        </div>
                        <button
                            type={'submit'}
                            className={`w-full bg-[#09209f] py-4 text-white text-center text-xl mt-7 rounded-b-xl`}>
                            Login
                        </button>
                    </form>
                </div>
                <p className={`text-white mt-8`}>
                    Copyright © 2023
                </p>
                <p className={`text-white mt-2`}>
                    Version 2.1.7
                </p>
            </div>
        </>
    )
}

export const getServerSideProps = ({ req, res }) => {
    const cookie = getCookie('@vuteq-token', { req, res });

    if (cookie) {
        res.writeHead(302, { Location: '/home' });
        res.end();
    }

    return { props: {} };
};

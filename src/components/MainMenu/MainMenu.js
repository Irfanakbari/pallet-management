import { dataState, useStoreTab } from "@/context/states";
import { useState } from "react";

// Komponen MainMenu menerima prop title dan data
export default function MainMenu({ title, data }) {
    const [dropdown, setDropdown] = useState(false);
    const { setNewTab } = useStoreTab();
    const { user } = dataState();

    // Ketika mouse masuk, setDropdown menjadi true
    const handleMouseEnter = () => {
        setDropdown(true);
    };

    // Ketika mouse keluar, setDropdown menjadi false
    const handleMouseLeave = () => {
        setDropdown(false);
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`border-gray-500 border-r hover:bg-[#85d3ff] hover:cursor-pointer`}
        >
            <span className={`p-2`}>{title}</span>
            {dropdown ? (
                <div className={`px-8 py-2 bg-white shadow-2xl shadow-gray-500 absolute flex flex-col gap-2 z-50`}>
                    {data.map((e, index) => {
                        // Filter menu berdasarkan peran pengguna
                        if (
                            (e.name === 'Users' ||
                                e.name === 'Department' ||
                                e.name === 'Customer') &&
                            user.role !== 'super'
                        ) {
                            return null;
                        }
                        if (
                            (e.name === 'Vehicle' || e.name === 'Part') &&
                            (user.role !== 'super' && user.role !== 'admin')
                        ) {
                            return null;
                        }
                        // Menampilkan menu dengan memberikan key dan mengatur tab baru saat diklik
                        return (
                            <span key={index} onClick={() => setNewTab(e.name)}>
                                {e.name}
                            </span>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

import {BiSearch} from "react-icons/bi";
import {useState} from "react";

export default function SearchBar({submit}) {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <form onSubmit={submit(searchTerm)} className="flex flex-row items-center">
            <label className="text-sm font-semibold mr-3">Cari :</label>
            <input
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
                type="text"
                className="border border-gray-300 rounded mr-3 px-1"
            />
            <button
                type={'submit'}
            >
                <BiSearch fontSize={25} />
            </button>
        </form>
    )
}
import {Dropdown} from "antd";
import {useStoreTab} from "@/context/states";

// Komponen MainMenu menerima prop title dan data
export default function MainMenu({title, data}) {
	const {setNewTab} = useStoreTab();
	return (
		<Dropdown
			menu={{
				items: data,
				onClick: (d) => setNewTab(d.key)
			}}
			placement="bottom"
		>
			<span className={`border-gray-500 border-r hover:bg-[#85d3ff] hover:cursor-pointer px-4`}>{title}</span>
		</Dropdown>
	);
}

import React from 'react';
import {DatePicker, Form, Input, InputNumber, Select} from 'antd';

const {Option} = Select;

const EditableCell = ({
	editing,
	dataIndex,
	title,
	inputType,
	options, // Opsi untuk jenis select
	record,
	index,
	children,
	...restProps
}) => {
	let inputNode;

	switch (inputType) {
		case 'number':
			inputNode = <InputNumber/>;
			break;
		case 'date':
			inputNode = <DatePicker showTime/>;
			break;
		case 'select':
			inputNode = (
				<Select>
					{options.map(option => (
						<Option key={option.value} value={option.value}>
							{option.label}
						</Option>
					))}
				</Select>
			);
			break;
		default:
			inputNode = <Input/>;
	}

	return (
		<td {...restProps}>
			{editing ? (
				<Form.Item
					name={dataIndex}
					style={{margin: 0}}
					rules={[
						{
							required: true,
							message: `Please input ${title}!`,
						},
					]}
				>
					{inputNode}
				</Form.Item>
			) : (
				children
			)}
		</td>
	);
};

export default EditableCell;

import { Form, Modal, Select } from 'antd';
import React, { useState } from 'react';
import AddCourse from './apis/AddCourse';
import GetAllCourses from './apis/GetAllCourses';

const { Option, OptGroup } = Select;

const AddCourseModal = (props: any) => {
    const { modalState, setModalState, rerender }: {modalState: boolean, setModalState: Function, rerender: Function} = props;
    const { courses } = GetAllCourses(false);

    const [searchInput, setSearchInput] = useState<string>();
    const [selected, setSelected] = useState<string>();

    const setupOptions = () => {
        let courseArr: React.ReactNode[] = [];
        const groupArr: React.ReactNode[] = [];
        let oldCode: string = "";

        const sortedCourses = courses.sort((a, b) => {
            const fa = a.courseId.toLowerCase();
            const fb = b.courseId.toLowerCase();
    
            if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
        });

        sortedCourses.forEach(item => {
            const code = item.courseId.slice(0, 3)

            if(oldCode === code) {
                courseArr.push(<Option value={item.courseId + item.courseName}>{`${item.courseId}: ${item.courseName}`}</Option>)
            } else {
                groupArr.push(<OptGroup label={oldCode}>{courseArr}</OptGroup>)
                oldCode = item.courseId.slice(0, 3)
                courseArr = [<Option value={item.courseId + item.courseName}>{`${item.courseId}: ${item.courseName}`}</Option>]
            }
        })
        groupArr.push(<OptGroup label={oldCode}>{courseArr}</OptGroup>)

        return groupArr;
    }

    const handleOk = () => {
        if(selected) {
            const code = selected.slice(0, 6);
            const name = selected.slice(6);

            AddCourse(code || '');
            rerender(code, name);
        }
        setModalState(false);
    }

    return (
        <Modal 
            title="Add Course" 
            open={modalState} 
            onCancel={() => setModalState(false)}
            onOk={() => handleOk()}
            destroyOnClose
        >
            <Form layout="vertical">
                <Form.Item label="Select Course to Add:">
                    <Select
                        showSearch
                        searchValue={searchInput}
                        placeholder="Select Course"
                        optionFilterProp="children"
                        size="small"
                        onSearch={(value: string) => setSearchInput(value)}
                        onChange={(value: string) => setSelected(value)}
                    >
                        {setupOptions()}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )

};


export default AddCourseModal;
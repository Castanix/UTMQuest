import { Form, Modal, Select } from 'antd';
import React, { useState } from 'react';
import AddCourse from './fetch/AddCourse';
import CoursesType from '../../../backend/types/Courses';

const { Option, OptGroup } = Select;

const AddCourseModal = (props: any) => {
    const { modalState, setModalState, rerender, unadded }: 
        {modalState: boolean, setModalState: Function, rerender: Function, unadded: CoursesType[]} = props;

    const [displayCourses, setDisplayCourses] = useState<CoursesType[]>(unadded)
    const [searchInput, setSearchInput] = useState<string>();
    const [selected, setSelected] = useState<string>();

    const setupOptions = () => {
        let courseArr: React.ReactNode[] = [];
        const groupArr: React.ReactNode[] = [];
        let oldCode: string = "";

        const courseSort = (data: CoursesType[]) => { 
            const newData = data.sort((a, b) => {
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
    
            return newData;
        }

        courseSort(displayCourses).forEach((item: CoursesType) => {
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
        console.log("here");
        console.log(selected)
        if(selected) {
            const code = selected.slice(0, 6);
            const name = selected.slice(6);

            AddCourse(code || '', name, displayCourses, rerender, setDisplayCourses);
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
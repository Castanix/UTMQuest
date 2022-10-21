import { Form, Modal, Select } from 'antd';
import React, { useState } from 'react';
import AddCourse from './apis/AddCourse';
import GetAllCourses from './apis/GetAllCourses';

const { Option, OptGroup } = Select;

const AddCourseModal = (props: any) => {
    const { modalState, setModalState }: {modalState: boolean, setModalState: Function} = props;
    const { courses } = GetAllCourses(false);

    const [searchInput, setSearchInput] = useState<string>();
    const [selected, setSelected] = useState<string>();

    const setupOptions = () => {
        let courseArr: React.ReactNode[] = [];
        const groupArr: React.ReactNode[] = [];
        let keyWord: string = "";

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
            const test = item.courseId.slice(0, 3)

            if(keyWord === test) {
                courseArr.push(<Option value={item.courseId}>{`${item.courseId}: ${item.courseName}`}</Option>)
            } else {
                groupArr.push(<OptGroup label={keyWord}>{courseArr}</OptGroup>)
                keyWord = item.courseId.slice(0, 3)
                courseArr = [<Option value={item.courseId}>{`${item.courseId}: ${item.courseName}`}</Option>]
            }
        })
        groupArr.push(<OptGroup label={keyWord}>{courseArr}</OptGroup>)

        return groupArr;
    }

    const handleOk = () => {
        if(selected) {
            AddCourse(selected || '');
        }
        setModalState(false);
    }

    return (
        <Modal 
            title="Add Course" 
            open={modalState} 
            onCancel={() => setModalState(false)}
            onOk={() => handleOk()}
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
                        filterOption={(input, option) =>
                            (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {setupOptions()}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )

};


export default AddCourseModal;
import { Button, Form, Modal, Select } from 'antd';
import React, { useContext, useState } from 'react';
import AddCourse from './fetch/AddCourse';
import { CoursesFrontEndType } from '../../../backend/types/Courses';
import "./CourseBoard.css";
import { ThemeContext } from '../Topbar/Topbar';

const { Option, OptGroup } = Select;

const AddCourseModal = (props: any) => {
    const { modalState, setModalState, rerender, modalData, setModalData }:
        { modalState: boolean, setModalState: Function, rerender: Function, modalData: CoursesFrontEndType[], setModalData: Function } = props;

    const [searchInput, setSearchInput] = useState<string>();
    const [selected, setSelected] = useState<string>();
    const isLightMode = useContext(ThemeContext);

    const setupOptions = () => {
        let courseArr: React.ReactNode[] = [];
        const groupArr: React.ReactNode[] = [];
        let oldCourseId: string = "";

        const courseSort = (data: CoursesFrontEndType[]) => {
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
        };

        courseSort(modalData).forEach((item: CoursesFrontEndType) => {
            const courseId = item.courseId.slice(0, 3);

            if (oldCourseId === courseId) {
                courseArr.push(<Option key={item._id} value={item.courseId + item.courseName}>{`${item.courseId}: ${item.courseName}`}</Option>);
            } else {
                groupArr.push(<OptGroup key={oldCourseId} label={oldCourseId}>{courseArr}</OptGroup>);
                oldCourseId = item.courseId.slice(0, 3);
                courseArr = [<Option key={item._id} value={item.courseId + item.courseName}>{`${item.courseId}: ${item.courseName}`}</Option>];
            }
        });
        groupArr.push(<OptGroup key={oldCourseId} label={oldCourseId}>{courseArr}</OptGroup>);

        // skip empty group in groupArr
        return groupArr.slice(1);
    };

    const handleOk = () => {
        if (selected) {
            // Slices the selected string to get the course id
            const courseId = selected.slice(0, 6);
            // Slices the selected string to get the course name
            const name = selected.slice(6);

            AddCourse(courseId || '', name, modalData, rerender, setModalData);
        }
        setModalState(false);
    };

    return (
        <Modal
            title="Add Course"
            open={modalState}
            footer={[
                <Button key="cancel" shape="round" onClick={() => setModalState(false)}>
                    Cancel
                </Button>,
                <Button key="ok" type="primary" shape="round" onClick={() => handleOk()}>
                    OK
                </Button>
            ]}
            onCancel={() => setModalState(false)}
            destroyOnClose
        >
            <Form layout="vertical">
                <Form.Item label="Select Course to Add:" name={`course-${isLightMode ? "light" : "dark"}`}>
                    <Select
                        showSearch
                        searchValue={searchInput}
                        placeholder="Select Course"
                        optionFilterProp="children"
                        onSearch={(value: string) => setSearchInput(value)}
                        onChange={(value: string) => setSelected(value)}
                    >
                        {setupOptions()}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};


export default AddCourseModal;

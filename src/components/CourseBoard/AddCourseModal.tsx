/* eslint-disable */
import { Button, Form, Modal, Select } from 'antd';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import AddCourse from './fetch/AddCourse';
import CoursesType from '../../../backend/types/Courses';
import "./CourseBoard.css";

const { Option, OptGroup } = Select;

const AddCourseModal = (props: any) => {
    const { modalState, setModalState, rerender, modalData, setModalData }:
        { modalState: boolean, setModalState: Function, rerender: Function, modalData: CoursesType[], setModalData: Function } = props;

    const [searchInput, setSearchInput] = useState<string>();
    const [selected, setSelected] = useState<string>();

    const queryClient = useQueryClient();
    const mutation = useMutation((courseId: string) => AddCourse(courseId), {
        onSuccess: (data) => {
            const oldData: CoursesType[] = queryClient.getQueryData("getAllCourses") ?? [];
            const newData = oldData.map(course => {
                if (course._id == data._id) {
                    return { ...course, added: true };
                }
                return course;
            });
            queryClient.setQueryData("getAllCourses", newData);
        }
    });

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
        };

        courseSort(modalData).forEach((item: CoursesType) => {
            const code = item.courseId.slice(0, 3);

            if (oldCode === code) {
                courseArr.push(<Option key={item._id} value={item.courseId + item.courseName}>{`${item.courseId}: ${item.courseName}`}</Option>);
            } else {
                groupArr.push(<OptGroup key={oldCode} label={oldCode}>{courseArr}</OptGroup>);
                oldCode = item.courseId.slice(0, 3);
                courseArr = [<Option key={item._id} value={item.courseId + item.courseName}>{`${item.courseId}: ${item.courseName}`}</Option>];
            }
        });
        groupArr.push(<OptGroup key={oldCode} label={oldCode}>{courseArr}</OptGroup>);

        // skip empty group in groupArr
        return groupArr.slice(1);
    };

    const handleOk = () => {
        if (selected) {
            // Slices the selected string to get the course code
            const code = selected.slice(0, 6);
            // Slices the selected string to get the course name
            const name = selected.slice(6);

            mutation.mutate(code);
            // AddCourse(code || '', name, modalData, rerender, setModalData);
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
                <Form.Item label="Select Course to Add:" name="course">
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

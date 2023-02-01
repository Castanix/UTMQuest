import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Button, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { CoursesFrontEndType } from "../../../backend/types/Courses";
import AddCourseModal from './AddCourseModal';

/* anti-pattern should fix */
const CourseBoardTable = ({ coursesList }: { coursesList: CoursesFrontEndType[] }) => {

    const [allAddedData, setAllAddedData] = useState<CoursesFrontEndType[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [tableDisplayData, setTableDisplayData] = useState<CoursesFrontEndType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalData, setModalData] = useState<CoursesFrontEndType[]>([]);

    useEffect(() => {
        // eslint-disable-next-line no-underscore-dangle
        const _added: CoursesFrontEndType[] = [];
        // eslint-disable-next-line no-underscore-dangle
        const _unadded: CoursesFrontEndType[] = [];
        coursesList.forEach((item) => {
            if (item.added) {
                _added.push(item);
            } else {
                _unadded.push(item);
            }
        });

        setAllAddedData(_added);
        setTableDisplayData(_added);
        setModalData(_unadded);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coursesList]);


    const columns: ColumnsType<CoursesFrontEndType> = [{
        title: "Course Code",
        dataIndex: "courseId",
        key: "courseId",
        render: text => <Link to={`/courses/${text}`}>{text}</Link>,
        sorter: (a: CoursesFrontEndType, b: CoursesFrontEndType) => a.courseId.localeCompare(b.courseId),
        defaultSortOrder: 'ascend'
    },
    {
        title: "Title",
        dataIndex: "courseName",
        key: "courseName",
        sorter: (a: CoursesFrontEndType, b: CoursesFrontEndType) => a.courseName.localeCompare(b.courseName)
    },
    {
        title: "# of Topics",
        dataIndex: "numTopics",
        key: "_id",
        width: '10%',
        sorter: (a: CoursesFrontEndType, b: CoursesFrontEndType) => a.numTopics - b.numTopics
    }];

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setTableDisplayData(value ? allAddedData.filter(item =>
            item.courseId.toLowerCase().includes(value.toLowerCase()) ||
            item.courseName.toLowerCase().includes(value.toLowerCase())
        ) : allAddedData);
    };

    // Locally renders new course on the courseboard. Renders by fetching from db happens on initial page load.
    const rerender = (_id: string, courseId: string, name: string) => {
        setSearchValue("");

        const courses = [...allAddedData, {
            _id,
            courseId,
            courseName: name,
            numTopics: 0,
            added: true
        }];

        setTableDisplayData(courses);
        setAllAddedData(courses);

    };

    return (
        <div>
            <div className='toolbar'>
                <Input className="course-board-search" placeholder="Search Course" prefix={<SearchOutlined />} value={searchValue} onChange={(e) => { handleSearch(e.target.value); }} />
                <Button type="primary" icon={<PlusCircleOutlined />} shape="round" className='add-new-course' onClick={() => { setIsModalOpen(true); }}>
                    Add a Course
                </Button>
            </div>
            <br />
            <Table
                dataSource={tableDisplayData}
                bordered
                columns={columns}
                pagination={{
                    showSizeChanger: true,
                }}
                rowKey="_id"
            />
            <AddCourseModal
                modalState={isModalOpen}
                setModalState={setIsModalOpen}
                rerender={rerender}
                modalData={modalData}
                setModalData={setModalData}
            />
        </div>
    );
};

export default CourseBoardTable;
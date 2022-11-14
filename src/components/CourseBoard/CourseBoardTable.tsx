import React, { useState } from 'react';
import Table, { ColumnsType } from "antd/lib/table";
import { Link } from "react-router-dom";
import { Button, Input } from 'antd';
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import CoursesType from "../../../backend/types/Courses";
import AddCourseModal from './AddCourseModal';

const CourseBoardTable = (props: any) => {
    const { dataSource }: { dataSource: CoursesType[] } = props;

    const added: CoursesType[] = [];
    const unadded: CoursesType[] = [];

    dataSource.forEach((item) => {
        if (item.added) {
            added.push(item);
        } else {
            unadded.push(item);
        }
    });

    const [allAddedData, setAllAddedData] = useState<CoursesType[]>(added);
    const [searchValue, setSearchValue] = useState<string>("");
    const [tableDisplayData, setTableDisplayData] = useState<CoursesType[]>(added);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalData, setModalData] = useState<CoursesType[]>(unadded);

    const columns: ColumnsType<CoursesType> = [{
        title: "Course Code",
        dataIndex: "courseId",
        render: text => <Link to={`/courses/${text}`}>{text}</Link>,
        sorter: (a: CoursesType, b: CoursesType) => a.courseId.localeCompare(b.courseId),
        defaultSortOrder: 'ascend'
    },
    {
        title: "Title",
        dataIndex: "courseName",
        sorter: (a: CoursesType, b: CoursesType) => a.courseName.localeCompare(b.courseName)
    },
    {
        title: "# of Topics",
        dataIndex: "numTopics",
        width: '10%',
        sorter: (a: CoursesType, b: CoursesType) => a.numTopics - b.numTopics
    }];

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setTableDisplayData(value ? allAddedData.filter(item =>
            item.courseId.toLowerCase().includes(value.toLowerCase()) ||
            item.courseName.toLowerCase().includes(value.toLowerCase())
        ) : allAddedData);
    };

    // Locally renders new course on the courseboard. Renders by fetching from db happens on initial page load.
    const rerender = (_id: string, code: string, name: string) => {
        setSearchValue("");

        const courses = [...allAddedData, {
            _id,
            courseId: code,
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
                <Input placeholder="Search Course" prefix={<SearchOutlined />} value={searchValue} onChange={(e) => { handleSearch(e.target.value); }} />
                <Button type="primary" icon={<PlusCircleOutlined />} shape="round" className='add-new-course' onClick={() => { setIsModalOpen(true); }}>
                    Add a Course
                </Button>
            </div>
            <br />
            <Table
                dataSource={tableDisplayData}
                columns={columns}
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
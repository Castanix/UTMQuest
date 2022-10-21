import React, { useState } from 'react';
import Table, { ColumnsType } from "antd/lib/table";
import { Link } from "react-router-dom";
import { Button, Input } from 'antd';
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import CoursesType from "../../../backend/types/Courses";
import AddCourseModal from './AddCourseModal';

const CourseBoardTable = (props: any) => {
    const { dataSource }: { dataSource: CoursesType[] } = props;

    const [searchValue, setSearchValue] = useState<string>("");
    const [displayData, setDisplayData] = useState<CoursesType[]>(dataSource);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const columns: ColumnsType<CoursesType> = [{
        title: "Course Code",
        dataIndex: "courseId",
        render: text => <Link to={`/courses/${text}`}>{text}</Link>,
    },
    {
        title: "Title",
        dataIndex: "courseName",
    },
    {
        title: "# of Topics",
        dataIndex: "numTopics",
        width: '10%' 
    }]

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setDisplayData(value ? dataSource.filter(item => 
            item.courseId.includes(value) || item.courseName.includes(value)
        ) : dataSource);
    };

    const rerender = (code: string, name: string) => {
        setSearchValue("")
        setDisplayData([{
            _id: "temp",
            courseId: code,
            courseName: name,
            numTopics: 0
        }, ...displayData])
    }

    return (
        <div>
            <div className='toolbar'>
                <Input placeholder="Search Course" prefix={<SearchOutlined />} value={searchValue} onChange={(e) => {handleSearch(e.target.value)}} />
                <Button type="primary" icon={<PlusCircleOutlined />} shape="round" className='addNewCourse' onClick={()=>{setIsModalOpen(true)}}>
                    Add a Course
                </Button>
            </div>
            <br/>
            <Table 
                dataSource={displayData}
                columns={columns}
            />
            <AddCourseModal 
                modalState={isModalOpen}
                setModalState={setIsModalOpen} 
                setDisplayData={setDisplayData} 
                rerender={rerender}
            />
        </div>
    )
}

export default CourseBoardTable
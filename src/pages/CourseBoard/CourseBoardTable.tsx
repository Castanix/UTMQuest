import React, { useState } from 'react';
import Table, { ColumnsType } from "antd/lib/table";
import { Link } from "react-router-dom";
import { Button, Input } from 'antd';
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import CoursesType from "../../../backend/types/Courses";

const CourseBoardTable = (props: any) => {
    const { dataSource }: { dataSource: CoursesType[] } = props;

    const [searchValue, setSearchValue] = useState<string>("");
    const [displayData, setDisplayData] = useState<CoursesType[]>(dataSource);

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
        title: "Number of Topics",
        dataIndex: "numTopics",
        width: '15%' 
    }]

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setDisplayData(value ? dataSource.filter(item => 
            item.courseId.includes(value) || item.courseName.includes(value)
        ) : dataSource);
    };

    return (
        <div>
            <div className='toolbar'>
                <Input placeholder="Search Course" prefix={<SearchOutlined />} value={searchValue} onChange={(e) => {handleSearch(e.target.value)}} />
                <Button type="primary" icon={<PlusCircleOutlined />} shape="round" className='addNewTopic'>
                    Add a Course
                </Button>
            </div>
            <br/>
            <Table 
                dataSource={displayData}
                columns={columns}
            />
        </div>
    )
}

export default CourseBoardTable
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
    }];

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

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setDisplayData(value ? dataSource.filter(item => 
            item.courseId.toLowerCase().includes(value.toLowerCase()) || 
            item.courseName.toLowerCase().includes(value.toLowerCase())
        ) : dataSource);
    };

    // Locally renders new course on the courseboard. Renders by fetching from db happens on initial page load.
    const rerender = (code: string, name: string) => {
        setSearchValue("")

        const courses = [...dataSource, {
            _id: "temp",
            courseId: code,
            courseName: name,
            numTopics: 0
        }]
        
        setDisplayData(courseSort(courses));
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
                courseSort={courseSort}
            />
        </div>
    )
}

export default CourseBoardTable
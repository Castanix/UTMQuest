import React from "react";
import { DropboxOutlined } from "@ant-design/icons";
import { List } from "antd";
import { Link } from "react-router-dom";
  
const SavedCoursesList = (props: any) => {
  const { courseData, paginationConfig }: { courseData: string[], paginationConfig: Function } = props;

  return courseData.length
    ? (
      <List
        size="small"
        bordered={false}
        dataSource={courseData}
        pagination={paginationConfig(courseData.length, 4)}
        renderItem={(item: any) => (
          <List.Item>
            <Link to={item[0]}>
              {item[1]}
            </Link>
          </List.Item>
        )}
      />
  ) : <div className="icon"><DropboxOutlined /></div>;
};

export default SavedCoursesList

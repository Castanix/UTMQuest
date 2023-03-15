import React from "react";
import { DropboxOutlined } from "@ant-design/icons";
import { List } from "antd";
import { Link } from "react-router-dom";

import "./BookmarkCoursesList.css";

const BookmarkCoursesList = (props: any) => {
  const { courseData, paginationConfig }: { courseData: string[], paginationConfig: Function } = props;

  return courseData.length
    ? (
      <List
        className="bookmarked-courses"
        size="small"
        bordered={false}
        dataSource={courseData}
        pagination={paginationConfig(courseData.length, 4)}
        renderItem={(item: any) => (
          <List.Item>
            <Link to={`${item[0]}/1`}>
              {item[1]}
            </Link>
          </List.Item>
        )}
      />
    ) : <div className="icon"><DropboxOutlined /></div>;
};

export default BookmarkCoursesList;

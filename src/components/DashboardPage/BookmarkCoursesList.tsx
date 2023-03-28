import React, { useContext } from "react";
import { Empty, List } from "antd";
import { Link } from "react-router-dom";
import { DropboxOutlined } from "@ant-design/icons";
import "./BookmarkCoursesList.css";
import { ThemeContext } from "../Topbar/Topbar";

const BookmarkCoursesList = (props: any) => {
  const {
    courseData,
    paginationConfig,
  }: { courseData: string[]; paginationConfig: Function } = props;

  const isLightMode = useContext(ThemeContext);

  return (
    <List
      className="bookmarked-courses"
      size="small"
      locale={{
        emptyText: (
          <Empty
            image={<DropboxOutlined style={{ fontSize: '5rem' }} />}
            description={
              <span
                style={{
                  color: isLightMode ? "black" : "white",
                }}
              >
                You don&apos;t have any bookmarked courses.
              </span>
            }
          />
        ),
      }}
      bordered={false}
      dataSource={courseData}
      pagination={paginationConfig(courseData.length, 4)}
      renderItem={(item: any) => (
        <List.Item>
          <Link to={`${item[0]}/1`}>{item[1]}</Link>
        </List.Item>
      )}
    />
  );
};

export default BookmarkCoursesList;

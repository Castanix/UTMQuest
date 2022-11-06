/* eslint-disable */

import React from "react";
import { DropboxOutlined } from "@ant-design/icons";
import { Table } from "antd";
import Column from "antd/lib/table/Column";
import WidgetType from "./types/Widget";

const ReviewQuestionsTable = (props: any) => {
  const { reviewQnsData, paginationConfig }: { reviewQnsData: WidgetType[], paginationConfig: Function } = props;

  return reviewQnsData.length
    ? (
      <Table
        dataSource={reviewQnsData}
        pagination={paginationConfig(reviewQnsData.length, 4)}
        rowKey="courseCode"
      >
        <Column title="Question Name" dataIndex="qnsName" key="qnsName" />
        <Column title="Topic" dataIndex="topic" key="topic" />
        <Column title="Course Code" dataIndex="courseCode" key="courseCode" />
        <Column title="Review Status" dataIndex="reviewStatus" key="reviewStatus" />
      </Table>
    ) : <div className="icon"><DropboxOutlined /></div>;
};

export default ReviewQuestionsTable;
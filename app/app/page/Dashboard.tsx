import { Row, Col } from "antd";
import BlinkInput from "../components/BlinkInput";

const Dashboard = () => {
  return (
    <Row className="px-12 py-6" gutter={[32,32]}>
      <Col span={12}>
        <BlinkInput />
      </Col>
      <Col span={12}>Dashboard</Col>
    </Row>
  );
};

export default Dashboard;

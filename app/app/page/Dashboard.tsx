"use client";

import { Row, Col } from "antd";
import { useState } from "react";
import BlinkInput from "../components/BlinkInput";
import BlinkDisplay from "../components/BlinkDisplay";

const Dashboard = () => {
  const [toPubkey, setToPubkey] = useState("");
  const [manualSend, setManualSend] = useState(true);
  const [title, setTitle] = useState("Actions Example - Transfer Native SOL");
  const [description, setDescription] = useState(
    "Transfer SOL to another Solana wallet"
  );
  const [iconURL, setIconURL] = useState(
    "https://cdn-icons-png.flaticon.com/512/6001/6001527.png"
  );
  const [actions, setActions] = useState([
    { value: 1 },
    { value: 2 },
    { value: 5 },
  ]);

  return (
    <Row align="middle" className="px-12 py-6" gutter={[32, 32]}>
      <Col span={12}>
        <BlinkInput
          toPubkey={toPubkey}
          setToPubkey={setToPubkey}
          manualSend={manualSend}
          setManualSend={setManualSend}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          iconURL={iconURL}
          setIconURL={setIconURL}
          actions={actions}
          setActions={setActions}
        />
      </Col>
      <Col span={12}>
        <BlinkDisplay
          manualSend={manualSend}
          title={title}
          description={description}
          iconURL={iconURL}
          actions={actions}
        />
      </Col>
    </Row>
  );
};

export default Dashboard;

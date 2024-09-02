"use client";

import { Row, Col, Divider } from "antd";
import { useState } from "react";
import BlinkInput from "../components/BlinkInput";
import BlinkDisplay from "../components/BlinkDisplay";
import FetchBlink from "../components/FetchBlink";

const Dashboard = () => {
  const [toPubkey, setToPubkey] = useState("");
  const [manualSend, setManualSend] = useState(true);
  const [title, setTitle] = useState("Actions Example - Transfer Send Token");
  const [description, setDescription] = useState(
    "Transfer SEND token to another Solana wallet"
  );
  const [iconURL, setIconURL] = useState(
    "https://miro.medium.com/v2/resize:fit:1400/0*9TfBXsi8Vsh-mj2q"
  );
  const [actions, setActions] = useState([
    { value: 1 },
    { value: 2 },
    { value: 5 },
  ]);

  return (
    <div className="px-12 py-6">
      <Row align="middle" gutter={[32, 32]}>
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
            id=""
            manualSend={manualSend}
            title={title}
            description={description}
            iconURL={iconURL}
            actions={actions}
            blinkAccount={undefined}
          />
        </Col>
      </Row>
      <Divider className="bg-slate-200" />
      <Row>
        <Col span={24}>
          <span className="flex align-middle text-center">
            <span className="w-full font-semibold text-4xl text-[#6495ED]">
              Created Blink(s)
            </span>
          </span>
          <FetchBlink />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

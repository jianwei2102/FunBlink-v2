import React from "react";
import { Col, message, Row } from "antd";
import { useRouter } from "next/navigation";
import { createBlink } from "../utils/utils";
import { Wallet } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

interface BlinkInputProps {
  toPubkey: string;
  setToPubkey: React.Dispatch<React.SetStateAction<string>>;
  manualSend: boolean;
  setManualSend: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  iconURL: string;
  setIconURL: React.Dispatch<React.SetStateAction<string>>;
  actions: { value: number }[];
  setActions: React.Dispatch<React.SetStateAction<{ value: number }[]>>;
}

const BlinkInput = ({
  toPubkey,
  setToPubkey,
  manualSend,
  setManualSend,
  title,
  setTitle,
  description,
  setDescription,
  iconURL,
  setIconURL,
  actions,
  setActions,
}: BlinkInputProps) => {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useAnchorWallet() as Wallet;
  const [messageApi, contextHolder] = message.useMessage();

  // Add new action input
  const addAction = () => {
    if (actions.length < 9) {
      setActions([...actions, { value: 1 }]);
    }
  };

  // Remove action input by index
  const removeAction = (index: number) => {
    if (actions.length != 1) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  // Validate and format the action input value
  const handleActionChange = (index: number, value: string) => {
    const regex = /^\d*\.?\d{0,3}$/; // Regex to allow up to 3 decimal places
    if (regex.test(value)) {
      const newActions = [...actions];
      newActions[index].value = parseFloat(value);
      setActions(newActions);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dataToStore = {
      a: actions,
      m: manualSend,
    };

    messageApi.open({
      type: "loading",
      content: "Creating Blink...",
      duration: 0,
    });

    let response = await createBlink(
      connection,
      wallet,
      title,
      iconURL,
      description,
      toPubkey,
      JSON.stringify(dataToStore)
    );

    messageApi.destroy();
    if (response.status === "success") {
      messageApi.open({
        type: "success",
        content: "Blink created successfully",
      });
      setTimeout(() => {
        router.refresh();
      }, 500);
    } else {
      console.log("Error creating blink", response);
      messageApi.open({
        type: "error",
        content: "Error creating blink",
      });
    }
  };

  return (
    <div className="p-4 border rounded-lg min-h-[760px]">
      {contextHolder}
      <div className="flex flex-col gap-2">
        <div className="flex justify-center items-center">
          <div className="font-semibold text-4xl text-[#6495ED]">
            Create Blink (Devnet)
          </div>
        </div>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="font-light text-lg">
              Blink&apos;s Title <span className="text-red-400">*</span>
            </label>
            <input
              required
              id="title"
              type="text"
              placeholder="Please enter the title of the Blink"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border-slate-500 bg-black border-2 px-4 py-2"
            />
          </div>

          <div>
            <label htmlFor="icon" className="font-light text-lg">
              Icon (URL) <span className="text-red-400">*</span>
            </label>
            <input
              required
              id="icon"
              type="text"
              placeholder="Please enter a URL for the icon"
              value={iconURL}
              onChange={(e) => setIconURL(e.target.value)}
              className="w-full rounded-lg border-slate-500 bg-black border-2 px-4 py-2"
            />
          </div>

          <div>
            <label htmlFor="description" className="font-light text-lg">
              Description <span className="text-red-400">*</span>
            </label>
            <input
              required
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-slate-500 bg-black border-2 px-4 py-2"
            />
          </div>

          <div>
            <label htmlFor="toPubkey" className="font-light text-lg">
              To Targeted Address <span className="text-red-400">*</span>{" "}
              (Please ensure the address is correct)
            </label>
            <input
              required
              id="toPubkey"
              type="text"
              value={toPubkey}
              onChange={(e) => setToPubkey(e.target.value)}
              className="w-full rounded-lg border-slate-500 bg-black border-2 px-4 py-2"
            />
          </div>

          <div>
            <input
              type="checkbox"
              id="manualSend"
              checked={manualSend}
              onChange={() => setManualSend(!manualSend)}
              className="mr-2"
            />
            <label htmlFor="manualSend" className="font-light text-lg">
              Send X amount (Manual)
            </label>
          </div>

          {/* Action Input Section */}
          <div>
            <div className="my-2 font-light text-lg">
              Link Actions <span className="text-red-400">*</span>
            </div>

            <Row align="middle" gutter={[16, 12]}>
              {actions.map((action, index) => (
                <Col key={index} span={8}>
                  <Row align="middle" gutter={6}>
                    <Col>Amount {index + 1}</Col>
                    <Col>
                      <input
                        required
                        type="number"
                        step="0.001"
                        value={action.value}
                        onChange={(e) =>
                          handleActionChange(index, e.target.value)
                        }
                        className="w-20 rounded-lg border-slate-500 bg-black border-2 px-4 py-2"
                      />
                    </Col>
                    <Col>
                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="text-red-500 hover:text-red-700 text-2xl"
                      >
                        X
                      </button>
                    </Col>
                  </Row>
                </Col>
              ))}
            </Row>

            <button
              type="button"
              onClick={addAction}
              className="text-blue-500 hover:text-blue-700 mt-2"
            >
              Add Action
            </button>
          </div>
          <div>
            <button
              type="submit"
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-full text-center font-semibold"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlinkInput;

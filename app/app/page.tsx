"use client";

import { Layout } from "antd";
import HeaderItem from "./components/HeaderItem";
import { Header, Content } from "antd/lib/layout/layout";
import Dashboard from "./page/Dashboard";

export default function Home() {
  return (
    <Layout>
      <Header className="bg-black text-white flex align-middle">
        <HeaderItem />
      </Header>
      <Content className="bg-black text-white">
        <Dashboard />
      </Content>
    </Layout>
  );
}

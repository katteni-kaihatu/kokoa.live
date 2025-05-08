'use client';

import { useApplication } from "@/contexts/Application";
import { Header } from "../components/Header";

export default function Home() {
  const app = useApplication()

  return (
    <>
      <Header></Header>
      <div>aaa</div>
    </>
  );
}

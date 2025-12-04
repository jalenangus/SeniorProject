"use client";

import { Header } from "@/components/Header";
import { RequestForm } from "@/components/request/RequestForm";

export default function NewRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-10 px-4">
        <div className="max-w-3xl mx-auto">
          <RequestForm />
        </div>
      </div>
    </div>
  );
}
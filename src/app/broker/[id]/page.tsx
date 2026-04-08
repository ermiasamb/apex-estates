import { BrokerDetail } from "@/components/brokers/BrokerDetail";
import { brokers } from "@/lib/data";
import { notFound } from "next/navigation";

export default function BrokerProfilePage({ params }: { params: { id: string } }) {
  const broker = brokers.find((b) => b.id === params.id);
  if (!broker) {
    notFound();
  }
  return <BrokerDetail broker={broker} />;
}

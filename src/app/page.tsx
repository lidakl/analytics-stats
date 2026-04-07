import { UsageStats } from "@/components/UsageStats/UsageStats";

export default function Home() {
  return (
    <main
      style={{
        padding: "40px 20px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <UsageStats />
    </main>
  );
}

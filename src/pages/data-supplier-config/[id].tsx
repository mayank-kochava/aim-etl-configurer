import { useRouter } from "next/router";
import { Spin } from "antd";
import { DataSupplierForm } from "@/components/data-supplier/DataSupplierForm";
import { useDataSupplier } from "@/hooks/useDataSupplier";

export default function SupplierPage() {
  const router = useRouter();
  const { id } = router.query;

  const supplierId = typeof id === "string" ? id : undefined;

  // Only fetch data if we have a valid supplierId and it's not "new"
  const { data, isLoading } = useDataSupplier(supplierId);

  // Show loading while router is initializing
  if (!supplierId) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Show loading while fetching existing data (not for "new")
  if (isLoading && supplierId !== "new") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DataSupplierForm
      supplierId={supplierId}
      initial={data ?? null}
      onBack={() => router.push("/")}
      onSaved={() => router.push("/")}
    />
  );
}

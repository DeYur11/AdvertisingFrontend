import Button from "../../../../../components/common/Button/Button";

export default function TaskTabs({ activeTab, setActiveTab, materialsCount, loading }) {
    return (
        <div className="mb-3 flex gap-2">
            <Button
                variant={activeTab === "info" ? "primary" : "outline"}
                size="small"
                onClick={() => setActiveTab("info")}
            >
                Info
            </Button>
            <Button
                variant={activeTab === "materials" ? "primary" : "outline"}
                size="small"
                onClick={() => setActiveTab("materials")}
            >
                Materials ({loading ? "…" : materialsCount})
            </Button>
        </div>
    );
}

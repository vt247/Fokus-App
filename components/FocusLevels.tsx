import { useState } from "react";
import { FocusLevels as FocusLevelsType } from "@/types/chat";

interface FocusLevelsProps {
  levels: FocusLevelsType;
  onUpdate: (key: keyof Omit<FocusLevelsType, "lastUpdated">, value: string) => void;
}

export default function FocusLevels({ levels, onUpdate }: FocusLevelsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const focusItems = [
    { key: "northStar" as const, label: "North Star", placeholder: "Your long-term vision" },
    { key: "year" as const, label: "Year 2025", placeholder: "Your annual focus" },
    { key: "threeMonths" as const, label: "Q1 2025", placeholder: "Your quarterly focus" },
    { key: "month" as const, label: "This Month", placeholder: "Your monthly focus" },
    { key: "week" as const, label: "This Week", placeholder: "Your weekly focus" },
    { key: "today" as const, label: "Today", placeholder: "What feels right now?" },
  ];

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const handleSave = (key: keyof Omit<FocusLevelsType, "lastUpdated">) => {
    onUpdate(key, editValue);
    setEditingKey(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue("");
  };

  // Check if any focus is set
  const hasFocus = Object.entries(levels).some(
    ([key, value]) => key !== "lastUpdated" && value !== ""
  );

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="max-w-4xl mx-auto px-8">
        {/* Compact Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 flex items-center justify-between hover:text-primary transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary">
              {isExpanded ? "▼" : "▶"} Focus
            </span>
            {!isExpanded && hasFocus && (
              <span className="text-xs text-secondary truncate max-w-md">
                {levels.today && `Today: ${levels.today}`}
                {!levels.today && levels.week && `Week: ${levels.week}`}
                {!levels.today && !levels.week && levels.northStar && `${levels.northStar}`}
              </span>
            )}
          </div>
          <span className="text-xs text-secondary">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
        </button>

        {/* Expanded View */}
        {isExpanded && (
          <div className="pb-6 space-y-3">
            {focusItems.map((item) => {
              const value = levels[item.key];
              const isEditing = editingKey === item.key;

              return (
                <div key={item.key} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-secondary uppercase tracking-wide mb-2 block">
                        {item.label}
                      </label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder={item.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(item.key)}
                              className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-accent transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleEdit(item.key, value)}
                          className="cursor-pointer hover:text-primary transition-colors group"
                        >
                          {value ? (
                            <p className="text-sm text-foreground">{value}</p>
                          ) : (
                            <p className="text-sm text-secondary italic">
                              {item.placeholder}
                            </p>
                          )}
                          <p className="text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                            Click to edit
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



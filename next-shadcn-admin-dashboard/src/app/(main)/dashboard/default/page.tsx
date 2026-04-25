import { SkillCard } from "@/components/skills/skill-card";
import { StatsCards } from "@/components/skills/stats-cards";
import { allSkillData, getAggregateStats, getAllSkillConfigs } from "@/data/skills/all-skills";
import type { SkillModuleId } from "@/data/skills";

export default function DashboardPage() {
  const configs = getAllSkillConfigs();
  const aggregateStats = getAggregateStats();

  return (
    <div className="@container/main flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skill Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý 7 skill modules — Xem trạng thái, chỉnh sửa prompt, theo dõi tài liệu đã tạo.
        </p>
      </div>

      {/* Aggregate Stats */}
      <StatsCards stats={aggregateStats} />

      {/* Skills Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Skill Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {configs.map((config) => {
            const data = allSkillData[config.id as SkillModuleId];
            return (
              <SkillCard
                key={config.id}
                config={config}
                stats={
                  data
                    ? {
                        totalGenerated: data.stats.totalGenerated,
                        thisMonthGenerated: data.stats.thisMonthGenerated,
                        successRate: data.stats.successRate,
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Hoạt động gần đây</h2>
        <div className="rounded-lg border bg-card">
          <div className="divide-y">
            {Object.values(allSkillData)
              .flatMap((d) =>
                d.documents.map((doc) => ({
                  ...doc,
                  skillName: d.config.name,
                  skillColor: d.config.color,
                }))
              )
              .sort(
                (a, b) =>
                  new Date(b.generatedAt).getTime() -
                  new Date(a.generatedAt).getTime()
              )
              .slice(0, 8)
              .map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: doc.skillColor }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.userRequest}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {doc.skillName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(doc.generatedAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        doc.status === "success"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { formatDateTime } from "@repo/shared";
import { channelLabel } from "@repo/marketing";
import { TrendingUp, Send, Users2, PencilLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useMarketingDashboard } from "@/features/marketing/hooks";

export function DashboardPage() {
  const dashboardQuery = useMarketingDashboard();

  if (dashboardQuery.isLoading) {
    return <LoadingState rows={5} />;
  }

  if (dashboardQuery.isError) {
    return <ErrorState title="Dashboard unavailable" description={dashboardQuery.error.message} onRetry={() => dashboardQuery.refetch()} />;
  }

  if (!dashboardQuery.data) {
    return <LoadingState rows={3} />;
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Campaign, audience, and send activity at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total contacts"
          value={dashboard.contactCount}
          detail={`${dashboard.unsubscribedContactCount} unsubscribed`}
          icon={Users2}
        />
        <MetricCard
          title="Subscribed contacts"
          value={dashboard.subscribedContactCount}
          detail={`${dashboard.contactCount === 0 ? 0 : Math.round((dashboard.subscribedContactCount / dashboard.contactCount) * 100)}% of total`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Campaigns"
          value={dashboard.campaignCount}
          detail={`${dashboard.sentCampaignCount} sent`}
          icon={Send}
        />
        <MetricCard
          title="Draft campaigns"
          value={dashboard.draftCampaignCount}
          detail="Ready for review"
          icon={PencilLine}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Recent campaigns</CardTitle>
            <CardDescription>Latest activity across email and SMS.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium text-slate-900">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === "SENT" ? "success" : campaign.status === "SCHEDULED" ? "warning" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{channelLabel(campaign.channel)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Upcoming campaigns</CardTitle>
            <CardDescription>Scheduled sends waiting in the queue.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dashboard.upcomingCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(campaign.scheduledAt)}</p>
                  </div>
                  <Badge variant="warning">{channelLabel(campaign.channel)}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: number;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-slate-200 bg-gradient-to-t from-slate-50/70 to-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

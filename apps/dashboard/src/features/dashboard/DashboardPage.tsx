"use client";

import { formatDateTime } from "@repo/shared";
import { channelLabel } from "@repo/marketing";
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
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Mocked campaign and contact performance overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total contacts" value={dashboard.contactCount} />
        <MetricCard title="Subscribed contacts" value={dashboard.subscribedContactCount} />
        <MetricCard title="Campaigns" value={dashboard.campaignCount} />
        <MetricCard title="Draft campaigns" value={dashboard.draftCampaignCount} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
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
                    <TableCell>{campaign.name}</TableCell>
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

        <Card>
          <CardHeader>
            <CardTitle>Upcoming campaigns</CardTitle>
            <CardDescription>Scheduled sends waiting in the queue.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dashboard.upcomingCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-lg border p-4">
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

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

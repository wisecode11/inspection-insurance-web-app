"use client"

import * as React from "react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useSettings } from "@/modules/platform-settings/hooks/use-settings"
import { settingsService } from "@/modules/platform-settings/services/settings.service"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { StatusBadge } from "@/components/shared/status-badge"

export default function SettingsPage() {
  const { data, isLoading, error } = useSettings()
  const [flags, setFlags] = React.useState(data?.flags ?? [])
  const [library, setLibrary] = React.useState(data?.citations ?? [])
  const [templateName, setTemplateName] = React.useState(data?.template.name ?? "")
  const [templateIntro, setTemplateIntro] = React.useState(data?.template.intro ?? "")

  React.useEffect(() => {
    if (!data) return
    setFlags(data.flags)
    setLibrary(data.citations)
    setTemplateName(data.template.name)
    setTemplateIntro(data.template.intro)
  }, [data])

  if (isLoading) return <LoadingState label="Loading settings…" />
  if (error) return <ErrorState message={error} />

  return (
    <>
      <PageHeader
        eyebrow="Platform admin"
        title="Global settings"
        description="Default report templates, the shared code-citation library, and feature flags."
        actions={
          <Button
            onClick={async () => {
              await Promise.all([
                settingsService.saveFlags(flags),
                settingsService.saveCitations(library),
                settingsService.saveTemplate({ name: templateName, intro: templateIntro }),
              ])
              toast.success("Global settings saved")
            }}
          >
            Save changes
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Default report templates</CardTitle>
          <CardDescription>Applied to new tenants until they publish their own branding.</CardDescription>
        </CardHeader>
        <CardContent className="flex max-w-2xl flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="template-name">Template name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="template-intro">Default introduction</Label>
            <Textarea
              id="template-intro"
              value={templateIntro}
              onChange={(e) => setTemplateIntro(e.target.value)}
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code citation library</CardTitle>
          <CardDescription>State building-code excerpts companies can attach to report sections.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {library.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[8rem_4rem_1fr]">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Code</Label>
                <Input
                  value={item.code}
                  onChange={(e) =>
                    setLibrary((rows) =>
                      rows.map((row) => (row.id === item.id ? { ...row, code: e.target.value } : row)),
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">State</Label>
                <Input
                  value={item.state}
                  onChange={(e) =>
                    setLibrary((rows) =>
                      rows.map((row) => (row.id === item.id ? { ...row, state: e.target.value } : row)),
                    )
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">{item.title}</Label>
                <Textarea
                  value={item.body}
                  onChange={(e) =>
                    setLibrary((rows) =>
                      rows.map((row) => (row.id === item.id ? { ...row, body: e.target.value } : row)),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
          <CardDescription>Roll features out globally without a deploy.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {flags.map((flag, index) => (
            <div
              key={flag.id}
              className="flex items-start justify-between gap-4 py-4"
              style={{ borderTop: index === 0 ? undefined : "1px solid var(--border)" }}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{flag.name}</p>
                  <StatusBadge status={flag.enabled ? "active" : "pending"} label={flag.stage} />
                </div>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={(checked) =>
                  setFlags((rows) =>
                    rows.map((row) => (row.id === flag.id ? { ...row, enabled: checked } : row)),
                  )
                }
                aria-label={`Toggle ${flag.name}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

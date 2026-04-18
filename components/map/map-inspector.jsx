"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getConnectionType } from "@/lib/constants";
import { createGroupedEdgeMapSelection } from "@/lib/map-selection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </section>
  );
}

function ValueList({ items, emptyLabel }) {
  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyLabel}</div>;
  }

  return <div className="flex flex-wrap gap-1.5">{items}</div>;
}

function Field({ label, value, muted = false }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={muted ? "text-sm text-muted-foreground" : "text-sm"}>{value}</div>
    </div>
  );
}

function RelationshipList({
  selection,
  connectionsById,
  onSelectionChange,
}) {
  const relationships = selection.connectionIds
    .map((connectionId) => connectionsById.get(connectionId))
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {relationships.map((connection) => {
        const type = getConnectionType(connection.type);
        const isActive = connection.id === selection.activeConnectionId;

        return (
          <button
            key={connection.id}
            type="button"
            className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
              isActive
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/60"
            }`}
            onClick={() =>
              onSelectionChange(
                createGroupedEdgeMapSelection({
                  sourceId: selection.sourceId,
                  targetId: selection.targetId,
                  connectionIds: selection.connectionIds,
                  activeConnectionId: connection.id,
                })
              )
            }
          >
            <div className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: type?.color || "#94a3b8" }}
              />
              <span className="font-medium">{type?.label || connection.type}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {connection.note?.trim() || "No note"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ConnectionEditor({
  connection,
  sourceName,
  targetName,
  draftType,
  draftNote,
  hasChanges,
  onTypeChange,
  onNoteChange,
  onSave,
  onDelete,
  onSelectNode,
  allConnectionTypes,
}) {
  if (!connection) return null;

  return (
    <>
      <Section title="Connection">
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <button
              type="button"
              className="text-left hover:underline"
              onClick={() => onSelectNode(connection.sourceId)}
            >
              {sourceName}
            </button>
            <ArrowRight className="size-4 text-muted-foreground" />
            <button
              type="button"
              className="text-left hover:underline"
              onClick={() => onSelectNode(connection.targetId)}
            >
              {targetName}
            </button>
          </div>
        </div>
      </Section>

      <Section title="Edit relationship">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Relationship type</Label>
            <Select value={draftType} onValueChange={onTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent>
                {allConnectionTypes.map((connectionType) => (
                  <SelectItem key={connectionType.value} value={connectionType.value}>
                    <div className="flex flex-col">
                      <span>{connectionType.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {connectionType.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="map-inspector-connection-note">Note</Label>
            <Textarea
              id="map-inspector-connection-note"
              rows={4}
              value={draftNote}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Add context for this relationship"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onSave} disabled={!draftType || !hasChanges}>
              Save relationship
            </Button>
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete connection
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}

function NodeInspector({
  system,
  domains,
  categories,
  relatedSystems,
  connectionCount,
  isPinned,
  isIsolated,
  onEdit,
  onCreateConnection,
  onHide,
  onTogglePin,
  onToggleIsolate,
  onDelete,
  onSelectNode,
}) {
  const domainBadges = domains.map((domain) => (
    <Badge
      key={domain.id}
      className="text-white"
      style={{ backgroundColor: domain.color }}
    >
      {domain.name}
    </Badge>
  ));

  const categoryBadges = categories.map((category) => (
    <Badge
      key={category.id}
      className="text-white"
      style={{ backgroundColor: category.color }}
    >
      {category.name}
    </Badge>
  ));

  return (
    <>
      <Card className="border-none bg-transparent py-0 shadow-none ring-0">
        <CardHeader className="px-0">
          <CardTitle>{system.name}</CardTitle>
          <CardDescription>
            {system.vendor || "No vendor"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button type="button" variant="outline" onClick={onCreateConnection}>
              Create connection
            </Button>
            <Button type="button" variant="outline" onClick={onHide}>
              Hide
            </Button>
            <Button type="button" variant="outline" onClick={onTogglePin}>
              {isPinned ? "Unpin" : "Pin"}
            </Button>
            <Button type="button" variant="outline" onClick={onToggleIsolate}>
              {isIsolated ? "Clear isolate" : "Isolate"}
            </Button>
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>

          <Separator />

          <div className="grid gap-4">
            <Field
              label="URL"
              value={
                system.url ? (
                  <Link
                    href={system.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    {system.url}
                    <ExternalLink className="size-3.5" />
                  </Link>
                ) : (
                  "No URL"
                )
              }
              muted={!system.url}
            />
            <Field
              label="Description"
              value={system.description || "No description"}
              muted={!system.description}
            />
            <Field
              label="Connection count"
              value={`${connectionCount} ${connectionCount === 1 ? "connection" : "connections"}`}
            />
          </div>
        </CardContent>
      </Card>

      <Section title="Domains">
        <ValueList items={domainBadges} emptyLabel="No domains" />
      </Section>

      <Section title="Categories">
        <ValueList items={categoryBadges} emptyLabel="No categories" />
      </Section>

      <Section title="Related systems">
        {relatedSystems.length === 0 ? (
          <div className="text-sm text-muted-foreground">No related systems</div>
        ) : (
          <div className="space-y-2">
            {relatedSystems.map((relatedSystem) => (
              <button
                key={relatedSystem.id}
                type="button"
                className="flex w-full items-start justify-between rounded-lg border px-3 py-2 text-left hover:bg-muted/60"
                onClick={() => onSelectNode(relatedSystem.id)}
              >
                <div>
                  <div className="font-medium">{relatedSystem.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {relatedSystem.relationshipLabels.join(", ")}
                  </div>
                </div>
                <Badge variant="outline">{relatedSystem.connectionCount}</Badge>
              </button>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function MultiSelectionInspector({
  systems,
  selectedNodeIds,
}) {
  return (
    <>
      <Card className="border-none bg-transparent py-0 shadow-none ring-0">
        <CardHeader className="px-0">
          <CardTitle>{selectedNodeIds.length} systems selected</CardTitle>
          <CardDescription>Use shift or command click to refine the selection.</CardDescription>
        </CardHeader>
      </Card>

      <Section title="Selected systems">
        <div className="space-y-2">
          {systems.map((system) => (
            <div key={system.id} className="rounded-lg border px-3 py-2">
              <div className="font-medium">{system.name}</div>
              <div className="text-xs text-muted-foreground">
                {system.vendor || "No vendor"}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function EmptyInspector() {
  return (
    <Card className="border-none bg-transparent py-0 shadow-none ring-0">
      <CardHeader className="px-0">
        <CardTitle>Inspector</CardTitle>
        <CardDescription>
          Select a node or relationship to inspect details and take action.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-0">
        <div className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
          Click a node for system details, click a connection for relationship details, or shift-click to review a multi-selection summary.
        </div>
      </CardContent>
    </Card>
  );
}

export function MapInspector({
  selection,
  systemsById,
  connectionsById,
  domainsById,
  categoriesById,
  allConnectionTypes,
  hiddenNodeIdSet,
  pinnedNodeIdSet,
  isolatedNodeId,
  connectionDraft,
  onConnectionDraftTypeChange,
  onConnectionDraftNoteChange,
  onSaveConnection,
  onDeleteConnection,
  onEditNode,
  onCreateConnection,
  onHideNode,
  onTogglePinNode,
  onToggleIsolateNode,
  onDeleteNode,
  onSelectNode,
  onSelectionChange,
}) {
  const activeConnectionId = selection.kind === "edge"
    ? selection.connectionId
    : selection.kind === "grouped-edge"
      ? selection.activeConnectionId
      : null;

  const activeConnection = activeConnectionId
    ? connectionsById.get(activeConnectionId)
    : null;

  const selectedSystem = selection.kind === "node"
    ? systemsById.get(selection.nodeId)
    : null;

  const multiSystems = selection.kind === "multi"
    ? selection.nodeIds.map((nodeId) => systemsById.get(nodeId)).filter(Boolean)
    : [];

  const edgeSourceName = activeConnection
    ? systemsById.get(activeConnection.sourceId)?.name || "Unknown"
    : "";
  const edgeTargetName = activeConnection
    ? systemsById.get(activeConnection.targetId)?.name || "Unknown"
    : "";

  const nodeDomains = selectedSystem
    ? (selectedSystem.domainIds || []).map((domainId) => domainsById.get(domainId)).filter(Boolean)
    : [];
  const nodeCategories = selectedSystem
    ? (selectedSystem.categoryIds || []).map((categoryId) => categoriesById.get(categoryId)).filter(Boolean)
    : [];

  const relatedSystems = useMemo(() => {
    if (!selectedSystem) return [];

    const grouped = new Map();

    for (const connection of connectionsById.values()) {
      if (
        connection.sourceId !== selectedSystem.id &&
        connection.targetId !== selectedSystem.id
      ) {
        continue;
      }

      const otherId =
        connection.sourceId === selectedSystem.id
          ? connection.targetId
          : connection.sourceId;
      const otherSystem = systemsById.get(otherId);

      if (!otherSystem) continue;

      const existing = grouped.get(otherId) || {
        id: otherId,
        name: otherSystem.name,
        connectionCount: 0,
        relationshipLabels: [],
      };

      existing.connectionCount += 1;
      existing.relationshipLabels.push(getConnectionType(connection.type)?.label || connection.type);
      grouped.set(otherId, existing);
    }

    return Array.from(grouped.values()).sort(
      (a, b) => b.connectionCount - a.connectionCount || a.name.localeCompare(b.name)
    );
  }, [connectionsById, selectedSystem, systemsById]);

  const connectionCount = relatedSystems.reduce(
    (total, relatedSystem) => total + relatedSystem.connectionCount,
    0
  );

  const hasConnectionChanges = Boolean(
    activeConnection &&
      connectionDraft.type &&
      (
        connectionDraft.type !== activeConnection.type ||
        connectionDraft.note.trim() !== (activeConnection.note || "")
      )
  );

  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-4">
        {selection.kind === "empty" && <EmptyInspector />}

        {selection.kind === "node" && selectedSystem && (
          <NodeInspector
            system={selectedSystem}
            domains={nodeDomains}
            categories={nodeCategories}
            relatedSystems={relatedSystems}
            connectionCount={connectionCount}
            isPinned={pinnedNodeIdSet.has(selectedSystem.id)}
            isIsolated={isolatedNodeId === selectedSystem.id}
            onEdit={() => onEditNode(selectedSystem)}
            onCreateConnection={() => onCreateConnection(selectedSystem)}
            onHide={() => onHideNode(selectedSystem.id)}
            onTogglePin={() => onTogglePinNode(selectedSystem.id)}
            onToggleIsolate={() => onToggleIsolateNode(selectedSystem.id)}
            onDelete={() => onDeleteNode(selectedSystem)}
            onSelectNode={onSelectNode}
          />
        )}

        {selection.kind === "multi" && (
          <MultiSelectionInspector
            systems={multiSystems}
            selectedNodeIds={selection.nodeIds}
          />
        )}

        {(selection.kind === "edge" || selection.kind === "grouped-edge") && activeConnection && (
          <>
            <Card className="border-none bg-transparent py-0 shadow-none ring-0">
              <CardHeader className="px-0">
                <CardTitle>
                  {selection.kind === "grouped-edge" ? "Grouped relationships" : "Relationship"}
                </CardTitle>
                <CardDescription>
                  Inspect and edit the selected connection.
                </CardDescription>
              </CardHeader>
            </Card>

            {selection.kind === "grouped-edge" && (
              <Section title="All relationships">
                <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                  <div className="mb-3 flex items-center gap-2 font-medium">
                    <button
                      type="button"
                      className="text-left hover:underline"
                      onClick={() => onSelectNode(selection.sourceId)}
                    >
                      {systemsById.get(selection.sourceId)?.name || "Unknown"}
                    </button>
                    <ArrowRight className="size-4 text-muted-foreground" />
                    <button
                      type="button"
                      className="text-left hover:underline"
                      onClick={() => onSelectNode(selection.targetId)}
                    >
                      {systemsById.get(selection.targetId)?.name || "Unknown"}
                    </button>
                  </div>
                  <RelationshipList
                    selection={selection}
                    connectionsById={connectionsById}
                    onSelectionChange={onSelectionChange}
                  />
                </div>
              </Section>
            )}

            <ConnectionEditor
              connection={activeConnection}
              sourceName={edgeSourceName}
              targetName={edgeTargetName}
              draftType={connectionDraft.type}
              draftNote={connectionDraft.note}
              hasChanges={hasConnectionChanges}
              onTypeChange={onConnectionDraftTypeChange}
              onNoteChange={onConnectionDraftNoteChange}
              onSave={onSaveConnection}
              onDelete={onDeleteConnection}
              onSelectNode={onSelectNode}
              allConnectionTypes={allConnectionTypes}
            />
          </>
        )}
      </div>
    </ScrollArea>
  );
}

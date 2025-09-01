"use client";

import { useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ActionError, ActionResult } from "@/lib/action-utils";

interface MigrationOption {
  id: number;
  name: string;
  questionCount?: number;
}

interface MigrationDialogProps {
  entityType: string;
  currentEntity: MigrationOption;
  availableEntities: MigrationOption[];
  migrateAction: (
    fromId: string,
    toId: string
  ) => Promise<ActionResult<{ migratedCount: number }>>;
  onMigrationComplete?: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

export function MigrationDialog({
  entityType,
  currentEntity,
  availableEntities,
  migrateAction,
  onMigrationComplete,
  disabled = false,
  disabledReason,
}: MigrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  // Filter out the current entity from available options
  const filteredEntities = availableEntities.filter(
    (entity) => entity.id !== currentEntity.id
  );

  const handleMigrate = async () => {
    if (!selectedTargetId) {
      toast.error("Please select a target " + entityType.toLowerCase());
      return;
    }

    setIsLoading(true);
    try {
      const response = await migrateAction(
        currentEntity.id.toString(),
        selectedTargetId
      );

      if (response.success) {
        const migratedCount = response.data?.migratedCount || 0;
        toast.success(
          `Successfully migrated ${migratedCount} question${
            migratedCount !== 1 ? "s" : ""
          } to the selected ${entityType.toLowerCase()}`
        );
        setIsOpen(false);
        setSelectedTargetId("");
        onMigrationComplete?.();
      } else {
        const err = response.error;
        let message = "Migration failed";
        if (typeof err === "string") {
          message = err;
        } else if (err && typeof err === "object") {
          const parts = Object.entries(err as ActionError).map(
            ([field, messages]) => `${field}: ${messages?.[0] ?? "Invalid"}`
          );
          if (parts.length > 0) message = parts.join("; ");
        }
        toast.error(message);
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Failed to migrate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTarget = filteredEntities.find(
    (entity) => entity.id.toString() === selectedTargetId
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          title={
            disabled
              ? disabledReason
              : `Migrate questions to another ${entityType.toLowerCase()}`
          }
        >
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Migrate Questions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Migrate Questions</DialogTitle>
          <DialogDescription>
            Migrate all questions from <strong>{currentEntity.name}</strong> to
            another {entityType.toLowerCase()}. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <Label className="text-sm font-medium">From:</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium">{currentEntity.name}</span>
                {typeof currentEntity.questionCount === "number" && (
                  <Badge variant="secondary">
                    {currentEntity.questionCount} questions
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-select">To:</Label>
            <Select
              value={selectedTargetId}
              onValueChange={setSelectedTargetId}
            >
              <SelectTrigger id="target-select">
                <SelectValue
                  placeholder={`Select target ${entityType.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {filteredEntities.length === 0 ? (
                  <SelectItem value="" disabled>
                    No other {entityType.toLowerCase()}s available
                  </SelectItem>
                ) : (
                  filteredEntities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{entity.name}</span>
                        {typeof entity.questionCount === "number" && (
                          <Badge variant="outline" className="text-xs">
                            {entity.questionCount}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedTarget && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-800 dark:text-green-200">
                <strong>Preview:</strong> All questions will be moved from{" "}
                <strong>{currentEntity.name}</strong> to{" "}
                <strong>{selectedTarget.name}</strong>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleMigrate}
            disabled={
              !selectedTargetId || isLoading || filteredEntities.length === 0
            }
          >
            {isLoading ? "Migrating..." : "Migrate Questions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

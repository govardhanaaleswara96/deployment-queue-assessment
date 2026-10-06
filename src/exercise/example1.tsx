

/**
 * ============================================================================
 * Exercise 1 - Deployment Card
 * ============================================================================
 *
 * Scenario
 * --------
 *
 * Your team is building an internal Deployment Queue application used by
 * Release Engineers to monitor application deployments.
 *
 * A mock API response has been provided in src/data/MOCK_DATA.ts.
 *
 * In this exercise, your task is to build a reusable DeploymentCard component.
 *
 * ============================================================================
 *
 * ## Requirements

### 1. Component Setup

- Create a `DeploymentCard` component.
- Keep the provided imports unchanged.
- Use React with TypeScript.
- Use the existing Shadcn UI components:
  - Card
  - Badge
  - Button
  - Separator

---
### 2. Deployment Interface

Create the `Deployment` interface with the mockdata properties:
make sure 
environment: "Production" | "QA" | "Development" | "Staging";
status: "Pending" | "In Progress" | "Completed";
priority: "Low" | "Medium" | "High" | "Critical";



 * ============================================================================
 *
 * UI Requirements
 *
 * • Use the provided shadcn/ui components where appropriate.
 *
 * • Environment and Status should be displayed using badges.
 *
 * • Color the left border of the card based on priority.
 *   Priority values in the data are: Low, Medium, High, and Critical.
 *   Choose a distinct color for each priority.
 *
 * • Display a "advance to [next status]" button at the bottom of the card.
 *
 * • Use appropriate spacing and visual hierarchy.
 *
 * • The component should remain responsive.
 *
 * ============================================================================
 *
 * Technical Expectations
 *
 * • Use TypeScript.
 *
 * • Define appropriate interfaces/types.
 *
 * • Keep the component reusable.
 *
 * • Do not hardcode values.
 *
 * • Avoid unnecessary duplication.
 *
 * • Write clean, maintainable code.
 *
 * ============================================================================
 *
 * Evaluation
 *
 * We will evaluate:
 *
 * ✓ React Fundamentals
 * ✓ Component Composition
 * ✓ TypeScript
 * ✓ Code Organization
 * ✓ Reusability
 * ✓ Tailwind CSS
 *
 * ============================================================================
 *
 * Note
 *
 * This exercise focuses only on the DeploymentCard component.
 *
 * Additional requirements will be introduced in later exercises.
 *
 * ============================================================================
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface Deployment {
  id: string;
  application: string;
  version: string;
  environment: "Production" | "QA" | "Development" | "Staging";
  status: "Pending" | "In Progress" | "Completed";
  requestedBy: string;
  requestedAt: string;
  scheduledAt: string;
  region: string;
  priority: "Low" | "Medium" | "High" | "Critical";
}

const priorityBorderClasses = {
  Low: "border-l-gray-400",
  Medium: "border-l-sky-500",
  High: "border-l-orange-500",
  Critical: "border-l-red-500",
};

const statusBadgeClasses = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
};

const DeploymentCard = ({ deployment, onAdvance }: {
  deployment: Deployment;
  onAdvance?: (deploymentId: string) => void;
}) => {
  const scheduledDate = new Date(deployment.scheduledAt).toLocaleDateString(
    "en-GB",
    { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" },
  );
  const isCompleted = deployment.status === "Completed";
  const nextStatus = deployment.status === "Pending" ? "In Progress" : "Completed";

  return (
    <Card className={`w-full border-l-4 transition-shadow hover:shadow-md ${priorityBorderClasses[deployment.priority]}`}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="break-words text-lg">{deployment.application}</CardTitle>
            <CardDescription>{deployment.version}</CardDescription>
          </div>
          <Badge variant="outline">{deployment.environment}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs text-muted-foreground">Deployment ID</p>
          <p className="font-semibold tracking-wide">{deployment.id}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className={statusBadgeClasses[deployment.status]}>
            {deployment.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Priority <span className="font-semibold text-foreground">{deployment.priority}</span>
          </span>
        </div>
        <Separator />
        <dl className="grid grid-cols-1 gap-5 text-sm min-[320px]:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Requested By</dt>
            <dd className="break-words font-medium">{deployment.requestedBy}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Scheduled</dt>
            <dd className="font-medium">
              <time dateTime={deployment.scheduledAt}>{scheduledDate}</time>
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Region</dt>
            <dd className="break-words font-medium">{deployment.region}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Environment</dt>
            <dd className="break-words font-medium">{deployment.environment}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="w-full whitespace-normal"
          disabled={isCompleted || !onAdvance}
          onClick={() => onAdvance?.(deployment.id)}
        >
          {isCompleted ? "✓ Completed" : `Advance to ${nextStatus}`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeploymentCard;

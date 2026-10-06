/**
 * ============================================================================
 * Exercise 3 - Deployment Queue
 * ============================================================================
 *
 * Scenario
 * --------
 *
 * Congratulations!
 *
 * The DeploymentCard component and search functionality have been completed.
 *
 * Your next task is to build the Deployment Queue page by integrating the
 * previous exercises.
 *
 * ============================================================================
 *
 * Requirements
 *
 * Build a Deployment Queue page using the supplied mock API response.
 *
 * The page should display all deployments using the DeploymentCard component
 * created in Exercise 1.
 *
 * Use the custom hook created in Exercise 2 for searching deployments.
 *
 * ============================================================================
 *
 * Functional Requirements
 *
 * 1. Fetch deployments using React Query.
 *
 * 2. Display all deployments.
 *
 * 3. Search deployments by Application Name.
 *
 * 4. Display the following summary:
 *
 *      Total Deployments
 *
 * 5. Add a Status filter.
 *
 *      All
 *      Pending
 *      In Progress
 *      Completed
 *      Failed
 *
 * 6. Display an Empty State when no deployments match the search/filter.
 *
 * 7. Display a Loading State while data is loading.
 *
 * 8. Display an Error State when the request fails.
 *
 * ============================================================================
 *
 * Technical Expectations
 *
 * • React Query
 *
 * • TypeScript
 *
 * • Reusable Components
 *
 * • Clean Folder Structure
 *
 * • Avoid duplicated logic
 *
 * • Use the custom hook from Exercise 2
 *
 * ============================================================================
 *
 * Bonus (Optional)
 *
 * If time permits, implement one or more of the following:
 *
 * • Sort deployments by Scheduled Date
 *
 * • Display deployment counts grouped by Status
 *
 * • Display the number of filtered deployments
 *
 * • Highlight the matched search text
 *
 * ============================================================================
 *
 * Notes
 *
 * • You may create additional components if needed.
 *
 * • You may extend the custom hook created in Exercise 2.
 *
 * • Focus on clean architecture over visual appearance.
 *
 * ============================================================================
 *
 * Evaluation
 *
 * ✓ React
 * ✓ React Query
 * ✓ TypeScript
 * ✓ Component Composition
 * ✓ Hooks
 * ✓ State Management
 * ✓ Code Organization
 * ✓ Reusability
 * ✓ Tailwind CSS
 *
 * ============================================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getDeployments } from "@/api/diploymentApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeploymentCard, { type Deployment } from "./example1";
import { useDeploymentFilters } from "./example2";

/**
 * TODO
 *
 * Build the Deployment Queue page.
 *
 * Expected flow:
 *
 * React Query
 *        ↓
 * Deployment Data
 *        ↓
 * useDeploymentSearch()
 *        ↓
 * DeploymentCard[]
 */

export default function Example3() {
  const queryClient = useQueryClient();
  const { data: deployments, isPending, isError } = useQuery({
    queryKey: ["deployments"],
    queryFn: getDeployments,
  });
  const { search, setSearch, filteredDeployments } = useDeploymentFilters(deployments ?? []);
  const [status, setStatus] = useState("All");
  const statusOptions = ["All", "Pending", "In Progress", "Completed", "Failed"];
  const visibleDeployments = filteredDeployments.filter(
    (deployment) => status === "All" || deployment.status === status,
  );

  const advanceDeployment = (deploymentId: string) => {
    queryClient.setQueryData<Deployment[]>(["deployments"], (currentDeployments) =>
      currentDeployments?.map((deployment) => {
        if (deployment.id !== deploymentId || deployment.status === "Completed") {
          return deployment;
        }
        return {
          ...deployment,
          status: deployment.status === "Pending" ? "In Progress" : "Completed",
        };
      }),
    );
  };

  return (
    <main className="min-h-screen bg-slate-200">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <header className="flex flex-col gap-4 rounded-xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">🚀 Deployment Queue</h1>
            <p className="mt-1 text-slate-300">Monitor deployment requests across environments.</p>
          </div>
          {!isPending && !isError && (
            <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-300">Total Deployments</p>
              <p className="text-3xl font-bold">{deployments.length}</p>
            </div>
          )}
        </header>

        {isPending ? (
          <p role="status">Loading deployments...</p>
        ) : isError ? (
          <p role="alert">Unable to load deployments. Please try again later.</p>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Search &amp; Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <label htmlFor="deployment-search" className="sr-only">Search by application name</label>
                <input
                  id="deployment-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by application name..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                />
                <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={status === option ? "default" : "outline"}
                      aria-pressed={status === option}
                      onClick={() => setStatus(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            {visibleDeployments.length === 0 ? (
              <Card>
                <CardContent className="space-y-2 text-center" role="status">
                  <h2 className="text-lg font-semibold">No Deployments Found</h2>
                  <p className="text-muted-foreground">Try changing your search keyword or selecting a different status.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {visibleDeployments.map((deployment) => (
                  <DeploymentCard key={deployment.id} deployment={deployment} onAdvance={advanceDeployment} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

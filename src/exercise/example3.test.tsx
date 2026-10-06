import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";
import { getDeployments } from "@/api/diploymentApi";
import { data } from "@/data/MOCK_DATA";

vi.mock("@/api/diploymentApi", () => ({ getDeployments: vi.fn() }));

function renderQueue() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

async function renderLoadedQueue() {
  renderQueue();
  await screen.findByText("Customer Portal");
}

describe("Deployment Queue", () => {
  beforeEach(() => {
    vi.mocked(getDeployments).mockReset();
    vi.mocked(getDeployments).mockResolvedValue(data);
  });

  it("shows a loading state while deployments are being fetched", () => {
    vi.mocked(getDeployments).mockReturnValue(new Promise(() => {}));
    renderQueue();

    expect(screen.getByRole("status")).toHaveTextContent("Loading deployments");
  });

  it("shows an error state when fetching fails", async () => {
    vi.mocked(getDeployments).mockRejectedValue(new Error("Request failed"));
    renderQueue();

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load deployments");
    expect(screen.queryByText("No Deployments Found")).not.toBeInTheDocument();
  });

  it("mounts the queue through App and renders every fetched deployment", async () => {
    await renderLoadedQueue();

    expect(screen.getByRole("heading", { name: /Deployment Queue/ })).toBeInTheDocument();
    for (const deployment of data) {
      expect(screen.getByText(deployment.application)).toBeInTheDocument();
      expect(screen.getByText(deployment.id)).toBeInTheDocument();
    }
  });

  it("keeps the total API count unchanged by search and status filters", async () => {
    await renderLoadedQueue();
    const header = screen.getByRole("banner");
    expect(within(header).getByText("Total Deployments")).toBeInTheDocument();
    expect(within(header).getByText("10")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Customer" } });
    fireEvent.click(screen.getByRole("button", { name: "Completed" }));

    expect(screen.getByText("No Deployments Found")).toBeInTheDocument();
    expect(within(header).getByText("10")).toBeInTheDocument();
  });

  it("searches application names case-insensitively without searching other fields", async () => {
    await renderLoadedQueue();
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "pAyMeNt" } });

    expect(screen.getByText("Payments API")).toBeInTheDocument();
    expect(screen.queryByText("Customer Portal")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Emily Davis" } });
    expect(screen.getByText("No Deployments Found")).toBeInTheDocument();
  });

  it.each(["Pending", "In Progress", "Completed", "Failed"])(
    "filters deployments by %s status",
    async (status) => {
      await renderLoadedQueue();
      fireEvent.click(screen.getByRole("button", { name: status }));

      for (const deployment of data) {
        if (deployment.status === status) {
          expect(screen.getByText(deployment.application)).toBeInTheDocument();
        } else {
          expect(screen.queryByText(deployment.application)).not.toBeInTheDocument();
        }
      }
      if (status === "Failed") {
        expect(screen.getByText("No Deployments Found")).toBeInTheDocument();
      }
    },
  );

  it("combines application search and status filtering", async () => {
    await renderLoadedQueue();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "service" } });
    fireEvent.click(screen.getByRole("button", { name: "Pending" }));

    for (const deployment of data) {
      if (deployment.application.toLowerCase().includes("service") && deployment.status === "Pending") {
        expect(screen.getByText(deployment.application)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(deployment.application)).not.toBeInTheDocument();
      }
    }
  });

  it("removes only the status restriction when All is selected", async () => {
    await renderLoadedQueue();
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "service" } });
    fireEvent.click(screen.getByRole("button", { name: "Pending" }));
    fireEvent.click(screen.getByRole("button", { name: "All" }));

    expect(input).toHaveValue("service");
    for (const deployment of data) {
      if (deployment.application.toLowerCase().includes("service")) {
        expect(screen.getByText(deployment.application)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(deployment.application)).not.toBeInTheDocument();
      }
    }
  });

  it("keeps controls available for empty results and allows clearing search", async () => {
    await renderLoadedQueue();
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "nonexistent" } });

    expect(screen.getByText("No Deployments Found")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filter by status" })).toBeInTheDocument();
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByText("Customer Portal")).toBeInTheDocument();
    expect(screen.queryByText("No Deployments Found")).not.toBeInTheDocument();
  });

  it("handles a successful response containing no deployments", async () => {
    vi.mocked(getDeployments).mockResolvedValue([]);
    renderQueue();

    expect(await screen.findByText("No Deployments Found")).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByText("0")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("advances a Pending deployment to In Progress and updates its button", async () => {
    await renderLoadedQueue();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Customer Portal" } });
    fireEvent.click(screen.getByRole("button", { name: "Advance to In Progress" }));

    expect(await screen.findByRole("button", { name: "Advance to Completed" })).toBeEnabled();
    expect(screen.getAllByText("In Progress")).toHaveLength(2);
    expect(screen.getByText("Customer Portal")).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByText("10")).toBeInTheDocument();
  });

  it("advances an In Progress deployment to Completed and disables advancement", async () => {
    await renderLoadedQueue();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Payments API" } });
    fireEvent.click(screen.getByRole("button", { name: "Advance to Completed" }));

    const completedButton = await screen.findByRole("button", { name: "✓ Completed" });
    expect(completedButton).toBeDisabled();
    expect(screen.getAllByText("Completed")).toHaveLength(2);
    fireEvent.click(completedButton);
    expect(screen.getByRole("button", { name: "✓ Completed" })).toBeDisabled();
  });

  it("removes an advanced deployment from the selected status and shows it under the next status", async () => {
    await renderLoadedQueue();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Customer Portal" } });
    fireEvent.click(screen.getByRole("button", { name: "Pending" }));
    fireEvent.click(screen.getByRole("button", { name: "Advance to In Progress" }));

    await waitFor(() => expect(screen.queryByText("Customer Portal")).not.toBeInTheDocument());
    expect(screen.getByText("No Deployments Found")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "In Progress" }));
    expect(screen.getByText("Customer Portal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Advance to Completed" }));

    await waitFor(() => expect(screen.queryByText("Customer Portal")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.getByText("Customer Portal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "✓ Completed" })).toBeDisabled();
    expect(screen.getByRole("searchbox")).toHaveValue("Customer Portal");
  });
});

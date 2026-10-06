import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import  DeploymentCard  from "./DeploymentCard";
import type { Deployment } from "./example1";

const deployment: Deployment = {
  id: "DEP-1001",
  application: "Customer Portal",
  version: "v4.2.1",
  environment: "Production",
  status: "Pending",
  requestedBy: "John Smith",
  requestedAt: "2026-07-18T09:30:00Z",
  scheduledAt: "2026-07-20T10:00:00Z",
  region: "US-East",
  priority: "High",
};

describe("DeploymentCard", () => {
  it("renders the application name", () => {
    render(<DeploymentCard deployment={deployment} />);

    expect(
      screen.getByText("Customer Portal")
    ).toBeInTheDocument();
  });

  it("renders the deployment id", () => {
    render(<DeploymentCard deployment={deployment} />);

    expect(
      screen.getByText("DEP-1001")
    ).toBeInTheDocument();
  });

  it("renders the version", () => {
    render(<DeploymentCard deployment={deployment} />);

    expect(
      screen.getByText("v4.2.1")
    ).toBeInTheDocument();
  });


  it("renders the deployment status", () => {
    render(<DeploymentCard deployment={deployment} />);

    expect(
      screen.getByText("Pending")
    ).toBeInTheDocument();
  });

  it("renders the requested by value", () => {
    render(<DeploymentCard deployment={deployment} />);

    expect(
      screen.getByText("John Smith")
    ).toBeInTheDocument();
  });

  it("renders the scheduled date", () => {
    render(<DeploymentCard deployment={deployment} />);

    expect(
      screen.getByText(/2026/i)
    ).toBeInTheDocument();
  });

});

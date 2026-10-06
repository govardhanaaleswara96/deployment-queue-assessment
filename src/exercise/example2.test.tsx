import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDeploymentFilters } from "./example2";

const deployments = [
  { id: "DEP-1001", application: "Customer Portal", requestedBy: "John Smith" },
  { id: "DEP-1002", application: "Payments API", requestedBy: "Emily Davis" },
  { id: "DEP-1003", application: "Customer API", requestedBy: "Michael Lee" },
];

describe("useDeploymentFilters", () => {
  it("returns all deployments when search is empty", () => {
    const { result } = renderHook(() => useDeploymentFilters(deployments));

    expect(result.current.search).toBe("");
    expect(result.current.filteredDeployments).toEqual(deployments);
  });

  it("matches partial application names and preserves deployment order and fields", () => {
    const { result } = renderHook(() => useDeploymentFilters(deployments));

    act(() => result.current.setSearch("Customer"));

    expect(result.current.search).toBe("Customer");
    expect(result.current.filteredDeployments).toEqual([
      deployments[0],
      deployments[2],
    ]);
  });

  it("matches application names case-insensitively", () => {
    const { result } = renderHook(() => useDeploymentFilters(deployments));

    act(() => result.current.setSearch("pAyMeNtS"));

    expect(result.current.filteredDeployments).toEqual([deployments[1]]);
  });

  it("returns an empty array when no application matches", () => {
    const { result } = renderHook(() => useDeploymentFilters(deployments));

    act(() => result.current.setSearch("Inventory"));

    expect(result.current.filteredDeployments).toEqual([]);
  });

  it("restores all deployments when search is cleared", () => {
    const { result } = renderHook(() => useDeploymentFilters(deployments));

    act(() => result.current.setSearch("Payments"));
    expect(result.current.filteredDeployments).toEqual([deployments[1]]);

    act(() => result.current.setSearch(""));

    expect(result.current.filteredDeployments).toEqual(deployments);
  });

  it("does not match values found only in other fields", () => {
    const { result } = renderHook(() => useDeploymentFilters(deployments));

    act(() => result.current.setSearch("John Smith"));
    expect(result.current.filteredDeployments).toEqual([]);

    act(() => result.current.setSearch("DEP-1001"));
    expect(result.current.filteredDeployments).toEqual([]);
  });

  it("handles an empty deployment array", () => {
    const { result } = renderHook(() =>
      useDeploymentFilters<{ application: string }>([]),
    );

    expect(result.current.filteredDeployments).toEqual([]);

    act(() => result.current.setSearch("Customer"));

    expect(result.current.filteredDeployments).toEqual([]);
  });

  it("updates results when supplied deployments change while retaining search", () => {
    const { result, rerender } = renderHook(
      ({ items }) => useDeploymentFilters(items),
      { initialProps: { items: deployments } },
    );

    act(() => result.current.setSearch("Customer"));
    rerender({ items: [deployments[2]] });

    expect(result.current.search).toBe("Customer");
    expect(result.current.filteredDeployments).toEqual([deployments[2]]);
  });

  it("does not mutate the supplied deployments", () => {
    const items = deployments.map((deployment) => ({ ...deployment }));
    const originalItems = items.map((deployment) => ({ ...deployment }));
    const { result } = renderHook(() => useDeploymentFilters(items));

    act(() => result.current.setSearch("Payments"));

    expect(result.current.filteredDeployments).toEqual([originalItems[1]]);
    expect(items).toEqual(originalItems);
  });
});

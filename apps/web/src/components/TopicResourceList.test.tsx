import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TopicResourceList from "./TopicResourceList";

describe("TopicResourceList", () => {
  it("renders each resource as a link to its url", () => {
    render(
      <TopicResourceList
        resources={[
          { url: "https://react.dev/learn", title: "Learn React" },
          { url: "https://react.dev/reference", title: "Reference" },
        ]}
      />,
    );
    const learn = screen.getByRole("link", { name: "Learn React" });
    expect(learn).toHaveAttribute("href", "https://react.dev/learn");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("renders nothing when there are no resources", () => {
    const { container } = render(<TopicResourceList resources={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

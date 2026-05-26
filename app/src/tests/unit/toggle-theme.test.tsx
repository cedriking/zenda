import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ToggleTheme from "@/components/toggle-theme";
import { ipc } from "@/ipc/manager";

describe("ToggleTheme", () => {
  it("renders a button", () => {
    render(<ToggleTheme />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("renders an svg icon inside the button", () => {
    render(<ToggleTheme />);
    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("shows the moon icon by default (light mode)", () => {
    render(<ToggleTheme />);
    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg?.classList).toContain("lucide-moon");
  });

  it("calls toggleTheme IPC on click", async () => {
    const user = userEvent.setup();
    render(<ToggleTheme />);
    const button = screen.getByRole("button");
    await user.click(button);
    expect(ipc.client.theme.toggleThemeMode).toHaveBeenCalled();
  });
});

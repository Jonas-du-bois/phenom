import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GlassTooltip from "../GlassTooltip.vue";

describe("GlassTooltip.vue", () => {
  it("renders trigger content correctly", () => {
    const wrapper = mount(GlassTooltip, {
      props: { content: "Tooltip content" },
      slots: { default: "<span>Trigger</span>" },
    });
    expect(wrapper.text()).toContain("Trigger");
  });

  it("is keyboard accessible", async () => {
    const wrapper = mount(GlassTooltip, {
      props: { content: "Tooltip content" },
      slots: { default: "<span>Trigger</span>" },
      attachTo: document.body,
    });

    const trigger = wrapper.find(".glass-tooltip-trigger");

    // Check for accessibility attributes
    expect(trigger.attributes("role")).toBe("button");
    expect(trigger.attributes("tabindex")).toBe("0");
    expect(trigger.attributes("aria-haspopup")).toBe("true");
    expect(trigger.attributes("aria-expanded")).toBe("false");

    // Check that aria-controls is present
    const controlsId = trigger.attributes("aria-controls");
    expect(controlsId).toBeDefined();

    // Test Enter key toggle
    await trigger.trigger("keydown.enter");
    expect(trigger.attributes("aria-expanded")).toBe("true");

    // Check if tooltip content has correct ID and role
    // Since it's teleported, we look in document.body
    const tooltipContent = document.getElementById(controlsId);
    expect(tooltipContent).not.toBeNull();
    expect(tooltipContent.getAttribute("role")).toBe("tooltip");

    await trigger.trigger("keydown.enter");
    expect(trigger.attributes("aria-expanded")).toBe("false");

    // Test Space key toggle
    await trigger.trigger("keydown.space");
    expect(trigger.attributes("aria-expanded")).toBe("true");
  });
});

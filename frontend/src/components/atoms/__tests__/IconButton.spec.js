import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import IconButton from "../IconButton.vue";

describe("IconButton", () => {
  it("renders correctly with default props", () => {
    const wrapper = mount(IconButton, {
      props: {
        ariaLabel: "Test Button",
      },
      slots: {
        default: '<span class="icon">Icon</span>',
      },
    });
    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
    expect(button.attributes("aria-label")).toBe("Test Button");
    expect(wrapper.find(".icon").exists()).toBe(true);
    expect(wrapper.find("svg.animate-spin").exists()).toBe(false);
  });

  it("shows spinner when loading is true", () => {
    const wrapper = mount(IconButton, {
      props: {
        ariaLabel: "Test Button",
        loading: true,
      },
      slots: {
        default: '<span class="icon">Icon</span>',
      },
    });
    const button = wrapper.find("button");

    expect(wrapper.find("svg.animate-spin").exists()).toBe(true);
    // Slot should be hidden
    expect(wrapper.find(".icon").exists()).toBe(false);
    // Button should be disabled
    expect(button.element.disabled).toBe(true);
    // Should have pointer-events-none class
    expect(button.classes()).toContain("pointer-events-none");
  });

  it("does not emit click when loading", async () => {
    const wrapper = mount(IconButton, {
      props: {
        ariaLabel: "Test Button",
        loading: true,
      },
    });
    const button = wrapper.find("button");
    await button.trigger("click");
    expect(wrapper.emitted("click")).toBeFalsy();
  });

  it("emits click when not loading", async () => {
    const wrapper = mount(IconButton, {
      props: {
        ariaLabel: "Test Button",
        loading: false,
      },
    });
    const button = wrapper.find("button");
    await button.trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });
});

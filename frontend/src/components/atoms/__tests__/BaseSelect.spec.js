import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import BaseSelect from "../BaseSelect.vue";

describe("BaseSelect", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ];

  it("renders correctly with options", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        label: "Test Label",
        modelValue: "option1",
        options,
      },
    });

    expect(wrapper.find("select").element.value).toBe("option1");
    expect(wrapper.text()).toContain("Test Label");
    expect(wrapper.findAll("option").length).toBe(3); // Placeholder + 2 options
  });

  it("associates label with select using id and for", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        label: "Test Label",
        id: "test-id",
        options,
      },
    });

    const label = wrapper.find("label");
    const select = wrapper.find("select");

    expect(label.attributes("for")).toBe("test-id");
    expect(select.attributes("id")).toBe("test-id");
  });

  it("generates an id if none is provided", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        label: "Test Label",
        options,
      },
    });

    const label = wrapper.find("label");
    const select = wrapper.find("select");

    const id = select.attributes("id");
    expect(id).toBeDefined();
    expect(label.attributes("for")).toBe(id);
  });

  it("sets aria-invalid and aria-describedby when error is present", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        label: "Test Label",
        id: "test-error-id",
        error: "Test Error",
        options,
      },
    });

    const select = wrapper.find("select");
    const errorMessage = wrapper.find("p.text-red-500");

    expect(select.attributes("aria-invalid")).toBe("true");
    expect(select.attributes("aria-describedby")).toBe("test-error-id-error");

    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.attributes("id")).toBe("test-error-id-error");
    expect(errorMessage.text()).toBe("Test Error");
  });

  it("does not set aria attributes when no error is present", () => {
    const wrapper = mount(BaseSelect, {
      props: {
        label: "Test Label",
        id: "test-no-error-id",
        options,
      },
    });

    const select = wrapper.find("select");
    const errorMessage = wrapper.find("p.text-red-500");

    expect(select.attributes("aria-invalid")).toBe("false");
    expect(select.attributes("aria-describedby")).toBeUndefined();
    expect(errorMessage.exists()).toBe(false);
  });
});

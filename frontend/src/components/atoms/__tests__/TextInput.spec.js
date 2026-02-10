import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import TextInput from "../TextInput.vue";

describe("TextInput", () => {
  it("renders correctly", () => {
    const wrapper = mount(TextInput, {
      props: {
        label: "Test Label",
        modelValue: "test value",
      },
    });
    expect(wrapper.find("input").element.value).toBe("test value");
    expect(wrapper.text()).toContain("Test Label");
  });

  it("associates label with input using id and for", () => {
    const wrapper = mount(TextInput, {
      props: {
        label: "Test Label",
        id: "test-id",
      },
    });

    const label = wrapper.find("label");
    const input = wrapper.find("input");

    expect(label.attributes("for")).toBe("test-id");
    expect(input.attributes("id")).toBe("test-id");
  });

  it("generates an id if none is provided", () => {
    const wrapper = mount(TextInput, {
      props: {
        label: "Test Label",
      },
    });

    const label = wrapper.find("label");
    const input = wrapper.find("input");

    const id = input.attributes("id");
    expect(id).toBeDefined();
    expect(label.attributes("for")).toBe(id);
  });

  it("sets aria-invalid and aria-describedby when error is present", () => {
    const wrapper = mount(TextInput, {
      props: {
        label: "Test Label",
        id: "test-error-id",
        error: "Test Error",
      },
    });

    const input = wrapper.find("input");
    const errorMessage = wrapper.find('p[role="alert"]');

    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.attributes("aria-describedby")).toBe("test-error-id-error");

    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.attributes("id")).toBe("test-error-id-error");
    expect(errorMessage.text()).toBe("Test Error");
  });

  it("does not set aria attributes when no error is present", () => {
    const wrapper = mount(TextInput, {
      props: {
        label: "Test Label",
        id: "test-no-error-id",
      },
    });

    const input = wrapper.find("input");
    const errorMessage = wrapper.find('p[role="alert"]');

    expect(input.attributes("aria-invalid")).toBe("false");
    expect(input.attributes("aria-describedby")).toBeUndefined();
    expect(errorMessage.exists()).toBe(false);
  });
});

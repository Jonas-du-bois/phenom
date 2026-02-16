import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ObservationCard from "../ObservationCard.vue";

// Mock dependencies
const pushMock = vi.fn();
vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const fetchCommentsMock = vi.fn();
const addCommentMock = vi.fn();
vi.mock("@/stores/comment", () => ({
  useCommentStore: () => ({
    fetchComments: fetchCommentsMock,
    addComment: addCommentMock,
    comments: [],
  }),
}));

const successToastMock = vi.fn();
const errorToastMock = vi.fn();
vi.mock("@/composables/useToast", () => ({
  useToast: () => ({
    success: successToastMock,
    error: errorToastMock,
  }),
}));

vi.mock("@/composables/useWebSocket", () => ({
  useWebSocket: () => ({
    messages: { value: [] },
  }),
}));

// Mock formatRelativeTime utility
vi.mock("@/utils/formatters", () => ({
  formatRelativeTime: () => "2 hours ago",
}));

// Mock image helpers
const mocks = vi.hoisted(() => ({
  getImageUrl: vi.fn((url) => (typeof url === "string" ? url : url.url)),
}));

vi.mock("@/utils/imageHelpers", () => ({
  getImageUrl: mocks.getImageUrl,
}));

describe("ObservationCard", () => {
  const mockObservation = {
    _id: "obs123",
    userId: { name: "Test User", avatar: "avatar.jpg" },
    city: "Paris",
    country: "France",
    createdAt: "2023-01-01",
    description: "A strange light in the sky",
    images: ["ufo.jpg"],
    ufoShapes: ["circle"],
    credibility: 80,
    strangeness: 90,
    commentsCount: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", () => {
    const wrapper = mount(ObservationCard, {
      props: {
        observation: mockObservation,
      },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Test User");
    expect(wrapper.text()).toContain("Paris");
  });

  it("is accessible via keyboard (tabindex and role)", () => {
    const wrapper = mount(ObservationCard, {
      props: {
        observation: mockObservation,
      },
    });
    const article = wrapper.find("article");

    // Check for tabindex="0" to ensure it's focusable
    expect(article.attributes("tabindex")).toBe("0");

    // Check for role="button" to semantics
    expect(article.attributes("role")).toBe("button");

    // Check for aria-label
    expect(article.attributes("aria-label")).toBe(
      "Observation de Test User à Paris",
    );
  });

  it("emits click event on Enter key", async () => {
    const wrapper = mount(ObservationCard, {
      props: {
        observation: mockObservation,
      },
    });
    const article = wrapper.find("article");

    await article.trigger("keydown.enter");
    expect(wrapper.emitted("click")).toBeTruthy();
    expect(wrapper.emitted("click")[0]).toEqual([mockObservation]);
  });

  it("emits click event on Space key", async () => {
    const wrapper = mount(ObservationCard, {
      props: {
        observation: mockObservation,
      },
    });
    const article = wrapper.find("article");

    await article.trigger("keydown.space");
    expect(wrapper.emitted("click")).toBeTruthy();
  });

  it("has accessible comment toggle button", async () => {
    const wrapper = mount(ObservationCard, {
      props: {
        observation: mockObservation,
      },
    });

    // Find the toggle button (it's the one with comment count text)
    const buttons = wrapper.findAll("button");
    const toggleButton = buttons.find((b) =>
      b.text().includes("5 commentaires"),
    );

    expect(toggleButton.exists()).toBe(true);
    expect(toggleButton.attributes("aria-expanded")).toBe("false");
    expect(toggleButton.attributes("aria-controls")).toBe(
      "comments-section-obs123",
    );
    expect(toggleButton.attributes("aria-label")).toBe(
      "Afficher 5 commentaires",
    );

    // Click to expand
    await toggleButton.trigger("click");
    expect(toggleButton.attributes("aria-expanded")).toBe("true");
    expect(toggleButton.attributes("aria-label")).toBe(
      "Masquer les commentaires",
    );
  });

  it("has accessible action buttons", () => {
    const wrapper = mount(ObservationCard, {
      props: {
        observation: mockObservation,
      },
    });

    const buttons = wrapper.findAll("button");
    const commentButton = buttons.find((b) => b.text().includes("Commenter"));
    const shareButton = buttons.find((b) => b.text().includes("Partager"));

    expect(commentButton.attributes("aria-label")).toBe(
      "Commenter cette observation",
    );
    expect(shareButton.attributes("aria-label")).toBe(
      "Partager cette observation",
    );
  });

  it("requests optimized image for objects", () => {
    const observationWithImageObj = {
      ...mockObservation,
      images: [{ url: "https://example.com/image.jpg", publicId: "123" }],
    };

    mount(ObservationCard, {
      props: {
        observation: observationWithImageObj,
      },
    });

    // Check if getImageUrl was called with optimization options
    expect(mocks.getImageUrl).toHaveBeenCalledWith(
      expect.objectContaining({ url: "https://example.com/image.jpg" }),
      expect.objectContaining({
        width: 800,
        height: 600,
        crop: "fill",
      }),
    );
  });
});

import {
  createWebSocketServer,
  publishToChannel,
  publishObservationEvent,
  publishCommentEvent,
} from "../src/config/websocket.js";
import http from "http";

describe("WebSocket Configuration", () => {
  let server;
  let wss;

  beforeEach(() => {
    // Create a test HTTP server
    server = http.createServer();
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe("createWebSocketServer", () => {
    it("should create a WebSocket server with PubSub", () => {
      wss = createWebSocketServer(server);

      expect(wss).toBeDefined();
      expect(wss.pub).toBeDefined();
    });

    it("should configure channels correctly", () => {
      wss = createWebSocketServer(server);

      expect(wss).toBeDefined();
      // Verify the server is configured with PubSub
      expect(typeof wss.pub).toBe("function");
    });
  });

  describe("publishToChannel", () => {
    it("should publish message to channel without error", () => {
      wss = createWebSocketServer(server);

      const testData = { id: "123", title: "Test" };

      // Verify the function executes without error
      expect(() =>
        publishToChannel("observations", "observation:created", testData)
      ).not.toThrow();
    });

    it("should handle publishing when WebSocket is not available", () => {
      // Do not create a WebSocket server

      // Verify the function gracefully handles the absence of WebSocket
      expect(() =>
        publishToChannel("observations", "observation:created", { id: "789" })
      ).not.toThrow();
    });
  });
});

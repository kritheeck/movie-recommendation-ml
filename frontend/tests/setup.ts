import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock convex/react for testing environments
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => false),
  useMutation: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
  useConvex: vi.fn(),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
  ConvexReactClient: vi.fn(),
}));

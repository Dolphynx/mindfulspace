import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

/**
 * End-to-end smoke tests.
 *
 * @remarks
 * These tests validate that the API boots correctly and exposes at least one
 * stable, publicly reachable endpoint (`/health`), suitable for monitoring
 * and readiness/liveness probes.
 */
describe("Application (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Health check endpoint.
   *
   * @remarks
   * This endpoint is expected to be publicly accessible and return a stable payload.
   */
  it("GET /health returns API health status", () => {
    return request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect({ status: "ok" });
  });
});

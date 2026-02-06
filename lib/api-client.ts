import { treaty } from "@elysiajs/eden";
import { App } from "@/app/api/[[...slugs]]/route";

// .api to enter /api prefix
export const apiClient = treaty<App>("localhost:3000").api;

export const getApiClient = (headers?: Headers) => {
  return treaty<App>("localhost:3000", { headers }).api;
};

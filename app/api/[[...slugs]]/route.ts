import { Elysia } from "elysia";
import { messages } from "../elysia/messages";
import { projects } from "../elysia/projects";
import { fragments } from "../elysia/fragments";

const app = new Elysia({ prefix: "/api" }).use([messages, projects, fragments]);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;
export const OPTIONS = app.fetch;

export type App = typeof app;

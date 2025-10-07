/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activities from "../activities.js";
import type * as auth from "../auth.js";
import type * as authAdapter from "../authAdapter.js";
import type * as calendar from "../calendar.js";
import type * as media from "../media.js";
import type * as meetings from "../meetings.js";
import type * as notifications from "../notifications.js";
import type * as planning from "../planning.js";
import type * as schoolInfo from "../schoolInfo.js";
import type * as seed from "../seed.js";
import type * as students from "../students.js";
import type * as teamMembers from "../teamMembers.js";
import type * as users from "../users.js";
import type * as votes from "../votes.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  auth: typeof auth;
  authAdapter: typeof authAdapter;
  calendar: typeof calendar;
  media: typeof media;
  meetings: typeof meetings;
  notifications: typeof notifications;
  planning: typeof planning;
  schoolInfo: typeof schoolInfo;
  seed: typeof seed;
  students: typeof students;
  teamMembers: typeof teamMembers;
  users: typeof users;
  votes: typeof votes;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

import { Place } from "../../schema/types";

export type QueryFields = keyof Omit<Place, "__typename">;

import { gql } from "apollo-server";
import setupServer from "./setupServer";
import { createTestClient } from "apollo-server-testing";
import nock from "nock";

describe("placeById", () => {
  it("should return place details given its id", async () => {
    const PLACE_BY_ID = gql`
      query GetPlace {
        placeById(id: "abc123") {
          address
          location {
            lat
            lng
          }
          name
          isOpen
          openingHours
          id
          rating
        }
      }
    `;

    const server = await setupServer();
    const { query } = createTestClient(server);

    const scope = nock("https://maps.googleapis.com/maps/api/place")
      .get("/details/json")
      // ignore query params
      .query(() => true)
      .reply(200, {
        html_attributions: [],
        status: "OK",
        result: {
          formatted_address: "Viale Gran Sasso, 23, 20131 Milano MI, Italy",
          geometry: { location: { lat: 45.4823803, lng: 9.220437199999997 } },
          name: "MoneyGram Milano",
          opening_hours: {
            open_now: false,
            weekday_text: [
              "Monday: 9:00 AM – 6:00 PM",
              "Tuesday: 9:00 AM – 6:00 PM",
              "Wednesday: 9:00 AM – 6:00 PM",
              "Thursday: 9:00 AM – 6:00 PM",
              "Friday: 9:00 AM – 6:00 PM",
              "Saturday: 9:00 AM – 12:30 PM",
              "Sunday: Closed",
            ],
          },
          place_id: "ChIJA92WPO_GhkcRccJQ3OA9QuU",
          rating: 4.3,
        },
      });

    expect(query({ query: PLACE_BY_ID })).resolves.toHaveProperty(
      "data.placeById"
    );
  });

  it("should return an error when Place Details API errors", async () => {
    const PLACE_BY_ID = gql`
      query GetPlace {
        placeById(id: "abc123") {
          address
          location {
            lat
            lng
          }
          name
          isOpen
          openingHours
          id
          rating
        }
      }
    `;

    const server = await setupServer();
    const { query } = createTestClient(server);

    const scope = nock("https://maps.googleapis.com/maps/api/place")
      .get("/details/json")
      // ignore query params
      .query(() => true)
      .reply(200, {
        html_attributions: [],
        status: "INVALID_REQUEST",
      });

    expect(query({ query: PLACE_BY_ID })).resolves.toHaveProperty("errors");
    expect(query({ query: PLACE_BY_ID })).resolves.not.toHaveProperty(
      "placeById"
    );
  });
});

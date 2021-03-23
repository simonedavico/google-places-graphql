import { PlaceDetailsCodec } from "./index";
import { isRight, isLeft } from "fp-ts/Either";

describe("PlaceDetailsCodec", () => {
  it("should decode a partial response", () => {
    expect(
      isRight(
        PlaceDetailsCodec.decode({
          html_attributions: [],
          status: "OK",
          result: {
            name: "foo",
          },
        })
      )
    ).toBe(true);
  });

  it("should decode a complete response", () => {
    expect(
      isRight(
        PlaceDetailsCodec.decode({
          html_attributions: [],
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
            reviews: [
              {
                author_name: "Alexandra Bocharov",
                rating: 5,
                text: "super fast service thank you very much gran sasso23",
              },
              { author_name: "monica mola", rating: 5, text: "great rate" },
              {
                author_name: "Medi Boultame",
                rating: 1,
                text:
                  "Calling is impossible they climbed me 5 euros without having spoken to anyone ... call duration 3 min just waiting",
              },
              {
                author_name: "Laura Sei",
                rating: 5,
                text:
                  "Excellent service.\nfriendly and competent staff. Maximum punctuality in the delivery only through the code the recipient can receive the money.\nI have sent everything to Perth (WA) twice, perfect without problems!",
              },
              {
                author_name: "Carla Romagnoli",
                rating: 5,
                text:
                  "a real MoneyGram center in Milan.! service with very strict rules! schedules in continuous variation, I recommend visiting their website to stay constantly updated!",
              },
            ],
            website: "https://www.moneygram.com/",
          },
          status: "OK",
        })
      )
    ).toBe(true);
  });

  it("should error on unexpected response format", () => {
    expect(
      isLeft(
        PlaceDetailsCodec.decode({
          html_attributions: [],
          status: "OK",
          result: {
            name: "foo",
            website: { url: "http://foo.bar" },
          },
        })
      )
    ).toBe(true);
  });
});

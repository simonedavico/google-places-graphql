import mapQueryFieldsToApiFields from "./mapQueryFieldsToApiFields";

describe("mapQueryFieldsToApiFields", () => {
  it("should map query fields to google places API fields", () => {
    expect(
      mapQueryFieldsToApiFields([
        "name",
        "location",
        "id",
        "address",
        "website",
        "rating",
        "openingHours",
        "reviews",
      ])
    ).toEqual([
      "name",
      "geometry/location",
      "place_id",
      "formatted_address",
      "website",
      "rating",
      "opening_hours/weekday_text",
      "review/author_name",
      "review/rating",
      "review/text",
    ]);
  });
});

#  ⌨ Implementation challenge

## Objectives
  
- Implement the application as specified in the [README.md](./README.md)
- Provide a "Prod ready" code
- Design the API with flexibility in mind  (clients can select the fields they need)
- The API should be built for scale (additional data sources, types of services and features could be easily added)
- As described in the [Usage and Billing](https://developers.google.com/places/web-service/usage-and-billing) section, Google charges for each request and returned field. Therefore your API should be designed to optimize costs, so request only what you need, when you need it (feel free to add storage of any kind if necessary)

## Rules

- The tech stack should be based on:
  - [Typescript 3](https://www.typescriptlang.org/) or modern Javascript
  - [Apollo Server](https://github.com/apollographql/apollo-server)

# Graphql API

Your team is about to create a Minimum Viable Product (MVP) allowing travelers to quickly find places to withdraw cash, exchange currencies or transfer money. You're in charge of designing the API which will be used by different clients such as a mobile app or a web app to show places on a map. Each kind of client may decide to show only some establishments fields (eg. limited number of fields on mobile)

## Specifications
For this MVP,  the team agreed on using the Google Places API as the source of data. 
You'll create a GraphQL API that provides two queries.

The first query allows to get nearby places/establishments within a specified area (location and max distance) filtered by types of services. 
Supported services are: 
- ATM, 
- Currency exchange service 
- Money transfer service.

For each establishment in the list returned by this query, the following information should be selectable:
- the geolocation
- some general information like the name of the establishment, the address and the website
- the opening hours and if the place is currently open
- the place's ratings and list of reviews


The second query allows to get a single place/establishment, specifying its place ID. 

We don't force you to use a specific response or parameters format so you can choose the most suitable structure, given the context of the project.

## Resources
### Google Place API
​
Documentation: https://developers.google.com/places/web-service/intro.

API Key: **REDACTED**  


**Query samples:**
​
- Get single place
  ```
  https://maps.googleapis.com/maps/api/place/details/json?key=<API_KEY>&place_id=<PLACE_ID>
  ```
- Find nearby atms.
  ```
  https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=<API_KEY>&location=46.5124197,6.6329685&radius=1000&type=atm
  ```
- Find neaby services
  ```
  https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=<API_KEY>&location=46.5124197,6.6329685&radius=1000&keyword=Currency%20exchange
  ```
  *You can use the `keyword` parameter to specify the kind of service (`Currency exchange` or `Money transfer`.*)
​

### Apollo Server
​
Documentation: https://www.apollographql.com/docs/apollo-server/

# WynnMAP(I)

A simple fullstack app using leafletjs and expressjs to create a light, pretty, and highly functional map of the Minecraft MMORPG server Wynncraft.

It began as an attempt to bring ingame-only data to the outside world, as the official Wynncraft API does not provide economy data for the territories.
However i started enjoying working on the frontend with leafletjs quite a bit, so i will be developing this further as a replacement for the other webmaps, which are a bit slow for my liking.
API currently lacks full hybrid data generation functionality because of concerns for the compliance of using a scraper bot to get the ingame data with the rules. It may still however be used as a nice wrapper over the Wynntils Athena API, which may become even more useful as more features/datafields are added to the API.
The website frontend is functional, with a few bugs/imperfections to be polisheshed, and a few features i have in mind to be added, but i am quite happy with how it looks and feels at the moment. 

This project is still under development, but is in a usable state, and i will start hosting the services as soon as i can. Everyone is free to contribute in the meantime.

![An image of the map](https://github.com/Catniped/WynnMAPI/blob/a8517ee42ef3daf07097837a0be406ee9955c9c2/image.png)

## Usage
### API
All required dependencies for the API are listed in the `server.js` file, where you can also change the port used by the app. Once you've condigured everything, simply run `node server.js` in the server directory and the app should start.

The API currently offers 3 endpoints:

**hybridData**:
Combines ingame data with Athena API data to generate the most accurate information about the map state possible. The ingame backend implementation is still TBD.

**apiData**:
Wraps the Athena API with some useful static additional info, like territory connections, territory externals (TBD), natural resource gen, and possibly other properties that may soon come. Mostly used by the website frontend as a substitute for the hybrid data.

**dummyData**:
A testing endpoint, and example of how territory data is defined in this API. You can modify this/do whatever you'd like with it.

### Website
Specify the API location at the top of the `index.js` file, and you should be good to go!
If you wanna use a different API endpoint, like `hybridData` (default is `apiData`), add it as a url parameter like this: 

`https://url?data=hybridData`

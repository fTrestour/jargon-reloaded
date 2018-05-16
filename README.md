![Jargon Reloaded Demo](https://firebasestorage.googleapis.com/v0/b/jargon-reloaded.appspot.com/o/Capture.PNG?alt=media&token=e0fb6328-160e-49b6-aff5-4ce4217c75bf)

## Try it

You can find a demo [here](https://jargon-reloaded.firebaseapp.com/).
Click on a node to see its definition.
You drag nodes to move them, scroll to zoom and drag the background to move in the graph.

## Modify it

Running `npm run fetch` launches the scrapping on http://catb.org/jargon and updates the `src/entries.json`, which is necessary for the frontend to display anything.
Then, running `npm run start` launches the live-reloading server.

## Build it

Just run `npm build` and the dist folder will contain the built files.

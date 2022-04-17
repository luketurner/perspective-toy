# Cubes in perspective

A little experiment in using perspective drawing techniques (horizon lines and vanishing points) to make "3D-looking" boxes. Users can manipulate the location of the horizon and vanishing points to change the perspective of the box. Currently supports 1P (one-point) and 2P (two-point) perspective types.

Inspired by the [1994 Perspective Drawing Series](https://marshallart.com/SHOP/all-products/all-videos/1994-perspective-drawing-series/) of lectures. I watched them recently and thought it would be fun to implement some of the principles using a JS program.

Of course, if you really want to render a cube, you should use a 3D rendering API. This is purely a for-fun experiment to build intuition around perspective drawing.
## Usage

This is a purely static site (HTML + CSS + JS) with no build step. Just clone the repository and serve the `docs` folder with your HTTP server of choice. (Note, the folder is called "Docs" for compatibility with Github Pages hosting. It's not actually docs.)
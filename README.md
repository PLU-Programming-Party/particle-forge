# Particle Forge
it's a particle engine, running in a web browser!

### Getting Started
1. clone the repo
2. install node js 
3. run `npm install` inside the project directory to install all other dependencies
4. from terminal run `npx vite`
5. follow URL to view web app

## Project Structure
Because we couldn't figure out webGPU for ThreeJS and didn't have time to sort it out, we built a rendering in straight javascript directly on top of WebGPU. The various components of the rendering engine are contained in subdirectories within the `src` folder.

### Engine
The `src/engine` directory contains most if not all of the things needed to actually render a scene. There are three core components of the Particle Forge renderer -- the `Engine` class, the `Scene` class, and the `Camera` class.

The `Engine` class is responsible for configuring and managing the rendering pipeline. It is meant to bind buffers, run shader code, and make all of the actual draw calls for you. 

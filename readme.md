# Jon-Trombone
> A poor use case for vocal synthesis


# Introduction
This nonsense shows a 3D scanned model of me, which is animated to have
a flapping jaw, which may or may not reflect reality. A modified version of
[Pink Trombone](https://dood.al/pinktrombone/) is used to synthesize vocals 
to match the movement of the jaw.


# Build Instructions
I can't imagine why you'd want to do this, but you can build this with a
few simple commands. It's a node project, so all you need to do is run 
`node install` in the root, and then you can use the following Gulp tasks 
(e.g. `gulp build`):

* `build` - Builds the project into [/dist](/dist/)
* `preview` - Builds and presents the project's test page (live reloads)

Everything you need to run is in [/dist](/dist/). For an example
of an integration, see the [test page](/testpage/index.html). 

Jon-Trombone will use DAT.GUI if it's available to give you a way to fiddle with the parameters.


# License
MIT License. See [license.md](license.md).
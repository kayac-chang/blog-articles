# N-API

There are different ways to write a Node.js addon.

- use V8 APIs directly
- use abstraction layer that hides the V8 specifics

The V8 its APIs are constantly changing between versions.
Some are deprecated and new APIs are introduced all the time.

While useful, this has its drawbacks
since `NAN` also needed to handle deprecated V8 APIs across versions.
And since `NAN` integrates tightly with the V8 APIs,
it did not shield us from the virtual machine changes underneath it.
In order to work across the different Node.js versions,
we needed to create a native binary for every major Node.js version.

There were many other native addons that have experienced the same problem.
Thus, the Node.js team decided to create a stable API layer build within Node.js itself,
which guarantees API stability across major Node.js versions
regardless of the virtual machine API changes underneath.
This API layer is called N-API.
It not only provides API stability but also guarantees ABI stability.
This means binaries compiled for one major version
are able to run on later major versions of Node.js.

N-API is a C API.
To support C++ for writing Node.js addons,
there is a module called `node-addon-api`.
This module is a more efficient way to write code that calls N-API.
It provides a layer on top of N-API.
Developers use this to create and manipulate JavaScript values
with integrated exception handling
that allows handling JavaScript exceptions as native C++ exceptions and vice versa.

# Hexagonal Architecture

Create your application to work without either a UI or a database
so you can run automated regression-tests against the application,
work when the database becomes unavailable,
and link applications together without any user involvement.

Allow an application to equally be driven by users, programs, automated test or batch scripts,
and to be developed and tested in isolation from its eventual run-time devices and databases.

## Unit testing the Hexagon in isolation

Unit Tests interact with the system through the user-side ports (use cases).

Test Doubles serve as in-memory adapters for the server-side ports (gateway interfaces).

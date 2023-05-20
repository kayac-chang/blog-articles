## Intention

I consider using **Graph** to solve this problem.

### Why choose **Graph**

one of the most direct applications are mapping and navigation applications.
where each vertex represents an intersection,
and the edge between vertices signify the roads between intersections.

make every maze on the board as nodes,
place path card on a maze are equivalent to connect nodes by edges,
every kinds of path cards can make different kinds of connection between nodes.

edges also can be removed or forbid.

### Which type of graph

- undirected graph: type of graph that doesn't have directionality
- adjacency list

## Terminology

##### Graph

a graph $G=(V,E)$ is a set of vertices $V$ and edges $E$
where each edge $(u, v)$ is a connection between vertices. $u,v \in V$.

##### Neighbors

vertices $u$ and $v$ are neighbors if an edge $(u, v)$ connects them.

##### Degree

$degree(v)$ is equal to the number of edges connected to $v$.

##### Path

sequence of vertices connected by edges.

##### Path Length

number of edges in a path.

##### Cycle

path that starts and ends at the same vertex.

##### Connectivity

two vertices are connected if a path exists between them.

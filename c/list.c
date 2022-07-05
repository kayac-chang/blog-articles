#include <stdio.h>
#include <stdlib.h>

void main() {
	// Dynamically allocate an array of size 3
	int *list = malloc(3 * sizeof(int));
	if (list == NULL) {
		return 1;
	}

	*list = 1;
	*(list + 1) = 2;
	*(list + 2) = 3;

	// Resize old array to be size 4
	int *tmp = realloc(4 * sizeof(int));
	if (tmp == NULL) {
		free(list);
		return 1;
	}

	// Add fourth number to new array
	tmp[3] = 4;

	// Remember new array
	list = tmp;

	// Print new array
	for (int i = 0; i < 4; i++) {
		printf("%i\n", list[i]);
	}

	// Free new array
	free(list);
	return 0;
}

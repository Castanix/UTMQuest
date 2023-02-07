# Artillery

To run artillery load tests, install the artillery CLI: `npm install -g artillery`

Confirm the installation by running: `artillery dino` in the terminal

### Running tests

1. Add mock data to the db by running `npm run mockData`. This should create two .txt files (questions.txt and courses.txt) inside `/artillery`
2. Run any of the tests under `/artillery/tests` using: `artillery run -o ${path to /artillery/reports}/${report name} ${artillery test}`

Make sure the following are git ignored:

-   /artillery/reports
-   /artillery/courses.txt
-   /artillery/questions.txt

### Notes

We can use custom JS functions to randomly pick between courses and questions ids. But since the mock data is generated
randomly, storing those values in a csv is simpler

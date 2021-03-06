const prereq_loader = require("../prereq_loader");
const rp = require("request-promise");
const plan_parser = require("scrapers/src/plan_parser");
const supported = [
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-science/bscs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-cognitive-psychology-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/information-science-cognitive-psychology-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/data-science-health-science-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-political-science-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-linguistics-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-mathematics-bs/#planofstudytext",

  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-communication-studies-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-criminal-justice-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/information-science-journalism-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-media-arts-bs/#planofstudytext",

  // This major parses correctly, but has a "Take two courses, at least one of which is at the 4000 or 5000 level, from the following:"
  // which is not handled, and has courses double listed in one location which may not parse correctly (?)
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-philosophy-bs/#planofstudytext",

  // "Complete four ECON electives with at least two numbered at ECON 3000 or above."
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/cybersecurity-economics-bs/#planofstudytext",

  // "Complete four economics electives with no more than two below 3000:"
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-information-science-combined-majors/economics-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/science/biochemistry/biochemistry-bs/#planofstudytext",
  "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/science/mathematics/mathematics-bs/#planofstudytext",
];

runTestsOnLinks(supported);

/**
 * Runs tests on an array of links.
 * @param {string[]} links the links to plans of study to test on.
 */
function runTestsOnLinks(links) {
  jest.setTimeout(100000);

  // run tests on the results.
  links.map((link, index) => {
    test(
      "Ensures that scraper correctly add pre-reqs for major no. " +
        index +
        "'s plans of study",
      async () => {
        await testScheduleLinkPrereqs(link);
      }
    );
  });
}

/**
 * Downloads a page, scrapes a plan, enhances the schedule, and then compares it to a snapshot.
 * @param {*} link the link of the schedule to download and test
 */
async function testScheduleLinkPrereqs(link) {
  // this test takes a while to run, so allow it to take more time.
  jest.setTimeout(10000);

  const page = await rp(link);
  const schedules = plan_parser.planOfStudyToSchedule(page);

  const enhancedSchedules = await prereq_loader.addPrereqsToSchedules(
    schedules
  );

  for (schedule of enhancedSchedules) {
    expect(schedule).toMatchSnapshot();
  }

  return undefined;
}

test("Ensure that prereqs and coreqs for CS 2810 are successfully added to a schedule containing just CS 2810.", async () => {
  const mockSched = {
    years: [1000],
    yearMap: {
      1000: {
        year: 1000,
        fall: {
          season: "FL",
          year: 1000,
          termId: 100010,
          id: 1010,
          classes: [],
          status: "INACTIVE",
        },
        spring: {
          season: "SP",
          year: 1000,
          termId: 100030,
          id: 1030,
          classes: [
            {
              classId: "2810",
              subject: "CS",
              numCreditsMin: 4,
              numCreditsMax: 4,
              prereqs: {
                type: "and",
                values: [
                  {
                    classId: "1800",
                    subject: "CS",
                  },
                  {
                    classId: "2500",
                    subject: "CS",
                  },
                ],
              },
              coreqs: {
                type: "and",
                values: [],
              },
            },
          ],
          status: "CLASSES",
        },
        summer1: {
          season: "S1",
          year: 1000,
          termId: 100040,
          id: 1040,
          classes: [],
          status: "INACTIVE",
        },
        summer2: {
          season: "S2",
          year: 1000,
          termId: 100060,
          id: 1060,
          classes: [],
          status: "INACTIVE",
        },
        isSummerFull: false,
      },
    },
  };

  const enhancedSchedules = await prereq_loader.addPrereqsToSchedules(
    [mockSched],
    2020
  );

  expect(enhancedSchedules).toBeDefined();
  expect(enhancedSchedules.length).toEqual(1);

  const withPrereqsCoreqs = enhancedSchedules[0];

  // ensure that the property exists, first of all.
  expect(withPrereqsCoreqs).toBeDefined();
  expect(withPrereqsCoreqs).toHaveProperty("yearMap");
  expect(withPrereqsCoreqs.yearMap).toHaveProperty("1000");
  expect(withPrereqsCoreqs.yearMap[1000]).toHaveProperty("spring");
  expect(withPrereqsCoreqs.yearMap[1000].spring).toHaveProperty("classes");

  // check that the array has the one element.
  expect(withPrereqsCoreqs.yearMap[1000].spring.classes).toBeInstanceOf(Array);
  expect(withPrereqsCoreqs.yearMap[1000].spring.classes.length).toEqual(1);

  // cs 2810, with now updated prereqs/coreqs.
  const cs2810 = withPrereqsCoreqs.yearMap[1000].spring.classes[0];

  // expect the prereqs to exist.
  expect(cs2810).toBeInstanceOf(Object);
  expect(cs2810).toHaveProperty("prereqs");
  expect(cs2810).toHaveProperty("coreqs");

  // checks on the prereqs/coreqs.
  const prereqs = cs2810.prereqs;
  const coreqs = cs2810.coreqs;

  // strict check on the prereqs.
  expect(prereqs).toStrictEqual({
    type: "and",
    values: [
      {
        classId: "1800",
        subject: "CS",
      },
      {
        classId: "2500",
        subject: "CS",
      },
    ],
  });

  // strict check on the coreqs.
  expect(coreqs).toStrictEqual({
    type: "and",
    values: [],
  });
});

// const fs = require('fs');
// test("Writes testing files for mitch", async () => {

//   // takes a while.
//   jest.setTimeout(30000);
//   const links = [
//     "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/computer-information-science/computer-science/bscs/",
//     "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/science/biochemistry/biochemistry-bs/",
//     "http://catalog.northeastern.edu/archive/2018-2019/undergraduate/science/mathematics/mathematics-bs/"
//   ];

//   const pages = await Promise.all(links.map((link) => rp(link)));

//   const schedules = pages.map((page) => plan_parser.planOfStudyToSchedule(page));

//   const withPrereqs = await Promise.all(schedules.map((plans) => prereq_loader.addPrereqsToSchedules(plans)));

//   for (let i = 0; i < withPrereqs.length; i += 1) {
//     fs.writeFile(`schedules${i}.json`, JSON.stringify(withPrereqs[i], null, 2));
//   }
//   expect(true).toBeTruthy();
// });

// this works:
/* const querySchema = `
query {
  class1: class(subject: "CS", classId: 2500) {
    occurrence(termId: 202010) {
      name
    }
  }
}`;

const queryObj = {
  query: querySchema,
}

// make the request.
// request result is a string.
let queryResult = await rp({
  uri: "https://searchneu.com/graphql",
  method: 'POST',
  body: JSON.stringify(queryObj),
  headers: {
    'Content-type': 'application/json'
  }
});

let objResult = JSON.parse(queryResult);
console.log(objResult); */

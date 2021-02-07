import {
  IMajorRequirementGroup,
  IRequiredCourse,
  Requirement,
} from "../../../common/types";
// remain to sidebar helper
export const flattenIOrCourseMap = (
  reqGroupMap: Record<string, IMajorRequirementGroup>
): Record<string, IMajorRequirementGroup> => {
  // flatten each IMajorRequirementGroup in this map if it contains nested ORs
  const groupMapArr = Object.entries(reqGroupMap).map(
    (
      entry: [string, IMajorRequirementGroup]
    ): [string, IMajorRequirementGroup] => {
      return [entry[0], flattenIOrCourseMajorGroup(entry[1])];
    }
  );
  // turn back into dictionary
  const groupMap: Record<string, IMajorRequirementGroup> = {};
  groupMapArr.map((pair: [string, IMajorRequirementGroup]) => {
    groupMap[pair[0]] = pair[1];
  });

  return reqGroupMap;
};

// flatten an "OR" IMajorRequirementGroup so that requirements field contains list of
// IRequiredCourse
const flattenIOrCourseMajorGroup = (
  reqGroup: IMajorRequirementGroup
): IMajorRequirementGroup => {
  var result: Requirement[] = [];
  if (reqGroup.type == "OR") {
    result = Array.from(flattenIOrCourseRequirement(reqGroup.requirements));
    reqGroup.requirements = result;
    return reqGroup;
  } else {
    return reqGroup;
  }
};

export const flattenIOrCourseRequirement = (
  requirements: Requirement[]
): Set<Requirement> =>
  requirements.reduce((acc: Set<Requirement>, req: Requirement) => {
    if (req.type == "OR") {
      getCoursesInRequirement(req).forEach(acc.add, acc);
    } else {
      acc.add(req);
    }
    return acc;
  }, new Set<IRequiredCourse>());

/**
 * Accumulate a Set of all unique courses within a given Requirement.
 * NOTE: This currently does not work for ICourseRanges.
 *
 * @param req the Requirement to retrieve the courses of
 */
const getCoursesInRequirement = (req: Requirement): Set<Requirement> => {
  switch (req.type) {
    case "CREDITS":
    case "AND":
    case "OR": {
      return flattenIOrCourseRequirement(req.courses);
    }
    case "RANGE": {
      // TODO: Implement a solution for accumulating range courses as well.
      return new Set();
    }
    case "COURSE": {
      return new Set([req]);
    }
  }
};

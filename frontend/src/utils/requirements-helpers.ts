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
  if (reqGroup.type == "OR" || reqGroup.type == "AND") {
    result = Array.from(flattenIOrCourseRequirement(reqGroup.requirements));
    reqGroup.requirements = result;
    return reqGroup;
  } else {
    return reqGroup;
  }
};

// flatten each requirement so that there are no nested OR blocks
export const flattenIOrCourseRequirement = (
  requirements: Requirement[]
): Set<Requirement> =>
  requirements.reduce((acc: Set<Requirement>, req: Requirement) => {
    if (req.type == "OR") {
      flattenIOrCourseRequirement(req.courses).forEach(acc.add, acc);
    } else {
      acc.add(req);
    }
    return acc;
  }, new Set<IRequiredCourse>());

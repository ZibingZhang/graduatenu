import {
  IMajorRequirementGroup,
  IRequiredCourse,
  Requirement,
} from "../../../common/types";

/**
 * For every IMajorRequirementGroup, if it contains nested OR Requirements,
 * modify the IMajorRequirementGroup so that it is flattened
 * @param reqGroupMap the requirement group map that needs to flattened
 */
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

/**
 * flatten an "OR" or "AND" IMajorRequirementGroup to remove nested ORs
 * @param reqGroup The IMajorRequirementGroup to be modified and flattened
 */
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

/**
 * flatten each requirement so that there are no nested OR blocks
 * @param requirements A list of requirements to be flattend if the requirment is type OR
 */
const flattenIOrCourseRequirement = (
  requirements: Requirement[]
): Set<Requirement> =>
  requirements.reduce((acc: Set<Requirement>, req: Requirement) => {
    // only flatten if it is OR, else keep the same
    if (req.type == "OR") {
      flattenIOrCourseRequirement(req.courses).forEach(acc.add, acc);
    } else {
      acc.add(req);
    }
    return acc;
  }, new Set<IRequiredCourse>());

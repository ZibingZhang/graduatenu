/**
 * JSON Schedule Formatter for sandbox/scheduleneu
 * By Alex Takayama
 * 
 * Converts JSON schedule data to a JSON formatted schedule.
 */

/* Data Definition:
 * Class: subject: "string", classId: "999", termId: "201830", nupath: [...]
 */

// ACCESSOR FUNCTIONS

/**
 * Gets the termId from a class.
 * @param {Class} c The target class.
 * @returns {number} The termId of the class.
 */
function getClassTermId(c) {
  return parseInt(c.termId);
}

/**
 * Gets the subject of a class.
 * @param {Class} c The target class.
 * @returns {String} The subject of the class.
 */
function getClassSubject(c) {
  return c.subject;
}

/**
 * Gets the classId  of a class.
 * @param {Class} c The target class.
 * @returns {number} The classId of the class.
 */
function getClassClassId(c) {
  return parseInt(c.classId);
}

// PARSING FUNCTIONS

/**
 * Grabs the first termId a class occurred. May return undefined if array is empty.
 * @param {Class[]} classes Array of classes from which to grab years from.
 * @returns {number} The first (lowest) termId in the list.
 */
function getFirstTerm(classes) {
  let terms = classes.map((c) => (getClassTermId(c)));
  let lowest = Math.min.apply(null, terms);
  return lowest === Infinity ? undefined : lowest;
}

/**
 * Grabs the next term a class occurred, after the provided term. May return undefined if array is empty.
 * @param {number} current The initial term.
 * @param {Class[]} classes Array of classes from which to grab from.
 * @returns {number} The next lowest termId found in the list.
 */
function getNextTerm(current, classes) {
  let terms = classes.map((c) => (getClassTermId(c)));
  let termsGreater = terms.filter((y) => (y > current));
  let next = Math.min.apply(null, termsGreater);
  return next === Infinity ? undefined : next;
}

/**
 * Filters an array for only the classes with the matching termId.
 * @param {number} termId The termId to filter for.
 * @param {Class[]} classes Array of classes from which to grab from.
 * @returns {Class[]} The classes with the provided termId. 
 */
function getClassesOfTerm(termId, classes) {
  let ofTerm = classes.filter((c) => (getClassTermId(c) === termId));
  return ofTerm;
}

/**
 * Returns if the classList contains the given class, by attr and course #.
 * @param {Class[]} classList The list of classes.
 * @param {Class} c The class to find.
 * @returns {boolean} True if class is found.
 */
function containsClass(classList, c) {
  let targetSubject = getClassSubject(c);
  let targetNumber = getClassClassId(c);
  for (let i = 0; i < classList.length; i += 1) {
    let item = classList[i];
    if (getClassSubject(item) === targetSubject && getClassClassId(item) === targetNumber) {
      return true;
    }
  }
  return false;
}

/**
 * Produces an array of the required classes not taken yet.
 * @param {Class[]} required The remaining classes to take.
 * @param {Class[]} completed The classes completed so far.
 * @returns {Class[]} The required classes not taken yet.
 */
function getRemainingRequirements(required, completed) {
  // keep the classes, if they are NOT in completed.
  let remaining = required.filter((cl) => (!containsClass(completed, cl)));
  return remaining;
}

/**
 * Adds the completed classes to the schedule. Does mutation. Returns void.
 * @param {JSON} schedule The schedule in JSON format. 
 * @param {Class[]} completedClasses A list of the completed classes.
 */
function addCompleted(schedule, completedClasses) {
  // start at the lowest year
  let currentTerm = getFirstTerm(completedClasses);

  // while we have a next year, append the year to a schedule.
  while (currentTerm) {
    schedule.completed.classes.push({termId: currentTerm, courses: getClassesOfTerm(currentTerm, completedClasses)});
    currentTerm = getNextTerm(currentTerm, completedClasses);
  }
}

// Graph for running topological sort on the prerequisites. 
class Graph {
  // constructor
  constructor() {
    this.adjList = new Map();
    this.numIncoming = new Map();
    this.vertices = [];
  }

  // adds a vertex
  addVertex(v) {
    // if the vertex is already added, don't overwrite the data!
    if (!this.hasVertex(v)) {
      this.adjList.set(v, []);
      this.numIncoming.set(v, 0);
      this.vertices.push(v);
    }
  }

  // adds an edge
  addEdge(v, w) {
    if (!this.hasEdge(v, w)) {
      this.adjList.get(v).push(w);
      this.numIncoming.set(w, this.numIncoming.get(w) + 1);
    }
  }

  // returns if vertex exists in |V|
  hasVertex(v) {
    return this.adjList.get(v) !== undefined;
  }

  // returns if edge exists in |V|
  hasEdge(from, to) {
    // if both vertices exist, test if edge exists.
    if (this.hasVertex(from) && this.hasVertex(to)) {

      // does the adjList for "from" contain "to"?
      let list = this.adjList.get(from);
      for (let i = 0; i < list.length; i += 1) {
        if (list[i] == to) {
          return true;
        }
      }
    }

    // wasn't found, return false;
    return false;
  }
  
  /**
   * Produces a 2D array with nested arrays having length "width" using the Coffman/Graham's algorithm.
   * Only guaranteed to work on DAGs. 
   * @param {number} width The width of the schedule to produce.
   */
  toCoffmanGraham(width) {
    
    // technically for coffman/graham, we need to find the transitive reduction for this DAG before computing topological ordering.
    // but we'll skip it for now.
    // todo: implement transitive reduction.

    // convert topological sorted list to a coffman graham schedule of width "width".
    let order = this.toTopologicalOrdering();

    // If, while at a particular round, the next task to be scheduled has a dependency that’s also scheduled for that same round,
    // we have no choice but to leave the remaining CPUs unused and start the next round
    
    let schedule = [[]];
    let currentLevel = 0;

    let conflictExist = (level, toAdd) => {

      // keep track of stuff we have seen.
      let seen = {};

      // for each one of the things already added,
      // does toAdd come after the thing already added?
      let check = schedule[level];
      let newCheck = [];
      // while we still ahve stuff to check,
      while (check.length > 0) {

        // check them.
        for (let i = 0; i < check.length; i += 1) {
          let v = check[i];
          if (!(v in seen)) {
            // if it's the item, then return true, (a conflict exists).
            if (v === toAdd) {
              return true;
            } else {
              // if we haven't seen the item, then add all the neighbors of item to newCheck.
              seen[v] = true;
              this.adjList.get(v).forEach(neighbor => {
                newCheck.push(neighbor);
              });
            }
          }
        }
        check = newCheck;
        newCheck = [];
      }

      return false;
      
    }

    for (let i = 0; i < order.length; i += 1) {
      let v = order[i];
      if (schedule[currentLevel].length < width && !conflictExist(currentLevel, v)) {
          // if no conflict exists, add.
          schedule[currentLevel].push(v);
      } else {
        currentLevel += 1;
        schedule.push([v]);
      }
    }

    return schedule;
  }

  /**
   * Produces a valid topological ordering for this graph.
   * Tiebreaks by choosing vertices with the earliest most recently added incoming neighbor of v, or vertices with less incoming neighbors.
   */
  toTopologicalOrdering() {
    // produced order
    let order = [];

    // ready list, incoming neighbors map, incoming # map, added index map
    let ready = [];
    let incomingNeighbors = new Map();
    let numIncomingNeighbors = new Map();
    let addedIndex = new Map();

    // initialize the lists of all the vertices for incoming neighbors
    this.vertices.forEach(v => incomingNeighbors.set(v, []));

    // build ready list, incoming neighbors map, incoming # map, added index map
    this.vertices.forEach(v => {

      // add each node with zero incoming edges to ready
      if (this.numIncoming.get(v) == 0) {
        ready.push(v);
      }

      // add each one of the neighbors of v to v's incoming neighbors map
      this.adjList.get(v).forEach(n => incomingNeighbors.get(n).push(v));

      // duplicate the entry for numIncomingNeighbors from this.numIncoming
      numIncomingNeighbors.set(v, this.numIncoming.get(v));

      // set the addedIndex entry to -1.
      addedIndex.set(v, -1);
    });

    // has next vertex
    let hasNextVertex = () => ready.length > 0;

    // grabs a vertex v such that the most recent incoming neighbor of v comes before any other vertex that could be added instead of v.
    // breaks ties by using the second most recent incoming neighbor, and so on.
    let getNextVertex = () => {
      // make sure we have a next vertex.
      if (!hasNextVertex()) return;

      // track the best vertex.
      let bestVertex = ready[0];
      let indexBestVertex = 0;

      // our possible candidates include everything in ready[]. starts at index 1.
      for (let i = 1; i < ready.length; i += 1) {
        let v = ready[i];

        if (addedIndex.get(v) < addedIndex.get(bestVertex)) {
          // if we are strictly better (more previous), then set and move on.
          bestVertex = v;
          indexBestVertex = i;
        } else if (addedIndex.get(v) == addedIndex.get(bestVertex)) {
          // if we are the same, need to break ties 
          // ties broken by using index of second most recently added incoming neighbor, etc., etc.

          // get the incoming neighbors of contesting vertices.
          // map incoming vertices to their index in ready (if it exists).
          // sort greatest => least.
          let incomingV = incomingNeighbors.get(v).map(ne => ready.indexOf(ne)).sort((a1, a2) => (a2 - a1));
          let incomingBest = incomingNeighbors.get(bestVertex).map(ne => ready.indexOf(ne)).sort((a1, a2) => (a2 - a1));

          // whether or not we broke the tie.
          let tiebroke = false;
          
          // the very first thing in both lists SHOULD be what we compared earlier (which should be equal).
          // go down the list until one of them isn't the same as the other.
          for (let i = 0; i < Math.min(incomingV.length, incomingBest.length); i += 1) {

            // if they are not equal, choose the one that has the lower index.
            if (incomingV[i] != incomingBest[i]) {
              tiebroke = true;
              if (incomingV[i] < incomingBest[i]) {
                // use v, as incoming
                bestVertex = v;
                indexBestVertex = i;
              } else {
                // otherwise, not == and v !< best => v > best, keep best.
              }
              break;
            }
          }

          // if we did not successfully tiebreak, then use the one with fewer incoming edges.
          if (!tiebroke && incomingV.length < incomingBest.length) {
            bestVertex = v;
            indexBestVertex = i;
          }

        }
      }

      // we have now selected a vertex to return. now we need to update tables.
      // ready, incoming neighbors, numincoming neighbors, added index.

      // remove from ready, update order.
      order.push(ready[indexBestVertex]);
      // the index that we added ready[indexBestVertex] at in order.
      let orderedIndex = order.length - 1;

      // for each of the outgoing neighbors of bestVertex, update numIncoming and addedIndex.
      this.adjList.get(bestVertex).forEach(v => {

        // update numIncomingNeighbors.
        numIncomingNeighbors.set(v, numIncomingNeighbors.get(v) - 1);

        // potentially add the vertex to ready
        if (numIncomingNeighbors.get(v) == 0) {
          ready.push(v);
        }

        // update the addedIndex
        // invariant: orderedIndex will always be greater than addedIndex
        addedIndex.set(v, orderedIndex);
      });

      // we are done. return the selected vertex.
      return ready.splice(indexBestVertex, indexBestVertex + 1)[0];
    }
    
    // while we have things to add, add them to order.
    while (hasNextVertex()) {

      // this says "get", but it itself mutated order (adds to).
      getNextVertex();
    }

    return order;
  }
}



// the following functions are for prerequisite parsing. a prerequisite object is defined below:

/**
 * Produces a string of the course's subject followed by classId.
 * @param {Class} course The course to get the code of.
 */
let courseCode = course => ("" + getClassSubject(course) + getClassClassId(course));

/**
 * Filters and simplifies the prereqs each course in remainingRequirements, updating the course.
 * If a prereq does not exist, then it is undefined. Ignores courses marked as "missing"
 * @param {Class[]} completed The completed classes (in SearchNEU format).
 * @param {Object} prereqObj The prereq object to filter
 * @returns {Class[]} remainingRequirements with each course.prereqs updated.
 */
function filterAndSimplifyPrereqs(completed, prereqObj) {

  // a prereq is an object {} and has the following properties:
  // "type": one of "and" or "or"
  // "values": an array [] of course objects or more prereqs

  // a course is an object {} and has the following properties:
  // "classId": 4 digit number in string format. ex "2500"
  // "subject": the course attribute. ex "CS" or "MATH"
  // "missing": if object property exists, then value is true (boolean). 

  /**
   * Recursively filters classes from a provided prerequisite object in SearchNEU format, according to a provided object map.
   * @param {PrereqObj} oldPrereqObj The prereq object to filter old classes from.
   */
  let filterPrereq = function(oldPrereqObj) {
    // if we have no prereqs, skip.
    if (oldPrereqObj === undefined) {
      return undefined;
    }    

    switch(oldPrereqObj.type) {
      case "and":
      return filterAndPrereq(oldPrereqObj);
      case "or":
      return filterOrPrereq(oldPrereqObj);
      default:
      throw console.trace("property \"type\" of SearchNEU-style prereq object was not one of \"and\" or \"or\"");
    }
  }

  /**
   * Recursively filters classes from a provided prerequisite object in SearchNEU format, according to a provided object map.
   * Returns undefined if all of the prereq's requirements have been satisfied, indicating the prereq is complete.
   * @param {PrereqObj} andPrereq The AND-type prereq object to filter old classes from.
   */
  let filterAndPrereq = function(andPrereq) {
    let newPrereqObj = {"type": "and","values": []};

    // conditionally add the non-completed prerequisite classes.
    andPrereq.values.forEach(function(course) {
      // if the course is marked as "missing", ignore it.
      if (course.missing) {}
      // if the course has NOT been completed, add it.
      else if ("type" in course) {
        course = filterPrereq(course);
        if (course !== undefined) newPrereqObj.values.push(course);
      }
      else if (!hasBeenCompleted[courseCode(course)]) {
        newPrereqObj.values.push(course);
      }
    });

    // if we filtered them all out, return undefined (no more prereqs!)
    return newPrereqObj.values.length === 0 ? undefined : newPrereqObj;
  }

  /**
   * Recursively filters classes from a provided prerequisite object in SearchNEU format, according to a provided object map.
   * Returns undefined if one of the prereq's requirements have been satisfied, indicating the prereq is complete.
   * @param {PrereqObj} orPrereq The OR-type prereq object to filter old classes from.
   */
  let filterOrPrereq = function(orPrereq) {
    let newPrereqObj = {"type": "or","values": []};
    let completed = false;

    // if any one of the prereqs have been satisfied => return undefined.
    orPrereq.values.forEach(function(course) {
      // if the course is marked as "missing", ignore it.
      if (course.missing) {}
      // else if the course is another course object
      else {
        if ("type" in course) {
          course = filterPrereq(course);
        }

        if (hasBeenCompleted[courseCode(course)] || course === undefined) {
          completed = true;
        }
        else {
          newPrereqObj.values.push(course);
        }
      }
    });

    // if none of the above ran, then return.
    if (completed) {
      return undefined;
    }
    else if (newPrereqObj.values.length === 1) {
      // return newPrereqObj.values[0];
      return {"type":"and", "values":[newPrereqObj.values[0]]};
    }
    else {
      return newPrereqObj;
    }
  }

  // make a look up table for instant indexing:
  let hasBeenCompleted = {};
  
  // mark all the completed courses as completed, in our hashmap object.
  completed.forEach(function(course) {
    hasBeenCompleted[courseCode(course)] = true;
  });

  // update the prereqs of each remaining requirement to its simplified and filtered version.
  return filterPrereq(prereqObj);
}

/**
 * Produces a graph of the provided list of SearchNEU formatted class objects. 
 * Uses class prereqs to create edges. Uses courseCode to name nodes.
 * @param {Class[]} completed The completed classes.
 * @param {Class[]} filteredRequirements The remaining requirements to schedule.
 * @param {Function} curriedGetSearchNEUData A function course => course, looks up searchNEUdata for a course.
 * @returns {Graph} The produced graph, complete with edges.
 */
function createPrerequisiteGraph(completed, filteredRequirements, curriedGetSearchNEUData) {

  // make the graph
  // must exist as a reference for the helper functions.
  let graph = new Graph();

  // add all vertices to the graph.
  // must be added for the helper functions.
  filteredRequirements.forEach(function(course) {
    graph.addVertex(courseCode(course));
  });

  // helper functions for doing prereq graph edges.
  // rely on having local reference "graph" available.

  /**
   * Checks whether or not the prereq's edges exist in the graph "graph"
   * @param {String} to The classCode of the node to point to
   * @param {PrereqObj} prereq The prerequisite object to add an edge for (maybe).
   * @returns {boolean} true if the full prereq exists in the graph "graph'"
   */
  let doesPrereqExist = function(to, prereq) {
    if (prereq === undefined) {
      return true;
    } 

    if (prereq.type === "and") {
      return doesAndPrereqExist(to, prereq);
    } else if (prereq.type === "or") {
      return doesOrPrereqExist(to, prereq);
    } else {
      throw console.trace("prereq not one of and or or");
    }
  }

  /**
   * 
   * @param {String} to The classCode of the node to point to
   * @param {PrereqObj} prereq The prerequisite objec to add an edge for (maybe).
   * @returns {boolean} true if the full prereq exists in the graph "graph"
   */
  let doesAndPrereqExist = function(to, prereq) {

    // make sure each of the values exists.
    prereq.values.forEach(function(item, index, arrY) {
      if ("type" in item) {
        // does the graph contain the entire prereq?
        if (!doesPrereqExist(to, item)) {
          return false;
        }
      } else {
        let from = courseCode(item);

        // does the graph contain an edge?
        if (!graph.hasEdge(from, to)) {
          return false;
        }
      }
    });

    // if we hit this point, everything passed.
    return true;
  }

  /**
   * 
   * @param {String} to The classCode of the node to point to
   * @param {PrereqObj} prereq The prerequisite object to add an edge for (mabye).
   * @returns {boolean} true if the full prerequisite object exists in the graph "graph"
   */
  let doesOrPrereqExist = function(to, prereq) {

    // if any one of the prereqs exists, return true.
    prereq.values.forEach(function(item, index, arr) {
      if ("type" in item) {
        if (doesPrereqExist(to, item)) {
          return true;
        }
      } else {
        let from = courseCode(item);
        if (graph.hasEdge(from, to)) {
          return true;
        }
      }
    });

    // nothing existed, so return false
    return false;
  }

  // following functions rely on local reference "completed" 

  /**
   * Recursively adds the prereq edges of a prereq object to a graph, for a specified course.
   * @param {String} to The courseCode of the course we are computing prereqs for. Creates edges to here.
   * @param {PrereqObj} prereq The prereq object of the course we are computing prereqs for.
   */
  let markPrereq = function(to, prereq) {
    // if undefined, return
    if (prereq === undefined) {
      return;
    }
    
    if (prereq.type === "and") {
      // if is an AND prereq, mark as AND prereq.
      markAndPrereq(to, prereq);
    } else if (prereq.type === "or") {
      // if is an OR prereq, mark as OR prereq.
      markOrPrereq(to, prereq);
    } else {
      // otherwise throw error.
      throw console.trace("prereq was not of either \"and\" or \"or\" type!");
    }
  }
  
  /**
   * Recursively adds the prereq edgese of an AND-type prereq to a graph.
   * @param {String} to The courseCode of the course we are computing prereqs for.
   * @param {PrereqObj} prereq The prerequisite object of the course we are computing prereqs for.
   */
  let markAndPrereq = function(to, prereq) {
    prereq = filterAndSimplifyPrereqs(completed, prereq);
    if (!prereq) return;
    
    // for each of the prereqs, add an edge from the prereq to us.
    prereq.values.forEach(function(course) {
      
      // here, we'd only like to process if we have a defined course
      // if we have another prereq object, we'd like to process after all the other OR objects.
      // this is in an ideal world. perhaps sort the prereqs beforehand for processing order.
      
      if ("type" in course) {
        // if we are another prereq, mark.
        markPrereq(to, course);
      } else {
        // if we are a defined course, mark.
        let from = courseCode(course);
        graph.addVertex(from);
        graph.addEdge(from, to); 

        // next mark all the prerequisites of the local course itself, if they exist.
        let prereqCourseData = curriedGetSearchNEUData(course);
        if (prereqCourseData && prereqCourseData.prereqs) {
          let nestedPrereqs = filterAndSimplifyPrereqs(completed, prereqCourseData.prereqs);
          markPrereq(from, nestedPrereqs);
        }
      }
    });
  }

  /**
   * Recursively adds the prereq edges of the OR-type prereq to a graph
   * @param {String} to The coruseCode of the course we are computing prereqs for. name of the node in the graph.
   * @param {PrereqObj} prereq The prerequisite object of the course we are compting prereqs for.
   */
  let markOrPrereq = function(to, prereq) {
    prereq = filterAndSimplifyPrereqs(completed, prereq);
    if (!prereq) return;

    let satisfied = false;

    // keep track of indices
    let lastNestedIndex = -1;
    let lastNormalIndex = -1;
    
    // for each of the prereq courses:
    prereq.values.forEach(function(item, index, array) {
      let course = item;
      
      if ("type" in course) {
        // we have a nested prereq. what a pain.
        lastNestedIndex = index;

        // if we already have the prereq, then mark.
        if (doesPrereqExist(to, course)) {
          markPrereq(to, prereq);
          return;
        }
      } else {
        // we have a normal course prereq. yay!
        lastNormalIndex = index;

        let from = courseCode(course);
        
        if (graph.hasVertex(from)) {
          // if we already have the vertex, then mark.
          // exit, or has been fulfilled.
          graph.addEdge(from, to);
          return;
        }
      }
    });
    
    // if none of the courses were satisfied, add the last vertex and edge.
    // we'd prefer to add a normal prereq (non-nested) before a nested.
    if (!satisfied) {
      let course;

      // find the proper index to add.
      if (lastNormalIndex !== -1) {
        course = prereq.values[lastNormalIndex];
      } else if (lastNestedIndex !== -1) {
        course = prereq.values[lastNestedIndex];
      } else {
        throw console.trace("empty prereq object!");
      }

      // if we are a defined course, mark.
      let from = courseCode(course);
      graph.addVertex(from);
      graph.addEdge(from, to); 

      // next mark all the prerequisites of the local course itself, if they exist.
      let prereqCourseData = curriedGetSearchNEUData(course);

      if (prereqCourseData && prereqCourseData.prereqs) {
        let nestedPrereqs = filterAndSimplifyPrereqs(completed, prereqCourseData.prereqs);
        markPrereq(from, nestedPrereqs);
      }
    }
  }

  // END HELPER FUNCTIONS

  // begin processing the items.

  // process the "and" prereqs before the "or" prereqs.
  filteredRequirements.forEach(function(item, index, array) {
    let course = item;

    // if prereqs exist and are of type "and", mark them.
    if (course.prereqs && course.prereqs.type === "and") {
      markAndPrereq(courseCode(course), course.prereqs);
    }
  });

  // process the "or" prereqs
  filteredRequirements.forEach(function(item, index, array) {
    let course = item;
    let prereqs = course.prereqs;

    // if the course has no prereqs, then skip.
    if (prereqs === undefined) {
      return;
    }

    // if any of the prereqs have been completed, abort.
    if (prereqs.type === "or") {
      let to = courseCode(course);
      markOrPrereq(courseCode(course), course.prereqs);
    }
  });

  // return the graph
  return graph;
}

/**
 * Adds the required classes to the schedule. Does mutation. Returns void.
 * @param {JSON} schedule The schedule in JSON format.
 * @param {Class[]} completed The completed classes (in SearchNEU format).
 * @param {Class[]} remainingRequirements The remaining requirements (in SearchNEU format).
 * @param {Function} curriedGetSearchNEUData A function course => course that produces searchNEU data for a course.
 */
function addRequired(schedule, completed, remainingRequirements, curriedGetSearchNEUData) {
  // precondition: schedule is full up to some point. need to fill with remaining requirements.
  
  // filter and simplify the requirements according to completed classes.
  // let newRequirements = filterAndSimplifyPrereqs(completed, remainingRequirements);

  // use those filtered classes to greate a prerequisite edge graph.
  let topo = createPrerequisiteGraph(completed, remainingRequirements, curriedGetSearchNEUData);

  // we should now have a complete graph with edges.
  // console.log(topo.adjList);
  
  // perform topological sort/coffman algorithm to produce an ordering with width 4.
  let coffmanGraham = topo.toCoffmanGraham(4);
  // console.log(coffmanGraham);

  // adds the produced ordering to the schedule under the property "scheduled".
  schedule.scheduled = coffmanGraham;
}

/**
* Attempts to grab searchNEU data for a course, using that course's termId to lookup the corresponding file.
* If no termId is found, automatically uses the most recent semester on record.
* May return undefined.
* @param {Course} course A course object (hopefully).
* @param {Object} classMapParent The parent classMap object, with props "mostRecentSemester" and "allTermIds"
* @returns {Object} Produces the corresponding searchNEU data for a class, if it exists. else => undefined.
*/
let getSearchNEUData = function(course, classMapParent) {
  /**
  * Grabs the data of a specified class.
  * @param {Object} classObj The class object containing a classMap and termId.
  * @param {String} subject The subject (college abbreviation) of the target course.
  * @param {number} classId course number of the target course.
  * @returns {Object} The resulting class object (if found).
  */
  function getClassData(classObj, subject, classId) {
    // classes can be accessed by the 'neu.edu/201830/<COLLEGE>/<COURSE_NUMBER>' attribute of each "classmap"
    if (classObj) {
      let query = 'neu.edu/' + classObj.termId + '/' + subject+ '/' + classId;
      return classObj.classMap[query];
    } else return undefined;
  }

  // skip doing work if there's no work to do.
  if (!course) {
    return undefined;
  }
  
  let subject = getClassSubject(course);
  let classId = getClassClassId(course);
  let termId = getClassTermId(course);
  let classMap = classMapParent[termId];

  if (classId && subject && termId && classMap) {
    // if everything is valid, then query the classMap
    // console.log("data found for: " + subject + classId);
    return getClassData(classMap, subject, classId);
  } else if (subject && classId && !termId) {
    // if only the subject and classId are valid, guess the termId from most recent => least recent
    let allTermIds = classMapParent.allTermIds;
    for (let i = 0; i < allTermIds.length; i += 1) {
      termId = allTermIds[i];
      classMap = classMapParent[termId];
      let data = getClassData(classMap, subject, classId);
      if (data) {
        // if the data exists, then return. otherwise keep searching.
        // console.log("data found in term: " + termId + " for course: " + subject + classId);
        return data;
      }
    }
    // if not found, then return undefined
    // console.log("data not found for:");
    // console.log(course);
    return undefined;
  } else {
    // if we have no subject and classId, then we don't even know what course to search for. 
    // console.log("data not found for:");
    // console.log(course);
    return undefined;
  }
}

/**
 * Parses the provided JSON file to an output JSON file, organized chronologically.
 * @param {String} input The input of a file, as a string.
 * @param {Object} classMapParent A classMap parent with each classMap under its corresponding termId.
 * @returns {Object} The resulting schedule object.
 */
function toSchedule(input, classMapParent) {
  
  // parse the json file
  let audit = JSON.parse(input);

  let schedule = 
  {
    completed: {
      classes: []
    }
  };

  // add the completed classes. this works!
  addCompleted(schedule, audit.completed.classes);
  
  // keepIfDataExists: Class[] => Class[]
  // maps from class to searchNEU lookup representation of class, otherwise filters out.
  let lookupIfDataExists = classes => classes
  .map(course => getSearchNEUData(course, classMapParent))
  .filter(course => (course && !("list" in course)) ? true : false);

  // filter through the completed classes to pull up their data.
  // only keep the stuff with actual results.
  // todo: change this to deal with class enums: {"list":["3302", 3308"], "num_required":"1"}
  let completed = lookupIfDataExists(audit.completed.classes);
  let required = lookupIfDataExists(audit.requirements.classes);

  // get the remaining required classes, in searchNEU format
  let remainingRequirements = getRemainingRequirements(required, completed);

  let curriedGetData = course => getSearchNEUData(course, classMapParent);

  // add the remaining required classes.
  // note, expects data in SearchNEU format
  addRequired(schedule, completed, remainingRequirements, curriedGetData);
  
  return schedule;
}



// export toSchedule function.
module.exports.toSchedule = toSchedule;

// export Graph class for testing.
module.exports.Graph = Graph;
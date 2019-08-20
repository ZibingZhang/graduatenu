const html_parser = require('../src/html_parser.js');
const fs = require('fs');

const cs_json = html_parser.audit_to_json(fs.readFileSync("./test/mock_audits/cs_audit.html", "utf-8"));
const cs_json2 = html_parser.audit_to_json(fs.readFileSync("./test/mock_audits/cs_audit2.html", "utf-8"));
const cs_json3 = html_parser.audit_to_json(fs.readFileSync("./test/mock_audits/cs_audit3.html", "utf-8"));
const cs_math_json = html_parser.audit_to_json(fs.readFileSync("./test/mock_audits/cs_math_grad_audit.html", "utf-8"));
const me_json = html_parser.audit_to_json(fs.readFileSync("./test/mock_audits/me_audit.html", "utf-8"));

const json_ex = [];
json_ex.push(cs_json);
json_ex.push(cs_math_json);
json_ex.push(cs_json2);
//json_ex.push(cs_json3);
//json_ex.push(me_json);

test('Confirms that the generated JavaScript object is of the proper form', () => {
    for(let i = 0; i < json_ex.length; i++) {
        expect(json_ex[i]).toBeDefined();

        // data
        expect(json_ex[i].data).toBeDefined();
        expect(json_ex[i].data.grad).toBeDefined();
        expect(json_ex[i].data.grad).toMatch(/^[0-3][0-9]\/[0-3][0-9]\/[0-9][0-9]$/);

        expect(json_ex[i].data.year).toBeDefined();
        expect(json_ex[i].data.year).toMatch(/^20[0-9][0-9]$/);

        expect(json_ex[i].data.major).toBeDefined();
        expect(json_ex[i].data.major).toMatch(/^[a-zA-Z ]+$/);

        // completed
        expect(json_ex[i].completed).toBeDefined();
        expect(json_ex[i].completed.classes).toBeDefined();
        expect(Array.isArray(json_ex[i].completed.classes)).toBeTruthy();
        expect(json_ex[i].completed.nupaths).toBeDefined(); expect(Array.isArray(json_ex[i].completed.nupaths)).toBeTruthy(); 
        // in progress
        expect(json_ex[i].inprogress).toBeDefined();
        expect(json_ex[i].inprogress.classes).toBeDefined();
        expect(Array.isArray(json_ex[i].inprogress.classes)).toBeTruthy();
        expect(json_ex[i].inprogress.nupaths).toBeDefined();
        expect(Array.isArray(json_ex[i].inprogress.nupaths)).toBeTruthy();

        // to be completed
        expect(json_ex[i].completed).toBeDefined();
        expect(json_ex[i].completed.classes).toBeDefined();
        expect(Array.isArray(json_ex[i].completed.classes)).toBeTruthy();
        expect(json_ex[i].completed.nupaths).toBeDefined();
        expect(Array.isArray(json_ex[i].completed.nupaths)).toBeTruthy();
    }
});

test('Ensures that all of the complete course information is of the form required.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        for(let j = 0; j < json_ex[i].completed.classes.length; j++) {
            expect(json_ex[i].completed.classes[j]).toBeDefined();
            expect(json_ex[i].completed.classes[j].hon).toBeDefined();
            expect(typeof json_ex[i].completed.classes[j].hon === typeof true).toBeTruthy();
            expect(json_ex[i].completed.classes[j].subject).toBeDefined();
            expect(json_ex[i].completed.classes[j].subject).toMatch(/^[A-Z]{2,4}$/);
            expect(json_ex[i].completed.classes[j].name).toBeDefined();
            expect(json_ex[i].completed.classes[j].classId).toBeDefined();
            expect(json_ex[i].completed.classes[j].classId).toMatch(/^[\d]{4}$/);
            expect(json_ex[i].completed.classes[j].credithours).toBeDefined();
            expect(json_ex[i].completed.classes[j].credithours).toMatch(/^[\d]\.00/);
            expect(json_ex[i].completed.classes[j].season).toBeDefined();
            expect(json_ex[i].completed.classes[j].season).toMatch(/FL|SP|S1|S2|SM/);
            expect(json_ex[i].completed.classes[j].year).toBeDefined();
            expect(json_ex[i].completed.classes[j].year).toMatch(/^\d\d$/);
            expect(json_ex[i].completed.classes[j].termId).toBeDefined();
            expect(json_ex[i].completed.classes[j].termId).toMatch(/^20\d\d[1-6]0$/);
        }
    }
});

test('Ensures that all of the in-progress course information is of the form required.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        for(let j = 0; j < json_ex[i].inprogress.classes.length; j++) { 
            expect(json_ex[i].inprogress.classes[j]).toBeDefined(); 
            expect(json_ex[i].inprogress.classes[j].hon).toBeDefined();
            expect(typeof json_ex[i].inprogress.classes[j].hon === typeof true).toBeTruthy();
            expect(json_ex[i].inprogress.classes[j].subject).toBeDefined();
            expect(json_ex[i].inprogress.classes[j].subject).toMatch(/^[A-Z]{2,4}$/);
            expect(json_ex[i].inprogress.classes[j].name).toBeDefined();
            expect(json_ex[i].inprogress.classes[j].classId).toBeDefined();
            expect(json_ex[i].inprogress.classes[j].classId).toMatch(/^[\d]{4}$/);
            expect(json_ex[i].inprogress.classes[j].credithours).toBeDefined();
            expect(json_ex[i].inprogress.classes[j].credithours).toMatch(/^[\d]\.00$/);
            expect(json_ex[i].inprogress.classes[j].season).toBeDefined();
            expect(json_ex[i].inprogress.classes[j].season).toMatch(/FL|SP|S1|S2|SM/);
            expect(json_ex[i].inprogress.classes[j].year).toBeDefined();
            expect(json_ex[i].inprogress.classes[j].year).toMatch(/^\d\d$/);
            expect(json_ex[i].inprogress.classes[j].termId).toBeDefined();
            expect(json_ex[i].inprogress.classes[j].termId).toMatch(/^20\d\d[1-6]0$/);
        }
    }
});

test('Ensures that all of the courses required to take are of the form required.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        for(let j = 0; j < json_ex[i].requirements.classes.length; j++) { 
            expect(json_ex[i].requirements.classes[j]).toBeDefined(); 
            expect(json_ex[i].requirements.classes[j].subject).toBeDefined();
            expect(json_ex[i].requirements.classes[j].subject).toMatch(/^[A-Z]{2,4}$/);

            if(typeof json_ex[i].requirements.classes[j].classId  === 'undefined') {

                expect(json_ex[i].requirements.classes[j].list).toBeDefined();
                expect(json_ex[i].requirements.classes[j].num_required).toBeDefined();
                expect(json_ex[i].requirements.classes[j].num_required).toMatch(/^[\d]$/);

                for(let k = 0; k < json_ex[i].requirements.classes[j].list.length; k++) {
                    // assumes that no more than 9 classes will be required
                    expect(json_ex[i].requirements.classes[j].list[k]).toMatch(/^[\d]{4}$/);    
                }
            } else {
                expect(json_ex[i].requirements.classes[j].classId).toMatch(/^[\d]{4}$/);
                if(typeof json_ex[i].requirements.classes[j].classId2 !== 'undefined') {
                    expect(json_ex[i].requirements.classes[j].classId2).toMatch(/^[\d]{4}$/);
                }
            }
        }
    }
});

test('Ensures that the required NUPaths are of the form required.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        for(let j = 0; j < json_ex[i].requirements.nupaths.length; j++) { 
            expect(json_ex[i].requirements.nupaths[j]).toBeDefined(); 
            expect(json_ex[i].requirements.nupaths[j]).toMatch(/ND|EI|IC|FQ|SI|AD|DD|ER|WF|WD|WI|EX|CE/);
        }
    }
});

test('Ensures that the in-progress NUPaths are of the form required.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        for(let j = 0; j < json_ex[i].inprogress.nupaths.length; j++) { 
            expect(json_ex[i].inprogress.nupaths[j]).toBeDefined(); 
            expect(json_ex[i].inprogress.nupaths[j]).toMatch(/ND|EI|IC|FQ|SI|AD|DD|ER|WF|WD|WI|EX|CE/);
        }
    }
});

test('Ensures that the completed NUPaths are of the form required.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        for(let j = 0; j < json_ex[i].completed.nupaths.length; j++) { 
            expect(json_ex[i].completed.nupaths[j]).toBeDefined(); 
            expect(json_ex[i].completed.nupaths[j]).toMatch(/ND|EI|IC|FQ|SI|AD|DD|ER|WF|WD|WI|EX|CE/);
        }
    }
});

test('Ensures that the audits do not contain duplicate completed courses.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        let duplicates = false;
        for(let j = 0; j < json_ex[i].completed.classes.length; j++) { 
            let course = json_ex[i].completed.classes[j];
            let seen = false;

            for(let k = 0; k < json_ex[i].completed.classes.length; k++) {
                if(course.classId === json_ex[i].completed.classes[k].classId && course.subject === json_ex[i].completed.classes[k].subject && course.termId === json_ex[i].completed.classes[k].termId && course.name === json_ex[i].completed.classes[k].name) { 
                    if(!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

            expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }
});

test('Ensures that the audits do not contain duplicate in-progress courses.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        let duplicates = false;
        for(let j = 0; j < json_ex[i].inprogress.classes.length; j++) { 
            let course = json_ex[i].inprogress.classes[j];
            let seen = false;

            for(let k = 0; k < json_ex[i].inprogress.classes.length; k++) {
                if(course.classId === json_ex[i].inprogress.classes[k].classId && course.subject === json_ex[i].inprogress.classes[k].subject && course.termId === json_ex[i].inprogress.classes[k].termId) { 
                    if(!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

            expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }   
});

test('Ensures that the audits do not contain duplicate required courses.', () => {

});

test('Ensures that the audits do not contain duplicate completed NUPaths.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        let duplicates = false;
        for(let j = 0; j < json_ex[i].completed.nupaths.length; j++) { 
            let seen = false;
            let nupath = json_ex[i].completed.nupaths[j];
            for(let k = 0; k < json_ex[i].completed.nupaths.length; k++) {
                if(json_ex[i].completed.nupaths[k] === nupath) { 
                    if(!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

            expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }
});

test('Ensures that the audits do not contain duplicate in-progress NUPaths.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        let duplicates = false;
        for(let j = 0; j < json_ex[i].inprogress.nupaths.length; j++) { 
            let seen = false;
            let nupath = json_ex[i].inprogress.nupaths[j];
            for(let k = 0; k < json_ex[i].inprogress.nupaths.length; k++) {
                if(json_ex[i].inprogress.nupaths[k] === nupath) { 
                    if(!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

           expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }
});

test('Ensures that the audits do not contain duplicate required NUPaths.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        let duplicates = false;
        for(let j = 0; j < json_ex[i].requirements.nupaths.length; j++) { 
            let seen = false;
            let nupath = json_ex[i].requirements.nupaths[j];
            for(let k = 0; k < json_ex[i].requirements.nupaths.length; k++) {
                if(json_ex[i].requirements.nupaths[k] === nupath) { 
                    if(!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

            expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }
});

test('Ensures that each audit contains all of the NUPath requirements.', () => {
    for(let i = 0; i < json_ex.length; i++) {
        let nupaths = ["ND","EI","IC","FQ","SI","AD","DD","ER","WF","WD","WI","EX","CE"];
        for(let j = 0; j < json_ex[i].completed.nupaths.length; j++) {
            let index = nupaths.indexOf(json_ex[i].completed.nupaths[j]);
            if (index > -1) {
                nupaths.splice(index, 1);
            }
        }

        for(let j = 0; j < json_ex[i].inprogress.nupaths.length; j++) {
            let index = nupaths.indexOf(json_ex[i].inprogress.nupaths[j]);
            if (index > -1) {
                nupaths.splice(index, 1);
            }
        }
        for(let j = 0; j < json_ex[i].requirements.nupaths.length; j++) {
            let index = nupaths.indexOf(json_ex[i].requirements.nupaths[j]);
            if (index > -1) {
                nupaths.splice(index, 1);
            }
        }

        expect(nupaths.length === 0).toBeTruthy();
    }
});

test('Verifies that the CS degree audit is properly reproduced by the code', () => {
    expect(cs_json).toStrictEqual(
        {  
            "completed":{  
                "classes":[  
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"1200",
                        "name": "LeadershipSkillDevelopment",
                        "credithours":"1.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":true,
                        "subject":"CS",
                        "classId":"1800",
                        "name": "DiscreteStructures",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":true,
                        "subject":"CS",
                        "classId":"1802",
                        "name": "SeminarforCS1800",
                        "credithours":"1.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"2500",
                        "name": "FundamentalsofComputerSci",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"2501",
                        "name": "LabforCS2500",
                        "credithours":"1.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"2510",
                        "name": "FundamentalsofComputerSci",
                        "credithours":"4.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"2511",
                        "name": "LabforCS2510",
                        "credithours":"1.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"2800",
                        "name": "LogicandComputation",
                        "credithours":"4.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"2801",
                        "name": "LabforCS2800",
                        "credithours":"1.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"3200",
                        "name": "DatabaseDesign",
                        "credithours":"4.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"3950",
                        "name": "IntrotoCSResearch",
                        "credithours":"2.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"1341",
                        "name": "CalculusBC++",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"1342",
                        "name": "CalculusBC++",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"2331",
                        "name": "LinearAlgebra",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":true,
                        "subject":"PHIL",
                        "classId":"1145",
                        "name": "TechandHumanValues",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":false,
                        "subject":"BIOL",
                        "classId":"1111",
                        "name": "AP:BIOLOGY",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"BIOL",
                        "classId":"1112",
                        "name": "AP:BIOLOGY",
                        "credithours":"1.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"BIOL",
                        "classId":"1113",
                        "name": "AP:BIOLOGY",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"BIOL",
                        "classId":"1114",
                        "name": "AP:BIOLOGY",
                        "credithours":"1.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"ENGW",
                        "classId":"1111",
                        "name": "AP:ENGLANG/COMP,ENGL",
                        "credithours":"8.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"1990",
                        "name": "AP:COMPSCIA",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"ECON",
                        "classId":"1115",
                        "name": "AP:ECON-MAC",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"ECON",
                        "classId":"1116",
                        "name": "AP:ECON-MIC",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"HIST",
                        "classId":"1110",
                        "name": "AP:WORLDHISTORY",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"2280",
                        "name": "AP:STATISTICS",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"1151",
                        "name": "AP:PHYSICSC-MECH",
                        "credithours":"3.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"1152",
                        "name": "AP:PHYSICSC-MECH",
                        "credithours":"1.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"1153",
                         "name": "AP:PHYSICSC-MECH",
                        "credithours":"1.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"PSYC",
                        "classId":"1101",
                        "name": "AP:PSYCHOLOGY",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":true,
                        "subject":"HONR",
                        "classId":"1102",
                        "name": "HonorsDiscovery",
                        "credithours":"1.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    }
                ],
                "nupaths":[  
                    "ND",
                    "FQ",
                    "SI",
                    "AD",
                    "ER",
                    "WF",
                ]
            },
            "inprogress":{  
                "classes":[  
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"3000",
                        "name": "Algorithms&Data",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"19",
                        "termId":"202010"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"3500",
                        "name": "Object-OrientedDesign",
                        "credithours":"4.00",
                        "season":"S1",
                        "year":"19",
                        "termId":"201940"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"3650",
                        "name": "ComputerSystems",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"19",
                        "termId":"202010"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"4100",
                        "name": "ArtificialIntelligence",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"19",
                        "termId":"202010"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"4950",
                        "name": "MachineLearnResearchSemina",
                        "credithours":"1.00",
                        "season":"FL",
                        "year":"19",
                        "termId":"202010"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"3081",
                        "name": "ProbabilityandStatistics",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"19",
                        "termId":"202010"
                    },
                    {  
                        "hon":false,
                        "subject":"EECE",
                        "classId":"2160",
                        "name": "EmbeddedDesEnablingRobotic",
                        "credithours":"4.00",
                        "season":"S1",
                        "year":"19",
                        "termId":"201940"
                    }
                ],
                "nupaths":[  
                    "CE"
                ]
            },
            "requirements":{  
                "classes":[  
                    {  
                        "subject":"CS",
                        "classId":"1210"
                    },
                    {  
                        "subject":"CS",
                        "classId":"3700"
                    },
                    {  
                        "subject":"CS",
                        "classId":"3800"
                    },
                    {  
                        "subject":"CS",
                        "classId":"4400"
                    },
                    {  
                        "subject":"CS",
                        "classId":"4500"
                    },
                    {  
                        "subject":"THTR",
                        "classId":"1170"
                    },
                    {  
                        "subject":"CS",
                        "classId":"2500",
                        "classId2":"7999"
                    },
                    {  
                        "subject":"DS",
                        "classId":"2000",
                        "classId2":"7999"
                    },
                    {  
                        "subject":"ENGW",
                        "list":[  
                            "3302",
                            "3308",
                            "3315"
                        ],
                        "num_required":"1"
                    }
                ],
                "nupaths":[  
                    "EI",
                    "IC",
                    "DD",
                    "WI",
                    "WD",
                    "EX"
                ]
            },
            "data":{  
                "grad":"08/20/22",
                "year":"2019",
                "major":"Computer Science"
            }
        });
});
test('Verifies that the second Computer Science degree audit is properly reproduced by the code', () => {
    expect(cs_json2).toStrictEqual(
        {
            "completed":{
                "classes": [ 
                    { hon: false,
                        subject: 'CS',
                        classId: '1200',
                        "name": "LeadershipSkillDevelopment",
                        credithours: '1.00',
                        season: 'FL',
                        year: '18',
                        termId: '201910' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '1800',
                        "name": "DiscreteStructures",
                        credithours: '4.00',
                        season: 'FL',
                        year: '18',
                        termId: '201910' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '1802',
                        "name": "SeminarforCS1800",
                        credithours: '1.00',
                        season: 'FL',
                        year: '18',
                        termId: '201910' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '2500',
                        "name": "FundamentalsofComputerSci",
                        credithours: '4.00',
                        season: 'FL',
                        year: '18',
                        termId: '201910' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '2501',
                        "name": "LabforCS2500",
                        credithours: '1.00',
                        season: 'FL',
                        year: '18',
                        termId: '201910' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '2510',
                        name: "FundamentalsofComputerSci",
                        credithours: '4.00',
                        season: 'SP',
                        year: '19',
                        termId: '201930' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '2511',
                        name: "LabforCS2510",
                        credithours: '1.00',
                        season: 'SP',
                        year: '19',
                        termId: '201930' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '2800',
                         name: "LogicandComputation",
                        credithours: '4.00',
                        season: 'SP',
                        year: '19',
                        termId: '201930' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '2801',
                        "name": "LabforCS2800",
                        credithours: '1.00',
                        season: 'SP',
                        year: '19',
                        termId: '201930' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '2550',
                        "name": "FoundationsofCybersecurity",
                        credithours: '4.00',
                        season: 'SP',
                        year: '19',
                        termId: '201930' 
                    },
                    { 
                        hon: false,
                        subject: 'MATH',
                        classId: '1341',
                        "name": "CalculusBC++",
                        credithours: '4.00',
                        season: 'S2',
                        year: '18',
                        termId: '201860' 
                    },
                    { 
                        hon: false,
                        subject: 'MATH',
                        classId: '1342',
                        "name": "CalculusBC++",
                        credithours: '4.00',
                        season: 'S2',
                        year: '18',
                        termId: '201860' 
                    },
                    { 
                        hon: false,
                        subject: 'MATH',
                        classId: '3081',
                        "name": "ProbabilityandStatistics",
                        credithours: '4.00',
                        season: 'S1',
                        year: '19',
                        termId: '201940' 
                    },
                    { 
                        hon: false,
                        subject: 'EECE',
                        classId: '2160',
                        "name": "EmbeddedDesEnablingRobotic",
                        credithours: '4.00',
                        season: 'S1',
                        year: '19',
                        termId: '201940' 
                    },
                    { 
                        hon: false,
                        subject: 'PHYS',
                        classId: '1151',
                        "name": "AP:PHYSICSC-MECH",
                        credithours: '3.00',
                        season: 'S2',
                        year: '18',
                        termId: '201860' 
                    },
                    { 
                        hon: false,
                        subject: 'PHYS',
                        classId: '1152',
                        "name": "AP:PHYSICSC-MECH",
                        credithours: '1.00',
                        season: 'S2',
                        year: '18',
                        termId: '201860' 
                    },
                    { 
                        hon: false,
                        subject: 'PHYS',
                        classId: '1153',
                        "name": "AP:PHYSICSC-MECH",
                        credithours: '1.00',
                        season: 'S2',
                        year: '18',
                        termId: '201860' 
                    },
                    { 
                        hon: false,
                        subject: 'PHYS',
                        classId: '1155',
                        "name": "PhysicsforEngineering2",
                        credithours: '3.00',
                        season: 'FL',
                        year: '18',
                        termId: '201910' 
                    },
                    { 
                        hon: false,
                        subject: 'PHYS',
                        classId: '1156',
                        "name": "LabforPHYS1155",
                        credithours: '1.00',
                        season: 'FL',
                        year: '18',
                        termId: '201910' 
                    },
                    { 
                        hon: false,
                        subject: 'PHYS',
                        classId: '1157',
                        "name": "InteractLearnforPHYS1155",
                        credithours: '1.00',
                        season: 'FL',
                        year: '18',
                        termId: '201910' 
                    },
                    { 
                        hon: false,
                        subject: 'ENGW',
                        classId: '1111',
                        "name": "AP:ENGLANG/COMP",
                        credithours: '4.00',
                        season: 'S2',
                        year: '18',
                        termId: '201860' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '1990',
                        "name": "AP:COMPSCIA",
                        credithours: '4.00',
                        season: 'S2',
                        year: '18',
                        termId: '201860' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '1990',
                        "name": "AP:COMPSCIPRINCI",
                        credithours: '4.00',
                        season: 'S2',
                        year: '18',
                        termId: '201860' 
                    },
                    { 
                        hon: false,
                        subject: 'HIST',
                        classId: '1130',
                        "name": "AP:USHISTORY",
                        credithours: '4.00',
                        season: 'S2',
                        year: '18',
                        termId: '201860' 
                    },
                    { 
                        hon: false,
                        subject: 'MATH',
                        classId: '2321',
                        "name": "Calculus3forSci/Engr",
                        credithours: '4.00',
                        season: 'FL',
                        year: '18',
                        termId: '201910' 
                    },
                    { 
                        hon: true,
                        subject: 'HONR',
                        classId: '1310',
                        "name": "IllusionsofReality",
                        credithours: '4.00',
                        season: 'SP',
                        year: '19',
                        termId: '201930' 
                    } 
                ],
                "nupaths": [ 
                    'ND', 
                    'IC', 
                    'FQ', 
                    'AD', 
                    'DD', 
                    'WF'
                ]
            },
            "inprogress":{
                "classes": [ 
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '3000',
                        "name": "Algorithms&Data",
                        credithours: '4.00',
                        season: 'S2',
                        year: '19',
                        termId: '201960' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '3500',
                        "name": "Object-OrientedDesign",
                        credithours: '4.00',
                        season: 'FL',
                        year: '19',
                        termId: '202010' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '3650',
                        "name": "ComputerSystems",
                        credithours: '4.00',
                        season: 'FL',
                        year: '19',
                        termId: '202010' 
                    },
                    { 
                        hon: false,
                        subject: 'CS',
                        classId: '3800',
                        "name": "TheoryofComputation",
                        credithours: '4.00',
                        season: 'FL',
                        year: '19',
                        termId: '202010' 
                    },
                    { 
                        hon: false,
                        subject: 'MATH',
                        classId: '2331',
                        "name": "LinearAlgebra",
                        credithours: '4.00',
                        season: 'S2',
                        year: '19',
                        termId: '201960' 
                    },
                    { 
                        hon: true,
                        subject: 'PHIL',
                        classId: '1145',
                        "name": "TechandHumanValues",
                        credithours: '4.00',
                        season: 'FL',
                        year: '19',
                        termId: '202010' 
                    } 
                ],
                "nupaths":[
                    'SI',
                    'ER' 
                ]
            },
            "requirements":{
                "classes": [ 
                    { 
                        subject: 'CS', 
                        classId: '1210' 
                    },
                    { 
                        subject: 'CS', 
                        classId: '3700' 
                    },
                    { 
                        subject: 'CS', 
                        classId: '4400'
                    },
                    { 
                        subject: 'CS', 
                        classId: '4500' 
                    },
                    { 
                        subject: 'THTR', 
                        classId: '1170' 
                    },
                    { 
                        subject: 'CS', 
                        list: [ '4100', '4300', '4410','4150','4550','4991'],
                        num_required: '1'
                    },
                    {
                        subject:'IS',
                        classId:'4900'
                    },
                    { 
                        subject: 'CS', 
                        classId: '2500', 
                        classId2: '7999' 
                    },
                    { 
                        subject: 'DS', 
                        classId: '2000', 
                        classId2: '7999' 
                    },
                    { 
                        subject: 'ENGW',
                        list: [ '3302', '3308', '3315' ],
                        num_required: '1' 
                    } 
                ],
                "nupaths": [ 
                    'EI', 
                    'WI', 
                    'WD', 
                    'EX', 
                    'CE' 
                ]
            },
            "data":{  
                "grad":"08/20/22",
                "year":"2019",
                "major":"Computer Science"
            }
        });
});

test('Verifies that the CS Math degree audit is properly reproduced by the code', () => {
    expect(cs_math_json).toStrictEqual(
        {  
            "completed":{  
                "classes":[  
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"1200",
                         "name": "LeadershipSkillDevelopment",
                        "credithours":"1.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":true,
                        "subject":"CS",
                        "classId":"1800",
                        "name": "DiscreteStructures",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":true,
                        "subject":"CS",
                        "classId":"1802",
                        "name": "SeminarforCS1800",
                        "credithours":"1.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"2500",
                        "name": "FundamentalsofComputerSci",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"2501",
                        "name": "LabforCS2500",
                        "credithours":"1.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"4993",
                        "name": "IndependentStudy",
                        "credithours":"4.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"1341",
                        "name": "CalculusI",
                        "credithours":"0.00",
                        "season":"FL",
                        "year":"16",
                        "termId":"201710"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"1342",
                        "name": "CalculusII",
                        "credithours":"5.00",
                        "season":"SP",
                        "year":"17",
                        "termId":"201730"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"2321",
                        "name": "CalculusIII",
                        "credithours":"5.00",
                        "season":"FL",
                        "year":"17",
                        "termId":"201810"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"1341",
                        "name": "AP:CALCULUSAB",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"2331",
                        "name": "LinearAlgebra",
                        "credithours":"4.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"3081",
                        "name": "ProbabilityandStatistics",
                        "credithours":"4.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":true,
                        "subject":"PHIL",
                        "classId":"1145",
                        "name": "TechandHumanValues",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":false,
                        "subject":"ENGW",
                        "classId":"1111",
                        "name": "AP:ENGLANG/COMP",
                        "credithours":"0.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {
                        "classId": "1111",
                        "credithours": "4.00",
                        "hon": false,
                        "name": "ENGLISHA:Literature",
                        "season": "S2",
                        "subject": "ENGW",
                        "termId": "201860",
                        "year": "18",
                    },
                    {
                        "classId": "1990",
                        "credithours": "3.00",
                        "hon": false,
                        "name": "Trigonometry",
                        "season": "SM",
                        "subject": "MATH",
                        "termId": "201650",
                        "year": "16",
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"1990",
                        "name": "PrecalculusAlgebra",
                        "credithours":"3.00",
                        "season":"SM",
                        "year":"16",
                        "termId":"201650"
                    },
                    {  
                        "hon":false,
                        "subject":"ENGL",
                        "classId":"3584",
                        "name": "HarryPotterandtheImaginat",
                        "credithours":"3.00",
                        "season":"SM",
                        "year":"17",
                        "termId":"201750"
                    },
                    {  
                        "hon":false,
                        "subject":"ARTS",
                        "classId":"1990",
                        "name": "Ceramics:WheelThrowing",
                        "credithours":"3.00",
                        "season":"SP",
                        "year":"18",
                        "termId":"201830"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"1990",
                        "name": "AP:COMPSCIA",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"ENGL",
                        "classId":"1990",
                        "name": "ENGLISHA:Literature",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"ENVR",
                        "classId":"1101",
                        "name": "AP:ENV.SCIENCE",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"HIST",
                        "classId":"1130",
                        "name": "AP:USHISTORY",
                        "credithours":"0.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {
                        "classId": "1130",
                        "credithours": "4.00",
                        "hon": false,
                        "name": "HistoryAmericas",
                        "season": "S2",
                        "subject": "HIST",
                        "termId": "201860",
                        "year": "18",
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"1145",
                        "name": "AP:PHYSICS1",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"1146",
                        "name": "AP:PHYSICS1",
                        "credithours":"1.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"1161",
                        "name": "IB:PHYSICS",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"1162",
                        "name": "IB:PHYSICS",
                        "credithours":"1.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"1165",
                        "name": "IB:PHYSICS",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"1166",
                        "name": "IB:PHYSICS",
                        "credithours":"1.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"SOCL",
                        "classId":"1990",
                        "name": "AP:HUMANGEOGRAPHY",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"SPNS",
                        "classId":"1990",
                        "name": "AP:SPANISHLANG",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"18",
                        "termId":"201860"
                    },
                    {  
                        "hon":false,
                        "subject":"ARTF",
                        "classId":"1121",
                        "name": "ConceptualDrawing",
                        "credithours":"4.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"3950",
                        "name": "IntrotoCSResearch",
                        "credithours":"2.00",
                        "season":"SP",
                        "year":"19",
                        "termId":"201930"
                    },
                    {  
                        "hon":true,
                        "subject":"HONR",
                        "classId":"1102",
                        "name": "HonorsDiscovery",
                        "credithours":"1.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    },
                    {  
                        "hon":true,
                        "subject":"HONR",
                        "classId":"1310",
                        "name": "FutureofMoney",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"18",
                        "termId":"201910"
                    }
                ],
                "nupaths":[  
                    "ND",
                    "EI",
                    "IC",
                    "FQ",
                    "SI",
                    "AD",
                    "DD",
                    "ER",
                    "WF",
                ]
            },
            "inprogress":{  
                "classes":[  
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"3500",
                        "name": "Object-OrientedDesign",
                        "credithours":"4.00",
                        "season":"S1",
                        "year":"19",
                        "termId":"201940"
                    },
                    {  
                        "hon":false,
                        "subject":"CS",
                        "classId":"5800",
                        "name": "Algorithms",
                        "credithours":"4.00",
                        "season":"SM",
                        "year":"19",
                        "termId":"201950"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"3175",
                        "name": "GroupTheory",
                        "credithours":"4.00",
                        "season":"S2",
                        "year":"19",
                        "termId":"201960"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"3331",
                        "name": "DifferentialGeometry",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"19",
                        "termId":"202010"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"5101",
                        "name": "Analysis1",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"19",
                        "termId":"202010"
                    },
                    {  
                        "hon":false,
                        "subject":"MATH",
                        "classId":"7241",
                        "name": "Probability1",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"19",
                        "termId":"202010"
                    },
                    {  
                        "hon":false,
                        "subject":"PHYS",
                        "classId":"2303",
                        "name": "ModernPhysics",
                        "credithours":"4.00",
                        "season":"FL",
                        "year":"19",
                        "termId":"202010"
                    }
                ],
                "nupaths":[  
                ]
            },
            "requirements":{  
                "classes":[  
                    {  
                        "subject":"CS",
                        "classId":"1210"
                    },
                    {
                        "subject":"CS",
                        "classId":"2801"
                    }, 
                    {
                        "subject":"CS",
                        "classId":"2510"
                    },
                    {  
                        "subject":"CS",
                        "classId":"2511"
                    },
                    {  
                        "subject":"CS",
                        "classId":"2800"
                    },
                    {  
                        "subject":"CS",
                        "classId":"3800"
                    },
                    {  
                        "subject":"CS",
                        "classId":"4300"
                    },
                    {  
                        "subject":"CS",
                        "classId":"4500"
                    },
                    {  
                        "subject":"CS",
                        "classId":"3000"
                    },
                    {  
                        "subject":"THTR",
                        "classId":"1170"
                    },
                    {  
                        "subject":"MATH",
                        "classId":"2341"
                    },
                    {  
                        "subject":"MATH",
                        "classId":"3527"
                    },
                    {  
                        "subject":"MATH",
                        "classId":"3001",
                        "classId2":"4999"
                    },
                    {  
                        "subject":"ENGW",
                        "list":[  
                            "3302",
                            "3308",
                            "3315"
                        ],
                        "num_required":"1"
                    }
                ],
                "nupaths":[  
                    "WI",
                    "WD",
                    "EX",
                    "CE"
                ]
            },
            "data":{  
                "grad":"05/20/23",
                "year":"2019",
                "major":"Computer Science"
            }
        });
});
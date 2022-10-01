/**
 * Collections Created:
 *  Accounts = {
 *      utorid: string PRIMARY KEY (obtained from uoft login)
 *      utorName: string
 *      savedCourses: [courseId: string -> Courses]
 *      reviewQns: {
 *          qnsId: string -> Questions
 *          qnsName: string
 *          topic: string
 *          reviewStatus: int
 *      }
 *  }
 *  Courses = {
 *      courseId: string PRIMARY KEY (course code)
 *      courseName: string
 *      topics: [topicId: string -> Topics]
 *  }
 *  Topics = {
 *      topicId: int PRIMARY KEY
 *      topicName: string
 *      approvedQns: [qnsId: string -> Questions]
 *      reviewQns: [qnsId: string -> Questions]
 *  }
 *  Questions = {
 *      qnsId: string PRIMARY KEY (made up of courseId + topicId + int)
 *      qnsName: string
 *      qnsStatus: (approved : pending)
 *      reviewStatus: int
 *      qnsType: (mc : matching : short)
 *      desc: string
 *      xplan: string
 *      choices: ([string] : null)
 *      ans: string
 *      author: {
 *          utorid: string -> Accounts
 *          utorName: string
 *      }
 *      discussion: [discussionId: int -> Discussions]
 *      date: string
 *      snapshot: ({self} : null)
 *  }
 *  Discussions = {
 *      discussionId: int PRIMARY KEY
 *      author: {
 *          utorid: string -> Accounts
 *          utorName: string
 *      }
 *      content: string
 *      thread: [discussionId: int -> Discussions]
 *      date: string
 *  }
 */

import * as mongoDB from "mongodb";
import configValues from '../../config'; 

// Use 'npm run init' on the terminal backend to setup the database and collections with validation in mongoDB if collections do not exist yet.
async function initDB() {


    const client: mongoDB.MongoClient = new mongoDB.MongoClient(configValues.MONGO_URI);

    await client.connect();

    const db: mongoDB.Db = client.db(configValues.DB_NAME);


    // Creates the Accounts collection in Mongo Atlas with validation
    await db.createCollection("Accounts", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Accounts Object Validation",
                required: [ "utorid", "utorName", "savedCourses", "reviewQns" ],
                additionalProperties: false,
                properties: {
                    _id: {
                        bsonType: "objectId",
                        description: "auto-generated objectId"
                    },
                    utorid: {
                        bsonType: "string",
                        description: "'utorid' must be a string, specifically the utorid, is unique, and is required"
                    },
                    utorName: {
                        bsonType: "string",
                        description: "'utorName' must be a string and is required"
                    },
                    savedCourses: {
                        bsonType: "array",
                        description: "'savedCourses' must be an array with courseIds referencing the Courses collection, and is required",
                        uniqueItems: true,
                        items: {
                            bsonType: "string",
                            description: "items in array must be a string referencing the Courses collection or empty"
                        }
                    },
                    reviewQns: {
                        bsonType: "array",
                        description: "'reviewQns' must be an array of object with partial Question properties from the Questions collection, and is required",
                        uniqueItems: true,
                        items: {
                            bsonType: "object",
                            required: [ "qnsId", "topic", "qnsName", "reviewStatus" ],
                            description: "items in array must be an object with partial Question properties from the Questions collection or empty",
                            properties: {
                                _id: {
                                    bsonType: "objectId",
                                    uniqueItems: true,
                                    description: "auto-generated objectId"
                                },
                                qnsId: {
                                    bsonType: "string",
                                    description: "'qnsId' must be a string, specifically a combination of courseId topicId and a num, is unique, and is required"
                                },
                                topic: {
                                    bsonType: "string",
                                    description: "'topic' must be a string and is required"
                                },
                                qnsName: {
                                    bsonType: "string",
                                    description: "'qnsName' must be a string and is required"
                                },
                                reviewStatus: {
                                    bsonType: "int",
                                    description: "'reviewStatus' must be an int and is required"
                                }
                            }
                        }
                    }
                }
            }
        }
    }).then(() => {
        console.log("Successfully created Accounts collection");
    }).catch(() => {
        console.log("Error creating collections or Accounts collection already exists");
    })


    // Creates the Courses collection in Mongo Atlas with validation
    await db.createCollection("Courses", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Courses Object Validation",
                required: [ "courseId", "courseName", "topics" ],
                additionalProperties: false,
                properties: {
                    _id: {
                        bsonType: "objectId",
                        description: "auto-generated objectId"
                    },
                    courseId: {
                        bsonType: "string",
                        description: "'courseId' must be a string, specifically the course code, is unique, and is required"
                    },
                    courseName: {
                        bsonType: "string",
                        description: "'courseName' must be a string and is required"
                    },
                    topics: {
                        bsonType: "array",
                        description: "'topics' must be an array with topicIds referencing the Topics collection, and is required",
                        uniqueItems: true,
                        items: {
                            bsonType: "int",
                            description: "items in array must be an int referencing the Topics collection or empty"
                        }
                    },
                }
            }
        }
    }).then(() => {
        console.log("Successfully created Courses collection");
    }).catch(() => {
        console.log("Error creating collections or Courses collection already exists");
    })


    // Creates the Topics collection in Mongo Atlas with validation
    await db.createCollection("Topics", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Topics Object Validation",
                required: [ "topicId", "topicName", "approvedQns", "reviewQns" ],
                additionalProperties: false,
                properties: {
                    _id: {
                        bsonType: "objectId",
                        description: "auto-generated objectId"
                    },
                    topicId: {
                        bsonType: "int",
                        description: "'topicId' must be an int, is unique, and is required"
                    },
                    topicName: {
                        bsonType: "string",
                        description: "'topicName' must be a string and is required"
                    },
                    approvedQns: {
                        bsonType: "array",
                        description: "'approvedQns' must be an array with qnsIds referencing the Questions collection, and is required",
                        uniqueItems: true,
                        items: {
                            bsonType: "int",
                            description: "items in array must be an int referencing the Questions collection or empty"
                        }
                    },
                    reviewQns: {
                        bsonType: "array",
                        description: "'reviewQns' must be an array with qnsIds referencing the Questions collection, and is required",
                        uniqueItems: true,
                        items: {
                            bsonType: "object",
                            description: "items in array must be an int referencing the Questions collection or empty"
                        }
                    },
                }
            }
        }
    }).then(() => {
        console.log("Successfully created Topics collection");
    }).catch(() => {
        console.log("Error creating collections or Topics collection already exists");
    })


    // Creates the Topics collection in Mongo Atlas with validation
    await db.createCollection("Questions", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Questions Object Validation",
                required: [ "qnsId", "qnsName", "qnsStatus", "reviewStatus", "qnsType", "desc", "xplan", "choices", "ans", "author", "discussions", "date", "snapshot" ],
                additionalProperties: false,
                properties: {
                    _id: {
                        bsonType: "objectId",
                        description: "auto-generated objectId"
                    },
                    qnsId: {
                        bsonType: "string",
                        description: "'qnsId' must be a string, specifically a combination of courseId topicId and a num, is unique, and is required"
                    },
                    qnsName: {
                        bsonType: "string",
                        description: "'qnsName' must be a string and is required"
                    },
                    qnsStatus: {
                        enum: ["approved", "pending"],
                        description: "'qnsStatus' must be specifically 'approved' or 'pending', and is required",
                    },
                    reviewStatus: {
                        bsonType: "int",
                        description: "'reviewStatus' must be an int if qnsStatus is pending or else null, and is required",
                    },
                    qnsType: {
                        enum: ["mc", "matching", "short"],
                        description: "'qnsType' must be specifically 'mc' 'matching' or 'short', and is required",
                    },
                    desc: {
                        bsonType: "string",
                        description: "'desc' must be a string or empty, and is required",
                    },
                    xplan: {
                        bsonType: "string",
                        description: "'xplan' must be a string or empty, and is required",
                    },
                    choices: {
                        bsonType: "array",
                        description: "'choices' must be an array of strings or empty, and is required",
                        uniqueItems: true,
                        items: {
                            bsonType: "string",
                            description: "items in array must be a string or empty"
                        }
                    },
                    ans: {
                        bsonType: "string",
                        description: "'ans' must be a string, and is required",
                    },
                    author: {
                        bsonType: "object",
                        description: "'author' must be an object with partial Account properties from Accounts collection",
                        required: ["utorid", "utorName"],
                        properties: {
                            utorid: {
                                bsonType: "string",
                                description: "'utorid' must be a string, specifically the utorid, is unique, and is required"
                            },
                            utorName: {
                                bsonType: "string",
                                description: "'utorName' must be a string and is required"
                            }
                        }
                    },
                    topic: {
                        bsonType: "string",
                        description: "'topic' must be a string, and is required",
                    },
                    discussions: {
                        bsonType: "array",
                        description: "'discussions' must be an array of discussionIds referencing the Discussions collection or empty, and is required",
                        uniqueItems: true,
                        items: {
                            bsonType: "int",
                            description: "items in array must be an int referencing the Discussions collection or empty"
                        }
                    },
                    date: {
                        bsonType: "string",
                        description: "'date' must be a date, specifically the date it was created, and is required" 
                    },
                    snapshot: {
                        bsonType: "objectId",
                        description: "'snapshot' must be an objectId of an old copy of itself or null" 
                    }
                }
            }
        }
    }).then(() => {
        console.log("Successfully created Questions collection");
    }).catch(() => {
        console.log("Error creating collections or Questions collection already exists");
    })


    // Creates the Discussions collection in Mongo Atlas with validation
    await db.createCollection("Discussions", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                title: "Dicussions Object Validation",
                required: [ "discussionId", "authName", "authId", "content", "thread", "date" ],
                additionalProperties: false,
                properties: {
                    _id: {
                        bsonType: "objectId",
                        description: "auto-generated objectId"
                    },
                    discussionId: {
                        bsonType: "int",
                        description: "'discussionId' must be an int, is unique, and is required"
                    },
                    author: {
                        bsonType: "object",
                        description: "'author' must be an object with partial Account properties from Accounts collection",
                        required: ["utorid", "utorName"],
                        properties: {
                            utorid: {
                                bsonType: "string",
                                description: "'utorid' must be a string, specifically the utorid, is unique, and is required"
                            },
                            utorName: {
                                bsonType: "string",
                                description: "'utorName' must be a string and is required"
                            }
                        }
                    },
                    content: {
                        bsonType: "string",
                        description: "'content' must be a string, and is required",
                    },
                    thread: {
                        bsonType: "array",
                        description: "'thread' must be an array of discussionIds referencing own collection or empty, and is required",
                        uniqueItems: true,
                        items: {
                            bsonType: "int",
                            description: "items in array must be int referencing own collection or empty"
                        }
                    },
                    date: {
                        bsonType: "date",
                        description: "'date' must be a date, specifically the date it was created, and is required"
                    }
                }
            }
        }
    }).then(() => {
        console.log("Successfully created Discussions collection");
    }).catch(() => {
        console.log("Error creating collections or Discussions collection already exists");
    })

    client.close();
}

initDB();

export {}
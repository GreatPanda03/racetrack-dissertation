// stores information about all available race cars

import Vector2 from "../classes/geometry/vector2.js";


// TODO: these race cars aren't THAT amazing...
//   objectively you would want to use the motorbike for its versatility,
//   but will eventually add velocity / acceleration "steps" to make
//   move choices more interesting and less arbitrary

const RACECAR_INFO = {
    ["The Race Car"]: {
        Id: 1,
        Name: "The Race Car",
        Description: "A standard race car for all-round racing",
        MaxSpeed: new Vector2(10, 10),
        MaxAcceleration: new Vector2(1, 1)
    },

    ["The Motorbike"]: {
        Id: 2,
        Name: "The Motorbike",
        Description: "A smaller vehicle with just as much horsepower as a race car!",
        MaxSpeed: new Vector2(15, 15),
        MaxAcceleration: new Vector2(2, 2)
    },

    ["The Truck"]: {
        Id: 3,
        Name: "The Truck",
        Description: "I mean... why would you bring this to a race?",
        MaxSpeed: new Vector2(3, 3),
        MaxAcceleration: new Vector2(1, 1)
    }
};

export default RACECAR_INFO;